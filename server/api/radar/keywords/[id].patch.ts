import { eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  pageExists: z.boolean(),
})

/**
 * PATCH /api/radar/keywords/:id
 *
 * Update a keyword's pageExists status.
 * Admin-only.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()
  const id = Number(getRouterParam(event, 'id'))

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid keyword ID' })
  }

  const body = bodySchema.parse(await readBody(event))

  const result = await db
    .update(schema.keywords)
    .set({
      pageExists: body.pageExists,
      lastSeen: new Date().toISOString(),
    })
    .where(eq(schema.keywords.id, id))
    .returning()

  if (!result.length) {
    throw createError({ statusCode: 404, message: 'Keyword not found' })
  }

  return { success: true, data: result[0] }
})
