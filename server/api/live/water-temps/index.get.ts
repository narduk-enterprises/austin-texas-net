import { sql } from 'drizzle-orm'

/**
 * GET /api/live/water-temps
 *
 * Returns the latest water reading per site as map-compatible spots.
 * Falls back to live USGS fetch if no DB data exists yet.
 */
export default defineEventHandler(async () => {
  const db = useDatabase()

  try {
    // Get latest reading per site
    const result = await db.run(sql`
      SELECT wr.*
      FROM water_readings wr
      INNER JOIN (
        SELECT site_id, parameter_code, MAX(timestamp) as max_ts
        FROM water_readings
        GROUP BY site_id, parameter_code
      ) latest ON wr.site_id = latest.site_id
        AND wr.parameter_code = latest.parameter_code
        AND wr.timestamp = latest.max_ts
      ORDER BY wr.site_name
    `)

    interface WaterRow {
      site_id: string
      site_name: string
      lat: number
      lng: number
      value: number
      unit: string
      parameter_code: string
      timestamp: string
    }
    const rows = (result.results ?? []) as WaterRow[]
    if (rows.length > 0) {
      const spots = rows.map((r) => ({
        id: r.site_id,
        name: r.site_name,
        lat: r.lat,
        lng: r.lng,
        value: r.value,
        unit: r.unit,
        parameterCode: r.parameter_code,
        displayValue: formatWaterValue(r.value, r.unit, r.parameter_code),
        timestamp: r.timestamp,
      }))

      return { spots, source: 'db' }
    }
  } catch {
    // Table may not exist yet
  }

  // Fallback: fetch directly from USGS
  try {
    const readings = await fetchUsgsReadings()
    const spots = readings.map((r) => ({
      id: r.siteId,
      name: r.siteName,
      lat: r.lat,
      lng: r.lng,
      value: r.value,
      unit: r.unit,
      parameterCode: r.parameterCode,
      displayValue: formatWaterValue(r.value, r.unit, r.parameterCode),
      timestamp: r.timestamp,
    }))

    return { spots, source: 'live' }
  } catch {
    return { spots: [], source: 'error' }
  }
})

function formatWaterValue(value: number, unit: string, paramCode: string): string {
  if (paramCode === '00010') {
    // Convert °C to °F
    const f = Math.round((value * 9) / 5 + 32)
    return `${f}°F`
  }
  if (paramCode === '00065') {
    return `${value.toFixed(1)} ft`
  }
  return `${value} ${unit}`
}
