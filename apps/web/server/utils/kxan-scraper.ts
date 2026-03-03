/**
 * KXAN Pollen Data Scraper
 *
 * Parses the KXAN allergy JS embed at:
 *   https://media.psg.nexstardigital.net/kxan/weather/allergy/yesterday_allergy_v8.js
 *
 * This endpoint returns a JS document.write() containing:
 * - var aryCedar = [ { y: ..., a: <count> }, ... ]
 * - var aryElm   = [ { y: ..., a: <count> }, ... ]
 * - var aryMold  = [ { y: ..., a: <count> }, ... ]
 * - HTML blocks with severity labels like "Cedar - Very high"
 * - A data-runtime timestamp
 *
 * All counts are in grains/m³ (real measurements from Georgetown Allergy & Asthma Center)
 */

export interface KxanAllergenHistory {
  date: string   // YYYY-MM-DD
  count: number  // grains/m³
}

export interface KxanPollenData {
  cedar: KxanAllergenHistory[]
  elm: KxanAllergenHistory[]
  mold: KxanAllergenHistory[]
  levels: {
    cedar: string   // "Very high", "High", "Medium", "Low"
    elm: string
    mold: string
  }
  reportDate: string  // YYYY-MM-DD
  lastFetched: string // ISO timestamp
}

const KXAN_URL = 'https://media.psg.nexstardigital.net/kxan/weather/allergy/yesterday_allergy_v8.js'

/**
 * Fetch and parse the KXAN pollen data endpoint
 */
export async function scrapeKxanPollen(): Promise<KxanPollenData> {
  const cacheBust = Date.now()
  const response = await fetch(`${KXAN_URL}?v=${cacheBust}`)

  if (!response.ok) {
    throw new Error(`KXAN fetch failed: ${response.status} ${response.statusText}`)
  }

  const jsText = await response.text()
  return parseKxanJs(jsText)
}

/**
 * Parse the JS content from KXAN into structured data
 */
export function parseKxanJs(jsText: string): KxanPollenData {
  const cedar = parseAllergenArray(jsText, 'aryCedar')
  const elm = parseAllergenArray(jsText, 'aryElm')
  const mold = parseAllergenArray(jsText, 'aryMold')

  // Extract severity levels from HTML: "Cedar - Very high", "Elm - Low", etc.
  const levels = {
    cedar: extractLevel(jsText, 'Cedar'),
    elm: extractLevel(jsText, 'Elm'),
    mold: extractLevel(jsText, 'Mold'),
  }

  // Extract report date from data-runtime or h3 content
  const dateMatch = jsText.match(/data-runtime="(\d{4}-\d{2}-\d{2})/)
    || jsText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/)
  let reportDate = new Date().toISOString().split('T')[0] as string
  if (dateMatch) {
    if (dateMatch[0].includes('data-runtime') && dateMatch[1]) {
      reportDate = dateMatch[1]
    } else {
      const d = new Date(dateMatch[0])
      if (!isNaN(d.getTime())) {
        reportDate = d.toISOString().split('T')[0] as string
      }
    }
  }

  return {
    cedar,
    elm,
    mold,
    levels,
    reportDate,
    lastFetched: new Date().toISOString(),
  }
}

/**
 * Parse one allergen array (aryCedar, aryElm, aryMold) from the JS text
 *
 * Format: { y: new Date('2026/01/09').toLocaleDateString('en-US', options), a: 328 }
 * We extract the date string and the `a:` count value.
 */
function parseAllergenArray(jsText: string, varName: string): KxanAllergenHistory[] {
  // Find the array block
  const arrayRegex = new RegExp(`var ${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`, 'm')
  const match = jsText.match(arrayRegex)
  if (!match) return []

  const arrayContent = match[1]!
  const entries: KxanAllergenHistory[] = []

  // Match each entry: new Date('2026/01/09') ... a: 328
  const entryRegex = /new Date\('(\d{4}\/\d{2}\/\d{2})'\)[^}]*a:\s*(\d+)/g
  let entryMatch: RegExpExecArray | null
  while ((entryMatch = entryRegex.exec(arrayContent)) !== null) {
    const dateStr = entryMatch[1]?.replace(/\//g, '-') ?? '' // 2026/01/09 → 2026-01-09
    const count = parseInt(entryMatch[2] ?? '0', 10)
    if (dateStr) entries.push({ date: dateStr, count })
  }

  return entries
}

/**
 * Extract severity level text from the HTML block
 * Looks for patterns like: "Cedar - Very high" in the allergen_value div
 */
function extractLevel(jsText: string, allergen: string): string {
  // Pattern: <div class="allergen_value">Cedar - Very high</div>
  const regex = new RegExp(`allergen_value[^>]*>\\s*${allergen}\\s*-\\s*([^<]+)<`, 'i')
  const match = jsText.match(regex)
  if (match?.[1]) {
    return match[1].trim()
  }
  return 'Unknown'
}
