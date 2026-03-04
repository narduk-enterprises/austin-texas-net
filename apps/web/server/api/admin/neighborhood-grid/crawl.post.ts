/**
 * POST /api/admin/neighborhood-grid/crawl
 *
 * Admin-only batch crawler: reverse geocodes grid points via Apple Maps
 * and stores the dependentLocalities (neighborhood names) in D1.
 *
 * Supports two modes:
 *   1. Grid crawl — sequential left-to-right, top-to-bottom scan of the metro grid
 *   2. Focus crawl — dense scan of a specific area (focusLat/focusLng + radiusKm + stepMeters)
 *
 * Body (optional):
 *   batchSize   — number of points to crawl this run (default: 500, max: 2000)
 *   delayMs     — ms between API calls (default: 50, avoids rate limiting)
 *   startLat    — optional latitude to start grid crawling from (overrides auto-resume)
 *   startLng    — optional longitude to start grid crawling from
 *   reset       — if true, clear all existing grid data before crawling
 *   focusLat    — center latitude for focus (high-res) crawl
 *   focusLng    — center longitude for focus crawl
 *   focusRadiusKm  — radius in km around the focus center (default: 2)
 *   focusStepMeters — step size in meters for the focus grid (default: 100)
 */
import { z } from 'zod'
import { sql } from 'drizzle-orm'
import { neighborhoodGrid } from '~~/server/database/schema'
import {
  GRID_ROWS,
  GRID_COLS,
  GRID_BOUNDS,
  STEP_LAT,
  STEP_LNG,
  gridToLatLng,
} from '~~/server/utils/neighborhoodGrid'

interface AppleGeoResult {
  structuredAddress?: {
    dependentLocalities?: string[]
    subLocality?: string | null
    locality?: string | null
    postCode?: string | null
  }
}

const bodySchema = z
  .object({
    batchSize: z.number().min(1).max(2000).optional().default(500),
    delayMs: z.number().min(0).max(500).optional().default(50),
    startLat: z.number().optional(),
    startLng: z.number().optional(),
    reset: z.boolean().optional().default(false),
    // Focus crawl params
    focusLat: z.number().optional(),
    focusLng: z.number().optional(),
    focusRadiusKm: z.number().min(0.1).max(10).optional().default(2),
    focusStepMeters: z.number().min(25).max(500).optional().default(100),
  })
  .optional()

type CrawlPoint = { row: number; col: number; lat: number; lng: number }

export default defineEventHandler(async (event) => {
  // Auth check — verify admin session cookie
  await requireAdmin(event)

  const body = await readBody(event)
  const parsed = bodySchema.parse(body)!
  const { batchSize, delayMs, reset } = parsed

  const db = useDatabase(event)

  // Optional: reset all grid data
  if (reset) {
    await db.delete(neighborhoodGrid).execute()
  }

  // ─── Determine if this is a focus crawl or standard grid crawl ───
  const isFocusCrawl = parsed.focusLat != null && parsed.focusLng != null

  const batch: CrawlPoint[] = isFocusCrawl
    ? await generateFocusBatch(
      db,
      parsed.focusLat!,
      parsed.focusLng!,
      parsed.focusRadiusKm ?? 2,
      parsed.focusStepMeters ?? 100,
      batchSize,
    )
    : await generateGridBatch(db, parsed.startLat, parsed.startLng, batchSize)

  if (batch.length === 0) {
    return {
      success: true,
      mode: isFocusCrawl ? 'focus' : 'grid',
      message: isFocusCrawl
        ? 'Focus area already fully crawled!'
        : 'Grid crawl complete! All points have been processed.',
      crawled: 0,
      withNeighborhood: 0,
      failed: 0,
      neighborhoodsFound: [],
      uniqueNeighborhoodsInBatch: 0,
    }
  }

  // Get Apple Maps access token once for the whole batch
  const accessToken = await getAppleMapsAccessToken()
  const now = new Date().toISOString()

  let crawled = 0
  let withNeighborhood = 0
  let failed = 0
  const errors: Array<{ row: number; col: number; error: string }> = []
  const neighborhoodsFound = new Set<string>()

  for (const point of batch) {
    try {
      const params = new URLSearchParams({ loc: `${point.lat},${point.lng}` })
      const url = `https://maps-api.apple.com/v1/reverseGeocode?${params.toString()}`

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) {
        const errBody = await response.text()
        errors.push({
          row: point.row,
          col: point.col,
          error: `HTTP ${response.status}: ${errBody}`,
        })
        failed++
        continue
      }

      const data = (await response.json()) as { results: AppleGeoResult[] }
      const results = data?.results || []
      const place = results[0]

      const dependentLocalities: string[] = place?.structuredAddress?.dependentLocalities || []
      const subLocality: string | null = place?.structuredAddress?.subLocality || null
      const locality: string | null = place?.structuredAddress?.locality || null
      const postCode: string | null = place?.structuredAddress?.postCode || null
      const primaryNeighborhood = dependentLocalities[0] || subLocality || null

      if (primaryNeighborhood) {
        withNeighborhood++
        neighborhoodsFound.add(primaryNeighborhood)
      }

      // Upsert into D1
      await db
        .insert(neighborhoodGrid)
        .values({
          lat: point.lat,
          lng: point.lng,
          neighborhood: primaryNeighborhood,
          allLocalities: dependentLocalities.length ? JSON.stringify(dependentLocalities) : null,
          locality,
          subLocality,
          postCode,
          crawledAt: now,
          gridRow: point.row,
          gridCol: point.col,
        })
        .onConflictDoUpdate({
          target: [neighborhoodGrid.gridRow, neighborhoodGrid.gridCol],
          set: {
            neighborhood: primaryNeighborhood,
            allLocalities: dependentLocalities.length ? JSON.stringify(dependentLocalities) : null,
            locality,
            subLocality,
            postCode,
            crawledAt: now,
          },
        })

      crawled++

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push({ row: point.row, col: point.col, error: message })
      failed++
    }
  }

  return {
    success: true,
    mode: isFocusCrawl ? 'focus' : 'grid',
    batchRequested: batchSize,
    crawled,
    withNeighborhood,
    failed,
    neighborhoodsFound: [...neighborhoodsFound].sort(),
    uniqueNeighborhoodsInBatch: neighborhoodsFound.size,
    errors: errors.length ? errors.slice(0, 10) : undefined,
    message: `${isFocusCrawl ? 'Focus' : 'Grid'} crawled ${crawled} points (${withNeighborhood} with neighborhoods, ${failed} failed).`,
  }
})

// ─── Standard grid batch generator ─────────────────────────────

async function generateGridBatch(
  db: ReturnType<typeof useDatabase>,
  startLat: number | undefined,
  startLng: number | undefined,
  batchSize: number,
): Promise<CrawlPoint[]> {
  let startRow = 0
  let startCol = 0

  if (startLat != null && startLng != null) {
    startRow = Math.max(
      0,
      Math.min(GRID_ROWS - 1, Math.round((GRID_BOUNDS.north - startLat) / STEP_LAT)),
    )
    startCol = Math.max(
      0,
      Math.min(GRID_COLS - 1, Math.round((startLng - GRID_BOUNDS.west) / STEP_LNG)),
    )
  } else {
    // Auto-resume: find highest crawled (row, col) in the standard grid range
    const lastCrawled = await db
      .select({ maxRow: sql<number>`MAX(grid_row)` })
      .from(neighborhoodGrid)
      .where(sql`grid_row >= 0 AND grid_row < ${GRID_ROWS}`)
      .get()

    if (lastCrawled?.maxRow != null) {
      const lastOnRow = await db
        .select({ maxCol: sql<number>`MAX(grid_col)` })
        .from(neighborhoodGrid)
        .where(sql`grid_row = ${lastCrawled.maxRow} AND grid_col >= 0 AND grid_col < ${GRID_COLS}`)
        .get()

      startRow = lastCrawled.maxRow
      startCol = (lastOnRow?.maxCol ?? 0) + 1

      if (startCol >= GRID_COLS) {
        startCol = 0
        startRow++
      }
    }
  }

  if (startRow >= GRID_ROWS) return []

  const batch: CrawlPoint[] = []
  let row = startRow
  let col = startCol
  while (batch.length < batchSize && row < GRID_ROWS) {
    const { lat, lng } = gridToLatLng(row, col)
    batch.push({ row, col, lat, lng })
    col++
    if (col >= GRID_COLS) {
      col = 0
      row++
    }
  }
  return batch
}

// ─── Focus crawl batch generator ───────────────────────────────

/**
 * Generates a dense grid of points within a circle, excluding points
 * already crawled. Uses large gridRow/gridCol values (lat*100000, lng*100000)
 * to avoid conflicts with the standard grid's 0-168 range.
 */
async function generateFocusBatch(
  db: ReturnType<typeof useDatabase>,
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  stepMeters: number,
  batchSize: number,
): Promise<CrawlPoint[]> {
  // Convert step size and radius to degrees
  const stepLat = stepMeters / 111_111
  const stepLng = stepMeters / (111_111 * Math.cos((centerLat * Math.PI) / 180))
  const radiusLat = radiusKm / 111.111
  const radiusLng = radiusKm / (111.111 * Math.cos((centerLat * Math.PI) / 180))

  const minLat = centerLat - radiusLat
  const maxLat = centerLat + radiusLat
  const minLng = centerLng - radiusLng
  const maxLng = centerLng + radiusLng

  // Generate all points within the circle
  const allPoints: CrawlPoint[] = []

  for (let lat = maxLat; lat >= minLat; lat -= stepLat) {
    for (let lng = minLng; lng <= maxLng; lng += stepLng) {
      const dLat = lat - centerLat
      const dLng = lng - centerLng
      if ((dLat / radiusLat) ** 2 + (dLng / radiusLng) ** 2 > 1) continue

      const roundedLat = Math.round(lat * 1e6) / 1e6
      const roundedLng = Math.round(lng * 1e6) / 1e6

      // Encode lat/lng into gridRow/gridCol with 100000x multiplier
      // Standard grid uses rows 0-168, cols 0-115 — these will be ~3000000+
      const gridRow = Math.round(roundedLat * 100000)
      const gridCol = Math.round(roundedLng * 100000)

      allPoints.push({ row: gridRow, col: gridCol, lat: roundedLat, lng: roundedLng })
    }
  }

  if (allPoints.length === 0) return []

  // Find already-crawled points in the focus area
  const existing = await db
    .select({
      gridRow: neighborhoodGrid.gridRow,
      gridCol: neighborhoodGrid.gridCol,
    })
    .from(neighborhoodGrid)
    .where(
      sql`grid_row > 10000 AND lat BETWEEN ${minLat} AND ${maxLat} AND lng BETWEEN ${minLng} AND ${maxLng}`,
    )
    .all()

  const existingSet = new Set(
    existing.map((e: { gridRow: number; gridCol: number }) => `${e.gridRow},${e.gridCol}`),
  )

  return allPoints.filter((p) => !existingSet.has(`${p.row},${p.col}`)).slice(0, batchSize)
}
