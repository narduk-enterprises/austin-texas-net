/**
 * POST /api/map-spots/ingest
 *
 * Admin-only endpoint that searches Apple Maps Server API for
 * spots matching a query and upserts results into D1's map_spots table.
 *
 * Body:
 *   category    — content type slug, e.g. "breakfast-tacos"
 *   searchQuery — Apple Maps search term, e.g. "breakfast tacos"
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { mapSpotsTable } from '~~/server/database/schema'
import { searchAppleMaps } from '~~/server/utils/appleMapToken'

/* eslint-disable @typescript-eslint/no-explicit-any */

const bodySchema = z.object({
  category: z.string().min(1),
  searchQuery: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  limit: z.number().optional(),
})

export default defineEventHandler(async (event) => {
  // Auth check
  const config = useRuntimeConfig()
  const ingestKey = getHeader(event, 'x-ingest-key')
  if (!ingestKey || ingestKey !== config.jwtSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { category, searchQuery, lat, lng, limit } = bodySchema.parse(body)

  const db = useDatabase()

  // Search Apple Maps (use provided location or default to downtown Austin)
  const data = await searchAppleMaps(searchQuery, {
    lat: lat ?? 30.2672,
    lng: lng ?? -97.7431,
    limit: limit ?? 25,
  })

  const places: any[] = data?.results || []

  if (!places.length) {
    return { success: true, count: 0, message: 'No results from Apple Maps' }
  }

  const now = new Date().toISOString()
  let upserted = 0

  for (const place of places) {
    const id = place.id || crypto.randomUUID()
    const coord = place.coordinate || {}
    const structuredAddress = place.structuredAddress || {}

    const spotData = {
      id: String(id),
      name: place.name || 'Unknown',
      lat: coord.latitude ?? 0,
      lng: coord.longitude ?? 0,
      address: place.formattedAddressLines?.join(', ') || '',
      neighborhood: structuredAddress.subLocality || structuredAddress.locality || '',
      category: Array.isArray(place.poiCategory)
        ? place.poiCategory.join(', ')
        : place.poiCategory || 'Restaurant',
      contentType: category,
      phone: place.telephone || '',
      url: place.urls?.[0] || place.url || '',
      updatedAt: now,
    }

    // Check if spot already exists
    const existing = await db
      .select()
      .from(mapSpotsTable)
      .where(eq(mapSpotsTable.id, spotData.id))
      .get()

    if (existing) {
      // Update Apple data but preserve editorial overrides
      await db
        .update(mapSpotsTable)
        .set({
          name: spotData.name,
          lat: spotData.lat,
          lng: spotData.lng,
          address: spotData.address,
          neighborhood: spotData.neighborhood,
          category: spotData.category,
          contentType: spotData.contentType,
          phone: spotData.phone,
          url: spotData.url,
          updatedAt: now,
        })
        .where(eq(mapSpotsTable.id, spotData.id))
    } else {
      await db.insert(mapSpotsTable).values({
        ...spotData,
        featured: true,
        priceRange: '$',
        createdAt: now,
      })
    }

    upserted++
  }

  return {
    success: true,
    count: upserted,
    total: places.length,
    message: `Ingested ${upserted} ${category} spots from Apple Maps`,
  }
})
