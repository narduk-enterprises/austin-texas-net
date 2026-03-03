-- 0004_rename_map_spots.sql
-- Rename taco_spots → map_spots with a content_type column
-- for the generic Map Content Type pattern.

CREATE TABLE IF NOT EXISTS map_spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT,
  neighborhood TEXT,
  category TEXT,
  content_type TEXT NOT NULL DEFAULT 'breakfast-tacos',
  phone TEXT,
  url TEXT,
  rank INTEGER,
  known_for TEXT,
  description TEXT,
  price_range TEXT DEFAULT '$',
  rating REAL,
  featured INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Copy existing taco spots data
INSERT OR IGNORE INTO map_spots (
  id, name, lat, lng, address, neighborhood, category,
  content_type, phone, url, rank, known_for, description,
  price_range, rating, featured, created_at, updated_at
)
SELECT
  id, name, lat, lng, address, neighborhood, category,
  'breakfast-tacos', phone, url, rank, known_for, description,
  price_range, rating, featured, created_at, updated_at
FROM taco_spots;

-- Drop the old table
DROP TABLE IF EXISTS taco_spots;
