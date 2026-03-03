/**
 * POST /api/admin/neighborhoods/save
 *
 * Admin-only endpoint to create or update a single neighborhood.
 * Matches by slug for upsert behavior.
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable } from '~~/server/database/schema'

const bodySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  population: z.number().nullable().optional(),
  featured: z.boolean().optional(),
  tier: z.string().nullable().optional(),
  parentRegion: z.string().nullable().optional(),
  appleMapName: z.string().nullable().optional(),
  boundaryGeojson: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const data = bodySchema.parse(body)
  const db = useDatabase(event)
  const now = new Date().toISOString()

  if (data.id) {
    // Update existing
    await db
      .update(neighborhoodsTable)
      .set({
        name: data.name,
        slug: data.slug,
        lat: data.lat,
        lng: data.lng,
        city: data.city ?? 'Austin',
        region: data.region ?? null,
        zipCode: data.zipCode ?? null,
        description: data.description ?? null,
        population: data.population ?? null,
        featured: data.featured ?? false,
        tier: data.tier ?? 'neighborhood',
        parentRegion: data.parentRegion ?? null,
        appleMapName: data.appleMapName ?? null,
        boundaryGeojson: data.boundaryGeojson ?? null,
        updatedAt: now,
      })
      .where(eq(neighborhoodsTable.id, data.id))
      .execute()

    return { success: true, action: 'updated', slug: data.slug }
  } else {
    // Insert new
    await db
      .insert(neighborhoodsTable)
      .values({
        name: data.name,
        slug: data.slug,
        lat: data.lat,
        lng: data.lng,
        city: data.city ?? 'Austin',
        region: data.region ?? null,
        zipCode: data.zipCode ?? null,
        description: data.description ?? null,
        population: data.population ?? null,
        featured: data.featured ?? false,
        tier: data.tier ?? 'neighborhood',
        parentRegion: data.parentRegion ?? null,
        appleMapName: data.appleMapName ?? null,
        boundaryGeojson: data.boundaryGeojson ?? null,
      })
      .execute()

    return { success: true, action: 'created', slug: data.slug }
  }
})
