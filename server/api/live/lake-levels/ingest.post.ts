import { sql } from 'drizzle-orm'

/**
 * POST /api/live/lake-levels/ingest
 *
 * Fetches lake level data from WaterDataForTexas.org and upserts into D1.
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
    CREATE TABLE IF NOT EXISTS lake_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lake_key TEXT NOT NULL,
      lake_name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      elevation REAL NOT NULL,
      percent_full REAL,
      conservation_capacity REAL,
      conservation_storage REAL,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // Fetch from WaterDataForTexas
  let readings
  try {
    readings = await fetchLakeLevels()
  } catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `WaterDataForTexas fetch failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let skipped = 0

  for (const reading of readings) {
    // Only insert if we don't have this lake+timestamp already
    try {
      const existing = await db.run(sql`
        SELECT id FROM lake_readings
        WHERE lake_key = ${reading.lakeKey} AND timestamp = ${reading.timestamp}
        LIMIT 1
      `)

      if (existing.results && existing.results.length > 0) {
        // Update existing
        await db.run(sql`
          UPDATE lake_readings SET
            elevation = ${reading.elevation},
            percent_full = ${reading.percentFull},
            conservation_capacity = ${reading.conservationCapacity},
            conservation_storage = ${reading.conservationStorage}
          WHERE lake_key = ${reading.lakeKey} AND timestamp = ${reading.timestamp}
        `)
        skipped++
      } else {
        await db.run(sql`
          INSERT INTO lake_readings (lake_key, lake_name, lat, lng, elevation, percent_full, conservation_capacity, conservation_storage, timestamp, created_at)
          VALUES (
            ${reading.lakeKey},
            ${reading.lakeName},
            ${reading.lat},
            ${reading.lng},
            ${reading.elevation},
            ${reading.percentFull},
            ${reading.conservationCapacity},
            ${reading.conservationStorage},
            ${reading.timestamp},
            datetime('now')
          )
        `)
        inserted++
      }
    } catch {
      skipped++
    }
  }

  return {
    success: true,
    source: 'waterdatafortexas',
    stats: {
      fetched: readings.length,
      inserted,
      skipped,
    },
  }
})
