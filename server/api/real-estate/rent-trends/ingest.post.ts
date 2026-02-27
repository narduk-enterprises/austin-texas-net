import { sql } from 'drizzle-orm'

/**
 * POST /api/real-estate/rent-trends/ingest
 *
 * Fetches Zillow ZORI data and upserts into D1.
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
    CREATE TABLE IF NOT EXISTS rent_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zip_code TEXT NOT NULL,
      period TEXT NOT NULL,
      median_rent REAL NOT NULL,
      yoy_change REAL,
      source TEXT DEFAULT 'zillow',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_rent_prices_zip_period
    ON rent_prices (zip_code, period)
  `)

  let readings
  try {
    readings = await fetchZillowRentIndex()
  }
  catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `Zillow ZORI fetch failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const reading of readings) {
    try {
      const existing = await db.run(sql`
        SELECT id FROM rent_prices
        WHERE zip_code = ${reading.zipCode} AND period = ${reading.period}
        LIMIT 1
      `)

      if (existing.results && existing.results.length > 0) {
        await db.run(sql`
          UPDATE rent_prices SET
            median_rent = ${reading.medianRent},
            yoy_change = ${reading.yoyChange}
          WHERE zip_code = ${reading.zipCode} AND period = ${reading.period}
        `)
        updated++
      }
      else {
        await db.run(sql`
          INSERT INTO rent_prices (zip_code, period, median_rent, yoy_change, source, created_at)
          VALUES (
            ${reading.zipCode},
            ${reading.period},
            ${reading.medianRent},
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
    source: 'zillow-zori',
    stats: { fetched: readings.length, inserted, updated, skipped },
  }
})
