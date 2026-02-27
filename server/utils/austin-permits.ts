/**
 * City of Austin Open Data — Building Permits fetch helper.
 *
 * Source: https://data.austintexas.gov/
 * Dataset: Issued Construction Permits
 * API: Socrata Open Data API (SODA)
 *
 * We filter for new residential construction permits to track
 * development activity across Austin neighborhoods.
 */

const SODA_BASE = 'https://data.austintexas.gov/resource'

/**
 * Dataset identifiers for City of Austin open data.
 * These are the 4x4 identifiers used in SODA API URLs.
 */
const ISSUED_PERMITS_DATASET = '3syk-w9eu'  // Issued Construction Permits

export interface BuildingPermit {
  permitNumber: string
  lat: number | null
  lng: number | null
  description: string
  units: number | null
  valuation: number | null
  issueDate: string       // YYYY-MM-DD
  workClass: string
  status: string
  address: string
  neighborhood: string | null
}

/**
 * Fetch recent new-construction residential permits from City of Austin.
 *
 * Filters:
 * - work_class = 'New' (new construction only)
 * - permit_type = 'BP' (building permits)
 * - issue_date within last 365 days
 * - housing_units > 0 (residential)
 *
 * Returns up to 1000 most recent permits.
 */
export async function fetchBuildingPermits(): Promise<BuildingPermit[]> {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const sinceDate = oneYearAgo.toISOString().substring(0, 10)

  const params = new URLSearchParams({
    '$where': `work_class = 'New' AND permit_type = 'BP' AND issued_date >= '${sinceDate}'`,
    '$order': 'issued_date DESC',
    '$limit': '1000',
  })

  const url = `${SODA_BASE}/${ISSUED_PERMITS_DATASET}.json?${params.toString()}`

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`City of Austin SODA API returned ${res.status}: ${res.statusText}`)
  }

  interface SodaPermit {
    permit_num?: string
    latitude?: string
    longitude?: string
    description?: string
    housing_units?: string
    project_valuation?: string
    issued_date?: string
    work_class?: string
    status_current?: string
    original_address1?: string
    // Some datasets use different field names
    permit_number?: string
    calendar_year_issued?: string
    total_existing_bldg_sqft?: string
    total_new_add_sqft?: string
    number_of_floors?: string
    location?: { latitude: string; longitude: string }
  }

  const data = (await res.json()) as SodaPermit[]
  const permits: BuildingPermit[] = []

  for (const row of data) {
    const permitNumber = row.permit_num || row.permit_number || ''
    if (!permitNumber) continue

    const lat = row.latitude ? parseFloat(row.latitude) : (row.location?.latitude ? parseFloat(row.location.latitude) : null)
    const lng = row.longitude ? parseFloat(row.longitude) : (row.location?.longitude ? parseFloat(row.location.longitude) : null)

    const issueDate = row.issued_date
      ? row.issued_date.substring(0, 10) // Strip time portion
      : ''
    if (!issueDate) continue

    permits.push({
      permitNumber,
      lat: lat && !isNaN(lat) ? lat : null,
      lng: lng && !isNaN(lng) ? lng : null,
      description: row.description || '',
      units: row.housing_units ? parseInt(row.housing_units, 10) || null : null,
      valuation: row.project_valuation ? parseFloat(row.project_valuation) || null : null,
      issueDate,
      workClass: row.work_class || 'New',
      status: row.status_current || '',
      address: row.original_address1 || '',
      neighborhood: null, // Will be enriched later via geocoding
    })
  }

  return permits
}
