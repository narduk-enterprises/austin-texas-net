/**
 * GET /api/admin/content-pipeline/runs
 *
 * Lists recent content pipeline runs, newest first.
 */
import { z } from 'zod'
import { desc } from 'drizzle-orm'
import { contentPipelineRuns } from '~~/server/database/schema'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { limit } = await getValidatedQuery(event, (data) => querySchema.parse(data))

  const db = useDatabase(event)
  const runs = await db
    .select()
    .from(contentPipelineRuns)
    .orderBy(desc(contentPipelineRuns.startedAt))
    .limit(limit)
    .all()

  return { runs }
})
