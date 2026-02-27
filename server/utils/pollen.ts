/**
 * Pollen data utilities: severity classification, realistic grain/m³ data generation
 *
 * Real Austin cedar pollen data reference (from austincedar.com & KXAN):
 * - Measured in grains per cubic meter (grains/m³)
 * - Low: 0–50 grains/m³
 * - Medium: 50–500 grains/m³
 * - High: 500–1,500 grains/m³
 * - Very High: 1,500–5,000 grains/m³
 * - Severe: 5,000+ grains/m³
 *
 * Real-world peaks in Austin regularly reach 6,000–9,000+ grains/m³
 */

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Very High' | 'Severe'

export interface PollenData {
  current: {
    count: number       // grains/m³
    level: SeverityLevel
    description: string
  }
  forecast: Array<{
    date: string
    dayName: string
    level: SeverityLevel
    count: number       // grains/m³
    highTemp: number
    lowTemp: number
    condition: string   // weather condition text (no emojis)
    humidity: number
    windSpeed: number
  }>
  history: Array<{
    date: string
    count: number       // grains/m³
    level: SeverityLevel
  }>
  allergens: {
    cedar: number
    oak: number
    grass: number
    ragweed: number
    mold: number
  }
  lastUpdated: string
  season: {
    peakCount: number
    highDays: number
    currentStreak: number
    seasonStart: string
    seasonEnd: string
    avgCount: number
  }
}

export interface WeatherData {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: string
  description: string
  condition: 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm' | 'fog'
}

/**
 * Convert grains/m³ count to severity level
 * Based on actual Austin/KXAN pollen severity thresholds
 */
export function getSeverityLevel(count: number): SeverityLevel {
  if (count < 50) return 'Low'
  if (count < 500) return 'Medium'
  if (count < 1500) return 'High'
  if (count < 5000) return 'Very High'
  return 'Severe'
}

/**
 * Get hex color for severity level
 */
export function getSeverityColor(level: SeverityLevel): string {
  const map: Record<SeverityLevel, string> = {
    'Low': '#22C55E',
    'Medium': '#EAB308',
    'High': '#F97316',
    'Very High': '#EF4444',
    'Severe': '#A855F7',
  }
  return map[level]
}

/**
 * Get descriptive text for severity level
 */
export function getSeverityDescription(level: SeverityLevel): string {
  const map: Record<SeverityLevel, string> = {
    'Low': 'Minimal cedar pollen. Most people will be comfortable outdoors.',
    'Medium': 'Moderate cedar pollen. Sensitive individuals may notice symptoms.',
    'High': 'High cedar pollen levels. Allergy sufferers should limit outdoor exposure.',
    'Very High': 'Very high cedar pollen. Stay indoors if possible and keep windows closed.',
    'Severe': 'Severe pollen levels. Avoid outdoor activity. Consider consulting your doctor.',
  }
  return map[level]
}

/**
 * Deterministic seed-based random for consistent daily data
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

/**
 * Generate realistic Austin cedar pollen season history
 *
 * Based on real 2025-2026 Austin cedar data patterns:
 * - Season runs Dec–Feb
 * - January is peak (counts 2,000–9,000+)
 * - Cold fronts trigger massive spikes
 * - Pattern: mostly high with periodic extreme spikes and brief dips after rain
 */
export function generateMockHistory(days: number = 30): PollenData['history'] {
  const history: PollenData['history'] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const month = date.getMonth()
    const dayOfMonth = date.getDate()
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)

    // Base intensity curve by month (grains/m³)
    let baseCount = 0
    if (month === 11) { // December — ramp up
      baseCount = 200 + (dayOfMonth / 31) * 2000
    } else if (month === 0) { // January — peak month
      // Peak mid-January, sine curve
      const progress = dayOfMonth / 31
      baseCount = 2000 + Math.sin(progress * Math.PI) * 4000
    } else if (month === 1) { // February — declining with spikes
      const progress = dayOfMonth / 28
      baseCount = 3000 * (1 - progress * 0.7)
    } else {
      baseCount = 10 + seededRandom(dayOfYear * 7) * 40
    }

    // Simulate cold front spikes (deterministic pattern)
    const frontFactor = seededRandom(dayOfYear * 3 + 17)
    if (frontFactor > 0.7 && (month === 0 || month === 1 || month === 11)) {
      // Cold front spike — 2x to 4x multiplier
      baseCount *= 1.5 + frontFactor * 2.5
    }

    // Simulate rain dips
    const rainFactor = seededRandom(dayOfYear * 5 + 31)
    if (rainFactor > 0.85 && (month === 0 || month === 1 || month === 11)) {
      baseCount *= 0.15 // Rain washes pollen away
    }

    // Daily variation (±30%)
    const variation = (seededRandom(dayOfYear * 11 + 7) - 0.5) * 0.6
    baseCount *= (1 + variation)

    // Clamp to realistic range
    const count = Math.max(0, Math.round(baseCount))

    history.push({
      date: date.toISOString().split('T')[0]!,
      count,
      level: getSeverityLevel(count),
    })
  }

  return history
}

/**
 * Generate full mock pollen data for Austin
 * Calibrated against real austincedar.com data (Feb 2026: ~8,775 grains/m³)
 */
export function generateMockPollenData(): PollenData {
  const history = generateMockHistory(30)
  const currentEntry = history[history.length - 1]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Clear', 'Partly Cloudy']

  // Generate 5-day forecast
  const forecast: PollenData['forecast'] = []
  for (let i = 1; i <= 5; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)

    const month = date.getMonth()
    let baseCount = 2000
    if (month === 11) baseCount = 1500
    else if (month === 0) baseCount = 4500
    else if (month === 1) baseCount = 2500

    // Variation per forecast day
    const variation = seededRandom(dayOfYear * 13 + i * 7)
    const count = Math.round(baseCount * (0.5 + variation * 1.5))

    forecast.push({
      date: date.toISOString().split('T')[0]!,
      dayName: dayNames[date.getDay()]!,
      level: getSeverityLevel(count),
      count,
      highTemp: Math.round(55 + seededRandom(dayOfYear + i) * 25),
      lowTemp: Math.round(32 + seededRandom(dayOfYear + i + 50) * 18),
      condition: conditions[i - 1]!,
      humidity: Math.round(35 + seededRandom(dayOfYear + i + 100) * 40),
      windSpeed: Math.round(4 + seededRandom(dayOfYear + i + 200) * 18),
    })
  }

  // Calculate season stats from history
  const counts = history.map(h => h.count)
  const peakCount = Math.max(...counts)
  const avgCount = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)
  const highDays = history.filter(h => h.count >= 1500).length

  let currentStreak = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i]!.count >= 500) currentStreak++
    else break
  }

  // Allergen breakdown — cedar dominates in winter
  const cedarRatio = 0.92
  const totalCount = currentEntry!.count

  return {
    current: {
      count: currentEntry!.count,
      level: currentEntry!.level,
      description: getSeverityDescription(currentEntry!.level),
    },
    forecast,
    history,
    allergens: {
      cedar: Math.round(totalCount * cedarRatio),
      oak: Math.round(totalCount * 0.03),
      grass: Math.round(totalCount * 0.02),
      ragweed: Math.round(totalCount * 0.01),
      mold: Math.round(totalCount * 0.02),
    },
    lastUpdated: now.toISOString(),
    season: {
      peakCount,
      highDays,
      currentStreak,
      avgCount,
      seasonStart: `${now.getFullYear() - (now.getMonth() < 6 ? 1 : 0)}-12-01`,
      seasonEnd: `${now.getFullYear() + (now.getMonth() >= 6 ? 1 : 0)}-02-28`,
    },
  }
}

/**
 * Generate mock weather data for Austin
 */
export function generateMockWeatherData(): WeatherData {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const now = new Date()
  const seed = now.getDate() + now.getMonth() * 31
  return {
    temp: Math.round(48 + seededRandom(seed) * 30),
    feelsLike: Math.round(45 + seededRandom(seed + 1) * 28),
    humidity: Math.round(40 + seededRandom(seed + 2) * 35),
    windSpeed: Math.round(4 + seededRandom(seed + 3) * 16),
    windDirection: directions[Math.floor(seededRandom(seed + 4) * 8)]!,
    description: 'Partly Cloudy',
    condition: 'partly-cloudy',
  }
}
