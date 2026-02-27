import { sql } from 'drizzle-orm'

/**
 * GET /api/live/lake-levels
 *
 * Returns the latest lake level reading per lake as map-compatible spots.
 * Falls back to live WaterDataForTexas fetch if no DB data exists.
 */
export default defineEventHandler(async () => {
  const db = useDatabase()

  try {
    // Get latest reading per lake
    const result = await db.run(sql`
      SELECT lr.*
      FROM lake_readings lr
      INNER JOIN (
        SELECT lake_key, MAX(timestamp) as max_ts
        FROM lake_readings
        GROUP BY lake_key
      ) latest ON lr.lake_key = latest.lake_key
        AND lr.timestamp = latest.max_ts
      ORDER BY lr.lake_name
    `)

    interface LakeRow {
      lake_key: string
      lake_name: string
      lat: number
      lng: number
      elevation: number
      percent_full: number | null
      conservation_capacity: number | null
      conservation_storage: number | null
      timestamp: string
    }
    const rows = (result.results ?? []) as LakeRow[]
    if (rows.length > 0) {
      const spots = rows.map((r) => ({
        id: r.lake_key,
        name: r.lake_name,
        lat: r.lat,
        lng: r.lng,
        elevation: r.elevation,
        percentFull: r.percent_full,
        conservationCapacity: r.conservation_capacity,
        conservationStorage: r.conservation_storage,
        displayValue:
          r.percent_full != null
            ? `${Math.round(r.percent_full)}%`
            : `${r.elevation.toFixed(1)} ft`,
        timestamp: r.timestamp,
      }))

      return { spots, source: 'db' }
    }
  } catch {
    // Table may not exist yet
  }

  // Fallback: fetch directly from WaterDataForTexas
  try {
    const readings = await fetchLakeLevels()
    const spots = readings.map((r) => ({
      id: r.lakeKey,
      name: r.lakeName,
      lat: r.lat,
      lng: r.lng,
      elevation: r.elevation,
      percentFull: r.percentFull,
      conservationCapacity: r.conservationCapacity,
      conservationStorage: r.conservationStorage,
      displayValue:
        r.percentFull != null ? `${Math.round(r.percentFull)}%` : `${r.elevation.toFixed(1)} ft`,
      timestamp: r.timestamp,
    }))

    return { spots, source: 'live' }
  } catch {
    return { spots: [], source: 'error' }
  }
})
