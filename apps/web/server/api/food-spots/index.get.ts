/**
 * GET /api/food-spots
 *
 * Searches Apple Maps Server API for food trucks in Austin, TX.
 * Enriches each result with neighborhood (from structuredAddress.subLocality)
 * and region (from the neighborhoods API's neighborhood→region mapping).
 * Caches results for 12 hours.
 */
import {
  getDeveloperToken,
  getAccessToken,
  searchPlaces,
  type AppleMapsCreds,
  type AppleMapsSearchResult,
} from '../../utils/apple-maps'

const AUSTIN_CENTER = { lat: 30.2672, lng: -97.7431 }

// Bounding box covering greater Austin area
const AUSTIN_REGION = {
  north: 30.52,
  east: -97.55,
  south: 30.08,
  west: -97.95,
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 12 // 12 hours
const SEARCH_LIMIT = 25

// Multiple search queries to get broad food truck coverage
const SEARCH_QUERIES = ['food trucks', 'food trailer park', 'taco truck', 'BBQ trailer']

export interface FoodSpot {
  id: string
  name: string
  address: string
  neighborhood: string
  region: string
  lat: number
  lng: number
  poiCategory: string
}

interface SpotsPayload {
  fetchedAt: string
  count: number
  spots: FoodSpot[]
}

interface NeighborhoodFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    name: string
    slug: string
    region: string | null
    city: string | null
    centerLat: number
    centerLng: number
  }
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: NeighborhoodFeature[]
}

let cache: { expiresAt: number; payload: SpotsPayload } | null = null

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/**
 * Build a neighborhood name → region lookup from the hoods API data.
 */
function buildRegionLookup(features: NeighborhoodFeature[]): Map<string, string> {
  const lookup = new Map<string, string>()
  for (const f of features) {
    if (f.properties.name && f.properties.region) {
      // Store both normalized and original for flexible matching
      lookup.set(normalizeName(f.properties.name), f.properties.region)
      lookup.set(f.properties.name.toLowerCase(), f.properties.region)
    }
  }
  return lookup
}

/**
 * Look up the region for a neighborhood string.
 * Tries exact match, then normalized match, then substring match.
 */
function findRegion(neighborhood: string, lookup: Map<string, string>): string {
  if (!neighborhood) return 'Unknown'

  // Exact normalized match
  const normalized = normalizeName(neighborhood)
  const exact = lookup.get(normalized) || lookup.get(neighborhood.toLowerCase())
  if (exact) return exact

  // Substring match — find if any neighborhood name contains this subLocality or vice versa
  for (const [key, region] of lookup) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return region
    }
  }

  return 'Unknown'
}

/**
 * Fetch neighborhood data from this app's own API to get neighborhood→region mapping.
 * Falls back gracefully if the API is unavailable.
 */
async function fetchNeighborhoodRegionLookup(): Promise<Map<string, string>> {
  try {
    const data = await $fetch<GeoJSONFeatureCollection>('/api/neighborhoods/geojson', {
      timeout: 10_000,
    })
    return buildRegionLookup(data.features ?? [])
  } catch {
    // Return empty lookup — spots will have region "Unknown"
    return new Map()
  }
}

/**
 * Convert an Apple Maps search result into a FoodSpot.
 */
function toFoodSpot(
  result: AppleMapsSearchResult,
  regionLookup: Map<string, string>,
): FoodSpot | null {
  const name = (result.name || result.displayName || '').trim()
  if (!name) return null

  const lat = toNumber(result.coordinate?.latitude, NaN)
  const lng = toNumber(result.coordinate?.longitude, NaN)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  // Verify the result is actually in Austin
  if (lat < AUSTIN_REGION.south || lat > AUSTIN_REGION.north) return null
  if (lng < AUSTIN_REGION.west || lng > AUSTIN_REGION.east) return null

  const address = result.formattedAddressLines?.join(', ') || ''
  const neighborhood = result.structuredAddress?.subLocality || ''
  const region = findRegion(neighborhood, regionLookup)

  return {
    id: normalizeName(name),
    name,
    address,
    neighborhood,
    region,
    lat,
    lng,
    poiCategory: result.poiCategory || '',
  }
}

export default defineEventHandler(async (event) => {
  const now = Date.now()

  if (cache && cache.expiresAt > now) {
    return cache.payload
  }

  const rawConfig = useRuntimeConfig(event) as Record<string, unknown>
  const creds: AppleMapsCreds = {
    mapkitServerApiKey: String(rawConfig.mapkitServerApiKey || ''),
    appleTeamId: String(rawConfig.appleTeamId || ''),
    appleKeyId: String(rawConfig.appleKeyId || ''),
    appleSecretKey: String(rawConfig.appleSecretKey || ''),
  }

  try {
    const developerToken = await getDeveloperToken(creds)
    const accessToken = await getAccessToken(developerToken)

    // Fetch neighborhood→region mapping in parallel with searches
    const [regionLookup, ...searchResults] = await Promise.all([
      fetchNeighborhoodRegionLookup(),
      ...SEARCH_QUERIES.map((query) =>
        searchPlaces(accessToken, {
          query,
          searchLocation: AUSTIN_CENTER,
          searchRegion: AUSTIN_REGION,
          includePoiCategories: 'Restaurant,FoodMarket',
          limit: SEARCH_LIMIT,
        }),
      ),
    ])

    // Flatten, deduplicate by normalized name, convert to FoodSpot
    const allResults = searchResults.flat()
    const seen = new Set<string>()
    const spots: FoodSpot[] = []

    for (const result of allResults) {
      const spot = toFoodSpot(result, regionLookup)
      if (!spot) continue

      if (seen.has(spot.id)) continue
      seen.add(spot.id)

      spots.push(spot)
    }

    // Sort alphabetically by name
    spots.sort((a, b) => a.name.localeCompare(b.name))

    const payload: SpotsPayload = {
      fetchedAt: new Date().toISOString(),
      count: spots.length,
      spots,
    }

    cache = {
      expiresAt: now + CACHE_TTL_MS,
      payload,
    }

    return payload
  } catch (error) {
    if (cache) {
      return cache.payload
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to load food truck data right now.',
      data: error,
    })
  }
})
