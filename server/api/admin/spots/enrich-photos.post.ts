/**
 * POST /api/admin/spots/enrich-photos
 *
 * Enriches map spots with Google Places photos.
 * Queries spots that lack a photoUrl, looks them up via Google Places API,
 * and stores the first photo URL + attribution.
 *
 * Body:
 *   contentType?: string  — filter by content type (e.g. "breakfast-tacos")
 *   limit?: number        — max spots to enrich (default 10, max 50)
 */
import { eq, and, isNull, type SQL } from 'drizzle-orm'
import { z } from 'zod'
import { mapSpotsTable } from '~~/server/database/schema'
import { enrichSpotWithPhoto } from '~~/server/utils/google-places'

const bodySchema = z.object({
  contentType: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = bodySchema.parse(await readBody(event))
  const limit = body.limit ?? 10

  const db = useDatabase()

  // Build filter: spots without photos
  const conditions: SQL[] = [isNull(mapSpotsTable.photoUrl)]
  if (body?.contentType) {
    conditions.push(eq(mapSpotsTable.contentType, body.contentType))
  }

  const spots = await db
    .select({
      id: mapSpotsTable.id,
      name: mapSpotsTable.name,
      lat: mapSpotsTable.lat,
      lng: mapSpotsTable.lng,
    })
    .from(mapSpotsTable)
    .where(and(...conditions))
    .limit(limit)

  let enriched = 0
  let errors = 0
  const results: Array<{ id: string; name: string; status: string; photoUrl?: string }> = []

  for (const spot of spots) {
    try {
      const photo = await enrichSpotWithPhoto(spot.name, spot.lat, spot.lng)

      if (photo) {
        await db
          .update(mapSpotsTable)
          .set({
            photoUrl: photo.photoUrl,
            googlePlaceId: photo.googlePlaceId,
            photoAttribution: photo.photoAttribution,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(mapSpotsTable.id, spot.id))

        enriched++
        results.push({ id: spot.id, name: spot.name, status: 'enriched', photoUrl: photo.photoUrl })
      } else {
        results.push({ id: spot.id, name: spot.name, status: 'no-photo' })
      }
    } catch (err) {
      errors++
      results.push({ id: spot.id, name: spot.name, status: 'error' })
      console.error(`[enrich-photos] Error enriching ${spot.name}:`, err)
    }

    // Rate limit: 200ms between API calls
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return {
    enriched,
    errors,
    noPhoto: spots.length - enriched - errors,
    total: spots.length,
    results,
  }
})
