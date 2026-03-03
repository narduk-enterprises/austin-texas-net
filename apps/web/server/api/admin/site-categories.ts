/**
 * /api/admin/site-categories
 *
 * GET: List all categories
 * POST: Create or update a category
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { siteCategoriesTable } from '~~/server/database/schema'

const categorySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  bgColor: z.string().min(1),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase(event)

  if (event.method === 'GET') {
    const categories = await db.select().from(siteCategoriesTable).all()
    return { categories }
  }

  if (event.method === 'POST') {
    const body = categorySchema.parse(await readBody(event))
    const existing = await db
      .select()
      .from(siteCategoriesTable)
      .where(eq(siteCategoriesTable.slug, body.slug))
      .get()

    const data = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    if (existing) {
      await db.update(siteCategoriesTable).set(data).where(eq(siteCategoriesTable.slug, body.slug))
      return { ok: true, action: 'updated' }
    } else {
      await db.insert(siteCategoriesTable).values(data)
      return { ok: true, action: 'created' }
    }
  }

  if (event.method === 'DELETE') {
    const body = await readValidatedBody(event, (data) =>
      z
        .object({
          slug: z.string().min(1),
        })
        .parse(data),
    )
    await db.delete(siteCategoriesTable).where(eq(siteCategoriesTable.slug, body.slug))
    return { ok: true, action: 'deleted' }
  }
})
