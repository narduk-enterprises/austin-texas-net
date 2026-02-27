/**
 * Radar — Geo filtering for Greater Austin area.
 */

const AUSTIN_GEO_TOKENS = [
  'austin', 'atx',
  'south congress', 'soco', 'east austin', 'south austin', 'north austin',
  'west austin', 'downtown austin', 'zilker', 'barton springs', 'barton creek',
  'mueller', 'domain', 'rainey street', 'rainey', '6th street', 'sixth street',
  'south lamar', 'north loop', 'hyde park', 'tarrytown', 'clarksville',
  'bouldin', 'travis heights', 'east cesar chavez', 'montopolis',
  'crestview', 'allandale', 'rosedale', 'brentwood', 'windsor park',
  'university hills', 'dove springs', 'onion creek', 'circle c',
  'great hills', 'arboretum', 'jollyville', 'balcones',
  'round rock', 'cedar park', 'pflugerville', 'lakeway', 'bee cave',
  'bee caves', 'west lake hills', 'westlake', 'lago vista',
  'leander', 'liberty hill', 'georgetown', 'hutto', 'taylor',
  'kyle', 'buda', 'dripping springs', 'manor', 'elgin',
  'bastrop', 'smithville', 'wimberley', 'san marcos',
  'lake travis', 'lake austin', 'lady bird lake', 'town lake',
  'barton springs pool', 'deep eddy', 'hamilton pool',
  'mckinney falls', 'mount bonnell', 'mt bonnell', 'pennybacker',
  'congress bridge', 'bat bridge', 'greenbelt',
  'travis county', 'williamson county', 'hays county',
]

const EXCLUDED_GEO_PATTERNS = [
  'california', 'florida', 'new york', 'ohio', 'georgia',
  'colorado', 'arizona', 'illinois', 'michigan', 'virginia',
  'washington state', 'oregon', 'nevada', 'minnesota',
  'north carolina', 'south carolina', 'tennessee', 'alabama',
  'louisiana', 'maryland', 'indiana', 'missouri', 'wisconsin',
  'massachusetts', 'new jersey', 'pennsylvania', 'connecticut',
  'dallas tx', 'houston tx', 'san antonio tx',
  'chicago', 'los angeles', 'new york city', 'nyc', 'miami',
  'denver', 'seattle', 'portland', 'phoenix', 'atlanta',
  'nashville', 'boston', 'detroit', 'san francisco', 'sf',
  'las vegas',
]

export function isAustinGeo(keyword: string): boolean {
  const lc = keyword.toLowerCase().trim()
  for (const pattern of EXCLUDED_GEO_PATTERNS) {
    if (lc.includes(pattern)) return false
  }
  for (const token of AUSTIN_GEO_TOKENS) {
    if (lc.includes(token)) return true
  }
  return false
}
