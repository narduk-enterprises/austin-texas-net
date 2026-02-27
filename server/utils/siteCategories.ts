/**
 * Server-side category + sub-app registry for sitemap generation.
 *
 * This mirrors the live-status data from `useSiteData()` (client-side)
 * but is importable from Nitro server routes and utilities.
 *
 * When you add or flip a sub-app to `live`, update BOTH this file
 * AND `app/composables/useSiteData.ts`.
 */

export interface SitemapSubApp {
  slug: string
  /** Only 'live' sub-apps are included in the sitemap. */
  status: 'live' | 'coming-soon'
  /** Override changefreq (default: 'weekly') */
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  /** Override priority (default: 0.8) */
  priority?: number
}

export interface SitemapCategory {
  slug: string
  /** Override priority for the landing page (default: 0.9) */
  priority?: number
  subApps: SitemapSubApp[]
}

/**
 * Canonical category list with sub-app statuses.
 * Only entries with status === 'live' will appear in the sitemap.
 */
export const siteCategories: SitemapCategory[] = [
  {
    slug: 'food',
    subApps: [
      { slug: 'breakfast-tacos', status: 'live' },
      { slug: 'bbq', status: 'live' },
      { slug: 'coffee-shops', status: 'live' },
      { slug: 'food-trucks', status: 'live' },
      { slug: 'happy-hours', status: 'live' },
      { slug: 'restaurant-map', status: 'live' },
      { slug: 'crawfish', status: 'live' },
      { slug: 'tex-mex', status: 'live' },
      { slug: 'brunch', status: 'live' },
      { slug: 'pizza', status: 'live' },
      { slug: 'asian-food', status: 'live' },
      { slug: 'bars', status: 'live' },
    ],
  },
  {
    slug: 'events',
    subApps: [
      { slug: 'sxsw', status: 'live', changefreq: 'monthly', priority: 0.9 },
      { slug: 'this-weekend', status: 'live', changefreq: 'daily', priority: 0.85 },
      { slug: 'acl-fest', status: 'live' },
      { slug: 'rodeo-austin', status: 'live' },
      { slug: 'trail-of-lights', status: 'live' },
      { slug: 'bat-fest', status: 'live' },
    ],
  },
  {
    slug: 'outdoors',
    subApps: [
      { slug: 'bluebonnets', status: 'live', changefreq: 'daily' },
      { slug: 'hiking-trails', status: 'live', changefreq: 'weekly' },
      { slug: 'swimming-holes', status: 'live', changefreq: 'weekly' },
      { slug: 'parks-guide', status: 'live' },
      { slug: 'kayak-launches', status: 'live' },
      { slug: 'disc-golf', status: 'live' },
    ],
  },
  {
    slug: 'health',
    subApps: [
      { slug: 'cedar-pollen', status: 'live', changefreq: 'daily', priority: 0.9 },
      { slug: 'allergy-forecast', status: 'live' },
      { slug: 'air-quality', status: 'live' },
    ],
  },
  {
    slug: 'weather',
    subApps: [
      { slug: 'current-conditions', status: 'live', changefreq: 'hourly', priority: 0.9 },
      { slug: 'radar', status: 'live', changefreq: 'hourly', priority: 0.9 },
      { slug: '7-day-forecast', status: 'live', changefreq: 'daily' },
      { slug: 'heat-index', status: 'live', changefreq: 'daily' },
      { slug: 'freeze-alerts', status: 'live', changefreq: 'daily' },
      { slug: 'drought-status', status: 'live', changefreq: 'weekly', priority: 0.7 },
      { slug: 'freeze-prep', status: 'live', changefreq: 'monthly', priority: 0.7 },
    ],
  },
  {
    slug: 'more',
    priority: 0.8,
    subApps: [],
  },
  {
    slug: 'live-data',
    priority: 0.8,
    subApps: [
      { slug: 'water-temps', status: 'live', changefreq: 'hourly' },
      { slug: 'lake-levels', status: 'live', changefreq: 'hourly' },
    ],
  },
  {
    slug: 'real-estate',
    subApps: [
      { slug: 'market-trends', status: 'live' },
      { slug: 'median-home-prices', status: 'live' },
      { slug: 'property-tax-guide', status: 'live', changefreq: 'monthly', priority: 0.7 },
      { slug: 'new-developments', status: 'live', priority: 0.7 },
      { slug: 'rent-trends', status: 'live' },
      { slug: 'housing-map', status: 'live' },
    ],
  },
  {
    slug: 'neighborhoods',
    subApps: [],
  },
  {
    slug: 'culture',
    priority: 0.8,
    subApps: [
      { slug: 'live-music-venues', status: 'live', changefreq: 'weekly' },
      { slug: 'street-art', status: 'live' },
    ],
  },
  {
    slug: 'fun',
    priority: 0.8,
    subApps: [
      { slug: 'haunted-austin', status: 'live' },
      { slug: 'games', status: 'live' },
      { slug: 'chicken-shit-bingo', status: 'live' },
    ],
  },
]
