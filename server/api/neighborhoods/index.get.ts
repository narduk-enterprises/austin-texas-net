/**
 * GET /api/neighborhoods
 *
 * Public endpoint returning all neighborhoods from D1,
 * optionally filtered by city or region.
 *
 * Query params:
 *   city   — filter by city name, e.g. "Austin"
 *   region — filter by region, e.g. "Central"
 */
import { eq, and, asc } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable } from '~~/server/database/schema'

const querySchema = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { city, region } = querySchema.parse(query)

  const db = useDatabase()

  try {
    const conditions = []

    if (city) {
      conditions.push(eq(neighborhoodsTable.city, city))
    }

    if (region) {
      conditions.push(eq(neighborhoodsTable.region, region))
    }

    const neighborhoods = await db.select()
      .from(neighborhoodsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(neighborhoodsTable.region), asc(neighborhoodsTable.name))
      .all()

    return { neighborhoods, count: neighborhoods.length }
  }
  catch {
    // Table might not exist yet during dev — return empty
    return { neighborhoods: [], count: 0 }
  }
})
