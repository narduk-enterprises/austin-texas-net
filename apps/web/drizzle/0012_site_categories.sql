-- Migration 0012: Create site_categories table + add missing columns to content_pipeline_topics
-- Also seeds both tables with local dev data

-- ── Create site_categories table ────────────────────────────
CREATE TABLE IF NOT EXISTS `site_categories` (
  `slug` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `tagline` text NOT NULL,
  `icon` text NOT NULL,
  `color` text NOT NULL,
  `bg_color` text NOT NULL,
  `seo_title` text NOT NULL,
  `seo_description` text NOT NULL,
  `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

-- ── Add missing columns to content_pipeline_topics ──────────
ALTER TABLE `content_pipeline_topics` ADD COLUMN `description` text;
ALTER TABLE `content_pipeline_topics` ADD COLUMN `status` text NOT NULL DEFAULT 'live';
ALTER TABLE `content_pipeline_topics` ADD COLUMN `standalone_url` text;
ALTER TABLE `content_pipeline_topics` ADD COLUMN `accent_color` text;
ALTER TABLE `content_pipeline_topics` ADD COLUMN `pin_color` text;
ALTER TABLE `content_pipeline_topics` ADD COLUMN `icon` text;

-- ── Seed site_categories ────────────────────────────────────
INSERT INTO site_categories (slug, title, tagline, icon, color, bg_color, seo_title, seo_description, created_at, updated_at) VALUES ('food', 'Food', 'The best eats across Austin — tacos, trucks, happy hours, and more.', 'i-lucide-utensils', 'text-amber-600 dark:text-amber-400', 'bg-amber-100 dark:bg-amber-900/30', 'Best Food in Austin — Tacos, BBQ, Coffee & More', 'Discover the best food in Austin, Texas — breakfast tacos, BBQ, coffee shops, food trucks, happy hours, and more. Your complete ATX food guide.', datetime('now'), datetime('now'));
INSERT INTO site_categories (slug, title, tagline, icon, color, bg_color, seo_title, seo_description, created_at, updated_at) VALUES ('events', 'Events', 'Live music, festivals, family events, and everything happening in ATX.', 'i-lucide-music', 'text-emerald-600 dark:text-emerald-400', 'bg-emerald-100 dark:bg-emerald-900/30', 'Austin Events — Live Music, Festivals & Things To Do', 'Austin events guide — live music tonight, festivals, family events, free things to do, and the best of what''s happening across ATX.', datetime('now'), datetime('now'));
INSERT INTO site_categories (slug, title, tagline, icon, color, bg_color, seo_title, seo_description, created_at, updated_at) VALUES ('outdoors', 'Outdoors', 'Parks, trails, swimming holes, and everything under the Texas sun.', 'i-lucide-trees', 'text-violet-600 dark:text-violet-400', 'bg-violet-100 dark:bg-violet-900/30', 'Outdoor Austin — Parks, Trails, Swimming & Nature', 'Explore Austin''s outdoor scene — parks, hiking trails, swimming holes, Lake Travis, Barton Springs, and trail maps.', datetime('now'), datetime('now'));
INSERT INTO site_categories (slug, title, tagline, icon, color, bg_color, seo_title, seo_description, created_at, updated_at) VALUES ('health', 'Health', 'Cedar pollen, air quality, and health resources for Central Texas.', 'i-lucide-heart-pulse', 'text-rose-600 dark:text-rose-400', 'bg-rose-100 dark:bg-rose-900/30', 'Austin Health — Pollen, Air Quality & Healthcare Resources', 'Austin health resources — live cedar pollen counts, air quality index, urgent care finder, hospital directory, and allergy tracking.', datetime('now'), datetime('now'));
INSERT INTO site_categories (slug, title, tagline, icon, color, bg_color, seo_title, seo_description, created_at, updated_at) VALUES ('weather', 'Weather', 'Current conditions, radar, forecasts, and severe weather alerts.', 'i-lucide-cloud-sun', 'text-sky-600 dark:text-sky-400', 'bg-sky-100 dark:bg-sky-900/30', 'Austin Weather — Radar, Forecasts & Severe Weather Alerts', 'Austin weather dashboard — current conditions, NEXRAD radar, 7-day forecast, heat index, freeze alerts, and drought monitoring.', datetime('now'), datetime('now'));
INSERT INTO site_categories (slug, title, tagline, icon, color, bg_color, seo_title, seo_description, created_at, updated_at) VALUES ('live-data', 'Live Data', 'Water temps, lake levels, traffic, power outages, and real-time feeds.', 'i-lucide-activity', 'text-cyan-600 dark:text-cyan-400', 'bg-cyan-100 dark:bg-cyan-900/30', 'Austin Live Data — Water Temps, Lake Levels, Traffic & AQI', 'Real-time Austin data feeds — water temperatures, lake levels, traffic conditions, power outage maps, air quality, and river flow.', datetime('now'), datetime('now'));
INSERT INTO site_categories (slug, title, tagline, icon, color, bg_color, seo_title, seo_description, created_at, updated_at) VALUES ('real-estate', 'Real Estate', 'Market trends, home prices, rent data, and where to live in Austin.', 'i-lucide-home', 'text-teal-600 dark:text-teal-400', 'bg-teal-100 dark:bg-teal-900/30', 'Austin Real Estate — Market Trends, Home Prices & Rent Data', 'Austin real estate insights — market trends, median home prices, property tax guide, new developments, rent trends, and housing maps.', datetime('now'), datetime('now'));
INSERT INTO site_categories (slug, title, tagline, icon, color, bg_color, seo_title, seo_description, created_at, updated_at) VALUES ('neighborhoods', 'Neighborhoods', 'Downtown, SoCo, East Austin, and every corner of the ATX metro.', 'i-lucide-map-pin', 'text-orange-600 dark:text-orange-400', 'bg-orange-100 dark:bg-orange-900/30', 'Austin Neighborhoods — 80+ Areas from Leander to Buda', 'Explore 80+ Austin neighborhoods — Downtown, South Congress, East Austin, Mueller, Round Rock, Cedar Park, and more. Find your perfect area in the ATX metro.', datetime('now'), datetime('now'));

-- ── Seed content_pipeline_topics (update existing rows with new columns) ──
UPDATE content_pipeline_topics SET description = 'The best tacos in Austin — street tacos, al pastor, carnitas, and more.', status = 'live' WHERE topic_key = 'tacos' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'Austin crawfish season — boils, restaurants, and Cajun spots.', status = 'live' WHERE topic_key = 'crawfish' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'Best BBQ in Austin — brisket, ribs, sausage, and legendary pitmasters.', status = 'live' WHERE topic_key = 'bbq' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'The best breakfast tacos in Austin — migas, bean & cheese, and more.', status = 'live' WHERE topic_key = 'breakfast-tacos' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'Austin food trucks — gourmet trailers, taco trucks, and food parks.', status = 'live' WHERE topic_key = 'food-trucks' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'Austin happy hour guide — drink specials, patios, and late-night deals.', status = 'live' WHERE topic_key = 'happy-hours' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'Best restaurants in Austin — fine dining, date night, and local favorites.', status = 'live' WHERE topic_key = 'restaurants' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'Best coffee shops in Austin — local roasters, cafes, and work spots.', status = 'live' WHERE topic_key = 'coffee-shops' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'Interactive Austin restaurant map — browse by cuisine, area, and price.', status = 'live' WHERE topic_key = 'restaurant-map' AND category_slug = 'food';
UPDATE content_pipeline_topics SET description = 'SXSW guide — schedule, venues, free events, and survival tips.', status = 'live' WHERE topic_key = 'sxsw' AND category_slug = 'events';
UPDATE content_pipeline_topics SET description = 'Texas Bluebonnet season — live iNaturalist sightings on an interactive map.', status = 'live' WHERE topic_key = 'bluebonnets' AND category_slug = 'outdoors';
UPDATE content_pipeline_topics SET description = 'Live cedar pollen counts, 5-day forecasts, and severity tracking.', status = 'live' WHERE topic_key = 'cedar-pollen' AND category_slug = 'health';
UPDATE content_pipeline_topics SET description = 'Real-time Austin weather — temperature, humidity, wind, and UV index.', status = 'live' WHERE topic_key = 'current-conditions' AND category_slug = 'weather';
UPDATE content_pipeline_topics SET description = 'Live NEXRAD radar for Central Texas — rain, storms, and precipitation.', status = 'live' WHERE topic_key = 'radar' AND category_slug = 'weather';
UPDATE content_pipeline_topics SET description = 'Extended forecast for Austin — daily highs, lows, and conditions.', status = 'live' WHERE topic_key = '7-day-forecast' AND category_slug = 'weather';
UPDATE content_pipeline_topics SET description = 'Current and forecast heat index — feels-like temperature tracking.', status = 'live' WHERE topic_key = 'heat-index' AND category_slug = 'weather';
UPDATE content_pipeline_topics SET description = 'Winter freeze warnings and pipe protection alerts for Austin.', status = 'live' WHERE topic_key = 'freeze-alerts' AND category_slug = 'weather';
UPDATE content_pipeline_topics SET description = 'Central Texas drought monitor — watering restrictions and conditions.', status = 'live' WHERE topic_key = 'drought-status' AND category_slug = 'weather';
UPDATE content_pipeline_topics SET description = 'Live water temperatures for Barton Springs, Lake Travis, and more.', status = 'live' WHERE topic_key = 'water-temps' AND category_slug = 'live-data';
UPDATE content_pipeline_topics SET description = 'Real-time Lake Travis and Lake Austin water levels from LCRA.', status = 'live' WHERE topic_key = 'lake-levels' AND category_slug = 'live-data';
UPDATE content_pipeline_topics SET description = 'Austin real estate market trends — sales volume, days on market, and outlook.', status = 'live' WHERE topic_key = 'market-trends' AND category_slug = 'real-estate';
UPDATE content_pipeline_topics SET description = 'Median home prices by Austin neighborhood and zip code.', status = 'live' WHERE topic_key = 'median-home-prices' AND category_slug = 'real-estate';
UPDATE content_pipeline_topics SET description = 'Travis County property tax guide — rates, exemptions, and protest tips.', status = 'live' WHERE topic_key = 'property-tax-guide' AND category_slug = 'real-estate';
UPDATE content_pipeline_topics SET description = 'New construction and development projects across Austin.', status = 'live' WHERE topic_key = 'new-developments' AND category_slug = 'real-estate';
UPDATE content_pipeline_topics SET description = 'Austin rent trends by neighborhood — averages, heatmap, and forecasts.', status = 'live' WHERE topic_key = 'rent-trends' AND category_slug = 'real-estate';
UPDATE content_pipeline_topics SET description = 'Interactive Austin housing map — prices, inventory, and market heat.', status = 'live' WHERE topic_key = 'housing-map' AND category_slug = 'real-estate';
