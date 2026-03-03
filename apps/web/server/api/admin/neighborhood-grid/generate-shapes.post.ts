/**
 * POST /api/admin/neighborhood-grid/generate-shapes
 *
 * Computes convex hull shapes from crawled grid points and stores them
 * in the neighborhoods.boundary_geojson column.
 *
 * Matches crawl neighborhood names to DB records via apple_maps_name,
 * falling back to case-insensitive name match.
 *
 * Body (optional):
 *   minPoints — minimum grid points to generate a shape (default: 10)
 *   dryRun   — if true, show what would happen without writing (default: false)
 */
import { z } from 'zod'
import { eq, isNotNull } from 'drizzle-orm'
import { neighborhoodGrid, neighborhoodsTable } from '~~/server/database/schema'
import { convexHull, hullToGeoJSONRing } from '~~/server/utils/convexHull'

const bodySchema = z
  .object({
    minPoints: z.number().min(3).optional().default(10),
    dryRun: z.boolean().optional().default(false),
  })
  .optional()

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const parsed = bodySchema.parse(body) ?? { minPoints: 10, dryRun: false }
  const { minPoints, dryRun } = parsed

  const db = useDatabase(event)

  // 1. Load all crawled points with neighborhood labels
  const points = await db
    .select({
      neighborhood: neighborhoodGrid.neighborhood,
      lat: neighborhoodGrid.lat,
      lng: neighborhoodGrid.lng,
    })
    .from(neighborhoodGrid)
    .where(isNotNull(neighborhoodGrid.neighborhood))
    .all()

  // Group by neighborhood name
  const byName = new Map<string, Array<{ lat: number; lng: number }>>()
  for (const p of points) {
    if (!p.neighborhood) continue
    const list = byName.get(p.neighborhood) || []
    list.push({ lat: p.lat, lng: p.lng })
    byName.set(p.neighborhood, list)
  }

  // 2. Load all DB neighborhoods
  const dbRows = await db.select().from(neighborhoodsTable).all()

  // Build lookup maps: by apple_maps_name and by name (case-insensitive)
  const byAppleMapName = new Map<string, (typeof dbRows)[0]>()
  const byDbName = new Map<string, (typeof dbRows)[0]>()
  for (const row of dbRows) {
    if (row.appleMapName) {
      byAppleMapName.set(row.appleMapName.toLowerCase(), row)
    }
    byDbName.set(row.name.toLowerCase(), row)
  }

  // 3. For each crawl neighborhood, compute hull and match to DB record
  const results: Array<{
    crawlName: string
    matchedDbName: string | null
    matchedSlug: string | null
    pointCount: number
    hullVertices: number
    stored: boolean
  }> = []

  const unmatched: Array<{ name: string; pointCount: number }> = []
  let stored = 0
  const now = new Date().toISOString()

  for (const [crawlName, pts] of byName.entries()) {
    if (pts.length < minPoints) continue

    const hull = convexHull(pts)
    if (hull.length < 3) continue

    const ring = hullToGeoJSONRing(hull)
    const geojson = JSON.stringify({
      type: 'Polygon',
      coordinates: [ring],
    })

    // Match: try apple_maps_name first, then case-insensitive name
    const dbRow =
      byAppleMapName.get(crawlName.toLowerCase()) || byDbName.get(crawlName.toLowerCase())

    if (dbRow) {
      if (!dryRun) {
        await db
          .update(neighborhoodsTable)
          .set({
            boundaryGeojson: geojson,
            updatedAt: now,
          })
          .where(eq(neighborhoodsTable.id, dbRow.id))
          .execute()
      }
      stored++
      results.push({
        crawlName,
        matchedDbName: dbRow.name,
        matchedSlug: dbRow.slug,
        pointCount: pts.length,
        hullVertices: hull.length,
        stored: !dryRun,
      })
    } else {
      unmatched.push({ name: crawlName, pointCount: pts.length })
    }
  }

  return {
    success: true,
    dryRun,
    minPoints,
    totalCrawlNeighborhoods: byName.size,
    aboveThreshold: [...byName.entries()].filter(([, pts]) => pts.length >= minPoints).length,
    matched: results.length,
    stored,
    unmatched: unmatched.sort((a, b) => b.pointCount - a.pointCount),
    results: results.sort((a, b) => a.crawlName.localeCompare(b.crawlName)),
  }
})
