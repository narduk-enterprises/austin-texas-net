import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable, mapSpotsTable } from '~~/server/database/schema'

const paramsSchema = z.object({
  slug: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { slug } = paramsSchema.parse(getRouterParams(event))

  const db = useDatabase()

  const neighborhood = await db
    .select()
    .from(neighborhoodsTable)
    .where(eq(neighborhoodsTable.slug, slug))
    .get()

  if (!neighborhood) {
    throw createError({ statusCode: 404, statusMessage: 'Neighborhood not found' })
  }

  // Fetch top 5 approved spots for this neighborhood
  const spots = await db
    .select()
    .from(mapSpotsTable)
    .where(
      and(eq(mapSpotsTable.neighborhood, neighborhood.name), eq(mapSpotsTable.status, 'approved')),
    )
    .orderBy(
      sql`CASE WHEN ${mapSpotsTable.neighborhoodRank} IS NULL THEN 1 ELSE 0 END`,
      mapSpotsTable.neighborhoodRank,
      mapSpotsTable.rank,
    )
    .limit(5)
    .all()

  return { neighborhood, spots }
})
