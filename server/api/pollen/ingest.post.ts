import { sql } from 'drizzle-orm'

/**
 * POST /api/pollen/ingest
 *
 * Scrapes KXAN pollen data and upserts all readings into D1.
 * Secured with x-api-key header.
 * Designed to be called daily by a cron trigger.
 */
export default defineEventHandler(async (event) => {
  // Auth check
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-api-key')

  if (!apiKey || apiKey !== config.ingestApiKey) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = useDatabase()

  // Scrape KXAN
  let kxanData
  try {
    kxanData = await scrapeKxanPollen()
  } catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `KXAN scrape failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let skipped = 0

  // Upsert cedar readings
  for (const reading of kxanData.cedar) {
    const severity = getSeverityLabel(reading.count)
    try {
      await db.run(sql`
        INSERT INTO pollen_readings (date, count, severity, source, created_at)
        VALUES (${reading.date}, ${reading.count}, ${severity}, 'kxan', datetime('now'))
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
    source: 'kxan',
    reportDate: kxanData.reportDate,
    stats: {
      total: kxanData.cedar.length,
      inserted,
      skipped,
    },
    levels: kxanData.levels,
  }
})

function getSeverityLabel(count: number): string {
  if (count < 50) return 'low'
  if (count < 500) return 'medium'
  if (count < 1500) return 'high'
  if (count < 5000) return 'very-high'
  return 'extreme'
}
