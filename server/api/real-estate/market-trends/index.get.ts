import { sql } from 'drizzle-orm'
import { z } from 'zod'

const querySchema = z.object({
  months: z.coerce.number().optional().default(24),
})

/**
 * GET /api/real-estate/market-trends
 *
 * Returns market stats from D1.
 * Supports: ?region=Austin,TX&months=24
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const query = await getValidatedQuery(event, querySchema.parse)
  const months = query.months

  try {
    const result = await db.run(sql`
      SELECT * FROM market_stats
      ORDER BY period DESC
      LIMIT ${months}
    `)

    interface MarketStatRow {
      region: string
      region_type: string
      period: string
      median_sale_price: number | null
      homes_sold: number | null
      new_listings: number | null
      inventory: number | null
      days_on_market: number | null
      sale_to_list_ratio: number | null
      source: string
    }

    const rows = (result.results ?? []) as MarketStatRow[]
    return {
      stats: rows.map((r) => ({
        region: r.region,
        regionType: r.region_type,
        period: r.period,
        medianSalePrice: r.median_sale_price,
        homesSold: r.homes_sold,
        newListings: r.new_listings,
        inventory: r.inventory,
        daysOnMarket: r.days_on_market,
        saleToListRatio: r.sale_to_list_ratio,
        source: r.source,
      })),
      source: 'db',
    }
  } catch {
    return { stats: [], source: 'error' }
  }
})
