-- Migration 0015: Seed ALL missing content_pipeline_topics entries
-- Ensures every sub-app from siteCategories has a DB row with proper metadata
-- Uses INSERT OR IGNORE to be idempotent (won't duplicate if rows already exist from admin UI)

-- ════════════════════════════════════════════════════════════════
-- FOOD — 5 missing spots sub-apps
-- ════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, spot_file, max_spots, search_queries, description, status, icon, accent_color, pin_color, enabled, created_at, updated_at)
VALUES ('food', 'Food', 'tex-mex', 'Tex-Mex', 'spots', 'texMexSpots.ts', 10, '["best tex-mex restaurants austin texas 2026","top rated tex-mex austin tx","authentic tex-mex austin"]', 'The best Tex-Mex in Austin — enchiladas, queso, and chile rellenos from legendary spots.', 'live', 'i-lucide-flame', 'orange', '#ea580c', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, spot_file, max_spots, search_queries, description, status, icon, accent_color, pin_color, enabled, created_at, updated_at)
VALUES ('food', 'Food', 'brunch', 'Brunch Spots', 'spots', 'brunchSpots.ts', 10, '["best brunch austin texas 2026","top brunch restaurants austin tx","bottomless brunch austin"]', 'Austin brunch guide — bottomless mimosas, egg sandwiches, and weekend favorites.', 'live', 'i-lucide-sun', 'yellow', '#ca8a04', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, spot_file, max_spots, search_queries, description, status, icon, accent_color, pin_color, enabled, created_at, updated_at)
VALUES ('food', 'Food', 'pizza', 'Pizza', 'spots', 'pizzaSpots.ts', 10, '["best pizza austin texas 2026","top pizza restaurants austin tx","neapolitan pizza austin"]', 'The best pizza in Austin — Neapolitan, New York-style, Detroit, and wood-fired pies.', 'live', 'i-lucide-pizza', 'red', '#dc2626', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, spot_file, max_spots, search_queries, description, status, icon, accent_color, pin_color, enabled, created_at, updated_at)
VALUES ('food', 'Food', 'asian-food', 'Asian Food', 'spots', 'asianFoodSpots.ts', 10, '["best asian restaurants austin texas 2026","top rated sushi ramen pho austin tx","thai vietnamese chinese austin"]', 'Best Asian food in Austin — sushi, ramen, pho, Thai, Chinese, Korean, and more.', 'live', 'i-lucide-soup', 'rose', '#e11d48', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, spot_file, max_spots, search_queries, description, status, icon, accent_color, pin_color, enabled, created_at, updated_at)
VALUES ('food', 'Food', 'bars', 'Bars', 'spots', 'barSpots.ts', 10, '["best bars austin texas 2026","top cocktail bars austin tx","dive bars austin sixth street rainey"]', 'Austin bar guide — cocktail lounges, dive bars, Rainey Street, and rooftop drinks.', 'live', 'i-lucide-wine', 'purple', '#7c3aed', 1, datetime('now'), datetime('now'));

-- ════════════════════════════════════════════════════════════════
-- EVENTS — 5 sub-apps with custom pages (guide content type)
-- ════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('events', 'Events', 'acl-fest', 'ACL Fest', 'guide', 0, '["acl fest austin 2026","austin city limits festival lineup","acl music festival guide"]', 'Austin City Limits Music Festival — lineup, tickets, schedule, and survival guide.', 'live', 'i-lucide-music', 'emerald', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('events', 'Events', 'rodeo-austin', 'Rodeo Austin', 'guide', 0, '["rodeo austin 2026","austin rodeo schedule tickets","star of texas fair rodeo"]', 'Rodeo Austin — rodeo events, concert lineup, carnival, and livestock shows at the Travis County Expo Center.', 'live', 'i-lucide-award', 'amber', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('events', 'Events', 'trail-of-lights', 'Trail of Lights', 'guide', 0, '["trail of lights austin 2026","austin trail of lights tickets","zilker park christmas lights"]', 'Austin Trail of Lights — dates, tickets, route map, and tips for Zilker Park''s iconic holiday display.', 'live', 'i-lucide-sparkles', 'yellow', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('events', 'Events', 'bat-fest', 'Bat Fest', 'guide', 0, '["bat fest austin 2026","congress avenue bridge bats festival","austin bat festival"]', 'Austin Bat Fest — celebrating the Congress Avenue Bridge colony with live music, food, and 1.5 million bats.', 'live', 'i-lucide-bat', 'violet', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('events', 'Events', 'this-weekend', 'This Weekend', 'utility', 0, '["things to do austin this weekend","austin events this weekend","what to do in austin saturday sunday"]', 'What to do in Austin this weekend — curated picks for music, food, outdoors, and family fun.', 'live', 'i-lucide-calendar', 'emerald', 1, datetime('now'), datetime('now'));

-- ════════════════════════════════════════════════════════════════
-- OUTDOORS — 5 sub-apps with custom pages (bluebonnets already seeded)
-- ════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('outdoors', 'Outdoors', 'hiking-trails', 'Hiking Trails', 'guide', 0, '["best hiking trails austin texas","austin hike and bike trail","greenbelt hiking austin"]', 'Austin hiking guide — Barton Creek Greenbelt, Mount Bonnell, Wild Basin, and trail maps.', 'live', 'i-lucide-mountain', 'green', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('outdoors', 'Outdoors', 'swimming-holes', 'Swimming Holes', 'guide', 0, '["best swimming holes austin texas","barton springs pool hours","hamilton pool reservation"]', 'Austin swimming holes — Barton Springs, Hamilton Pool, Jacob''s Well, and secret spots.', 'live', 'i-lucide-waves', 'cyan', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('outdoors', 'Outdoors', 'parks-guide', 'Parks Guide', 'guide', 0, '["best parks austin texas","zilker park austin","austin parks and recreation"]', 'Austin parks guide — Zilker, Pease, Mueller, and 300+ green spaces across the metro.', 'live', 'i-lucide-trees', 'emerald', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('outdoors', 'Outdoors', 'kayak-launches', 'Kayak Launches', 'guide', 0, '["kayak launch spots austin texas","kayaking lady bird lake austin","paddle board rentals austin"]', 'Austin kayak launches — Lady Bird Lake, Lake Travis, and river access points with rental info.', 'live', 'i-lucide-sailboat', 'blue', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('outdoors', 'Outdoors', 'disc-golf', 'Disc Golf', 'guide', 0, '["disc golf courses austin texas","best disc golf austin","circle c disc golf course"]', 'Austin disc golf courses — Circle C, Zilker, Roy G, and course maps with difficulty ratings.', 'live', 'i-lucide-disc', 'lime', 1, datetime('now'), datetime('now'));

-- ════════════════════════════════════════════════════════════════
-- HEALTH — 2 sub-apps with custom pages (cedar-pollen already seeded)
-- ════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('health', 'Health', 'allergy-forecast', 'Allergy Forecast', 'data-page', 0, '["austin allergy forecast today","austin pollen count today","central texas allergy report"]', 'Austin allergy forecast — daily pollen counts, mold levels, and seasonal allergy tips.', 'live', 'i-lucide-flower-2', 'rose', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('health', 'Health', 'air-quality', 'Air Quality', 'data-page', 0, '["austin air quality index today","austin aqi","air quality austin texas"]', 'Austin air quality index — real-time AQI, ozone levels, and PM2.5 monitoring.', 'live', 'i-lucide-wind', 'sky', 1, datetime('now'), datetime('now'));

-- ════════════════════════════════════════════════════════════════
-- WEATHER — 2 sub-apps not yet seeded (freeze-prep, drought-status already seeded above)
-- current-conditions, radar, 7-day-forecast, heat-index, freeze-alerts already seeded in 0012
-- ════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('weather', 'Weather', 'freeze-prep', 'Freeze Prep Guide', 'guide', 0, '["austin freeze preparation guide","winter storm prep austin texas","how to protect pipes austin freeze"]', 'Complete freeze preparation guide — pipe protection, plant safety, emergency supplies, and winter storm survival.', 'live', 'i-lucide-snowflake', 'sky', 1, datetime('now'), datetime('now'));

-- ════════════════════════════════════════════════════════════════
-- CULTURE — 2 sub-apps with custom pages
-- ════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('culture', 'Culture', 'live-music-venues', 'Live Music Venues', 'guide', 0, '["best live music venues austin texas","austin live music tonight","sixth street music venues austin"]', 'Austin live music venues — Sixth Street, Red River, Continental Club, and where to hear music every night.', 'live', 'i-lucide-music', 'pink', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('culture', 'Culture', 'street-art', 'Street Art', 'guide', 0, '["austin street art murals","greetings from austin mural","best murals austin texas"]', 'Austin street art and murals — the iconic Greetings from Austin, HOPE Outdoor Gallery legacy, and hidden gems.', 'live', 'i-lucide-palette', 'fuchsia', 1, datetime('now'), datetime('now'));

-- ════════════════════════════════════════════════════════════════
-- FUN — 3 sub-apps with custom pages
-- ════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('fun', 'Fun', 'haunted-austin', 'Haunted Austin', 'guide', 0, '["haunted places austin texas","ghost tours austin","most haunted austin locations"]', 'Haunted Austin — ghost tours, haunted hotels, spooky history, and paranormal hot spots.', 'live', 'i-lucide-ghost', 'violet', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('fun', 'Fun', 'games', 'Games Portal', 'utility', 0, '["browser games austin","atx apps games","online games austin themed"]', 'ATX Games — playable browser games inspired by Austin, from arcade survival to strategy sims.', 'live', 'i-lucide-gamepad-2', 'indigo', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO content_pipeline_topics (category_slug, category_label, topic_key, topic_label, content_type, max_spots, search_queries, description, status, icon, accent_color, enabled, created_at, updated_at)
VALUES ('fun', 'Fun', 'chicken-shit-bingo', 'Chicken Shit Bingo', 'guide', 0, '["chicken shit bingo austin","little longhorn saloon bingo","chicken bingo austin texas"]', 'Chicken Shit Bingo at Little Longhorn Saloon — the most Austin thing you can do on a Sunday.', 'live', 'i-lucide-egg', 'amber', 1, datetime('now'), datetime('now'));
