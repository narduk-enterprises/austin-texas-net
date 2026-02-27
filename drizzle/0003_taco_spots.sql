-- Taco spots sourced from Apple Maps Server API
CREATE TABLE taco_spots (
  id              TEXT PRIMARY KEY,            -- Apple Maps place ID
  name            TEXT NOT NULL,
  lat             REAL NOT NULL,
  lng             REAL NOT NULL,
  address         TEXT,
  neighborhood    TEXT,
  category        TEXT,
  phone           TEXT,
  url             TEXT,
  -- Editorial overrides (populated by us, not Apple)
  rank            INTEGER,
  known_for       TEXT,
  description     TEXT,
  price_range     TEXT DEFAULT '$',
  rating          REAL,
  featured        INTEGER DEFAULT 1,           -- 1 = show on map
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE INDEX idx_taco_spots_featured ON taco_spots(featured);
CREATE INDEX idx_taco_spots_rank ON taco_spots(rank);
