-- Neighborhood grid: stores reverse-geocoded points for building
-- neighborhood boundaries from Apple Maps dependentLocalities.
CREATE TABLE neighborhood_grid (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  lat             REAL    NOT NULL,
  lng             REAL    NOT NULL,
  neighborhood    TEXT,                -- dependentLocalities[0] (primary neighborhood name)
  all_localities  TEXT,                -- JSON array of all dependentLocalities
  locality        TEXT,                -- city name (e.g. "Austin")
  sub_locality    TEXT,                -- structuredAddress.subLocality
  post_code       TEXT,
  crawled_at      TEXT    NOT NULL,
  grid_row        INTEGER NOT NULL,
  grid_col        INTEGER NOT NULL,
  UNIQUE(grid_row, grid_col)
);

CREATE INDEX idx_neighborhood_grid_neighborhood ON neighborhood_grid(neighborhood);
CREATE INDEX idx_neighborhood_grid_rowcol ON neighborhood_grid(grid_row, grid_col);
