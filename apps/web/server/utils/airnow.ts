/**
 * EPA AirNow API Client for Austin, TX
 *
 * Free API key required — get one at https://docs.airnowapi.org/account/request/
 * Rate limit: 500 req/hour (very generous).
 *
 * Provides current AQI, forecast, and observation data for the Austin reporting area.
 *
 * Docs: https://docs.airnowapi.org/webservices
 */

// Austin, TX coordinates (downtown)
const AUSTIN_LAT = 30.2672
const AUSTIN_LNG = -97.7431

// ─── Types ───────────────────────────────────────────────

export interface AqiObservation {
  dateObserved: string // "2026-02-14"
  hourObserved: number // 0-23
  localTimeZone: string // "CST"
  parameterName: string // "O3", "PM2.5", "PM10"
  aqi: number // 0-500
  category: AqiCategory
  siteName: string
  stateCode: string
  latitude: number
  longitude: number
}

export interface AqiForecast {
  dateIssue: string
  dateForecast: string
  parameterName: string
  aqi: number
  category: AqiCategory
  actionDay: boolean
  discussion: string
}

export interface AqiCategory {
  number: number // 1-6
  name: string // "Good", "Moderate", "Unhealthy for Sensitive Groups", etc.
}

export interface AqiResult {
  observations: AqiObservation[]
  forecast: AqiForecast[]
  dominantPollutant: string
  overallAqi: number
  overallCategory: string
  healthMessage: string
  fetchedAt: string
}

// ─── AQI Category helpers ────────────────────────────────

const AQI_HEALTH_MESSAGES: Record<number, string> = {
  1: "Air quality is good. It's a great day to be active outside.",
  2: 'Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.',
  3: 'Members of sensitive groups (people with asthma, older adults, children) may experience health effects. The general public is less likely to be affected.',
  4: 'Some members of the general public may experience health effects. Members of sensitive groups may experience more serious effects.',
  5: 'The health of everyone may be affected. Members of sensitive groups may experience more serious effects.',
  6: 'Everyone may experience serious health effects. Stay indoors and reduce physical activity.',
}

// ─── Fetch ───────────────────────────────────────────────

/**
 * Fetch current AQI observations for Austin from EPA AirNow.
 */
export async function fetchAirNowCurrent(apiKey: string): Promise<AqiObservation[]> {
  const url = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${AUSTIN_LAT}&longitude=${AUSTIN_LNG}&distance=25&API_KEY=${apiKey}`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AirNow current observation failed (${response.status}): ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as Array<{
    DateObserved: string
    HourObserved: number
    LocalTimeZone: string
    ParameterName: string
    AQI: number
    Category: { Number: number; Name: string }
    ReportingArea: string
    StateCode: string
    Latitude: number
    Longitude: number
  }>

  return data.map((d) => ({
    dateObserved: d.DateObserved.trim(),
    hourObserved: d.HourObserved,
    localTimeZone: d.LocalTimeZone,
    parameterName: d.ParameterName,
    aqi: d.AQI,
    category: { number: d.Category.Number, name: d.Category.Name },
    siteName: d.ReportingArea,
    stateCode: d.StateCode,
    latitude: d.Latitude,
    longitude: d.Longitude,
  }))
}

/**
 * Fetch AQI forecast for Austin from EPA AirNow.
 */
export async function fetchAirNowForecast(apiKey: string): Promise<AqiForecast[]> {
  const url = `https://www.airnowapi.org/aq/forecast/latLong/?format=application/json&latitude=${AUSTIN_LAT}&longitude=${AUSTIN_LNG}&distance=25&API_KEY=${apiKey}`

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AirNow forecast failed (${response.status}): ${text.slice(0, 200)}`)
  }

  const data = (await response.json()) as Array<{
    DateIssue: string
    DateForecast: string
    ParameterName: string
    AQI: number
    Category: { Number: number; Name: string }
    ActionDay: boolean
    Discussion: string
  }>

  return data.map((d) => ({
    dateIssue: d.DateIssue,
    dateForecast: d.DateForecast.trim(),
    parameterName: d.ParameterName,
    aqi: d.AQI,
    category: { number: d.Category.Number, name: d.Category.Name },
    actionDay: d.ActionDay,
    discussion: d.Discussion || '',
  }))
}

/**
 * Fetch complete AQI data (current + forecast) for Austin.
 */
export async function fetchAirNowData(apiKey: string): Promise<AqiResult> {
  const [observations, forecast] = await Promise.all([
    fetchAirNowCurrent(apiKey),
    fetchAirNowForecast(apiKey),
  ])

  // Find the dominant pollutant (highest AQI)
  const sorted = [...observations].sort((a, b) => b.aqi - a.aqi)
  const dominant = sorted[0]

  const overallAqi = dominant?.aqi ?? 0
  const overallCategory = dominant?.category.name ?? 'Unknown'
  const categoryNumber = dominant?.category.number ?? 1
  const healthMessage = AQI_HEALTH_MESSAGES[categoryNumber] ?? ''

  return {
    observations,
    forecast,
    dominantPollutant: dominant?.parameterName ?? 'Unknown',
    overallAqi,
    overallCategory,
    healthMessage,
    fetchedAt: new Date().toISOString(),
  }
}
