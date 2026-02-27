/**
 * PATCH /api/admin/map-spots/status
 *
 * Bulk update the status of map spots (e.g., approve or archive).
 * Body: { ids: string[], status: 'approved' | 'pending' | 'archived' }
 */
import { z } from 'zod'
import { inArray } from 'drizzle-orm'
import { mapSpotsTable } from '~~/server/database/schema'

const bodySchema = z.object({
  ids: z.array(z.string().min(1)),
  status: z.enum(['approved', 'pending', 'archived']),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { ids, status } = bodySchema.parse(await readBody(event))
  const db = useDatabase()

  if (ids.length === 0) {
    return { ok: true, count: 0 }
  }

  await db
    .update(mapSpotsTable)
    .set({
      status,
      updatedAt: new Date().toISOString(),
    })
    .where(inArray(mapSpotsTable.id, ids))

  return { ok: true, count: ids.length }
})
