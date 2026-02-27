/**
 * DELETE /api/admin/neighborhoods/delete
 *
 * Admin-only endpoint to delete a neighborhood by ID.
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable } from '~~/server/database/schema'

const bodySchema = z.object({
  id: z.number(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { id } = bodySchema.parse(body)

  const db = useDatabase()

  await db.delete(neighborhoodsTable).where(eq(neighborhoodsTable.id, id)).execute()

  return { success: true, deletedId: id }
})
