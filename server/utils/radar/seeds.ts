/**
 * Radar — Seed keywords and model versioning.
 */
import type { SeedKeyword } from './types'

export const SCORING_MODEL_VERSION = '2.0.0'

export const SEED_KEYWORDS: SeedKeyword[] = [
  // ─── Food ──────────────────────────────────────────
  { keyword: 'best breakfast tacos austin', bucket: 'food', estimatedVolume: 6600 },
  { keyword: 'austin food trucks', bucket: 'food', estimatedVolume: 4400 },
  { keyword: 'best bbq austin', bucket: 'food', estimatedVolume: 5400 },
  { keyword: 'happy hour austin', bucket: 'food', estimatedVolume: 3600 },
  { keyword: 'best restaurants austin', bucket: 'food', estimatedVolume: 8100 },
  { keyword: 'crawfish boils austin', bucket: 'food', estimatedVolume: 1900 },
  { keyword: 'best tacos austin', bucket: 'food', estimatedVolume: 4400 },
  { keyword: 'great hills restaurants austin', bucket: 'food', estimatedVolume: 720 },
  { keyword: 'best brunch austin', bucket: 'food', estimatedVolume: 3600 },
  { keyword: 'best pizza austin', bucket: 'food', estimatedVolume: 2900 },
  { keyword: 'best sushi austin', bucket: 'food', estimatedVolume: 2400 },

  // ─── Outdoors ──────────────────────────────────────
  { keyword: 'barton springs water temperature', bucket: 'outdoors', estimatedVolume: 2900 },
  { keyword: 'lake travis water temp', bucket: 'outdoors', estimatedVolume: 2400 },
  { keyword: 'austin disc golf courses', bucket: 'outdoors', estimatedVolume: 880 },
  { keyword: 'kayak austin', bucket: 'outdoors', estimatedVolume: 1600 },
  { keyword: 'austin greenbelt trail', bucket: 'outdoors', estimatedVolume: 1900 },
  { keyword: 'bluebonnets austin', bucket: 'outdoors', estimatedVolume: 4400 },
  { keyword: 'congress bridge bats austin', bucket: 'outdoors', estimatedVolume: 3600 },
  { keyword: 'hamilton pool austin', bucket: 'outdoors', estimatedVolume: 2900 },
  { keyword: 'mount bonnell austin', bucket: 'outdoors', estimatedVolume: 2400 },

  // ─── Weather / Allergies ───────────────────────────
  { keyword: 'austin cedar pollen count today', bucket: 'weather', estimatedVolume: 5400 },
  { keyword: 'cedar fever austin', bucket: 'weather', estimatedVolume: 3600 },
  { keyword: 'austin allergy forecast', bucket: 'weather', estimatedVolume: 2900 },
  { keyword: 'oak pollen austin', bucket: 'weather', estimatedVolume: 1300 },
  { keyword: 'austin pollen count', bucket: 'weather', estimatedVolume: 4400 },

  // ─── Events ────────────────────────────────────────
  { keyword: 'austin events this weekend', bucket: 'events', estimatedVolume: 6600 },
  { keyword: 'live music austin tonight', bucket: 'events', estimatedVolume: 3600 },
  { keyword: 'rodeo austin', bucket: 'events', estimatedVolume: 8100 },
  { keyword: 'chicken shit bingo austin', bucket: 'events', estimatedVolume: 1900 },
  { keyword: 'acl festival austin', bucket: 'events', estimatedVolume: 9900 },
  { keyword: 'sxsw austin', bucket: 'events', estimatedVolume: 14800 },

  // ─── Neighborhoods ────────────────────────────────
  { keyword: 'best neighborhoods austin', bucket: 'neighborhoods', estimatedVolume: 2400 },
  { keyword: 'east austin neighborhoods', bucket: 'neighborhoods', estimatedVolume: 880 },
  { keyword: 'south congress austin', bucket: 'neighborhoods', estimatedVolume: 1600 },
  { keyword: 'zilker neighborhood austin', bucket: 'neighborhoods', estimatedVolume: 590 },
  { keyword: 'hyde park austin', bucket: 'neighborhoods', estimatedVolume: 1300 },

  // ─── Housing ──────────────────────────────────────
  { keyword: 'cost of living austin', bucket: 'housing', estimatedVolume: 3600 },
  { keyword: 'austin rent prices', bucket: 'housing', estimatedVolume: 1900 },
  { keyword: 'best places to live austin', bucket: 'housing', estimatedVolume: 2400 },
  { keyword: 'austin apartment finder', bucket: 'housing', estimatedVolume: 1300 },

  // ─── Places ───────────────────────────────────────
  { keyword: 'things to do austin', bucket: 'places', estimatedVolume: 12100 },
  { keyword: 'free things to do austin', bucket: 'places', estimatedVolume: 2900 },
  { keyword: 'austin murals', bucket: 'places', estimatedVolume: 1600 },
  { keyword: 'haunted places austin', bucket: 'places', estimatedVolume: 880 },
  { keyword: 'austin date night ideas', bucket: 'places', estimatedVolume: 1300 },
]
