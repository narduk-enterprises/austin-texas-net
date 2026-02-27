import { sql } from 'drizzle-orm'

/**
 * GET /api/live/events
 *
 * Returns weekend events for Austin.
 * Data sources (in priority order):
 *   1. D1 `events_cache` table (populated by events cron)
 *   2. Live Do512 scrape fallback
 *
 * Cached for 4 hours in production. No cache in dev for easier testing.
 */
export default defineCachedEventHandler(
  async () => {
    const db = useDatabase()

    // ── Try D1 cache first ────────────────────────────────────
    try {
      const result = await db.run(sql`
        SELECT name, date_display, date_iso, venue, category, url, is_free, image_url, scraped_at
        FROM events_cache
        WHERE date_iso >= date('now', '-1 day')
        ORDER BY date_iso ASC
        LIMIT 100
      `)

      interface EventRow {
        name: string
        date_display: string
        date_iso: string
        venue: string
        category: string
        url: string
        is_free: number
        image_url: string
        scraped_at: string
      }
      const rows = (result.results ?? []) as EventRow[]

      if (rows.length > 0) {
        const events = rows.map((r) => ({
          name: r.name,
          date: r.date_display,
          dateISO: r.date_iso,
          venue: r.venue,
          category: r.category,
          url: r.url,
          isFree: Boolean(r.is_free),
          imageUrl: r.image_url ?? '',
        }))

        const byCat = groupByCategory(events)

        return {
          source: 'db',
          count: events.length,
          events,
          byCategory: byCat,
          updatedAt: rows[0]!.scraped_at,
        }
      }
    } catch {
      // Table may not exist yet
    }

    // ── Fallback: live Do512 scrape ───────────────────────────
    try {
      const result = await scrapeDo512Events()

      if (result.events.length > 0) {
        // Cache in DB for future reads (best-effort)
        cacheEvents(db, result.events).catch(() => {})

        const byCat = groupByCategory(result.events)

        return {
          source: 'do512-live',
          count: result.events.length,
          events: result.events,
          byCategory: byCat,
          weekendStart: result.weekendStart,
          weekendEnd: result.weekendEnd,
          updatedAt: result.fetchedAt,
        }
      }
    } catch (err: unknown) {
      // Return error info so we can debug
      return {
        source: 'error',
        count: 0,
        events: [],
        byCategory: {},
        error: (err as Error).message,
        updatedAt: new Date().toISOString(),
      }
    }

    // ── All sources empty ─────────────────────────────────────
    return {
      source: 'none',
      count: 0,
      events: [],
      byCategory: {},
      updatedAt: new Date().toISOString(),
    }
  },
  {
    maxAge: 60 * 60 * 4, // Cache for 4 hours
    name: 'live-events',
  },
)

// ─── Helpers ─────────────────────────────────────────────

interface SimpleEvent {
  name: string
  category: string
}

function groupByCategory<T extends SimpleEvent>(events: T[]): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const event of events) {
    const cat = event.category || 'other'
    if (!result[cat]) result[cat] = []
    result[cat].push(event)
  }
  return result
}

async function cacheEvents(
  db: ReturnType<typeof useDatabase>,
  events: Array<{
    name: string
    date: string
    dateISO: string
    venue: string
    category: string
    url: string
    isFree: boolean
    imageUrl: string
  }>,
) {
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

  for (const e of events) {
    try {
      await db.run(sql`
        INSERT OR IGNORE INTO events_cache (name, date_display, date_iso, venue, category, url, image_url, is_free, scraped_at)
        VALUES (${e.name}, ${e.date}, ${e.dateISO}, ${e.venue}, ${e.category}, ${e.url}, ${e.imageUrl}, ${e.isFree ? 1 : 0}, datetime('now'))
      `)
    } catch {
      // Skip individual insert failures
    }
  }
}
