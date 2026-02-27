/**
 * POST /api/admin/neighborhoods/import
 *
 * Admin-only endpoint that accepts an export JSON payload and upserts
 * neighborhoods into the DB. Matches by slug and updates all fields
 * including boundary_geojson.
 *
 * Designed for syncing local crawl data → production:
 *   1. Crawl locally (fill neighborhood_grid)
 *   2. Generate shapes (POST /api/admin/neighborhood-grid/generate-shapes)
 *   3. Export (GET /api/admin/neighborhoods/export)
 *   4. Import to prod (POST /api/admin/neighborhoods/import with --remote)
 *
 * Body: { neighborhoods: [...] } (same format as export)
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { neighborhoodsTable } from '~~/server/database/schema'

const neighborhoodSchema = z.object({
  name: z.string(),
  slug: z.string(),
  lat: z.number(),
  lng: z.number(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  population: z.number().nullable().optional(),
  featured: z.union([z.boolean(), z.number()]).nullable().optional(),
  tier: z.string().nullable().optional(),
  parentRegion: z.string().nullable().optional(),
  appleMapName: z.string().nullable().optional(),
  boundaryGeojson: z.string().nullable().optional(),
})

const bodySchema = z.object({
  neighborhoods: z.array(neighborhoodSchema),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { neighborhoods } = bodySchema.parse(body)

  const db = useDatabase()
  const now = new Date().toISOString()

  let inserted = 0
  let updated = 0
  let failed = 0
  const errors: Array<{ slug: string; error: string }> = []

  for (const hood of neighborhoods) {
    try {
      // Check if exists
      const existing = await db
        .select({ id: neighborhoodsTable.id })
        .from(neighborhoodsTable)
        .where(eq(neighborhoodsTable.slug, hood.slug))
        .get()

      const featured = typeof hood.featured === 'boolean' ? hood.featured : hood.featured === 1

      if (existing) {
        await db
          .update(neighborhoodsTable)
          .set({
            name: hood.name,
            lat: hood.lat,
            lng: hood.lng,
            city: hood.city ?? 'Austin',
            region: hood.region ?? null,
            zipCode: hood.zipCode ?? null,
            description: hood.description ?? null,
            population: hood.population ?? null,
            featured,
            tier: hood.tier ?? 'neighborhood',
            parentRegion: hood.parentRegion ?? null,
            appleMapName: hood.appleMapName ?? null,
            boundaryGeojson: hood.boundaryGeojson ?? null,
            updatedAt: now,
          })
          .where(eq(neighborhoodsTable.slug, hood.slug))
          .execute()
        updated++
      } else {
        await db
          .insert(neighborhoodsTable)
          .values({
            name: hood.name,
            slug: hood.slug,
            lat: hood.lat,
            lng: hood.lng,
            city: hood.city ?? 'Austin',
            region: hood.region ?? null,
            zipCode: hood.zipCode ?? null,
            description: hood.description ?? null,
            population: hood.population ?? null,
            featured,
            tier: hood.tier ?? 'neighborhood',
            parentRegion: hood.parentRegion ?? null,
            appleMapName: hood.appleMapName ?? null,
            boundaryGeojson: hood.boundaryGeojson ?? null,
          })
          .execute()
        inserted++
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push({ slug: hood.slug, error: message })
      failed++
    }
  }

  return {
    success: true,
    total: neighborhoods.length,
    inserted,
    updated,
    failed,
    errors: errors.length ? errors : undefined,
  }
})
