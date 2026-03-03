/**
 * Google Pollen API Client
 *
 * Provides 5-day pollen forecast with per-species data for Austin, TX.
 * Free tier: 5,000 queries/month.
 *
 * API docs: https://developers.google.com/maps/documentation/pollen
 */

// Austin, TX coordinates
const AUSTIN_LAT = 30.2672
const AUSTIN_LNG = -97.7431

export interface GooglePollenDay {
  date: string                    // YYYY-MM-DD
  treeUPI: number                 // Universal Pollen Index (0-5)
  treeCategory: string            // 'None' | 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  juniperUPI: number | null       // Cedar/Juniper-specific UPI
  juniperCategory: string | null
  grassUPI: number | null
  weedUPI: number | null
  activeSpecies: string[]         // e.g. ['Elm', 'Juniper', 'Oak']
  healthRecommendations: string[]
  inSeason: boolean               // Whether tree pollen is in season
}

interface GooglePollenResponse {
  regionCode: string
  dailyInfo: Array<{
    date: { year: number; month: number; day: number }
    pollenTypeInfo?: Array<{
      code: string
      displayName: string
      inSeason?: boolean
      indexInfo?: {
        code: string
        displayName: string
        value: number
        category: string
        indexDescription: string
      }
      healthRecommendations?: string[]
    }>
    plantInfo?: Array<{
      code: string
      displayName: string
      inSeason?: boolean
      indexInfo?: {
        code: string
        value: number
        category: string
        indexDescription: string
      }
    }>
  }>
}

/**
 * Fetch 5-day pollen forecast from Google Pollen API.
 */
export async function fetchGooglePollenForecast(
  apiKey: string,
  days: number = 5,
): Promise<GooglePollenDay[]> {
  const url = `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.longitude=${AUSTIN_LNG}&location.latitude=${AUSTIN_LAT}&days=${Math.min(days, 5)}`

  const response = await fetch(url)

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Google Pollen API error ${response.status}: ${text}`)
  }

  const json = await response.json() as GooglePollenResponse

  if (!json.dailyInfo) return []

  return json.dailyInfo.map((day) => {
    const d = day.date
    const dateStr = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`

    // Extract tree pollen info
    const treeType = day.pollenTypeInfo?.find(p => p.code === 'TREE')
    const grassType = day.pollenTypeInfo?.find(p => p.code === 'GRASS')
    const weedType = day.pollenTypeInfo?.find(p => p.code === 'WEED')

    // Extract juniper/cedar specifically
    const juniper = day.plantInfo?.find(p => p.code === 'JUNIPER')

    // Get all active species
    const activeSpecies = (day.plantInfo || [])
      .filter(p => p.indexInfo && p.indexInfo.value > 0)
      .map(p => p.displayName)

    return {
      date: dateStr,
      treeUPI: treeType?.indexInfo?.value ?? 0,
      treeCategory: treeType?.indexInfo?.category ?? 'None',
      juniperUPI: juniper?.indexInfo?.value ?? null,
      juniperCategory: juniper?.indexInfo?.category ?? null,
      grassUPI: grassType?.indexInfo?.value ?? null,
      weedUPI: weedType?.indexInfo?.value ?? null,
      activeSpecies,
      healthRecommendations: treeType?.healthRecommendations ?? [],
      inSeason: treeType?.inSeason ?? false,
    }
  })
}

/**
 * Map Google UPI (0-5) to approximate grains/m³ for comparability with KXAN data.
 * This is an approximation based on known Austin cedar pollen levels.
 *
 * UPI Scale:
 *   0 = None          (~0 grains/m³)
 *   1 = Very Low      (~1-50 grains/m³)
 *   2 = Low           (~50-200 grains/m³)
 *   3 = Moderate      (~200-500 grains/m³)
 *   4 = High          (~500-2000 grains/m³)
 *   5 = Very High     (~2000+ grains/m³)
 */
export function upiToApproxCount(upi: number): number {
  const map: Record<number, number> = {
    0: 0,
    1: 25,
    2: 125,
    3: 350,
    4: 1000,
    5: 3000,
  }
  return map[upi] ?? 0
}

/**
 * Map UPI to severity label (matching our internal scale)
 */
export function upiToSeverity(upi: number): string {
  if (upi <= 0) return 'none'
  if (upi <= 1) return 'low'
  if (upi <= 2) return 'medium'
  if (upi <= 3) return 'medium'
  if (upi <= 4) return 'high'
  return 'very-high'
}
