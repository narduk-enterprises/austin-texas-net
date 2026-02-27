import { sql, isNotNull, isNull, desc } from 'drizzle-orm'

/**
 * GET /api/radar/stats
 *
 * Dashboard KPIs: totals, bucket/intent breakdowns,
 * top opportunities, coverage stats. Admin-only.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()

  const [
    totalResult,
    coveredResult,
    avgDiffResult,
    bucketBreakdown,
    intentBreakdown,
    topOpportunities,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(schema.keywords),
    db.select({ count: sql<number>`count(*)` }).from(schema.keywords)
      .where(isNotNull(schema.keywords.matchedApp)),
    db.select({ avg: sql<number>`avg(${schema.keywords.difficulty})` }).from(schema.keywords),
    db.select({
      bucket: schema.keywords.bucket,
      count: sql<number>`count(*)`,
      avgScore: sql<number>`avg(${schema.keywords.strategicScore})`,
    }).from(schema.keywords).groupBy(schema.keywords.bucket),
    db.select({
      intent: schema.keywords.intent,
      count: sql<number>`count(*)`,
    }).from(schema.keywords).groupBy(schema.keywords.intent),
    db.select()
      .from(schema.keywords)
      .where(isNull(schema.keywords.matchedApp))
      .orderBy(desc(schema.keywords.strategicScore))
      .limit(10),
  ])

  const total = totalResult[0]?.count ?? 0
  const covered = coveredResult[0]?.count ?? 0
  const gaps = total - covered

  return {
    kpi: {
      total,
      covered,
      gaps,
      coveragePct: total > 0 ? Math.round((covered / total) * 100) : 0,
      avgDifficulty: Math.round(avgDiffResult[0]?.avg ?? 0),
    },
    buckets: bucketBreakdown,
    intents: intentBreakdown,
    topOpportunities,
  }
})
