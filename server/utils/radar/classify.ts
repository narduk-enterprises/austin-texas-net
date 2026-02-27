/**
 * Radar — Keyword classification, coverage matching, and link suggestions.
 */
import type { KeywordSubtype, CoverageMatch } from './types'

// ─── Subtype tagging ──────────────────────────────────────────

const SUBTYPE_PATTERNS: Record<KeywordSubtype, RegExp[]> = {
  GUIDE: [/guide/i, /how to/i, /tips/i, /best/i, /top/i, /review/i],
  MAP: [/map/i, /where/i, /location/i, /near me/i, /directions/i, /find/i],
  EVENT: [
    /event/i,
    /festival/i,
    /concert/i,
    /show/i,
    /tonight/i,
    /this weekend/i,
    /schedule/i,
    /rodeo/i,
    /sxsw/i,
    /acl/i,
  ],
  SEASONAL: [
    /season/i,
    /spring/i,
    /summer/i,
    /fall/i,
    /winter/i,
    /cedar/i,
    /bluebonnet/i,
    /pollen/i,
    /crawfish/i,
    /christmas/i,
    /halloween/i,
  ],
  NEAR_ME: [/near me/i, /nearby/i, /close to/i, /around me/i],
  MENU: [/menu/i, /order/i, /delivery/i, /takeout/i],
  PHONE: [/phone/i, /number/i, /call/i, /contact/i],
  JOB: [/job/i, /hiring/i, /career/i, /work at/i, /employment/i],
  PDF: [/pdf/i, /download/i, /printable/i],
  HOURS: [/hours/i, /open/i, /close/i, /when does/i],
}

export function tagSubtypes(keyword: string): KeywordSubtype[] {
  const matches: KeywordSubtype[] = []
  for (const [subtype, patterns] of Object.entries(SUBTYPE_PATTERNS)) {
    if (patterns.some((p) => p.test(keyword))) {
      matches.push(subtype as KeywordSubtype)
    }
  }
  return matches.length ? matches : ['GUIDE']
}

// ─── App coverage matching ────────────────────────────────────

interface AppMapping {
  patterns: RegExp[]
  app: string
  domain: string
  url: string | null
}

const APP_MAPPINGS: AppMapping[] = [
  {
    patterns: [/breakfast taco/i, /best tacos/i],
    app: 'breakfast-tacos',
    domain: 'food',
    url: '/food/breakfast-tacos/',
  },
  { patterns: [/food truck/i], app: 'food-trucks', domain: 'food', url: '/food/food-trucks/' },
  { patterns: [/happy hour/i], app: 'happy-hours', domain: 'food', url: '/food/happy-hours/' },
  { patterns: [/crawfish/i], app: 'crawfish-boils', domain: 'food', url: '/food/crawfish-boils/' },
  {
    patterns: [/great hills.*restaurant/i],
    app: 'great-hills-restaurants',
    domain: 'food',
    url: '/food/great-hills-restaurants/',
  },
  {
    patterns: [/water temp/i, /barton springs temp/i, /lake.*temp/i],
    app: 'water-temps',
    domain: 'outdoors',
    url: '/outdoors/water-temps/',
  },
  { patterns: [/disc golf/i], app: 'disc-golf', domain: 'outdoors', url: '/outdoors/disc-golf/' },
  {
    patterns: [/kayak/i, /paddleboard/i],
    app: 'kayak-launches',
    domain: 'outdoors',
    url: '/outdoors/kayak-launches/',
  },
  {
    patterns: [/bluebonnet/i, /wildflower/i],
    app: 'bluebonnets',
    domain: 'outdoors',
    url: '/outdoors/bluebonnets/',
  },
  {
    patterns: [/bat.*bridge/i, /congress.*bat/i, /bat colony/i],
    app: 'bat-bridge',
    domain: 'outdoors',
    url: '/outdoors/bat-bridge/',
  },
  {
    patterns: [/cedar.*pollen/i, /cedar fever/i, /cedar.*allerg/i],
    app: 'cedar-pollen',
    domain: 'allergies',
    url: '/allergies/cedar-pollen/',
  },
  {
    patterns: [/oak.*pollen/i],
    app: 'oak-pollen',
    domain: 'allergies',
    url: '/allergies/oak-pollen/',
  },
  {
    patterns: [/pollen.*count/i, /allergy.*forecast/i, /pollen.*forecast/i],
    app: 'cedar-pollen',
    domain: 'allergies',
    url: '/allergies/cedar-pollen/',
  },
  {
    patterns: [/live music/i, /concert/i, /show.*tonight/i],
    app: 'live-music',
    domain: 'events',
    url: '/events/live-music/',
  },
  {
    patterns: [/rodeo.*austin/i],
    app: 'rodeo-austin',
    domain: 'events',
    url: '/events/rodeo-austin/',
  },
  {
    patterns: [/chicken.*bingo/i],
    app: 'chicken-shit-bingo',
    domain: 'events',
    url: '/events/chicken-shit-bingo/',
  },
  {
    patterns: [/mural/i, /street art/i, /graffiti/i],
    app: 'street-art',
    domain: 'culture',
    url: '/culture/street-art/',
  },
  {
    patterns: [/haunt/i, /ghost/i, /spooky/i],
    app: 'haunted-austin',
    domain: 'culture',
    url: '/culture/haunted-austin/',
  },
  {
    patterns: [/neighborhood/i, /where to live/i],
    app: 'neighborhoods',
    domain: 'real-estate',
    url: '/real-estate/neighborhoods/',
  },
  {
    patterns: [/rent.*price/i, /rent.*heatmap/i, /apartment/i],
    app: 'rent-heatmap',
    domain: 'real-estate',
    url: '/real-estate/rent-heatmap/',
  },
]

export function matchKeywordToApp(keyword: string): CoverageMatch | null {
  for (const mapping of APP_MAPPINGS) {
    if (mapping.patterns.some((p) => p.test(keyword))) {
      return { app: mapping.app, domain: mapping.domain, url: mapping.url }
    }
  }
  return null
}

// ─── Internal link suggestions ───────────────────────────────

const LINK_MAP: { patterns: RegExp[]; urls: string[] }[] = [
  {
    patterns: [
      /food/i,
      /restaurant/i,
      /eat/i,
      /dining/i,
      /taco/i,
      /bbq/i,
      /pizza/i,
      /sushi/i,
      /brunch/i,
    ],
    urls: ['/food/'],
  },
  {
    patterns: [/outdoor/i, /trail/i, /hike/i, /lake/i, /swim/i, /kayak/i, /greenbelt/i],
    urls: ['/outdoors/'],
  },
  {
    patterns: [/pollen/i, /allerg/i, /cedar/i, /oak/i],
    urls: ['/allergies/', '/allergies/cedar-pollen/'],
  },
  { patterns: [/event/i, /music/i, /festival/i, /concert/i, /sxsw/i, /acl/i], urls: ['/events/'] },
  {
    patterns: [/neighborhood/i, /rent/i, /housing/i, /apartment/i, /real estate/i],
    urls: ['/real-estate/'],
  },
  { patterns: [/art/i, /mural/i, /culture/i, /ghost/i, /haunt/i], urls: ['/culture/'] },
]

export function suggestInternalLinks(keyword: string): string[] {
  const links = new Set<string>()
  for (const entry of LINK_MAP) {
    if (entry.patterns.some((p) => p.test(keyword))) {
      for (const url of entry.urls) links.add(url)
    }
  }
  // Always suggest homepage
  if (links.size === 0) links.add('/')
  return [...links]
}

// ─── Seasonality boost ───────────────────────────────────────

const SEASONAL_PATTERNS: { pattern: RegExp; boost: number }[] = [
  { pattern: /cedar/i, boost: 25 },
  { pattern: /bluebonnet/i, boost: 20 },
  { pattern: /crawfish/i, boost: 15 },
  { pattern: /pollen/i, boost: 20 },
  { pattern: /rodeo/i, boost: 15 },
  { pattern: /sxsw/i, boost: 25 },
  { pattern: /acl.*festival/i, boost: 20 },
  { pattern: /halloween|haunt/i, boost: 10 },
  { pattern: /christmas|holiday/i, boost: 10 },
  { pattern: /spring break/i, boost: 10 },
  { pattern: /water temp/i, boost: 15 },
  { pattern: /swim/i, boost: 10 },
]

export function getSeasonalityBoost(keyword: string): number {
  let maxBoost = 0
  for (const { pattern, boost } of SEASONAL_PATTERNS) {
    if (pattern.test(keyword) && boost > maxBoost) {
      maxBoost = boost
    }
  }
  return maxBoost
}
