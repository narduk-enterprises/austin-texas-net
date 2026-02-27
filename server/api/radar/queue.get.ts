import { isNull, eq, desc, and } from 'drizzle-orm'
import { z } from 'zod'

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(20),
})

/**
 * GET /api/radar/queue
 *
 * Content queue: top uncovered keywords sorted by strategic score.
 * Admin-only.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()

  const q = querySchema.parse(getQuery(event))

  const rows = await db.select()
    .from(schema.keywords)
    .where(and(isNull(schema.keywords.matchedApp), eq(schema.keywords.pageExists, false)))
    .orderBy(desc(schema.keywords.strategicScore))
    .limit(q.limit)

  return { data: rows, total: rows.length }
})
