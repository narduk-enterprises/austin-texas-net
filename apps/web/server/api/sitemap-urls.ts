/**
 * Dynamic sitemap URLs for austin-texas.net
 *
 * Auto-generates URLs from the server-side category registry
 * (server/utils/siteCategories.ts) plus dynamic neighborhood slugs
 * from the D1 database. No manual URL lists to maintain.
 *
 * lastmod strategy:
 * - Live data pages (weather, pollen, lake levels): current timestamp (actually changes frequently)
 * - Static content pages: build timestamp (changes only on deploy)
 * - Map spots / neighborhoods: updatedAt from D1 (changes when data is edited)
 */

import { eq } from 'drizzle-orm'
import { neighborhoodsTable, mapSpotsTable } from '~~/server/database/schema'
import { siteCategories } from '~~/server/utils/siteCategories'

declare const __BUILD_TIME__: string

/** Sub-apps whose data genuinely changes hourly/daily */
const LIVE_DATA_SLUGS = new Set([
  'cedar-pollen', 'allergy-forecast', 'air-quality',
  'current-conditions', 'radar', '7-day-forecast', 'heat-index', 'freeze-alerts',
  'water-temps', 'lake-levels', 'this-weekend', 'drought-status',
])

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default defineEventHandler(async (event) => {
  const now = new Date().toISOString()
  // Build time is baked in at deploy — use for static content pages
  const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : now

  // ── Dynamic data from DB ─────────────────────────────────────
  let neighborhoodSlugs: { slug: string; updatedAt?: string | null }[] = []
  let allSpots: { name: string; contentType: string; updatedAt?: string | null }[] = []
  try {
    const db = useDatabase(event)
    const [neighborhoodsRows, spotsRows] = await Promise.all([
      db.select({ slug: neighborhoodsTable.slug, updatedAt: neighborhoodsTable.updatedAt }).from(neighborhoodsTable).all(),
      db
        .select({ name: mapSpotsTable.name, contentType: mapSpotsTable.contentType, updatedAt: mapSpotsTable.updatedAt })
        .from(mapSpotsTable)
        .where(eq(mapSpotsTable.status, 'approved'))
        .all(),
    ])
    neighborhoodSlugs = neighborhoodsRows
    allSpots = spotsRows
  } catch (err) {
    console.error('[sitemap-urls] Error fetching dynamic data:', err)
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
      lastmod: buildTime,
    })

    for (const app of cat.subApps) {
      if (app.status !== 'live') continue
      urls.push({
        loc: `/${cat.slug}/${app.slug}/`,
        changefreq: app.changefreq ?? 'weekly',
        priority: app.priority ?? 0.8,
        lastmod: LIVE_DATA_SLUGS.has(app.slug) ? now : buildTime,
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
        lastmod: spot.updatedAt || buildTime,
      })
    }
  }

  // ── Neighborhoods (dynamic from DB) ──────────────────────
  for (const nh of neighborhoodSlugs) {
    urls.push({
      loc: `/neighborhoods/${nh.slug}/`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: nh.updatedAt || buildTime,
    })
  }

  return urls
})
