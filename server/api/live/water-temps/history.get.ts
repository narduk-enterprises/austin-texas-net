import { sql } from 'drizzle-orm'
import { z } from 'zod'

/**
 * GET /api/live/water-temps/history
 *
 * Returns time-series data for a given USGS site, used for charting.
 * Query params:
 *   siteId — USGS site number (default: 08155500 = Barton Springs)
 *   days   — lookback period (default: 30)
 */
const querySchema = z.object({
  siteId: z.string().min(1).default('08155500'),
  days: z.coerce.number().int().min(1).max(365).default(30),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { siteId, days } = querySchema.parse(query)

  const db = useDatabase()

  try {
    // eslint-disable-next-line atx/prefer-drizzle-operators -- raw SQL query, no Drizzle schema
    const result = await db.run(sql`
      SELECT value, unit, parameter_code, timestamp
      FROM water_readings
      WHERE site_id = ${siteId}
        AND timestamp >= datetime('now', ${`-${days} days`})
      ORDER BY timestamp ASC
    `)

    interface WaterRow {
      value: number
      unit: string
      parameter_code: string
      timestamp: string
    }
    const rows = (result.results ?? []) as WaterRow[]
    const data = rows.map((r) => ({
      value: r.value,
      unit: r.unit,
      parameterCode: r.parameter_code,
      timestamp: r.timestamp,
    }))

    return { siteId, days, data }
  } catch {
    return { siteId, days, data: [] }
  }
})
