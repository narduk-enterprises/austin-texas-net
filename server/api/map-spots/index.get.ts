/**
 * GET /api/map-spots
 *
 * Public endpoint that returns featured map spots from D1,
 * filtered by content type (category), ordered by rank (nulls last).
 *
 * Query params:
 *   category — content type slug, e.g. "breakfast-tacos", "bbq", "live-music"
 */
import { desc, eq, sql, and } from 'drizzle-orm'
import { z } from 'zod'
import { mapSpotsTable } from '~~/server/database/schema'

const querySchema = z.object({
  category: z.string().min(1).default('breakfast-tacos'),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { category } = querySchema.parse(query)

  const db = useDatabase()

  try {
    const spots = await db
      .select()
      .from(mapSpotsTable)
      .where(
        and(
          eq(mapSpotsTable.contentType, category),
          eq(mapSpotsTable.featured, true),
          eq(mapSpotsTable.status, 'approved'),
        ),
      )
      .orderBy(
        sql`CASE WHEN ${mapSpotsTable.rank} IS NULL THEN 1 ELSE 0 END`,
        mapSpotsTable.rank,
        desc(mapSpotsTable.rating),
      )
      .all()

    return { spots }
  } catch {
    // Table might not exist yet during dev — return empty
    return { spots: [] }
  }
})
