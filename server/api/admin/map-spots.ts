/**
 * /api/admin/map-spots
 *
 * GET: List spots for a specific contentType
 * POST: Create or update a spot
 * DELETE: Remove a spot
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { mapSpotsTable } from '~~/server/database/schema'

const spotSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  category: z.string().optional(),
  contentType: z.string().min(1),
  phone: z.string().optional(),
  url: z.string().optional(),
  rank: z.number().optional().nullable(),
  neighborhoodRank: z.number().optional().nullable(),
  area: z.string().optional().nullable(),
  knownFor: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  priceRange: z.string().optional().nullable(),
  rating: z.number().optional().nullable(),
  status: z.enum(['approved', 'pending', 'archived']).optional().default('approved'),
  sourceRunId: z.number().optional().nullable(),
  featured: z.boolean().optional().default(true),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()

  if (event.method === 'GET') {
    const query = await getValidatedQuery(event, (data) =>
      z
        .object({
          contentType: z.string().min(1),
        })
        .parse(data),
    )

    const contentType = query.contentType

    const spots = await db
      .select()
      .from(mapSpotsTable)
      .where(eq(mapSpotsTable.contentType, contentType))
      .orderBy(mapSpotsTable.neighborhoodRank, mapSpotsTable.rank)
      .all()

    return { spots }
  }

  if (event.method === 'POST') {
    const body = spotSchema.parse(await readBody(event))
    const existing = await db
      .select()
      .from(mapSpotsTable)
      .where(eq(mapSpotsTable.id, body.id))
      .get()

    const data = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    if (existing) {
      await db.update(mapSpotsTable).set(data).where(eq(mapSpotsTable.id, body.id))
      return { ok: true, action: 'updated' }
    } else {
      await db.insert(mapSpotsTable).values(data)
      return { ok: true, action: 'created' }
    }
  }

  if (event.method === 'DELETE') {
    const body = await readValidatedBody(event, (data) =>
      z
        .object({
          id: z.string().min(1),
        })
        .parse(data),
    )

    await db.delete(mapSpotsTable).where(eq(mapSpotsTable.id, body.id))
    return { ok: true, action: 'deleted' }
  }
})
