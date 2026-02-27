/**
 * NWS (National Weather Service) API client for Austin, TX.
 *
 * Free, no API key required. Just needs a User-Agent header.
 * Austin grid: EWX/156,91 · Radar station: KGRK · Zone: TXZ192
 *
 * Docs: https://www.weather.gov/documentation/services-web-api
 */

const NWS_BASE = 'https://api.weather.gov'
const USER_AGENT = 'austin-texas.net (contact@austin-texas.net)'

// Austin coordinates
const AUSTIN_LAT = 30.2672
const AUSTIN_LNG = -97.7431

// Precomputed grid for Austin — avoids the /points lookup on every request
const GRID_OFFICE = 'EWX'
const GRID_X = 156
const GRID_Y = 91

// Nearest observation station: Camp Mabry (KATT)
const OBSERVATION_STATION = 'KATT'

// ─── Types ──────────────────────────────────────────────────

export interface NwsCurrentConditions {
  temperature: number | null      // °F
  feelsLike: number | null        // °F (wind chill or heat index)
  humidity: number | null         // %
  windSpeed: string               // e.g. "10 mph"
  windDirection: string           // e.g. "NNW"
  description: string             // e.g. "Partly Cloudy"
  icon: string                    // NWS icon URL
  visibility: string              // e.g. "10.0 mi"
  pressure: number | null         // inHg
  dewpoint: number | null         // °F
  heatIndex: number | null        // °F
  windChill: number | null        // °F
  timestamp: string               // ISO 8601
  station: string
}

export interface NwsForecastPeriod {
  number: number
  name: string                   // "Today", "Tonight", "Saturday", etc.
  isDaytime: boolean
  temperature: number            // °F
  temperatureUnit: string
  windSpeed: string
  windDirection: string
  shortForecast: string
  detailedForecast: string
  icon: string
  probabilityOfPrecipitation: number | null // %
  startTime: string
  endTime: string
}

export interface NwsAlert {
  id: string
  event: string                  // "Heat Advisory", "Freeze Warning", etc.
  severity: string               // "Extreme", "Severe", "Moderate", "Minor"
  urgency: string                // "Immediate", "Expected", "Future"
  headline: string
  description: string
  instruction: string | null
  onset: string                  // ISO 8601
  expires: string                // ISO 8601
  senderName: string
}

// ─── Fetch Helpers ──────────────────────────────────────────

async function nwsFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/geo+json',
    },
  })
  if (!res.ok) {
    throw new Error(`NWS API ${res.status}: ${res.statusText} — ${url}`)
  }
  return res.json() as Promise<T>
}

// ─── Current Conditions ─────────────────────────────────────

interface NwsObservationResponse {
  properties: {
    timestamp: string
    textDescription: string
    icon: string
    temperature: { value: number | null; unitCode: string }
    dewpoint: { value: number | null; unitCode: string }
    windDirection: { value: number | null }
    windSpeed: { value: number | null; unitCode: string }
    barometricPressure: { value: number | null }
    visibility: { value: number | null; unitCode: string }
    relativeHumidity: { value: number | null }
    windChill: { value: number | null; unitCode: string }
    heatIndex: { value: number | null; unitCode: string }
  }
}

function celsiusToFahrenheit(c: number | null): number | null {
  if (c === null) return null
  return Math.round((c * 9) / 5 + 32)
}

function metersToMiles(m: number | null): string {
  if (m === null) return 'N/A'
  return (m / 1609.344).toFixed(1) + ' mi'
}

function pascalToInHg(pa: number | null): number | null {
  if (pa === null) return null
  return Math.round((pa / 3386.39) * 100) / 100
}

function windDegreesToDirection(degrees: number | null): string {
  if (degrees === null) return 'N/A'
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const idx = Math.round(degrees / 22.5) % 16
  return dirs[idx]!
}

function kphToMph(kph: number | null): string {
  if (kph === null) return 'Calm'
  const mph = Math.round(kph * 0.621371)
  return `${mph} mph`
}

export async function fetchCurrentConditions(): Promise<NwsCurrentConditions> {
  const url = `${NWS_BASE}/stations/${OBSERVATION_STATION}/observations/latest`
  const data = await nwsFetch<NwsObservationResponse>(url)
  const p = data.properties

  return {
    temperature: celsiusToFahrenheit(p.temperature.value),
    feelsLike: celsiusToFahrenheit(p.heatIndex.value ?? p.windChill.value ?? p.temperature.value),
    humidity: p.relativeHumidity.value !== null ? Math.round(p.relativeHumidity.value) : null,
    windSpeed: kphToMph(p.windSpeed.value),
    windDirection: windDegreesToDirection(p.windDirection.value),
    description: p.textDescription || 'Unknown',
    icon: p.icon || '',
    visibility: metersToMiles(p.visibility.value),
    pressure: pascalToInHg(p.barometricPressure.value),
    dewpoint: celsiusToFahrenheit(p.dewpoint.value),
    heatIndex: celsiusToFahrenheit(p.heatIndex.value),
    windChill: celsiusToFahrenheit(p.windChill.value),
    timestamp: p.timestamp,
    station: OBSERVATION_STATION,
  }
}

// ─── Forecast ──────────────────────────────────────────────

interface NwsForecastResponse {
  properties: {
    periods: Array<{
      number: number
      name: string
      isDaytime: boolean
      temperature: number
      temperatureUnit: string
      windSpeed: string
      windDirection: string
      shortForecast: string
      detailedForecast: string
      icon: string
      probabilityOfPrecipitation: { value: number | null }
      startTime: string
      endTime: string
    }>
  }
}

export async function fetchForecast(): Promise<NwsForecastPeriod[]> {
  const url = `${NWS_BASE}/gridpoints/${GRID_OFFICE}/${GRID_X},${GRID_Y}/forecast`
  const data = await nwsFetch<NwsForecastResponse>(url)

  return data.properties.periods.map((p) => ({
    number: p.number,
    name: p.name,
    isDaytime: p.isDaytime,
    temperature: p.temperature,
    temperatureUnit: p.temperatureUnit,
    windSpeed: p.windSpeed,
    windDirection: p.windDirection,
    shortForecast: p.shortForecast,
    detailedForecast: p.detailedForecast,
    icon: p.icon,
    probabilityOfPrecipitation: p.probabilityOfPrecipitation?.value ?? null,
    startTime: p.startTime,
    endTime: p.endTime,
  }))
}

export async function fetchHourlyForecast(): Promise<NwsForecastPeriod[]> {
  const url = `${NWS_BASE}/gridpoints/${GRID_OFFICE}/${GRID_X},${GRID_Y}/forecast/hourly`
  const data = await nwsFetch<NwsForecastResponse>(url)

  return data.properties.periods.map((p) => ({
    number: p.number,
    name: p.name,
    isDaytime: p.isDaytime,
    temperature: p.temperature,
    temperatureUnit: p.temperatureUnit,
    windSpeed: p.windSpeed,
    windDirection: p.windDirection,
    shortForecast: p.shortForecast,
    detailedForecast: p.detailedForecast,
    icon: p.icon,
    probabilityOfPrecipitation: p.probabilityOfPrecipitation?.value ?? null,
    startTime: p.startTime,
    endTime: p.endTime,
  }))
}

// ─── Alerts ────────────────────────────────────────────────

interface NwsAlertsResponse {
  features: Array<{
    properties: {
      id: string
      event: string
      severity: string
      urgency: string
      headline: string
      description: string
      instruction: string | null
      onset: string
      expires: string
      senderName: string
    }
  }>
}

export async function fetchAlerts(): Promise<NwsAlert[]> {
  const url = `${NWS_BASE}/alerts/active?point=${AUSTIN_LAT},${AUSTIN_LNG}`
  const data = await nwsFetch<NwsAlertsResponse>(url)

  return data.features.map((f) => ({
    id: f.properties.id,
    event: f.properties.event,
    severity: f.properties.severity,
    urgency: f.properties.urgency,
    headline: f.properties.headline,
    description: f.properties.description,
    instruction: f.properties.instruction,
    onset: f.properties.onset,
    expires: f.properties.expires,
    senderName: f.properties.senderName,
  }))
}

// ─── Radar ─────────────────────────────────────────────────

export const RADAR_STATION = 'KGRK'
export const RADAR_EMBED_URL = `https://radar.weather.gov/station/${RADAR_STATION}/standard`
export const RADAR_FULL_URL = `https://radar.weather.gov/station/${RADAR_STATION}`

// ─── Drought Monitor ──────────────────────────────────────

export const DROUGHT_MONITOR_MAP_URL = 'https://droughtmonitor.unl.edu/data/png/current/current_tx_trd.png'
export const DROUGHT_MONITOR_PAGE_URL = 'https://droughtmonitor.unl.edu/CurrentMap/StateDroughtMonitor.aspx?TX'
