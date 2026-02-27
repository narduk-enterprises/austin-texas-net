-- 0010_neighborhood_shapes.sql
-- Add tier, parent_region, apple_maps_name, and boundary_geojson
-- to the neighborhoods table for crawl reconciliation and shape storage.

ALTER TABLE neighborhoods ADD COLUMN tier TEXT DEFAULT 'neighborhood';
-- 'region' | 'neighborhood' | 'micro' | 'district'

ALTER TABLE neighborhoods ADD COLUMN parent_region TEXT;
-- e.g. 'Northwest Austin' for Northwest Hills

ALTER TABLE neighborhoods ADD COLUMN apple_maps_name TEXT;
-- Exact name Apple Maps returns (for crawl matching)

ALTER TABLE neighborhoods ADD COLUMN boundary_geojson TEXT;
-- GeoJSON Polygon geometry as JSON string
