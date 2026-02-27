/**
 * neighborhoodGrid — Shared grid math for the Austin metro reverse-geocode crawler.
 *
 * Grid specs:
 *   Bounding box: NW (30.65, -98.15) → SE (30.05, -97.40)
 *   Resolution:   ~250m spacing
 *   Total:        ~68K points (256 cols × 268 rows)
 */

/**
 * Austin metro bounding box — tightened to the actual urbanized area.
 * Covers Round Rock border → Slaughter Lane, Loop 360 → SH 130.
 * Excludes empty Hill Country, Lago Vista, and rural areas.
 */
export const GRID_BOUNDS = {
  north: 30.52,   // Round Rock / Pflugerville border
  south: 30.14,   // Slaughter Lane / Onion Creek
  west: -97.90,   // Loop 360 / Bee Cave Rd
  east: -97.60,   // Manor / SH 130
} as const

/**
 * Approximate degrees per 250m at Austin's latitude (~30.3°N).
 * - Latitude:  1° ≈ 111 km → 250m ≈ 0.00225°
 * - Longitude: 1° ≈ 96 km at 30°N → 250m ≈ 0.0026°
 */
export const STEP_LAT = 0.00225
export const STEP_LNG = 0.0026

/** Total rows and columns in the grid */
export const GRID_ROWS = Math.ceil((GRID_BOUNDS.north - GRID_BOUNDS.south) / STEP_LAT)  // ~267
export const GRID_COLS = Math.ceil((GRID_BOUNDS.east - GRID_BOUNDS.west) / STEP_LNG)    // ~288
export const GRID_TOTAL = GRID_ROWS * GRID_COLS

/**
 * Convert a grid (row, col) to lat/lng coordinates.
 * Row 0 = north edge, Col 0 = west edge.
 */
export function gridToLatLng(row: number, col: number): { lat: number; lng: number } {
  return {
    lat: Math.round((GRID_BOUNDS.north - row * STEP_LAT) * 1e6) / 1e6,
    lng: Math.round((GRID_BOUNDS.west + col * STEP_LNG) * 1e6) / 1e6,
  }
}

/**
 * Generate a batch of uncrawled grid coordinates.
 * Returns up to `batchSize` coordinates starting from `startRow`/`startCol`.
 * Scans left-to-right, top-to-bottom.
 */
export function generateGridBatch(
  startRow: number,
  startCol: number,
  batchSize: number,
): Array<{ row: number; col: number; lat: number; lng: number }> {
  const batch: Array<{ row: number; col: number; lat: number; lng: number }> = []

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
