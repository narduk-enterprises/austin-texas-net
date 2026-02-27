import { sql } from 'drizzle-orm'
import { z } from 'zod'

const querySchema = z.object({
  zip: z.string().optional(),
  months: z.coerce.number().optional().default(24),
  latest: z.enum(['true', 'false']).optional(),
})

/**
 * GET /api/real-estate/home-prices
 *
 * Returns home price data from D1.
 * Supports: ?zip=78704 (single zip), ?months=12 (limit), ?latest=true (latest per zip only)
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const query = await getValidatedQuery(event, querySchema.parse)
  const zip = query.zip
  const months = query.months
  const latest = query.latest === 'true'

  try {
    if (latest) {
      // Latest price per zip code
      const result = await db.run(sql`
        SELECT hp.*
        FROM home_prices hp
        INNER JOIN (
          SELECT zip_code, MAX(period) as max_period
          FROM home_prices
          GROUP BY zip_code
        ) latest ON hp.zip_code = latest.zip_code AND hp.period = latest.max_period
        ORDER BY hp.median_value DESC
      `)

      interface HomePriceRow {
        zip_code: string
        period: string
        median_value: number
        yoy_change: number | null
        source: string
      }

      const rows = (result.results ?? []) as HomePriceRow[]
      return {
        prices: rows.map((r) => ({
          zipCode: r.zip_code,
          period: r.period,
          medianValue: r.median_value,
          yoyChange: r.yoy_change,
          source: r.source,
        })),
        source: 'db',
      }
    }

    if (zip) {
      // Time series for a specific zip
      const result = await db.run(sql`
        SELECT * FROM home_prices
        WHERE zip_code = ${zip}
        ORDER BY period DESC
        LIMIT ${months}
      `)

      interface HomePriceRow {
        zip_code: string
        period: string
        median_value: number
        yoy_change: number | null
        source: string
      }

      const rows = (result.results ?? []) as HomePriceRow[]
      return {
        prices: rows.map((r) => ({
          zipCode: r.zip_code,
          period: r.period,
          medianValue: r.median_value,
          yoyChange: r.yoy_change,
          source: r.source,
        })),
        source: 'db',
      }
    }

    // Default: latest price per zip code
    const result = await db.run(sql`
      SELECT hp.*
      FROM home_prices hp
      INNER JOIN (
        SELECT zip_code, MAX(period) as max_period
        FROM home_prices
        GROUP BY zip_code
      ) latest ON hp.zip_code = latest.zip_code AND hp.period = latest.max_period
      ORDER BY hp.median_value DESC
    `)

    interface HomePriceRow {
      zip_code: string
      period: string
      median_value: number
      yoy_change: number | null
      source: string
    }

    const rows = (result.results ?? []) as HomePriceRow[]
    return {
      prices: rows.map((r) => ({
        zipCode: r.zip_code,
        period: r.period,
        medianValue: r.median_value,
        yoyChange: r.yoy_change,
        source: r.source,
      })),
      source: 'db',
    }
  } catch {
    return { prices: [], source: 'error' }
  }
})
