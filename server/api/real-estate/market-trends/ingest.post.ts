import { sql } from 'drizzle-orm'

/**
 * POST /api/real-estate/market-trends/ingest
 *
 * Fetches Redfin market stats and upserts into D1.
 * Secured with x-api-key header.
 * Designed to be called monthly by a cron trigger.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-api-key')

  if (!apiKey || apiKey !== config.ingestApiKey) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = useDatabase()

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS market_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region TEXT NOT NULL,
      region_type TEXT NOT NULL,
      period TEXT NOT NULL,
      median_sale_price REAL,
      homes_sold INTEGER,
      new_listings INTEGER,
      inventory INTEGER,
      days_on_market INTEGER,
      sale_to_list_ratio REAL,
      source TEXT DEFAULT 'redfin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_market_stats_region_period
    ON market_stats (region, period)
  `)

  let readings
  try {
    readings = await fetchRedfinMarketStats()
  }
  catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `Redfin fetch failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const stat of readings) {
    try {
      const existing = await db.run(sql`
        SELECT id FROM market_stats
        WHERE region = ${stat.region} AND period = ${stat.period} AND region_type = ${stat.regionType}
        LIMIT 1
      `)

      if (existing.results && existing.results.length > 0) {
        await db.run(sql`
          UPDATE market_stats SET
            median_sale_price = ${stat.medianSalePrice},
            homes_sold = ${stat.homesSold},
            new_listings = ${stat.newListings},
            inventory = ${stat.inventory},
            days_on_market = ${stat.daysOnMarket},
            sale_to_list_ratio = ${stat.saleToListRatio}
          WHERE region = ${stat.region} AND period = ${stat.period} AND region_type = ${stat.regionType}
        `)
        updated++
      }
      else {
        await db.run(sql`
          INSERT INTO market_stats (region, region_type, period, median_sale_price, homes_sold, new_listings, inventory, days_on_market, sale_to_list_ratio, source, created_at)
          VALUES (
            ${stat.region},
            ${stat.regionType},
            ${stat.period},
            ${stat.medianSalePrice},
            ${stat.homesSold},
            ${stat.newListings},
            ${stat.inventory},
            ${stat.daysOnMarket},
            ${stat.saleToListRatio},
            'redfin',
            datetime('now')
          )
        `)
        inserted++
      }
    }
    catch {
      skipped++
    }
  }

  return {
    success: true,
    source: 'redfin',
    stats: { fetched: readings.length, inserted, updated, skipped },
  }
})
