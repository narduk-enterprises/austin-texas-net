/**
 * GET /api/admin/content-pipeline/topics
 *
 * Lists all content pipeline topic configs.
 */
import { contentPipelineTopics } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()
  const topics = await db.select().from(contentPipelineTopics).all()

  return {
    topics: topics.map((t) => ({
      ...t,
      searchQueries: JSON.parse(t.searchQueries || '[]') as string[],
      description: t.description || '',
      status: t.status,
      standaloneUrl: t.standaloneUrl || '',
    })),
  }
})
