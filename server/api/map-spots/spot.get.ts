/**
 * GET /api/map-spots/spot
 *
 * Returns a single spot by ID.
 * Query params:
 *   id — Apple Maps place ID (primary key)
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { mapSpotsTable } from '~~/server/database/schema'

const querySchema = z.object({
  id: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { id } = querySchema.parse(query)

  const db = useDatabase()

  const spot = await db.select().from(mapSpotsTable).where(eq(mapSpotsTable.id, id)).get()

  if (!spot) {
    throw createError({ statusCode: 404, statusMessage: 'Spot not found' })
  }

  return { spot }
})
