/**
 * POST /api/neighborhoods/ingest
 *
 * Admin-only endpoint that geocodes neighborhoods via Apple Maps
 * and upserts them into the D1 neighborhoods table.
 *
 * Body (optional):
 *   names — array of neighborhood names to ingest (overrides seed list)
 *
 * If no body is provided, uses the full built-in seed list.
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable } from '~~/server/database/schema'
import { geocodeAppleMaps } from '~~/server/utils/appleMapToken'
import { NEIGHBORHOOD_SEED, type NeighborhoodSeedEntry } from '~~/server/utils/neighborhoodSeed'

/* eslint-disable @typescript-eslint/no-explicit-any */

const bodySchema = z
  .object({
    names: z.array(z.string().min(1)).optional(),
  })
  .optional()

// Austin metro bounding box: Leander (north) to Buda (south)
// Format: northLat,eastLng,southLat,westLng
const AUSTIN_REGION = '30.65,-97.40,30.05,-98.15'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  // Auth check
  const config = useRuntimeConfig()
  const ingestKey = getHeader(event, 'x-ingest-key')
  if (!ingestKey || ingestKey !== config.jwtSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const parsed = bodySchema.parse(body)

  // Build the list to ingest
  let entries: NeighborhoodSeedEntry[]

  if (parsed?.names?.length) {
    // Use provided names, look them up in seed for region/city, fallback to defaults
    entries = parsed.names.map((name) => {
      const match = NEIGHBORHOOD_SEED.find((s) => s.name.toLowerCase() === name.toLowerCase())
      return match || { name, region: 'Unknown', city: 'Austin', tier: 'neighborhood' as const }
    })
  } else {
    entries = NEIGHBORHOOD_SEED
  }

  const db = useDatabase()
  const now = new Date().toISOString()
  let inserted = 0
  let updated = 0
  let failed = 0
  const errors: Array<{ name: string; error: string }> = []

  for (const entry of entries) {
    try {
      // Try geocoding first — more reliable for specific place names
      const data = await geocodeAppleMaps(`${entry.name}, ${entry.city}, Texas`, {
        searchRegion: AUSTIN_REGION,
        limitToCountries: 'US',
      })

      const results: any[] = data?.results || []

      if (!results.length) {
        errors.push({ name: entry.name, error: 'No geocode results' })
        failed++
        continue
      }

      // Take the first (best) result
      const place = results[0]
      const coord = place.coordinate || {}
      const structuredAddress = place.structuredAddress || {}

      const lat = coord.latitude
      const lng = coord.longitude

      if (!lat || !lng) {
        errors.push({ name: entry.name, error: 'No coordinates in result' })
        failed++
        continue
      }

      const slug = slugify(entry.name)

      const neighborhoodData = {
        name: entry.name,
        slug,
        lat,
        lng,
        city: structuredAddress.locality || entry.city,
        region: entry.region,
        zipCode: structuredAddress.postCode || null,
        updatedAt: now,
      }

      // Check if neighborhood already exists by slug
      const existing = await db
        .select()
        .from(neighborhoodsTable)
        .where(eq(neighborhoodsTable.slug, slug))
        .get()

      if (existing) {
        await db
          .update(neighborhoodsTable)
          .set({
            lat: neighborhoodData.lat,
            lng: neighborhoodData.lng,
            city: neighborhoodData.city,
            zipCode: neighborhoodData.zipCode,
            region: neighborhoodData.region,
            tier: entry.tier ?? 'neighborhood',
            parentRegion: ('parentRegion' in entry ? entry.parentRegion : undefined) ?? null,
            appleMapName: ('appleMapName' in entry ? entry.appleMapName : undefined) ?? null,
            updatedAt: now,
          })
          .where(eq(neighborhoodsTable.slug, slug))
        updated++
      } else {
        await db.insert(neighborhoodsTable).values({
          ...neighborhoodData,
          tier: entry.tier ?? 'neighborhood',
          parentRegion: ('parentRegion' in entry ? entry.parentRegion : undefined) ?? null,
          appleMapName: ('appleMapName' in entry ? entry.appleMapName : undefined) ?? null,
          featured: false,
          createdAt: now,
        })
        inserted++
      }

      // Small delay to avoid rate limiting (25k/day quota shared with MapKit JS)
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (err: any) {
      errors.push({ name: entry.name, error: err.message || String(err) })
      failed++
    }
  }

  return {
    success: true,
    total: entries.length,
    inserted,
    updated,
    failed,
    errors: errors.length ? errors : undefined,
    message: `Ingested ${inserted + updated} neighborhoods (${inserted} new, ${updated} updated, ${failed} failed)`,
  }
})
