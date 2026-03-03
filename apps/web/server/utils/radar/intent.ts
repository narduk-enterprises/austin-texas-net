/**
 * Radar — Intent classification and difficulty estimation.
 */
import type { Intent, DifficultyValidationInput, DifficultyValidationResult } from './types'

const COMMERCIAL_SIGNALS = [
  'best', 'top', 'review', 'cheap', 'affordable', 'price', 'cost',
  'compare', 'vs', 'buy', 'deal', 'discount', 'worth', 'recommend',
  'favorite', 'popular', 'rated', 'premium', 'luxury',
]

const INFORMATIONAL_SIGNALS = [
  'how to', 'what is', 'when is', 'why', 'guide',
  'tips', 'history', 'meaning', 'definition', 'explained',
  'tutorial', 'learn', 'facts', 'information',
]

const LOCAL_SIGNALS = [
  'near me', 'near', 'nearby', 'close to', 'around',
  'open now', 'open late', 'open early', 'open today',
  'downtown', 'south austin', 'north austin', 'east austin', 'west austin',
  'south congress', 'rainey', '6th street', 'zilker', 'mueller', 'domain',
  'cedar park', 'round rock', 'pflugerville', 'south lamar',
  'north loop', 'east side', 'west lake', 'barton', 'great hills',
  'in austin',
  'with a view', 'on the lake', 'on the water', 'on the river',
  'on lake travis', 'on lake austin', 'on lady bird',
  'waterfront', 'lakeside', 'rooftop',
  'map', 'directions', 'location', 'where',
  'reservations', 'walk in', 'takeout', 'delivery',
  'for large groups', 'for groups', 'for families', 'for kids',
  'dog friendly', 'kid friendly', 'pet friendly',
  'outdoor seating', 'outdoor dining', 'patio',
  'date night', 'romantic',
]

const NAVIGATIONAL_SIGNALS = [
  'atx-apps', 'website', 'app', 'schedule',
  'address', 'phone', 'contact', 'book',
]

export function classifyIntent(keyword: string): Intent {
  const lc = keyword.toLowerCase()
  if (LOCAL_SIGNALS.some(s => lc.includes(s))) return 'local'
  if (COMMERCIAL_SIGNALS.some(s => lc.includes(s))) return 'commercial'
  if (NAVIGATIONAL_SIGNALS.some(s => lc.includes(s))) return 'navigational'
  if (INFORMATIONAL_SIGNALS.some(s => lc.includes(s))) return 'informational'
  return 'informational'
}

export function estimateDifficulty(keyword: string, volume: number, intent: Intent): number {
  let diff = Math.min(85, Math.round(Math.log10(Math.max(volume, 10)) * 15))
  if (intent === 'commercial') diff = Math.min(95, diff + 12)
  if (intent === 'local') diff = Math.max(10, diff - 15)
  if (intent === 'navigational') diff = Math.max(5, diff - 20)

  const wordCount = keyword.split(/\s+/).length
  if (wordCount >= 3) diff = Math.max(5, diff - 8)
  if (wordCount >= 4) diff = Math.max(5, diff - 10)
  if (wordCount >= 5) diff = Math.max(5, diff - 8)
  if (wordCount >= 6) diff = Math.max(5, diff - 5)

  const lc = keyword.toLowerCase()
  const MODIFIER_DISCOUNT_SIGNALS = [
    'indian', 'mexican', 'italian', 'chinese', 'korean', 'thai',
    'japanese', 'vietnamese', 'mediterranean', 'french', 'greek',
    'ethiopian', 'persian', 'cajun', 'southern', 'asian',
    'vegan', 'vegetarian', 'gluten free', 'healthy',
    'bbq', 'sushi', 'ramen', 'tacos', 'pizza', 'burger',
    'seafood', 'steak', 'brunch', 'breakfast', 'lunch', 'dinner',
    'for families', 'for kids', 'for groups', 'for large groups',
    'dog friendly', 'kid friendly', 'pet friendly',
    'with a view', 'on the lake', 'on the water', 'rooftop',
    'outdoor', 'patio', 'romantic', 'date night', 'late night',
    'on thanksgiving', 'on christmas', 'new year', 'weekend',
    'tonight', 'this weekend', 'open late', 'open now',
  ]
  const modifierCount = MODIFIER_DISCOUNT_SIGNALS.filter(m => lc.includes(m)).length
  if (modifierCount >= 1) diff = Math.max(5, diff - 10)
  if (modifierCount >= 2) diff = Math.max(5, diff - 5)

  return Math.round(Math.max(5, Math.min(95, diff)))
}

// ─── Difficulty Validator ───────────────────────────────────────

const COMPETITIVE_MODIFIERS = [
  'restaurants', 'best', 'downtown', 'lake', 'brunch', 'bbq', 'tacos',
  'bars', 'hotels', 'apartments', 'coffee', 'pizza', 'sushi',
  'nightlife', 'food trucks', 'breweries', 'steakhouse', 'rooftop bar',
  'happy hour', 'date night', 'things to do',
]
const DIFFICULTY_FLOOR = 35

export function validateDifficulty(input: DifficultyValidationInput): DifficultyValidationResult {
  const { keyword, rawDifficulty, monthlyVolume, source = 'estimated' } = input
  const lc = keyword.toLowerCase()

  if (source === 'api') {
    return { difficulty: rawDifficulty, difficultySource: 'api', difficultyConfidence: 'high', anomaly: null }
  }

  let correctedDifficulty = rawDifficulty
  let anomaly: string | null = null
  let confidence: 'high' | 'medium' | 'low' = 'medium'

  const suspiciouslyLow = rawDifficulty < 15 && monthlyVolume > 100
  if (suspiciouslyLow) {
    correctedDifficulty = Math.max(correctedDifficulty, DIFFICULTY_FLOOR)
    anomaly = `floor-enforced: raw ${rawDifficulty} → ${correctedDifficulty} (vol=${monthlyVolume} too high for diff<15)`
    confidence = 'low'
  }

  const hasCompetitiveModifier = COMPETITIVE_MODIFIERS.some(mod => lc.includes(mod))
  if (hasCompetitiveModifier && rawDifficulty < DIFFICULTY_FLOOR) {
    correctedDifficulty = Math.max(correctedDifficulty, DIFFICULTY_FLOOR)
    const matchedMod = COMPETITIVE_MODIFIERS.find(mod => lc.includes(mod))
    anomaly = anomaly
      ? `${anomaly}; competitive-modifier "${matchedMod}" enforced floor`
      : `floor-enforced: raw ${rawDifficulty} → ${correctedDifficulty} (competitive modifier "${matchedMod}")`
    confidence = 'low'
  }

  if (!anomaly) {
    const expectedMin = Math.max(10, Math.round(Math.log10(Math.max(monthlyVolume, 10)) * 8))
    const expectedMax = Math.min(95, expectedMin + 40)
    confidence = (correctedDifficulty >= expectedMin && correctedDifficulty <= expectedMax) ? 'high' : 'medium'
  }

  return { difficulty: correctedDifficulty, difficultySource: source, difficultyConfidence: confidence, anomaly }
}
