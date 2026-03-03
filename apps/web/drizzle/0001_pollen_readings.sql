-- Migration: pollen_readings table for historical pollen data
-- Sources: kxan, ambee, manual

CREATE TABLE IF NOT EXISTS `pollen_readings` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `date` text NOT NULL,
  `count` real NOT NULL,
  `severity` text NOT NULL,
  `source` text DEFAULT 'kxan',
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

-- Prevent duplicate readings for same date + source
CREATE UNIQUE INDEX IF NOT EXISTS `pollen_readings_date_source_unique`
  ON `pollen_readings` (`date`, `source`);

-- Fast lookups by date range
CREATE INDEX IF NOT EXISTS `pollen_readings_date_idx`
  ON `pollen_readings` (`date`);
