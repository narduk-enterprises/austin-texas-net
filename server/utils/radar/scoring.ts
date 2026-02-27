/**
 * Radar — Scoring utilities (composite, opportunity, strategic).
 */
import type { ScoreInputs, OpportunityInput, StrategicScoreInput } from './types'

const WEIGHTS = { volume: 0.5, trend: 0.3, rising: 0.2 }

export function computeCompositeScore(inputs: ScoreInputs): number {
  const raw =
    inputs.monthlyVolume * WEIGHTS.volume +
    inputs.trendScore * WEIGHTS.trend +
    inputs.risingScore * WEIGHTS.rising
  return Math.round(Math.max(0, Math.min(100, raw)))
}

export function normalizeVolume(rawVolume: number): number {
  if (rawVolume <= 0) return 0
  const normalized = (Math.log10(rawVolume) / Math.log10(100000)) * 100
  return Math.round(Math.max(0, Math.min(100, normalized)))
}

// ─── Opportunity Score ───────────────────────────────────────
/**
 * Rates how "easy to win" a keyword is.
 * High volume + low difficulty + seasonal boost = high opportunity.
 * Already-covered keywords get a penalty.
 */
export function computeOpportunityScore(input: OpportunityInput): number {
  const volScore = Math.min(
    100,
    (Math.log10(Math.max(input.monthlyVolume, 10)) / Math.log10(100000)) * 100,
  )
  const diffPenalty = input.difficulty / 100 // 0-1, higher = harder
  const seasonBonus = (input.seasonalityBoost ?? 0) / 100
  const coveragePenalty = input.isCovered ? 0.3 : 0

  const raw =
    volScore * 0.4 +
    (1 - diffPenalty) * 100 * 0.35 +
    seasonBonus * 100 * 0.15 -
    coveragePenalty * 100 * 0.1

  return Math.round(Math.max(0, Math.min(100, raw)))
}

// ─── Strategic Score ─────────────────────────────────────────
/**
 * Comprehensive score considering volume, difficulty, subtypes,
 * geo relevance, and bucket priority.
 */
const BUCKET_PRIORITY: Record<string, number> = {
  food: 10,
  outdoors: 9,
  weather: 8,
  events: 8,
  places: 7,
  neighborhoods: 6,
  housing: 5,
}

const SUBTYPE_BONUSES: Record<string, number> = {
  GUIDE: 8,
  MAP: 6,
  EVENT: 5,
  SEASONAL: 7,
  NEAR_ME: 4,
}

export function computeStrategicScore(input: StrategicScoreInput): number {
  const volScore = Math.min(
    40,
    (Math.log10(Math.max(input.monthlyVolume, 10)) / Math.log10(100000)) * 40,
  )
  const diffBonus = Math.max(0, ((100 - input.difficulty) / 100) * 25)
  const bucketBonus = BUCKET_PRIORITY[input.bucket] ?? 3
  const geoBonus = input.isAustinGeo ? 8 : 0

  let subtypeBonus = 0
  for (const st of input.subtypes) {
    subtypeBonus += SUBTYPE_BONUSES[st] ?? 0
  }
  subtypeBonus = Math.min(15, subtypeBonus)

  const raw = volScore + diffBonus + bucketBonus + geoBonus + subtypeBonus
  return Math.round(Math.max(0, Math.min(100, raw)))
}
