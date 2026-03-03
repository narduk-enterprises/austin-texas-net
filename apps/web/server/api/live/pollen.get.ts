import { sql } from 'drizzle-orm'

/**
 * GET /api/live/pollen
 *
 * Returns current pollen data for Austin.
 * Data sources (in priority order):
 *   1. D1 `pollen_readings` table (populated by pollen-cron worker)
 *   2. Live KXAN scraper fallback
 *
 * No API key needed — this is a public read endpoint.
 */
export default defineCachedEventHandler(
  async (event) => {
    const db = useDatabase(event)

    // ── Try D1 first (populated by cron) ──────────────────────
    try {
      // Latest readings by source (KXAN has grains/m³, austincedar has historical)
      const latestResult = await db.run(sql`
        SELECT date, count, severity, source, created_at
        FROM pollen_readings
        WHERE source = 'kxan'
        ORDER BY date DESC
        LIMIT 30
      `)

      interface PollenRow {
        date: string
        count: number
        severity: string
        source: string
        created_at: string
      }
      const rows = (latestResult.results ?? []) as PollenRow[]

      if (rows.length > 0) {
        const latest = rows[0]!
        const history = rows.map((r) => ({
          date: r.date,
          count: r.count,
          severity: r.severity,
        }))

        return {
          source: 'db',
          current: {
            count: latest.count,
            level: latest.severity,
            date: latest.date,
          },
          history,
          updatedAt: latest.created_at,
        }
      }
    } catch {
      // Table may not exist yet — fall through to live fetch
    }

    // ── Fallback: live KXAN scrape ────────────────────────────
    try {
      const kxanData = await scrapeKxanPollen()

      const latestCedar =
        kxanData.cedar.length > 0 ? kxanData.cedar.at(-1)! : null

      const history = kxanData.cedar.map((r) => ({
        date: r.date,
        count: r.count,
        severity: getSeverityLabel(r.count),
      }))

      return {
        source: 'kxan-live',
        current: {
          count: latestCedar?.count ?? 0,
          level: latestCedar ? getSeverityLabel(latestCedar.count) : 'unknown',
          date: latestCedar?.date ?? kxanData.reportDate,
        },
        levels: kxanData.levels,
        history,
        updatedAt: kxanData.lastFetched,
      }
    } catch {
      // KXAN also failed
    }

    // ── Last resort: austincedar.com ──────────────────────────
    try {
      const cedarData = await fetchAustinCedar(30)

      const latest =
        cedarData.readings.length > 0 ? cedarData.readings.at(-1)! : null

      const history = cedarData.readings.map((r) => ({
        date: r.date,
        count: r.count,
        severity: getSeverityLabel(r.count),
      }))

      return {
        source: 'austincedar-live',
        current: {
          count: latest?.count ?? 0,
          level: latest ? getSeverityLabel(latest.count) : 'unknown',
          date: latest?.date ?? '',
        },
        history,
        updatedAt: cedarData.fetchedAt,
      }
    } catch {
      // All sources failed
      return {
        source: 'error',
        current: { count: 0, level: 'unknown', date: '' },
        history: [],
        updatedAt: new Date().toISOString(),
        error: 'All pollen data sources unavailable',
      }
    }
  },
  {
    maxAge: 60 * 60 * 6, // Cache for 6 hours
    name: 'live-pollen',
  },
)

function getSeverityLabel(count: number): string {
  if (count < 50) return 'low'
  if (count < 500) return 'medium'
  if (count < 1500) return 'high'
  if (count < 5000) return 'very-high'
  return 'extreme'
}
