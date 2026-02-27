-- Real Estate tables

CREATE TABLE IF NOT EXISTS `home_prices` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `zip_code` text NOT NULL,
  `period` text NOT NULL,
  `median_value` real NOT NULL,
  `yoy_change` real,
  `source` text DEFAULT 'zillow',
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `market_stats` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `region` text NOT NULL,
  `region_type` text NOT NULL,
  `period` text NOT NULL,
  `median_sale_price` real,
  `homes_sold` integer,
  `new_listings` integer,
  `inventory` integer,
  `days_on_market` integer,
  `sale_to_list_ratio` real,
  `source` text DEFAULT 'redfin',
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `rent_prices` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `zip_code` text NOT NULL,
  `period` text NOT NULL,
  `median_rent` real NOT NULL,
  `yoy_change` real,
  `source` text DEFAULT 'zillow',
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `development_permits` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `permit_number` text NOT NULL UNIQUE,
  `lat` real,
  `lng` real,
  `description` text,
  `units` integer,
  `valuation` real,
  `issue_date` text NOT NULL,
  `work_class` text,
  `status` text,
  `address` text,
  `neighborhood` text,
  `created_at` text NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS `idx_home_prices_zip_period` ON `home_prices` (`zip_code`, `period`);
CREATE INDEX IF NOT EXISTS `idx_market_stats_region_period` ON `market_stats` (`region`, `period`);
CREATE INDEX IF NOT EXISTS `idx_rent_prices_zip_period` ON `rent_prices` (`zip_code`, `period`);
CREATE INDEX IF NOT EXISTS `idx_dev_permits_issue_date` ON `development_permits` (`issue_date`);
