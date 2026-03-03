/**
 * Radar Types — shared interfaces and type aliases.
 */

export type KeywordSubtype =
  | 'MENU' | 'PHONE' | 'JOB' | 'PDF' | 'HOURS'
  | 'GUIDE' | 'MAP' | 'EVENT' | 'SEASONAL' | 'NEAR_ME'

export type Intent = 'commercial' | 'informational' | 'local' | 'navigational'

export interface SeedKeyword {
  keyword: string
  bucket: string
  estimatedVolume: number
}

export interface CoverageMatch {
  app: string
  domain: string
  url: string | null
}

export interface ScoreInputs {
  monthlyVolume: number
  trendScore: number
  risingScore: number
}

export interface StrategicScoreInput {
  monthlyVolume: number
  difficulty: number
  subtypes: KeywordSubtype[]
  isAustinGeo: boolean
  bucket: string
  keyword: string
}

export interface DifficultyValidationInput {
  keyword: string
  rawDifficulty: number
  monthlyVolume: number
  source?: 'estimated' | 'api'
}

export interface DifficultyValidationResult {
  difficulty: number
  difficultySource: 'estimated' | 'api'
  difficultyConfidence: 'high' | 'medium' | 'low'
  anomaly: string | null
}

export interface OpportunityInput {
  monthlyVolume: number
  difficulty: number
  seasonalityBoost?: number
  isCovered: boolean
}

export interface AutocompleteSuggestion {
  keyword: string
  source: 'suffix' | 'alpha'
}
