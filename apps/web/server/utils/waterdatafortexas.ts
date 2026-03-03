/**
 * WaterDataForTexas.org — fetch helper for reservoir lake levels.
 *
 * Source: Texas Water Development Board (TWDB)
 * API: https://waterdatafortexas.org/reservoirs/recent-conditions.json
 *
 * Returns data for all Texas reservoirs; we filter to Austin-area lakes.
 */

const RECENT_CONDITIONS_URL = 'https://waterdatafortexas.org/reservoirs/recent-conditions.json'

export interface LakeLevelReading {
  lakeKey: string // "Travis", "Austin", etc.
  lakeName: string // "Lake Travis"
  lat: number
  lng: number
  elevation: number // ft above sea level
  percentFull: number | null
  conservationCapacity: number | null
  conservationStorage: number | null
  timestamp: string // YYYY-MM-DD
}

/**
 * Austin-area lakes to monitor.
 */
export const AUSTIN_LAKES = [
  'Travis',
  'Austin',
  'Buchanan',
  'Georgetown',
  'LyndonBJohnson', // LBJ
  'Inks',
  'MarbleFalls',
  'Canyon', // Canyon Lake — popular day trip
] as const

interface TwdbReservoir {
  full_name: string
  condensed_name: string
  elevation: number
  percent_full: number | null
  conservation_capacity: number | null
  conservation_storage: number | null
  timestamp: string
  gauge_location: {
    coordinates: [number, number] // [lng, lat]
    type: string
  }
}

/**
 * Fetch current lake levels for Austin-area reservoirs.
 */
export async function fetchLakeLevels(): Promise<LakeLevelReading[]> {
  const res = await fetch(RECENT_CONDITIONS_URL)
  if (!res.ok) {
    throw new Error(`WaterDataForTexas API returned ${res.status}: ${res.statusText}`)
  }

  const data = (await res.json()) as Record<string, TwdbReservoir>
  const readings: LakeLevelReading[] = []

  for (const key of AUSTIN_LAKES) {
    const lake = data[key as string]
    if (!lake) continue

    readings.push({
      lakeKey: key,
      lakeName: lake.full_name,
      lat: lake.gauge_location.coordinates[1], // GeoJSON is [lng, lat]
      lng: lake.gauge_location.coordinates[0],
      elevation: lake.elevation,
      percentFull: lake.percent_full,
      conservationCapacity: lake.conservation_capacity,
      conservationStorage: lake.conservation_storage,
      timestamp: lake.timestamp,
    })
  }

  return readings
}
