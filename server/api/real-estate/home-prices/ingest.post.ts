import { sql } from 'drizzle-orm'

/**
 * POST /api/real-estate/home-prices/ingest
 *
 * Fetches Zillow ZHVI data and upserts into D1.
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

  // Ensure table exists
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS home_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zip_code TEXT NOT NULL,
      period TEXT NOT NULL,
      median_value REAL NOT NULL,
      yoy_change REAL,
      source TEXT DEFAULT 'zillow',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_home_prices_zip_period
    ON home_prices (zip_code, period)
  `)

  let readings
  try {
    readings = await fetchZillowHomeValues()
  }
  catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `Zillow ZHVI fetch failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const reading of readings) {
    try {
      // Check if we already have this zip+period
      const existing = await db.run(sql`
        SELECT id FROM home_prices
        WHERE zip_code = ${reading.zipCode} AND period = ${reading.period}
        LIMIT 1
      `)

      if (existing.results && existing.results.length > 0) {
        await db.run(sql`
          UPDATE home_prices SET
            median_value = ${reading.medianValue},
            yoy_change = ${reading.yoyChange}
          WHERE zip_code = ${reading.zipCode} AND period = ${reading.period}
        `)
        updated++
      }
      else {
        await db.run(sql`
          INSERT INTO home_prices (zip_code, period, median_value, yoy_change, source, created_at)
          VALUES (
            ${reading.zipCode},
            ${reading.period},
            ${reading.medianValue},
            ${reading.yoyChange},
            'zillow',
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
    source: 'zillow-zhvi',
    stats: { fetched: readings.length, inserted, updated, skipped },
  }
})
