import { sql } from 'drizzle-orm'

/**
 * POST /api/live/aqi/ingest
 *
 * Fetches current AQI data from EPA AirNow and persists to D1.
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

  const airnowKey = config.airnowApiKey as string | undefined
  if (!airnowKey) {
    throw createError({ statusCode: 500, message: 'AIRNOW_API_KEY not configured' })
  }

  const db = useDatabase(event)

  // Ensure table exists
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS aqi_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      hour INTEGER NOT NULL,
      parameter TEXT NOT NULL,
      aqi INTEGER NOT NULL,
      category TEXT NOT NULL,
      category_number INTEGER NOT NULL,
      site_name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(date, hour, parameter)
    )
  `)

  // Fetch from AirNow
  let observations
  try {
    observations = await fetchAirNowCurrent(airnowKey)
  } catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `AirNow fetch failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let skipped = 0

  for (const obs of observations) {
    try {
      await db.run(sql`
        INSERT INTO aqi_readings (date, hour, parameter, aqi, category, category_number, site_name, created_at)
        VALUES (${obs.dateObserved}, ${obs.hourObserved}, ${obs.parameterName}, ${obs.aqi}, ${obs.category.name}, ${obs.category.number}, ${obs.siteName}, datetime('now'))
        ON CONFLICT(date, hour, parameter) DO UPDATE SET
          aqi = excluded.aqi,
          category = excluded.category,
          category_number = excluded.category_number
      `)
      inserted++
    } catch {
      skipped++
    }
  }

  return {
    success: true,
    source: 'airnow',
    stats: {
      fetched: observations.length,
      inserted,
      skipped,
    },
  }
})
