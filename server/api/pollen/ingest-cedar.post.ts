import { sql } from 'drizzle-orm'

/**
 * POST /api/pollen/ingest-cedar
 *
 * Fetches cedar pollen history from austincedar.com and upserts into D1.
 * Secured with x-api-key header (reuses ingestApiKey).
 * Designed to be called daily by a cron trigger / scheduled worker.
 */
export default defineEventHandler(async (event) => {
  // Auth check
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-api-key')

  if (!apiKey || apiKey !== config.ingestApiKey) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = useDatabase()

  // Fetch from austincedar.com
  let cedarData
  try {
    cedarData = await fetchAustinCedar(90)
  } catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `AustinCedar.com fetch failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let skipped = 0

  // Upsert readings
  for (const reading of cedarData.readings) {
    const severity = getSeverityLabel(reading.count)
    try {
      await db.run(sql`
        INSERT INTO pollen_readings (date, count, severity, source, created_at)
        VALUES (${reading.date}, ${reading.count}, ${severity}, 'austincedar', datetime('now'))
        ON CONFLICT(date, source) DO UPDATE SET
          count = excluded.count,
          severity = excluded.severity
      `)
      inserted++
    } catch {
      skipped++
    }
  }

  return {
    success: true,
    source: 'austincedar',
    fetchedAt: cedarData.fetchedAt,
    stats: {
      total: cedarData.readings.length,
      inserted,
      skipped,
    },
  }
})

function getSeverityLabel(count: number): string {
  if (count < 50) return 'low'
  if (count < 500) return 'medium'
  if (count < 1500) return 'high'
  if (count < 5000) return 'very-high'
  return 'extreme'
}
