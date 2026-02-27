-- 0005_neighborhoods.sql
-- Create neighborhoods table for Austin-area neighborhood directory.

CREATE TABLE IF NOT EXISTS neighborhoods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  city TEXT DEFAULT 'Austin',
  region TEXT,
  zip_code TEXT,
  description TEXT,
  population INTEGER,
  featured INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
