import { sql } from 'drizzle-orm'
import { z } from 'zod'

/**
 * GET /api/live/lake-levels/history
 *
 * Returns time-series data for a given lake, used for charting.
 * Query params:
 *   lake — lake key (default: Travis)
 *   days — lookback period (default: 30)
 */
const querySchema = z.object({
  lake: z.string().min(1).default('Travis'),
  days: z.coerce.number().int().min(1).max(365).default(30),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { lake, days } = querySchema.parse(query)

  const db = useDatabase()

  try {
    // eslint-disable-next-line atx/prefer-drizzle-operators -- raw SQL query, no Drizzle schema
    const result = await db.run(sql`
      SELECT elevation, percent_full, conservation_storage, timestamp
      FROM lake_readings
      WHERE lake_key = ${lake}
        AND timestamp >= date('now', ${`-${days} days`})
      ORDER BY timestamp ASC
    `)

    interface LakeRow {
      elevation: number
      percent_full: number | null
      conservation_storage: number | null
      timestamp: string
    }
    const rows = (result.results ?? []) as LakeRow[]
    const data = rows.map((r) => ({
      elevation: r.elevation,
      percentFull: r.percent_full,
      conservationStorage: r.conservation_storage,
      timestamp: r.timestamp,
    }))

    return { lake, days, data }
  } catch {
    return { lake, days, data: [] }
  }
})
