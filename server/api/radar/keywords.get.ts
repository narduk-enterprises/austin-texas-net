import { eq, desc, asc, and, like, gte, lte, sql, isNotNull, isNull } from 'drizzle-orm'
import { z } from 'zod'

const querySchema = z.object({
  bucket: z.string().optional(),
  intent: z.string().optional(),
  covered: z.enum(['true', 'false']).optional(),
  diffMin: z.coerce.number().optional(),
  diffMax: z.coerce.number().optional(),
  oppMin: z.coerce.number().optional(),
  search: z.string().optional(),
  subtype: z.string().optional(),
  sort: z.enum(['composite_score', 'strategic_score', 'opportunity_score', 'difficulty', 'monthly_volume', 'keyword']).optional().default('strategic_score'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().min(1).max(500).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
})

/**
 * GET /api/radar/keywords
 *
 * Paginated, filterable keyword list. Admin-only.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()
  const q = querySchema.parse(getQuery(event))

  const conditions = []
  if (q.bucket) conditions.push(eq(schema.keywords.bucket, q.bucket))
  if (q.intent) conditions.push(eq(schema.keywords.intent, q.intent))
  if (q.covered === 'true') conditions.push(isNotNull(schema.keywords.matchedApp))
  if (q.covered === 'false') conditions.push(isNull(schema.keywords.matchedApp))
  if (q.diffMin != null) conditions.push(gte(schema.keywords.difficulty, q.diffMin))
  if (q.diffMax != null) conditions.push(lte(schema.keywords.difficulty, q.diffMax))
  if (q.oppMin != null) conditions.push(gte(schema.keywords.opportunityScore, q.oppMin))
  if (q.search) conditions.push(like(schema.keywords.keyword, `%${q.search}%`))
  if (q.subtype) conditions.push(like(schema.keywords.subtypes, `%${q.subtype}%`))

  const where = conditions.length ? and(...conditions) : undefined

  const sortCol = {
    composite_score: schema.keywords.compositeScore,
    strategic_score: schema.keywords.strategicScore,
    opportunity_score: schema.keywords.opportunityScore,
    difficulty: schema.keywords.difficulty,
    monthly_volume: schema.keywords.monthlyVolume,
    keyword: schema.keywords.keyword,
  }[q.sort] ?? schema.keywords.strategicScore

  const orderFn = q.order === 'asc' ? asc : desc

  const [rows, countResult] = await Promise.all([
    db.select()
      .from(schema.keywords)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(q.limit)
      .offset(q.offset),
    db.select({ count: sql<number>`count(*)` })
      .from(schema.keywords)
      .where(where),
  ])

  return {
    data: rows,
    total: countResult[0]?.count ?? 0,
    limit: q.limit,
    offset: q.offset,
  }
})
