import { sql } from 'drizzle-orm'

/**
 * POST /api/live/water-temps/ingest
 *
 * Fetches real-time water data from USGS IV Service and upserts into D1.
 * Secured with x-api-key header (reuses ingestApiKey).
 * Designed to be called hourly by a cron trigger.
 */
export default defineEventHandler(async (event) => {
  // Auth check
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-api-key')

  if (!apiKey || apiKey !== config.ingestApiKey) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = useDatabase()

  // Ensure table exists
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS water_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      site_name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      parameter_code TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // Fetch from USGS
  let readings
  try {
    readings = await fetchUsgsReadings()
  }
  catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `USGS fetch failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let skipped = 0

  for (const reading of readings) {
    try {
      await db.run(sql`
        INSERT INTO water_readings (site_id, site_name, lat, lng, parameter_code, value, unit, timestamp, created_at)
        VALUES (
          ${reading.siteId},
          ${reading.siteName},
          ${reading.lat},
          ${reading.lng},
          ${reading.parameterCode},
          ${reading.value},
          ${reading.unit},
          ${reading.timestamp},
          datetime('now')
        )
      `)
      inserted++
    }
    catch {
      skipped++
    }
  }

  return {
    success: true,
    source: 'usgs',
    stats: {
      fetched: readings.length,
      inserted,
      skipped,
    },
  }
})
