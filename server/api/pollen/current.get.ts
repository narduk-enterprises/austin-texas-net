import { desc } from 'drizzle-orm'

/**
 * GET /api/pollen/current
 *
 * Returns the latest pollen reading and severity info.
 * Tries KXAN live data first, falls back to latest D1 reading.
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const { pollenReadings } = await import('../../database/schema')

  // Get the latest reading from D1
  const [latest] = await db
    .select()
    .from(pollenReadings)
    .orderBy(desc(pollenReadings.date))
    .limit(1)

  // Also try to fetch live KXAN data
  let kxanLive = null
  let allergens: {
    cedar: number
    elm: number
    mold: number
    levels: { cedar: string; elm: string; mold: string }
  } | null = null
  try {
    const kxan = await scrapeKxanPollen()
    if (kxan.cedar.length > 0) {
      const latestKxan = kxan.cedar[kxan.cedar.length - 1]!
      kxanLive = {
        date: latestKxan.date,
        count: latestKxan.count,
        level: getSeverityLabel(latestKxan.count),
        source: 'kxan-live',
        reportDate: kxan.reportDate,
        cedarLevel: kxan.levels.cedar,
      }
    }
    // Allergen breakdown — latest count from each array
    allergens = {
      cedar: kxan.cedar.length > 0 ? kxan.cedar[kxan.cedar.length - 1]!.count : 0,
      elm: kxan.elm.length > 0 ? kxan.elm[kxan.elm.length - 1]!.count : 0,
      mold: kxan.mold.length > 0 ? kxan.mold[kxan.mold.length - 1]!.count : 0,
      levels: kxan.levels,
    }
  } catch {
    // KXAN may be temporarily unavailable; fall back to DB
  }

  // Use KXAN live if it's more recent, otherwise DB
  const current =
    kxanLive && (!latest || kxanLive.date >= latest.date)
      ? kxanLive
      : latest
        ? {
            date: latest.date,
            count: latest.count,
            level: getSeverityLabel(latest.count),
            source: latest.source,
          }
        : null

  if (!current) {
    return {
      current: null,
      message: 'No pollen data available yet.',
    }
  }

  // Compute trend from recent DB readings
  const recentReadings = await db
    .select()
    .from(pollenReadings)
    .orderBy(desc(pollenReadings.date))
    .limit(7)

  let trend = 'stable'
  if (recentReadings.length >= 3) {
    const recent3 = recentReadings.slice(0, 3).map((r) => r.count)
    const older3 = recentReadings.slice(Math.max(0, recentReadings.length - 3)).map((r) => r.count)
    const recentAvg = recent3.reduce((a, b) => a + b, 0) / recent3.length
    const olderAvg = older3.reduce((a, b) => a + b, 0) / older3.length
    if (recentAvg > olderAvg * 1.2) trend = 'rising'
    else if (recentAvg < olderAvg * 0.8) trend = 'falling'
  }

  // Fetch Google Pollen API forecast (non-blocking — don't fail if unavailable)
  let forecast: Awaited<ReturnType<typeof fetchGooglePollenForecast>> = []
  try {
    const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>
    const googleKey = cfEnv.GOOGLE_POLLEN_API_KEY || useRuntimeConfig().googlePollenApiKey
    if (googleKey) {
      forecast = await fetchGooglePollenForecast(googleKey, 5)
    }
  } catch {
    // Google API may be unavailable
  }

  return {
    current: {
      ...current,
      description: getSeverityDescription(current.level),
    },
    trend,
    season: getSeasonInfo(current.count, recentReadings),
    allergens,
    forecast: forecast.map((day) => ({
      date: day.date,
      cedar: {
        upi: day.juniperUPI,
        category: day.juniperCategory,
        approxCount: day.juniperUPI !== null ? upiToApproxCount(day.juniperUPI) : null,
      },
      tree: {
        upi: day.treeUPI,
        category: day.treeCategory,
      },
      activeSpecies: day.activeSpecies,
      healthRecommendations: day.healthRecommendations,
      inSeason: day.inSeason,
    })),
  }
})

function getSeverityLabel(count: number): string {
  if (count < 50) return 'Low'
  if (count < 500) return 'Medium'
  if (count < 1500) return 'High'
  if (count < 5000) return 'Very High'
  return 'Severe'
}

function getSeverityDescription(level: string): string {
  const map: Record<string, string> = {
    Low: 'Minimal cedar pollen. Most people will be comfortable outdoors.',
    Medium: 'Moderate cedar pollen. Sensitive individuals may notice symptoms.',
    High: 'High cedar pollen levels. Allergy sufferers should limit outdoor exposure.',
    'Very High': 'Very high cedar pollen. Stay indoors if possible and keep windows closed.',
    Severe: 'Severe pollen levels. Avoid outdoor activity. Consider consulting your doctor.',
  }
  return map[level] || ''
}

function getSeasonInfo(_currentCount: number, recentReadings: { count: number }[]) {
  const counts = recentReadings.map((r) => r.count)
  return {
    peakCount: counts.length > 0 ? Math.max(...counts) : 0,
    avgCount: counts.length > 0 ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) : 0,
    highDays: counts.filter((c) => c >= 1500).length,
  }
}
