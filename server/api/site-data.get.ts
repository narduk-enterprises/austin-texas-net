/**
 * GET /api/site-data
 *
 * Public endpoint to fetch site hierarchy (categories + topics).
 * Used by useSiteData() composable.
 *
 * Falls back to the static siteCategories registry when the
 * site_categories DB table does not yet exist in the environment.
 */
import { siteCategories } from '~~/server/utils/siteCategories'

export default defineEventHandler(async () => {
  const db = useDatabase()

  try {
    // Dynamic imports so we don't crash if the table doesn't exist
    const { siteCategoriesTable, contentPipelineTopics } = await import('~~/server/database/schema')
    const { eq } = await import('drizzle-orm')

    // 1. Fetch Categories
    const categories = await db.select().from(siteCategoriesTable).all()

    // If the table exists but is empty, fall through to static data
    if (categories.length === 0) {
      throw new Error('Empty site_categories table — using static fallback')
    }

    // 2. Fetch all active Topics
    const allTopics = await db
      .select()
      .from(contentPipelineTopics)
      .where(eq(contentPipelineTopics.enabled, true))
      .all()

    // 3. Assemble hierarchy
    return {
      categories: categories.map((cat) => ({
        slug: cat.slug,
        title: cat.title,
        tagline: cat.tagline,
        icon: cat.icon,
        color: cat.color,
        bgColor: cat.bgColor,
        seo: {
          title: cat.seoTitle,
          description: cat.seoDescription,
        },
        subApps: allTopics
          .filter((t) => t.categorySlug === cat.slug)
          .map((t) => ({
            slug: t.topicKey,
            title: t.topicLabel,
            description: t.description || '',
            status: t.status as 'live' | 'coming-soon',
            contentType: t.contentType,
            accentColor: t.accentColor || undefined,
            pinColor: t.pinColor || undefined,
            icon: t.icon || undefined,
            standaloneUrl: t.standaloneUrl || undefined,
          })),
      })),
    }
  } catch {
    // DB table doesn't exist yet — fall back to static registry.
    // This keeps the site functional until the site_categories migration runs.
    return {
      categories: siteCategories.map((cat) => ({
        slug: cat.slug,
        title: cat.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        tagline: '',
        icon: 'i-lucide-folder',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        seo: { title: '', description: '' },
        subApps: cat.subApps.map((app) => ({
          slug: app.slug,
          title: app.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          description: '',
          status: app.status,
        })),
      })),
    }
  }
})
