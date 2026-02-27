/**
 * neighborhoodSeed — Curated list of Austin-area neighborhoods
 * covering Leander (north) to Buda (south).
 *
 * Each entry has a name, region grouping, parent city, tier classification,
 * optional parent_region for hierarchy, and apple_maps_name for crawl matching.
 *
 * Tiers:
 *   region       — broad area or unincorporated county zone
 *   neighborhood — standard residential neighborhood
 *   micro        — small sub-neighborhood or pocket
 *   district     — named commercial / entertainment district
 */

export type NeighborhoodTier = 'region' | 'neighborhood' | 'micro' | 'district'

export interface NeighborhoodSeedEntry {
  name: string
  region: string
  city: string
  tier: NeighborhoodTier
  parentRegion?: string // links to a region-tier entry
  appleMapName?: string // exact name Apple Maps returns
}

export const NEIGHBORHOOD_SEED: NeighborhoodSeedEntry[] = [
  // ═══════════════════════════════════════════════════════════════
  // BROAD REGIONS (tier: 'region')
  // Apple Maps uses these as catch-all when no specific hood exists.
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Northwest Austin',
    region: 'North Austin',
    city: 'Austin',
    tier: 'region',
    appleMapName: 'Northwest Austin',
  },
  {
    name: 'North Austin',
    region: 'North Austin',
    city: 'Austin',
    tier: 'region',
    appleMapName: 'North Austin',
  },
  {
    name: 'South Austin',
    region: 'South',
    city: 'Austin',
    tier: 'region',
    appleMapName: 'South Austin',
  },
  {
    name: 'Southeast Austin',
    region: 'East',
    city: 'Austin',
    tier: 'region',
    appleMapName: 'Southeast Austin',
  },
  {
    name: 'Travis Northwest',
    region: 'West',
    city: 'Austin',
    tier: 'region',
    appleMapName: 'Travis Northwest',
  },
  {
    name: 'Travis Northeast',
    region: 'East',
    city: 'Austin',
    tier: 'region',
    appleMapName: 'Travis Northeast',
  },
  {
    name: 'Travis Southwest',
    region: 'West',
    city: 'Austin',
    tier: 'region',
    appleMapName: 'Travis Southwest',
  },

  // ═══════════════════════════════════════════════════════════════
  // FAR NORTH (Leander / Cedar Park / Georgetown)
  // ═══════════════════════════════════════════════════════════════
  { name: 'Leander', region: 'Far North', city: 'Leander', tier: 'neighborhood' },
  { name: 'Crystal Falls', region: 'Far North', city: 'Leander', tier: 'neighborhood' },
  { name: 'Cedar Park', region: 'Far North', city: 'Cedar Park', tier: 'neighborhood' },
  { name: 'Brushy Creek', region: 'Far North', city: 'Cedar Park', tier: 'neighborhood' },
  { name: 'Avery Ranch', region: 'Far North', city: 'Austin', tier: 'neighborhood' },
  { name: 'Georgetown', region: 'Far North', city: 'Georgetown', tier: 'neighborhood' },

  // ═══════════════════════════════════════════════════════════════
  // NORTH (Round Rock / Pflugerville / Hutto)
  // ═══════════════════════════════════════════════════════════════
  { name: 'Round Rock', region: 'North', city: 'Round Rock', tier: 'neighborhood' },
  { name: 'Pflugerville', region: 'North', city: 'Pflugerville', tier: 'neighborhood' },
  { name: 'Hutto', region: 'North', city: 'Hutto', tier: 'neighborhood' },
  {
    name: 'Wells Branch',
    region: 'North',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Wells Branch',
  },
  { name: 'Jollyville', region: 'North', city: 'Austin', tier: 'neighborhood' },
  { name: 'Anderson Mill', region: 'North', city: 'Austin', tier: 'neighborhood' },
  { name: 'McNeil', region: 'North', city: 'Austin', tier: 'neighborhood' },

  // ═══════════════════════════════════════════════════════════════
  // NORTH AUSTIN
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'The Domain',
    region: 'North Austin',
    city: 'Austin',
    tier: 'district',
    parentRegion: 'Northwest Austin',
    appleMapName: 'The Domain',
  },
  {
    name: 'Arboretum',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Northwest Austin',
  },
  {
    name: 'Great Hills',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Northwest Austin',
    appleMapName: 'Great Hills',
  },
  {
    name: 'Balcones Woods',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Balcones',
  },
  {
    name: 'Milwood',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Milwood',
  },
  {
    name: 'Gracywoods',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Gracy Woods',
  },
  { name: 'Walnut Creek', region: 'North Austin', city: 'Austin', tier: 'neighborhood' },
  {
    name: 'Wooten',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Wooten',
  },
  {
    name: 'Copperfield',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Copperfield',
  },
  {
    name: 'Gateway',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'North Austin',
    appleMapName: 'Gateway',
  },
  {
    name: 'Georgian Acres',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'North Austin',
    appleMapName: 'Georgian Acres',
  },
  {
    name: 'North Burnet',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Northwest Austin',
    appleMapName: 'North Burnet',
  },
  {
    name: 'North Lamar',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'North Austin',
    appleMapName: 'North Lamar',
  },
  {
    name: 'Barrington Oaks',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Northwest Austin',
    appleMapName: 'Barrington Oaks',
  },
  {
    name: 'Canyon Creek',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Canyon Creek',
  },
  {
    name: 'Lamplight Village',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Northwest Austin',
    appleMapName: 'Lamplight Village',
  },
  {
    name: 'Bellingham Meadows',
    region: 'North Austin',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Northwest Austin',
    appleMapName: 'Bellingham Meadows',
  },

  // ═══════════════════════════════════════════════════════════════
  // NORTH-CENTRAL
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Allandale',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Allandale',
  },
  {
    name: 'Brentwood',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Brentwood',
  },
  {
    name: 'Crestview',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Crestview',
  },
  {
    name: 'North Loop',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'North Loop',
  },
  {
    name: 'Rosedale',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Rosedale',
  },
  {
    name: 'Highland',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Highland',
  },
  {
    name: 'Mueller',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Mueller',
  },
  {
    name: 'Windsor Park',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Windsor Park',
  },
  {
    name: 'University Hills',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'University Hills',
  },
  {
    name: 'Coronado Hills',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Coronado Hills',
  },
  {
    name: 'North Shoal Creek',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'North Shoal Creek',
  },
  {
    name: 'St. Johns',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'St. Johns',
  },
  {
    name: 'The Triangle',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'The Triangle',
  },
  {
    name: 'Highland South',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Highland South',
  },
  {
    name: 'Highland North',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Highland North',
  },
  {
    name: 'Northfield',
    region: 'North-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Northfield',
  },

  // ═══════════════════════════════════════════════════════════════
  // CENTRAL
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Downtown',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Downtown',
  },
  {
    name: 'Hyde Park',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Hyde Park',
  },
  {
    name: 'Hancock',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Hancock',
  },
  {
    name: 'West Campus',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'West Campus',
  },
  {
    name: 'North University',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'North University',
  },
  { name: 'Clarksville', region: 'Central', city: 'Austin', tier: 'neighborhood' },
  {
    name: 'Old West Austin',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Old West Austin',
  },
  {
    name: 'Tarrytown',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Tarrytown',
  },
  {
    name: 'Pemberton Heights',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Pemberton Heights',
  },
  {
    name: 'Heritage',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Heritage',
  },
  { name: 'Rainey Street', region: 'Central', city: 'Austin', tier: 'district' },
  {
    name: 'Heritage Hills',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Heritage Hills',
  },
  {
    name: 'Old Enfield',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Old Enfield',
  },
  {
    name: 'Windsor Hills',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Windsor Hills',
  },
  {
    name: 'Windsor Road',
    region: 'Central',
    city: 'Austin',
    tier: 'micro',
    appleMapName: 'Windsor Road',
  },
  {
    name: 'Bryker Woods',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Bryker Woods',
  },
  {
    name: 'Shoal Crest',
    region: 'Central',
    city: 'Austin',
    tier: 'micro',
    appleMapName: 'Shoal Crest',
  },
  {
    name: 'Cat Mountain',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Northwest Austin',
    appleMapName: 'Cat Mountain',
  },
  {
    name: 'Northwest Hills',
    region: 'Central',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Northwest Austin',
    appleMapName: 'Northwest Hills',
  },

  // ── Central Districts ──
  {
    name: '2nd Street District',
    region: 'Central',
    city: 'Austin',
    tier: 'district',
    appleMapName: '2nd Street District',
  },
  {
    name: 'Sixth Street',
    region: 'Central',
    city: 'Austin',
    tier: 'district',
    appleMapName: 'Sixth Street',
  },
  {
    name: 'Warehouse District',
    region: 'Central',
    city: 'Austin',
    tier: 'district',
    appleMapName: 'Warehouse District',
  },
  {
    name: 'Red River District',
    region: 'Central',
    city: 'Austin',
    tier: 'district',
    appleMapName: 'Red River District',
  },
  {
    name: 'Market District',
    region: 'Central',
    city: 'Austin',
    tier: 'district',
    appleMapName: 'Market District',
  },
  {
    name: 'Congress Ave District',
    region: 'Central',
    city: 'Austin',
    tier: 'district',
    appleMapName: 'Congress Ave District',
  },

  // ═══════════════════════════════════════════════════════════════
  // EAST
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'East Austin',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'East Austin',
  },
  {
    name: 'East César Chávez',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'East Cesar Chavez',
  },
  { name: 'Holly', region: 'East', city: 'Austin', tier: 'neighborhood', appleMapName: 'Holly' },
  {
    name: 'Govalle',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Govalle',
  },
  {
    name: 'Johnston Terrace',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Johnston Terrace',
  },
  {
    name: 'Rosewood',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Rosewood',
  },
  { name: 'MLK', region: 'East', city: 'Austin', tier: 'neighborhood', appleMapName: 'Mlk' },
  {
    name: 'Chestnut',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Chestnut',
  },
  { name: 'Manor', region: 'East', city: 'Manor', tier: 'neighborhood' },
  { name: 'Del Valle', region: 'East', city: 'Austin', tier: 'neighborhood' },
  {
    name: 'Central East Austin',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Central East Austin',
  },
  {
    name: 'MLK-183',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Mlk-183',
  },
  {
    name: 'Montopolis',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Montopolis',
  },
  {
    name: 'Pecan Springs-Springdale',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Pecan Springs-springdale',
  },
  {
    name: 'Pleasant Valley',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Pleasant Valley',
  },
  { name: 'Upper Boggy Creek', region: 'East', city: 'Austin', tier: 'neighborhood' },
  {
    name: 'Cherrywood',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Cherrywood',
  },
  { name: 'Blackland', region: 'East', city: 'Austin', tier: 'micro', appleMapName: 'Blackland' },
  {
    name: 'Oak Springs',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Oak Springs',
  },
  {
    name: 'Ed Bluestein',
    region: 'East',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Ed Bluestein',
  },

  // ═══════════════════════════════════════════════════════════════
  // SOUTH-CENTRAL
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'South Congress',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'South Congress',
  },
  {
    name: 'Bouldin Creek',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Bouldin Creek',
  },
  {
    name: 'Travis Heights',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Travis Heights',
  },
  {
    name: 'Zilker',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Zilker',
  },
  {
    name: 'Barton Hills',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Barton Hills',
  },
  {
    name: 'Galindo',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Galindo',
  },
  {
    name: 'South Lamar',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'South Lamar',
  },
  { name: 'South First', region: 'South-Central', city: 'Austin', tier: 'neighborhood' },
  {
    name: 'Dawson',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Dawson',
  },
  {
    name: 'St. Edwards',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'St. Edwards',
  },
  {
    name: 'Parker Lane',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Parker Lane',
  },
  {
    name: 'Riverside',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Riverside',
  },
  {
    name: 'East Riverside',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'East Riverside',
  },
  {
    name: 'Spyglass-Barton Bluff',
    region: 'South-Central',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Spyglass-Bartons Bluff',
  },

  // ═══════════════════════════════════════════════════════════════
  // SOUTH AUSTIN
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Westgate',
    region: 'South',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Westgate',
  },
  { name: 'Cherry Creek', region: 'South', city: 'Austin', tier: 'neighborhood' },
  { name: 'Onion Creek', region: 'South', city: 'Austin', tier: 'neighborhood' },
  { name: 'Slaughter Creek', region: 'South', city: 'Austin', tier: 'neighborhood' },
  { name: 'Circle C Ranch', region: 'South', city: 'Austin', tier: 'neighborhood' },
  { name: 'Shady Hollow', region: 'South', city: 'Austin', tier: 'neighborhood' },
  { name: 'Manchaca', region: 'South', city: 'Austin', tier: 'neighborhood' },
  { name: 'Southpark Meadows', region: 'South', city: 'Austin', tier: 'neighborhood' },
  { name: 'McKinney Falls', region: 'South', city: 'Austin', tier: 'neighborhood' },
  {
    name: 'East Oak Hill',
    region: 'South',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'South Austin',
    appleMapName: 'East Oak Hill',
  },
  {
    name: 'Garrison Park',
    region: 'South',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Garrison Park',
  },
  {
    name: 'South Manchaca',
    region: 'South',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'South Manchaca',
  },
  {
    name: 'Southeast',
    region: 'South',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Southeast',
  },
  {
    name: 'West Oak Hill',
    region: 'South',
    city: 'Austin',
    tier: 'neighborhood',
    parentRegion: 'Travis Southwest',
    appleMapName: 'West Oak Hill',
  },
  {
    name: 'Skyview Manor',
    region: 'South',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Skyview Manor',
  },
  {
    name: 'Boulder Ridge',
    region: 'South',
    city: 'Austin',
    tier: 'neighborhood',
    appleMapName: 'Boulder Ridge',
  },

  // ═══════════════════════════════════════════════════════════════
  // FAR SOUTH (Buda / Kyle / Dripping Springs)
  // ═══════════════════════════════════════════════════════════════
  { name: 'Buda', region: 'Far South', city: 'Buda', tier: 'neighborhood' },
  { name: 'Kyle', region: 'Far South', city: 'Kyle', tier: 'neighborhood' },
  { name: 'Dripping Springs', region: 'Far South', city: 'Dripping Springs', tier: 'neighborhood' },

  // ═══════════════════════════════════════════════════════════════
  // WEST / HILL COUNTRY
  // ═══════════════════════════════════════════════════════════════
  { name: 'Westlake Hills', region: 'West', city: 'West Lake Hills', tier: 'neighborhood' },
  { name: 'Rollingwood', region: 'West', city: 'Rollingwood', tier: 'neighborhood' },
  { name: 'Bee Cave', region: 'West', city: 'Bee Cave', tier: 'neighborhood' },
  { name: 'Lakeway', region: 'West', city: 'Lakeway', tier: 'neighborhood' },
  { name: 'Steiner Ranch', region: 'West', city: 'Austin', tier: 'neighborhood' },
  { name: 'River Place', region: 'West', city: 'Austin', tier: 'neighborhood' },
  { name: 'Lost Creek', region: 'West', city: 'Austin', tier: 'neighborhood' },
  { name: 'Barton Creek', region: 'West', city: 'Austin', tier: 'neighborhood' },
  { name: 'Rob Roy', region: 'West', city: 'Austin', tier: 'neighborhood' },
  { name: 'Spicewood Springs', region: 'West', city: 'Austin', tier: 'neighborhood' },
]
