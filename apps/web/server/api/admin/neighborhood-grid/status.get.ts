/**
 * GET /api/admin/neighborhood-grid/status
 *
 * Returns crawl progress stats: total points,
 * crawled, unique neighborhoods, and per-neighborhood counts.
 */
import { sql, isNotNull } from 'drizzle-orm'
import { neighborhoodGrid } from '~~/server/database/schema'
import { GRID_ROWS, GRID_COLS } from '~~/server/utils/neighborhoodGrid'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase(event)
  const totalGrid = GRID_ROWS * GRID_COLS

  // Total crawled points
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(neighborhoodGrid)
    .get()
  const crawledCount = countResult?.count ?? 0

  // Points with neighborhood labels
  const labeledResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(neighborhoodGrid)
    .where(isNotNull(neighborhoodGrid.neighborhood))
    .get()
  const labeledCount = labeledResult?.count ?? 0

  // Unique neighborhoods found
  const neighborhoods = await db
    .select({
      neighborhood: neighborhoodGrid.neighborhood,
      count: sql<number>`COUNT(*)`,
    })
    .from(neighborhoodGrid)
    .where(isNotNull(neighborhoodGrid.neighborhood))
    .groupBy(neighborhoodGrid.neighborhood)
    .orderBy(sql`COUNT(*) DESC`)
    .all()

  // Last crawled position
  const lastCrawled = await db
    .select({
      maxRow: sql<number>`MAX(grid_row)`,
      maxCol: sql<number>`MAX(grid_col)`,
    })
    .from(neighborhoodGrid)
    .get()

  const progress = crawledCount > 0 ? Math.round((crawledCount / totalGrid) * 10000) / 100 : 0

  const remainingPoints = totalGrid - crawledCount
  const estimatedDaysAt15k = Math.ceil(remainingPoints / 15000)

  return {
    grid: {
      rows: GRID_ROWS,
      cols: GRID_COLS,
      totalPoints: totalGrid,
      spacingMeters: 250,
    },
    progress: {
      crawled: crawledCount,
      labeled: labeledCount,
      unlabeled: crawledCount - labeledCount,
      remaining: remainingPoints,
      percent: `${progress}%`,
      estimatedDaysRemaining: estimatedDaysAt15k,
    },
    lastPosition: lastCrawled ? { row: lastCrawled.maxRow, col: lastCrawled.maxCol } : null,
    neighborhoods: {
      uniqueCount: neighborhoods.length,
      byName: neighborhoods.map((n) => ({
        name: n.neighborhood,
        points: n.count,
      })),
    },
  }
})
