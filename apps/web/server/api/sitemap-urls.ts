/**
 * Dynamic sitemap URLs for austin-texas.net
 *
 * Auto-generates URLs from the server-side category registry
 * (server/utils/siteCategories.ts) plus dynamic neighborhood slugs
 * from the D1 database. No manual URL lists to maintain.
 */
import { eq } from 'drizzle-orm'
import { neighborhoodsTable, mapSpotsTable } from '~~/server/database/schema'
import { siteCategories } from '~~/server/utils/siteCategories'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default defineEventHandler(async (event) => {
  const now = new Date().toISOString()

  // ── Dynamic data from DB ─────────────────────────────────────
  let neighborhoodSlugs: string[] = []
  let allSpots: { name: string; contentType: string }[] = []
  try {
    const db = useDatabase(event)
    const [neighborhoodsRows, spotsRows] = await Promise.all([
      db.select({ slug: neighborhoodsTable.slug }).from(neighborhoodsTable).all(),
      db
        .select({ name: mapSpotsTable.name, contentType: mapSpotsTable.contentType })
        .from(mapSpotsTable)
        .where(eq(mapSpotsTable.status, 'approved'))
        .all(),
    ])
    neighborhoodSlugs = neighborhoodsRows.map((r) => r.slug)
    allSpots = spotsRows
  } catch {
    // Table might not exist yet during dev — return empty
  }

  // Build a lookup for subAppSlug -> categorySlug
  const appToCategory = new Map<string, string>()
  for (const cat of siteCategories) {
    for (const app of cat.subApps) {
      if (app.status === 'live') {
        appToCategory.set(app.slug, cat.slug)
      }
    }
  }

  // ── Homepage ─────────────────────────────────────────────
  const urls: Array<{
    loc: string
    changefreq: string
    priority: number
    lastmod: string
  }> = [{ loc: '/', changefreq: 'daily', priority: 1.0, lastmod: now }]

  // ── Category landing pages + live sub-apps ───────────────
  for (const cat of siteCategories) {
    urls.push({
      loc: `/${cat.slug}/`,
      changefreq: 'weekly',
      priority: cat.priority ?? 0.9,
      lastmod: now,
    })

    for (const app of cat.subApps) {
      if (app.status !== 'live') continue
      urls.push({
        loc: `/${cat.slug}/${app.slug}/`,
        changefreq: app.changefreq ?? 'weekly',
        priority: app.priority ?? 0.8,
        lastmod: now,
      })
    }
  }

  // ── Individual map spots ──────────────────────────────────
  for (const spot of allSpots) {
    const categorySlug = appToCategory.get(spot.contentType)
    if (categorySlug) {
      urls.push({
        loc: `/${categorySlug}/${spot.contentType}/?spot=${slugify(spot.name)}`,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: now,
      })
    }
  }

  // ── Neighborhoods (dynamic from DB) ──────────────────────
  for (const slug of neighborhoodSlugs) {
    urls.push({
      loc: `/neighborhoods/${slug}/`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: now,
    })
  }

  return urls
})
