/**
 * DELETE /api/admin/content-pipeline/topics
 *
 * Delete a content pipeline topic config by id.
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { contentPipelineTopics } from '~~/server/database/schema'

const bodySchema = z.object({
  id: z.number().int().positive(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = await readValidatedBody(event, (data) => bodySchema.parse(data))

  const db = useDatabase()
  await db.delete(contentPipelineTopics).where(eq(contentPipelineTopics.id, id))

  return { ok: true, deleted: id }
})
