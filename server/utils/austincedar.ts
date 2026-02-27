/**
 * AustinCedar.com API Client
 *
 * Fetches historical cedar pollen data from:
 *   https://austincedar.com/api/history?days=N
 *
 * Data is in grains/m³ from Georgetown Allergy & Asthma Center monitoring stations.
 * The API returns daily readings with date, count, and level.
 */

import { z } from 'zod'

const AUSTIN_CEDAR_API = 'https://austincedar.com/api/history'

// ─── Schema ──────────────────────────────────────────────
const readingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.number().min(0),
  level: z.string().optional(),
})

const historyResponseSchema = z.union([
  // Could be a bare array
  z.array(readingSchema),
  // Or wrapped in an object
  z.object({
    data: z.array(readingSchema).optional(),
    readings: z.array(readingSchema).optional(),
    history: z.array(readingSchema).optional(),
  }),
])

// ─── Types ───────────────────────────────────────────────
export interface CedarReading {
  date: string   // YYYY-MM-DD
  count: number  // grains/m³
  level?: string // severity label from API
}

export interface AustinCedarResult {
  readings: CedarReading[]
  source: 'austincedar'
  fetchedAt: string
}

// ─── Fetch ───────────────────────────────────────────────

/**
 * Fetch historical cedar pollen data from austincedar.com.
 *
 * Tries multiple request patterns to handle potential API quirks:
 * 1. GET with Accept: application/json
 * 2. GET with browser-like User-Agent
 *
 * @param days - Number of days of history to fetch (default: 90)
 */
export async function fetchAustinCedar(days: number = 90): Promise<AustinCedarResult> {
  const url = `${AUSTIN_CEDAR_API}?days=${days}`

  // Try with proper JSON headers first
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'AustinTexasNet/1.0 (https://austin-texas.net; pollen data aggregation)',
  }

  let response: Response
  let body: string

  try {
    response = await fetch(url, { headers })
    body = await response.text()

    if (!response.ok) {
      // Retry with minimal headers
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AustinTexasNet/1.0)',
        },
      })
      body = await response.text()
    }
  } catch (err: unknown) {
    throw new Error(`AustinCedar.com fetch failed: ${(err as Error).message}`)
  }

  if (!response.ok) {
    throw new Error(`AustinCedar.com returned ${response.status}: ${body.slice(0, 200)}`)
  }

  // Parse JSON
  let json: unknown
  try {
    json = JSON.parse(body)
  } catch {
    throw new Error(`AustinCedar.com returned invalid JSON: ${body.slice(0, 200)}`)
  }

  // Validate with Zod
  const parsed = historyResponseSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(`AustinCedar.com response validation failed: ${parsed.error.message}`)
  }

  // Extract readings from whatever shape the response came in
  let readings: CedarReading[]
  if (Array.isArray(parsed.data)) {
    readings = parsed.data
  } else {
    readings = parsed.data.data ?? parsed.data.readings ?? parsed.data.history ?? []
  }

  return {
    readings,
    source: 'austincedar',
    fetchedAt: new Date().toISOString(),
  }
}
