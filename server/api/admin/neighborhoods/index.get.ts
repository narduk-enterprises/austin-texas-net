/**
 * GET /api/admin/neighborhoods
 *
 * Admin-only endpoint that lists all neighborhoods from the DB,
 * ordered by region and name. Supports optional filtering by tier and region.
 */
import { eq, asc, and } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable } from '~~/server/database/schema'

const querySchema = z.object({
  tier: z.string().optional(),
  region: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const { tier, region } = querySchema.parse(query)

  const db = useDatabase()
  const conditions = []

  if (tier) conditions.push(eq(neighborhoodsTable.tier, tier))
  if (region) conditions.push(eq(neighborhoodsTable.region, region))

  const neighborhoods = await db
    .select()
    .from(neighborhoodsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(neighborhoodsTable.region), asc(neighborhoodsTable.name))
    .all()

  return { neighborhoods, count: neighborhoods.length }
})
