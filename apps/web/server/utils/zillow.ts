/**
 * Zillow Research Data — fetch helpers for ZHVI and ZORI.
 *
 * Source: https://www.zillow.com/research/data/
 *
 * ZHVI = Zillow Home Value Index (typical home value, smoothed, seasonally adjusted)
 * ZORI = Zillow Observed Rent Index (typical rent, smoothed)
 *
 * Both are published as CSV files, updated on the 16th of each month.
 * We download the zip-code level CSVs and filter to Austin-area zip codes.
 */

/**
 * Austin-area zip codes (78xxx range + surrounding suburbs).
 * This covers the Austin-Round Rock-San Marcos MSA.
 */
export const AUSTIN_ZIP_CODES = [
  // Core Austin
  '78701', '78702', '78703', '78704', '78705',
  '78712', '78717', '78719', '78721', '78722',
  '78723', '78724', '78725', '78726', '78727',
  '78728', '78729', '78730', '78731', '78732',
  '78733', '78734', '78735', '78736', '78737',
  '78738', '78739', '78741', '78742', '78744',
  '78745', '78746', '78747', '78748', '78749',
  '78750', '78751', '78752', '78753', '78754',
  '78756', '78757', '78758', '78759',
  // Round Rock / Cedar Park / Leander
  '78613', '78615', '78617', '78634', '78641',
  '78660', '78664', '78665', '78681',
  // Pflugerville / Hutto / Manor
  '78653', '78660', '78728',
  // Buda / Kyle / San Marcos
  '78610', '78640', '78666',
  // Georgetown / Liberty Hill
  '78626', '78628', '78633', '78642',
  // Dripping Springs / Bee Cave / Lakeway
  '78620', '78669', '78734', '78738',
] as const

// Deduplicate
const AUSTIN_ZIP_SET: Set<string> = new Set(AUSTIN_ZIP_CODES)

export interface ZillowHomeValue {
  zipCode: string
  period: string    // YYYY-MM
  medianValue: number
  yoyChange: number | null
}

export interface ZillowRentValue {
  zipCode: string
  period: string    // YYYY-MM
  medianRent: number
  yoyChange: number | null
}

/**
 * Zillow ZHVI CSV URL — zip code level, all homes, SFR + condo, smoothed, seasonally adjusted.
 */
const ZHVI_CSV_URL = 'https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv'

/**
 * Zillow ZORI CSV URL — zip code level, all homes, smoothed.
 */
const ZORI_CSV_URL = 'https://files.zillowstatic.com/research/public_csvs/zori/Zip_zori_uc_sfrcondomfr_sm_month.csv'

/**
 * Parse CSV text into rows. Handles quoted fields with commas.
 */
function parseCSV(text: string): string[][] {
  const lines = text.split('\n')
  return lines.map((line) => {
    const row: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    row.push(current.trim())
    return row
  }).filter(row => row.length > 1)
}

/**
 * Fetch Zillow ZHVI data for Austin-area zip codes.
 * Returns the last 24 months of data for each zip code.
 */
export async function fetchZillowHomeValues(): Promise<ZillowHomeValue[]> {
  const res = await fetch(ZHVI_CSV_URL)
  if (!res.ok) {
    throw new Error(`Zillow ZHVI CSV fetch failed: ${res.status} ${res.statusText}`)
  }

  const text = await res.text()
  const rows = parseCSV(text)
  if (rows.length < 2) throw new Error('Zillow ZHVI CSV is empty or malformed')

  const headers = rows[0]!
  const results: ZillowHomeValue[] = []

  // Find the date columns (they start after the metadata columns)
  // Headers: RegionID, SizeRank, RegionName, RegionType, StateName, State, City, Metro, CountyName, ...date columns
  const dateStartIdx = headers.findIndex(h => /^\d{4}-\d{2}-\d{2}$/.test(h))
  if (dateStartIdx === -1) throw new Error('Could not find date columns in ZHVI CSV')

  const dateColumns = headers.slice(dateStartIdx)
  // Take last 24 months
  const recentDates = dateColumns.slice(-24)
  const recentStartIdx = dateStartIdx + dateColumns.length - 24

  const regionNameIdx = headers.indexOf('RegionName')

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]!
    const zipCode = row[regionNameIdx]
    if (!zipCode || !AUSTIN_ZIP_SET.has(zipCode)) continue

    for (let j = 0; j < recentDates.length; j++) {
      const dateStr = recentDates[j]!
      const valueStr = row[recentStartIdx + j]
      if (!valueStr || valueStr === '') continue

      const value = parseFloat(valueStr)
      if (isNaN(value)) continue

      // Calculate YoY change
      let yoyChange: number | null = null
      if (j >= 12) {
        const prevStr = row[recentStartIdx + j - 12]
        if (prevStr && prevStr !== '') {
          const prevValue = parseFloat(prevStr)
          if (!isNaN(prevValue) && prevValue > 0) {
            yoyChange = (value - prevValue) / prevValue
          }
        }
      }

      // Convert date column "2025-01-31" -> period "2025-01"
      const period = dateStr.substring(0, 7)

      results.push({
        zipCode,
        period,
        medianValue: Math.round(value),
        yoyChange: yoyChange !== null ? Math.round(yoyChange * 10000) / 10000 : null,
      })
    }
  }

  return results
}

/**
 * Fetch Zillow ZORI data for Austin-area zip codes.
 * Returns the last 24 months of data for each zip code.
 */
export async function fetchZillowRentIndex(): Promise<ZillowRentValue[]> {
  const res = await fetch(ZORI_CSV_URL)
  if (!res.ok) {
    throw new Error(`Zillow ZORI CSV fetch failed: ${res.status} ${res.statusText}`)
  }

  const text = await res.text()
  const rows = parseCSV(text)
  if (rows.length < 2) throw new Error('Zillow ZORI CSV is empty or malformed')

  const headers = rows[0]!
  const results: ZillowRentValue[] = []

  const dateStartIdx = headers.findIndex(h => /^\d{4}-\d{2}-\d{2}$/.test(h))
  if (dateStartIdx === -1) throw new Error('Could not find date columns in ZORI CSV')

  const dateColumns = headers.slice(dateStartIdx)
  const recentDates = dateColumns.slice(-24)
  const recentStartIdx = dateStartIdx + dateColumns.length - 24

  const regionNameIdx = headers.indexOf('RegionName')

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]!
    const zipCode = row[regionNameIdx]
    if (!zipCode || !AUSTIN_ZIP_SET.has(zipCode)) continue

    for (let j = 0; j < recentDates.length; j++) {
      const dateStr = recentDates[j]!
      const valueStr = row[recentStartIdx + j]
      if (!valueStr || valueStr === '') continue

      const value = parseFloat(valueStr)
      if (isNaN(value)) continue

      let yoyChange: number | null = null
      if (j >= 12) {
        const prevStr = row[recentStartIdx + j - 12]
        if (prevStr && prevStr !== '') {
          const prevValue = parseFloat(prevStr)
          if (!isNaN(prevValue) && prevValue > 0) {
            yoyChange = (value - prevValue) / prevValue
          }
        }
      }

      const period = dateStr.substring(0, 7)

      results.push({
        zipCode,
        period,
        medianRent: Math.round(value),
        yoyChange: yoyChange !== null ? Math.round(yoyChange * 10000) / 10000 : null,
      })
    }
  }

  return results
}
