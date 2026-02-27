import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ─── Users ──────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash'), // nullable for Apple-only users
  appleSub: text('apple_id').unique(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Sessions ───────────────────────────────────────────────
// Server-side session tracking for revocation support
export const sessions = sqliteTable('sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Pollen Readings ────────────────────────────────────────
export const pollenReadings = sqliteTable('pollen_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(), // YYYY-MM-DD
  count: real('count').notNull(), // grains/m³
  severity: text('severity').notNull(), // low | medium | high | very-high | extreme
  source: text('source').default('kxan'), // data source
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Radar Keywords ─────────────────────────────────────────
export const keywords = sqliteTable('keywords', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  keyword: text('keyword').notNull().unique(),
  bucket: text('bucket').notNull(),
  monthlyVolume: integer('monthly_volume').default(0),
  competition: text('competition').default('LOW'),
  trendScore: integer('trend_score').default(0),
  risingScore: integer('rising_score').default(0),
  firstSeen: text('first_seen')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  lastSeen: text('last_seen')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  pageExists: integer('page_exists', { mode: 'boolean' }).default(false),
  compositeScore: integer('composite_score').default(0),
  // Roadmap columns (v2)
  intent: text('intent').default('informational'),
  difficulty: integer('difficulty').default(50),
  seasonality: text('seasonality'),
  opportunityScore: integer('opportunity_score').default(0),
  matchedApp: text('matched_app'),
  matchedUrl: text('matched_url'),
  suggestedTitle: text('suggested_title'),
  suggestedInternalLinks: text('suggested_internal_links'),
  // Strategic scoring (v3)
  subtypes: text('subtypes'), // JSON array of KeywordSubtype[]
  strategicScore: integer('strategic_score').default(0),
  // Difficulty validation (v4)
  difficultySource: text('difficulty_source').default('estimated'),
  difficultyConfidence: text('difficulty_confidence').default('medium'),
  difficultyAnomaly: text('difficulty_anomaly'),
})

// ─── Map Spots (Apple Maps — generic content type) ──────────
export const mapSpotsTable = sqliteTable('map_spots', {
  id: text('id').primaryKey(), // Apple Maps place ID
  name: text('name').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  address: text('address'),
  neighborhood: text('neighborhood'),
  category: text('category'),
  contentType: text('content_type').notNull().default('breakfast-tacos'),
  phone: text('phone'),
  url: text('url'),
  // Editorial overrides
  rank: integer('rank'),
  knownFor: text('known_for'),
  description: text('description'),
  priceRange: text('price_range').default('$'),
  rating: real('rating'),
  neighborhoodRank: integer('neighborhood_rank'),
  area: text('area'),
  status: text('status').notNull().default('approved'), // approved | pending | archived
  // Google Places enrichment
  photoUrl: text('photo_url'),
  googlePlaceId: text('google_place_id'),
  photoAttribution: text('photo_attribution'),
  sourceRunId: integer('source_run_id'),
  featured: integer('featured', { mode: 'boolean' }).default(true),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Neighborhoods ──────────────────────────────────────────
export const neighborhoodsTable = sqliteTable('neighborhoods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  city: text('city').default('Austin'),
  region: text('region'),
  zipCode: text('zip_code'),
  description: text('description'),
  longDescription: text('long_description'), // Extended 250-500 word prose backstory
  population: integer('population'),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  // Shape & classification (added 0010)
  tier: text('tier').default('neighborhood'), // 'region' | 'neighborhood' | 'micro' | 'district'
  parentRegion: text('parent_region'), // e.g. 'Northwest Austin' for Northwest Hills
  appleMapName: text('apple_maps_name'), // exact name from Apple Maps crawl
  boundaryGeojson: text('boundary_geojson'), // GeoJSON Polygon geometry as JSON string
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Water Readings (USGS time-series) ──────────────────────
export const waterReadings = sqliteTable('water_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  siteId: text('site_id').notNull(), // USGS site number, e.g. "08155500"
  siteName: text('site_name').notNull(), // "Barton Springs"
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  parameterCode: text('parameter_code').notNull(), // "00010" = temp, "00065" = gage height
  value: real('value').notNull(),
  unit: text('unit').notNull(), // "deg C", "ft"
  timestamp: text('timestamp').notNull(), // ISO 8601 from USGS
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Lake Readings (TWDB reservoir levels) ──────────────────
export const lakeReadings = sqliteTable('lake_readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lakeKey: text('lake_key').notNull(), // "Travis", "Austin", etc.
  lakeName: text('lake_name').notNull(), // "Lake Travis"
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  elevation: real('elevation').notNull(), // ft above sea level
  percentFull: real('percent_full'),
  conservationCapacity: real('conservation_capacity'),
  conservationStorage: real('conservation_storage'),
  timestamp: text('timestamp').notNull(), // date from API (YYYY-MM-DD)
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Neighborhood Grid (Apple Maps reverse geocode crawler) ─
export const neighborhoodGrid = sqliteTable('neighborhood_grid', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  neighborhood: text('neighborhood'), // dependentLocalities[0]
  allLocalities: text('all_localities'), // JSON array of all dependentLocalities
  locality: text('locality'), // city name
  subLocality: text('sub_locality'), // structuredAddress.subLocality
  postCode: text('post_code'),
  crawledAt: text('crawled_at').notNull(),
  gridRow: integer('grid_row').notNull(),
  gridCol: integer('grid_col').notNull(),
})

// ─── Home Prices (Zillow ZHVI by zip code) ──────────────────
export const homePrices = sqliteTable('home_prices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  zipCode: text('zip_code').notNull(),
  period: text('period').notNull(), // YYYY-MM
  medianValue: real('median_value').notNull(), // $
  yoyChange: real('yoy_change'), // decimal, e.g. 0.054 = 5.4%
  source: text('source').default('zillow'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Market Stats (Redfin metro/city-level) ─────────────────
export const marketStats = sqliteTable('market_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  region: text('region').notNull(), // "Austin, TX" or zip code
  regionType: text('region_type').notNull(), // "metro", "city", "zip"
  period: text('period').notNull(), // YYYY-MM
  medianSalePrice: real('median_sale_price'),
  homesSold: integer('homes_sold'),
  newListings: integer('new_listings'),
  inventory: integer('inventory'),
  daysOnMarket: integer('days_on_market'),
  saleToListRatio: real('sale_to_list_ratio'), // e.g. 0.98
  source: text('source').default('redfin'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Rent Prices (Zillow ZORI by zip code) ──────────────────
export const rentPrices = sqliteTable('rent_prices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  zipCode: text('zip_code').notNull(),
  period: text('period').notNull(), // YYYY-MM
  medianRent: real('median_rent').notNull(), // $/month
  yoyChange: real('yoy_change'), // decimal
  source: text('source').default('zillow'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Development Permits (City of Austin SODA API) ──────────
export const developmentPermits = sqliteTable('development_permits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  permitNumber: text('permit_number').notNull().unique(),
  lat: real('lat'),
  lng: real('lng'),
  description: text('description'),
  units: integer('units'),
  valuation: real('valuation'), // $
  issueDate: text('issue_date').notNull(), // YYYY-MM-DD
  workClass: text('work_class'), // "New", "Remodel", etc.
  status: text('status'),
  address: text('address'),
  neighborhood: text('neighborhood'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Bluebonnet Observations (iNaturalist) ──────────────────
export const bluebonnetObservations = sqliteTable('bluebonnet_observations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  inatId: integer('inat_id').notNull().unique(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  observedOn: text('observed_on').notNull(), // YYYY-MM-DD
  photoUrl: text('photo_url'),
  observer: text('observer').notNull(),
  place: text('place').notNull(),
  url: text('url').notNull(),
  qualityGrade: text('quality_grade').default('needs_id'), // 'research' | 'needs_id'
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Site Hierarchy ──────────────────────────────────────────
export const siteCategoriesTable = sqliteTable('site_categories', {
  slug: text('slug').primaryKey(),
  title: text('title').notNull(),
  tagline: text('tagline').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  bgColor: text('bg_color').notNull(),
  seoTitle: text('seo_title').notNull(),
  seoDescription: text('seo_description').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ─── Content Pipeline ───────────────────────────────────────
export const contentPipelineTopics = sqliteTable('content_pipeline_topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categorySlug: text('category_slug').notNull(),
  categoryLabel: text('category_label').notNull(),
  topicKey: text('topic_key').notNull(),
  topicLabel: text('topic_label').notNull(),
  contentType: text('content_type').notNull(),
  spotFile: text('spot_file'),
  maxSpots: integer('max_spots').notNull().default(10),
  searchQueries: text('search_queries').notNull().default('[]'), // JSON array of strings
  bodySystemPrompt: text('body_system_prompt'),
  faqSystemPrompt: text('faq_system_prompt'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  // Additional fields for useSiteData compatibility
  description: text('description'),
  status: text('status').notNull().default('live'), // live | coming-soon
  standaloneUrl: text('standalone_url'),
  accentColor: text('accent_color'),
  pinColor: text('pin_color'),
  icon: text('icon'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const contentPipelineRuns = sqliteTable('content_pipeline_runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categorySlug: text('category_slug').notNull(),
  topicKey: text('topic_key'),
  status: text('status').notNull().default('pending'), // pending | running | completed | failed
  spotsGenerated: integer('spots_generated').default(0),
  tokensUsed: integer('tokens_used').default(0),
  outputPreview: text('output_preview'), // JSON snapshot of generated data
  error: text('error'),
  startedAt: text('started_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  completedAt: text('completed_at'),
})

// ─── Type helpers ───────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type PollenReading = typeof pollenReadings.$inferSelect
export type NewPollenReading = typeof pollenReadings.$inferInsert
export type Keyword = typeof keywords.$inferSelect
export type NewKeyword = typeof keywords.$inferInsert
export type MapSpotRow = typeof mapSpotsTable.$inferSelect
export type NewMapSpotRow = typeof mapSpotsTable.$inferInsert
export type Neighborhood = typeof neighborhoodsTable.$inferSelect
export type NewNeighborhood = typeof neighborhoodsTable.$inferInsert
export type WaterReading = typeof waterReadings.$inferSelect
export type NewWaterReading = typeof waterReadings.$inferInsert
export type LakeReading = typeof lakeReadings.$inferSelect
export type NewLakeReading = typeof lakeReadings.$inferInsert
export type NeighborhoodGridPoint = typeof neighborhoodGrid.$inferSelect
export type NewNeighborhoodGridPoint = typeof neighborhoodGrid.$inferInsert
export type HomePrice = typeof homePrices.$inferSelect
export type NewHomePrice = typeof homePrices.$inferInsert
export type MarketStat = typeof marketStats.$inferSelect
export type NewMarketStat = typeof marketStats.$inferInsert
export type RentPrice = typeof rentPrices.$inferSelect
export type NewRentPrice = typeof rentPrices.$inferInsert
export type DevelopmentPermit = typeof developmentPermits.$inferSelect
export type NewDevelopmentPermit = typeof developmentPermits.$inferInsert
export type BluebonnetObservation = typeof bluebonnetObservations.$inferSelect
export type NewBluebonnetObservation = typeof bluebonnetObservations.$inferInsert
export type ContentPipelineTopic = typeof contentPipelineTopics.$inferSelect
export type NewContentPipelineTopic = typeof contentPipelineTopics.$inferInsert

export type SiteCategory = typeof siteCategoriesTable.$inferSelect
export type NewSiteCategory = typeof siteCategoriesTable.$inferInsert
export type ContentPipelineRun = typeof contentPipelineRuns.$inferSelect
export type NewContentPipelineRun = typeof contentPipelineRuns.$inferInsert
