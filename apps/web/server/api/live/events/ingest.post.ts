import { sql } from 'drizzle-orm'

/**
 * POST /api/live/events/ingest
 *
 * Scrapes weekend events from Do512 and caches in D1.
 * Secured with x-api-key header (reuses ingestApiKey).
 * Designed to be called daily by a cron trigger.
 */
export default defineEventHandler(async (event) => {
  // Auth check
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-api-key')

  if (!apiKey || apiKey !== config.ingestApiKey) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = useDatabase(event)

  // Ensure table exists
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS events_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date_display TEXT NOT NULL,
      date_iso TEXT NOT NULL,
      venue TEXT NOT NULL DEFAULT 'TBA',
      category TEXT NOT NULL DEFAULT 'other',
      url TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      is_free INTEGER NOT NULL DEFAULT 0,
      scraped_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(name, date_iso, venue)
    )
  `)

  // Clean up old events (older than 7 days)
  await db.run(sql`
    DELETE FROM events_cache WHERE date_iso < date('now', '-7 days')
  `)

  // Scrape Do512
  let result
  try {
    result = await scrapeDo512Events()
  } catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `Do512 scrape failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let skipped = 0

  for (const e of result.events) {
    try {
      await db.run(sql`
        INSERT OR IGNORE INTO events_cache (name, date_display, date_iso, venue, category, url, image_url, is_free, scraped_at)
        VALUES (${e.name}, ${e.date}, ${e.dateISO}, ${e.venue}, ${e.category}, ${e.url}, ${e.imageUrl}, ${e.isFree ? 1 : 0}, datetime('now'))
      `)
      inserted++
    } catch {
      skipped++
    }
  }

  return {
    success: true,
    source: 'do512',
    weekendStart: result.weekendStart,
    weekendEnd: result.weekendEnd,
    stats: {
      fetched: result.events.length,
      inserted,
      skipped,
    },
  }
})
