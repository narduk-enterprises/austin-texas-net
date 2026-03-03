/**
 * GET /api/neighborhoods/geojson
 *
 * Returns all neighborhoods as a GeoJSON FeatureCollection with
 * polygon boundaries. Shape data priority:
 *   1. DB-stored boundary_geojson (from Apple Maps crawl hull generation)
 *   2. Static GeoJSON file (City of Austin, OpenStreetMap, blackmad/neighborhoods)
 *   3. Point fallback (DB lat/lng only)
 *
 * Query params (optional):
 *   slug   — return a single neighborhood by slug
 *   city   — filter by city name, e.g. "Austin"
 *   region — filter by region, e.g. "Central"
 *   tier   — filter by tier, e.g. "neighborhood" (excludes regions)
 */
import { eq, and, asc } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable } from '~~/server/database/schema'

const querySchema = z.object({
  slug: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  tier: z.string().optional(),
})

interface GeoJSONGeometry {
  type: string
  coordinates: unknown
}

interface StaticFeatureProperties {
  name: string
  slug: string
  region: string
  city: string
  centerLat: number | null
  centerLng: number | null
  source: string
}

interface StaticFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: StaticFeatureProperties
}

interface StaticFeatureCollection {
  type: 'FeatureCollection'
  features: StaticFeature[]
}

interface NeighborhoodProperties {
  name: string
  slug: string
  region: string | null
  city: string | null
  tier: string | null
  parentRegion: string | null
  population: number | null
  zipCode: string | null
  description: string | null
  featured: boolean | null
  centerLat: number | null
  centerLng: number | null
  source: string
}

interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: NeighborhoodProperties
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

/** Lazily cached static GeoJSON (loaded once per cold start). */
let _cachedGeo: StaticFeatureCollection | null = null

async function loadStaticGeoJSON(): Promise<StaticFeatureCollection> {
  if (_cachedGeo) return _cachedGeo

  try {
    // Read from server/assets/ via Nitro storage (edge-compatible).
    // $fetch('/data/...') causes a 404 during SSR because Nitro does not
    // serve public/ files through its internal fetch mechanism.
    const storage = useStorage('assets:server')
    const raw = await storage.getItem<StaticFeatureCollection>('data/austin-neighborhoods.geojson')
    if (raw && typeof raw === 'object' && Array.isArray(raw.features)) {
      _cachedGeo = raw
    } else {
      _cachedGeo = { type: 'FeatureCollection', features: [] }
    }
  } catch {
    _cachedGeo = { type: 'FeatureCollection', features: [] }
  }

  return _cachedGeo
}

export default defineEventHandler(async (event): Promise<GeoJSONFeatureCollection> => {
  const query = getQuery(event)
  const { slug, city, region, tier } = querySchema.parse(query)

  // Load static polygon data (edge-compatible, reads from public/)
  const staticData = await loadStaticGeoJSON()

  // Build slug-indexed lookup from static features
  const staticBySlug = new Map<string, StaticFeature>()
  for (const feat of staticData.features) {
    staticBySlug.set(feat.properties.slug, feat)
  }

  // Try to enrich with D1 metadata
  let dbBySlug = new Map<string, typeof neighborhoodsTable.$inferSelect>()
  try {
    const db = useDatabase(event)
    const conditions = []

    if (slug) {
      conditions.push(eq(neighborhoodsTable.slug, slug))
    }
    if (city) {
      conditions.push(eq(neighborhoodsTable.city, city))
    }
    if (region) {
      conditions.push(eq(neighborhoodsTable.region, region))
    }
    if (tier) {
      conditions.push(eq(neighborhoodsTable.tier, tier))
    }

    const rows = await db
      .select()
      .from(neighborhoodsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(neighborhoodsTable.region), asc(neighborhoodsTable.name))
      .all()

    dbBySlug = new Map(rows.map((r) => [r.slug, r]))
  } catch {
    // DB not available — use static data only
  }

  // Determine which features to return
  let slugsToInclude: Set<string>

  if (slug) {
    // Single neighborhood requested — only include that slug
    slugsToInclude = new Set([slug])
  } else if (city || region || tier) {
    // When filtering, only include neighborhoods that match the filter in D1
    slugsToInclude = new Set(dbBySlug.keys())
  } else {
    // No filter — include all from static, plus any D1-only
    slugsToInclude = new Set([...staticBySlug.keys(), ...dbBySlug.keys()])
  }

  const features: GeoJSONFeature[] = []

  for (const slug of slugsToInclude) {
    const staticFeat = staticBySlug.get(slug)
    const dbRow = dbBySlug.get(slug)

    // Determine geometry: DB boundary_geojson > static polygon > point fallback
    let geometry: GeoJSONGeometry | null = null
    let source = 'unknown'

    if (dbRow?.boundaryGeojson) {
      // Prefer DB-stored shape from Apple Maps crawl
      try {
        geometry = JSON.parse(dbRow.boundaryGeojson) as GeoJSONGeometry
        source = 'apple-maps-crawl'
      } catch {
        // Fallback if JSON is invalid
        geometry = null
      }
    }

    if (!geometry && staticFeat) {
      geometry = staticFeat.geometry
      source = staticFeat.properties.source
    }

    if (!geometry && dbRow && Number.isFinite(dbRow.lat) && Number.isFinite(dbRow.lng)) {
      geometry = { type: 'Point', coordinates: [dbRow.lng, dbRow.lat] }
      source = 'database'
    }

    if (!geometry) continue

    features.push({
      type: 'Feature',
      geometry,
      properties: {
        name: dbRow?.name ?? staticFeat?.properties.name ?? slug,
        slug,
        region: dbRow?.region ?? staticFeat?.properties.region ?? null,
        city: dbRow?.city ?? staticFeat?.properties.city ?? null,
        tier: dbRow?.tier ?? 'neighborhood',
        parentRegion: dbRow?.parentRegion ?? null,
        population: dbRow?.population ?? null,
        zipCode: dbRow?.zipCode ?? null,
        description: dbRow?.description ?? null,
        featured: dbRow?.featured ?? null,
        centerLat: dbRow?.lat ?? staticFeat?.properties.centerLat ?? null,
        centerLng: dbRow?.lng ?? staticFeat?.properties.centerLng ?? null,
        source,
      },
    })
  }

  return { type: 'FeatureCollection', features }
})
