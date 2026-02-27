import { eq } from 'drizzle-orm'
import { z } from 'zod'
import * as tables from '../../database/schema'

// Ingest Bluebonnet observations from iNaturalist
// Triggered daily via Cron (externally or worker schedule)
// Headers: x-api-key: <INGEST_API_KEY>

const INAT_BASE = 'https://api.inaturalist.org/v1/observations'
const TAXON_ID = 49564 // Lupinus texensis
const BBOX = { swlat: 25.8, swlng: -106.7, nelat: 36.5, nelng: -93.5 }
const PER_PAGE = 200
const MAX_PAGES = 15 // ~3000 observations cap

interface INatObservation {
  id: number
  geojson: { type: string; coordinates: [number, number] } | null
  observed_on: string | null
  quality_grade: string | null
  place_guess: string | null
  uri: string | null
  user: { login: string; name: string | null } | null
  photos: Array<{ id: number; url: string }>
}

interface INatResponse {
  total_results: number
  page: number
  per_page: number
  results: INatObservation[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-api-key')

  if (!config.ingestApiKey || apiKey !== config.ingestApiKey) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const db = useDatabase()
  const query = await getValidatedQuery(
    event,
    z.object({ year: z.coerce.number().optional() }).parse,
  )
  const manualYear = query.year

  // Default: fetch current year or manual override
  const targetYear = manualYear || new Date().getFullYear()

  let totalFetched = 0
  let totalInserted = 0
  let totalSkipped = 0
  let page = 1
  let hasMore = true

  try {
    while (hasMore && page <= MAX_PAGES) {
      const params = new URLSearchParams({
        taxon_id: String(TAXON_ID),
        swlat: String(BBOX.swlat),
        swlng: String(BBOX.swlng),
        nelat: String(BBOX.nelat),
        nelng: String(BBOX.nelng),
        per_page: String(PER_PAGE),
        page: String(page),
        order: 'desc',
        order_by: 'observed_on',
        quality_grade: 'research,needs_id',
      })

      // Fetch for the specific year
      params.set('d1', `${targetYear}-01-01`)
      params.set('d2', `${targetYear}-12-31`)

      const url = `${INAT_BASE}?${params.toString()}`

      const data = await $fetch<INatResponse>(url, {
        headers: {
          'User-Agent': 'austin-texas.net/1.0 (contact@austin-texas.net)',
        },
      }).catch((err) => {
        if (err.statusCode === 429) {
          throw createError({ statusCode: 429, message: 'iNaturalist Rate Limit Exceeded' })
        }
        throw err
      })

      if (!data.results || data.results.length === 0) {
        hasMore = false
        break
      }

      const valuesToInsert = []

      for (const obs of data.results) {
        if (obs.geojson?.coordinates && obs.observed_on) {
          const [lng, lat] = obs.geojson.coordinates
          // Build medium-size photo URL
          const photoUrl = obs.photos?.[0]?.url?.replace('/square.', '/medium.') ?? null

          valuesToInsert.push({
            inatId: obs.id,
            lat,
            lng,
            observedOn: obs.observed_on,
            photoUrl,
            observer: obs.user?.name || obs.user?.login || 'Anonymous',
            place: obs.place_guess || '',
            url: obs.uri || `https://www.inaturalist.org/observations/${obs.id}`,
            qualityGrade: obs.quality_grade || 'needs_id',
            createdAt: new Date().toISOString(),
          })
        }
      }

      if (valuesToInsert.length > 0) {
        // Upsert logic (insert on conflict update)
        // Drizzle sqlite doesn't support complex ON CONFLICT across all drivers well,
        // but explicit query builder does.
        // We will insert individually or batch insert with on conflict do update.

        for (const row of valuesToInsert) {
          try {
            const existing = await db
              .select()
              .from(tables.bluebonnetObservations)
              .where(eq(tables.bluebonnetObservations.inatId, row.inatId))
              .get()

            if (existing) {
              // Optional: Update if needed. For now, we assume observations don't change much.
              // Maybe update photo url?
              await db
                .update(tables.bluebonnetObservations)
                .set({
                  photoUrl: row.photoUrl,
                  place: row.place,
                  observer: row.observer,
                  qualityGrade: row.qualityGrade,
                })
                .where(eq(tables.bluebonnetObservations.inatId, row.inatId))
                .run()
              totalSkipped++ // Count as skipped/updated
            } else {
              await db.insert(tables.bluebonnetObservations).values(row).run()
              totalInserted++
            }
          } catch (e) {
            console.error('Insert Error', e)
          }
        }

        totalFetched += valuesToInsert.length
      }

      hasMore = page * PER_PAGE < data.total_results
      page++

      // Respectful delay
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      stats: { totalFetched, totalInserted, totalSkipped },
    }
  }

  return {
    success: true,
    stats: { totalFetched, totalInserted, totalSkipped },
  }
})
