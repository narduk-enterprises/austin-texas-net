/**
 * USGS Instantaneous Values (IV) Service — fetch helper.
 *
 * Fetches real-time water data from the USGS Water Services API.
 * Docs: https://waterservices.usgs.gov/docs/instantaneous-values/
 *
 * Parameter codes:
 *   00010 = Water temperature, °C
 *   00065 = Gage height, ft
 */

const USGS_IV_BASE = 'https://waterservices.usgs.gov/nwis/iv/'

export interface UsgsReading {
  siteId: string
  siteName: string
  lat: number
  lng: number
  parameterCode: string
  parameterName: string
  value: number
  unit: string
  timestamp: string // ISO 8601
}

/**
 * Austin-area USGS sites we monitor.
 * Each entry maps a site ID to the parameters we care about.
 *
 * Parameter codes:
 *   00010 = Water temperature, °C
 *   00065 = Gage height, ft
 */
export const USGS_SITES: Array<{
  siteId: string
  label: string
  params: string[] // parameter codes
}> = [
  // Water temperature + gage height
  { siteId: '08155500', label: 'Barton Springs', params: ['00010', '00065'] },
  { siteId: '08170990', label: "Jacob's Well Spring", params: ['00010', '00065'] },

  // Water temperature only
  { siteId: '08105891', label: 'Brushy Creek at Round Rock', params: ['00010'] },

  // Gage height — key Austin water bodies
  { siteId: '08158000', label: 'Lady Bird Lake (Colorado Rv at Austin)', params: ['00065'] },
  { siteId: '08154700', label: 'Bull Creek at Loop 360', params: ['00065'] },
  { siteId: '08155300', label: 'Barton Creek at Loop 360', params: ['00065'] },
  { siteId: '08155400', label: 'Barton Creek above Barton Springs', params: ['00065'] },
  { siteId: '08159000', label: 'Onion Creek at US 183 (McKinney Falls)', params: ['00065'] },
]

/**
 * Fetch current readings from USGS IV Service for all configured sites.
 */
export async function fetchUsgsReadings(): Promise<UsgsReading[]> {
  const siteIds = USGS_SITES.map((s) => s.siteId).join(',')
  const paramCodes = [...new Set(USGS_SITES.flatMap((s) => s.params))].join(',')

  const url = `${USGS_IV_BASE}?format=json&sites=${siteIds}&parameterCd=${paramCodes}&siteStatus=all`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`USGS API returned ${res.status}: ${res.statusText}`)
  }

  const json = (await res.json()) as UsgsResponse
  return parseUsgsResponse(json)
}

/* ── USGS response parsing ─────────────────────────────── */

interface UsgsResponse {
  value: {
    timeSeries: Array<{
      sourceInfo: {
        siteName: string
        siteCode: Array<{ value: string }>
        geoLocation: {
          geogLocation: { latitude: number; longitude: number }
        }
      }
      variable: {
        variableCode: Array<{ value: string }>
        variableName: string
        unit: { unitCode: string }
      }
      values: Array<{
        value: Array<{
          value: string
          dateTime: string
        }>
      }>
    }>
  }
}

function parseUsgsResponse(data: UsgsResponse): UsgsReading[] {
  const readings: UsgsReading[] = []

  for (const ts of data.value.timeSeries) {
    const siteId = ts.sourceInfo.siteCode[0]?.value
    const siteName = ts.sourceInfo.siteName
    const geo = ts.sourceInfo.geoLocation.geogLocation
    const paramCode = ts.variable.variableCode[0]?.value
    const paramName = ts.variable.variableName
    const unit = ts.variable.unit.unitCode

    if (!siteId || !paramCode) continue

    const latestValues = ts.values[0]?.value
    if (!latestValues?.length) continue

    const latest = latestValues[latestValues.length - 1]
    if (!latest || latest.value === '-999999') continue

    readings.push({
      siteId,
      siteName,
      lat: geo.latitude,
      lng: geo.longitude,
      parameterCode: paramCode,
      parameterName: paramName,
      value: parseFloat(latest.value),
      unit,
      timestamp: latest.dateTime,
    })
  }

  return readings
}
