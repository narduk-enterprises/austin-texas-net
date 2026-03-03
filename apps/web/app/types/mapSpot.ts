/**
 * MapSpot — Generic interface for any ranked, location-based content item.
 * Used by the Map Content Type pattern across food spots, venues, parks, etc.
 */
export interface MapSpot {
  id: string
  name: string
  slug: string
  lat: number
  lng: number
  address: string
  neighborhood: string
  rank: number
  neighborhoodRank?: number // Rank within the specific neighborhood
  category: string // "Restaurant", "Park", "Venue", etc.
  knownFor: string // signature item or highlight
  description: string
  priceRange?: string // "$", "$$", "$$$" — optional, food-specific
  rating?: number // 0–5 star rating
  phone?: string
  url?: string
  photoUrl?: string // Google Places photo URL
  photoAttribution?: string // Required attribution for Google Places photos
  area?: string // Neighborhood collection/region, e.g. "Central", "East"
  status?: 'approved' | 'pending' | 'archived'
  sourceRunId?: number // ID of the content pipeline run that created this spot
}

/**
 * MapPageConfig — Configuration object for a Map Content Type page.
 * Passed to MapContentPage to customize title, SEO, map behavior, and styling.
 */
export interface MapPageConfig {
  title: string // "Top 10 Breakfast Tacos"
  description: string // SEO description
  introText: string // Below-header paragraph
  parentCategory: string // "food", "things-to-do", etc.
  parentLabel: string // "← Food"
  parentPath: string // "/food/"
  mapCenter: { lat: number; lng: number }
  mapZoom?: number // default overview span
  pinColor?: string // gradient start color (CSS)
  accentColor?: string // Tailwind color name for highlights (e.g., "amber")
  categoryIcon?: string // icon name for the "Known For" callout
  apiEndpoint?: string // "/api/map-spots?category=breakfast-tacos"
  staticFallback?: MapSpot[] // fallback data when API is unavailable
}
