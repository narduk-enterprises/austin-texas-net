-- Radar Keywords table for SEO intelligence engine
-- Combined v1-v4 schema in a single migration

CREATE TABLE IF NOT EXISTS `keywords` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `keyword` text NOT NULL UNIQUE,
  `bucket` text NOT NULL,
  `monthly_volume` integer DEFAULT 0,
  `competition` text DEFAULT 'LOW',
  `trend_score` integer DEFAULT 0,
  `rising_score` integer DEFAULT 0,
  `first_seen` text NOT NULL,
  `last_seen` text NOT NULL,
  `page_exists` integer DEFAULT 0,
  `composite_score` integer DEFAULT 0,
  -- Roadmap columns (v2)
  `intent` text DEFAULT 'informational',
  `difficulty` integer DEFAULT 50,
  `seasonality` text,
  `opportunity_score` integer DEFAULT 0,
  `matched_app` text,
  `matched_url` text,
  `suggested_title` text,
  `suggested_internal_links` text,
  -- Strategic scoring (v3)
  `subtypes` text,
  `strategic_score` integer DEFAULT 0,
  -- Difficulty validation (v4)
  `difficulty_source` text DEFAULT 'estimated',
  `difficulty_confidence` text DEFAULT 'medium',
  `difficulty_anomaly` text
);

CREATE INDEX IF NOT EXISTS `idx_keywords_bucket` ON `keywords` (`bucket`);
CREATE INDEX IF NOT EXISTS `idx_keywords_composite` ON `keywords` (`composite_score` DESC);
CREATE INDEX IF NOT EXISTS `idx_keywords_page_exists` ON `keywords` (`page_exists`);
CREATE INDEX IF NOT EXISTS `idx_keywords_intent` ON `keywords` (`intent`);
CREATE INDEX IF NOT EXISTS `idx_keywords_difficulty` ON `keywords` (`difficulty`);
CREATE INDEX IF NOT EXISTS `idx_keywords_opportunity` ON `keywords` (`opportunity_score`);
CREATE INDEX IF NOT EXISTS `idx_keywords_matched_app` ON `keywords` (`matched_app`);
CREATE INDEX IF NOT EXISTS `idx_keywords_strategic` ON `keywords` (`strategic_score` DESC);
