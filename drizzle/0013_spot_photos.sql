-- 0013_spot_photos.sql
-- Add Google Places photo fields to map_spots

ALTER TABLE map_spots ADD COLUMN photo_url TEXT;
ALTER TABLE map_spots ADD COLUMN google_place_id TEXT;
ALTER TABLE map_spots ADD COLUMN photo_attribution TEXT;
