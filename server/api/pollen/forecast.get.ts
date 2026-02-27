/**
 * GET /api/pollen/forecast
 *
 * Returns 5-day pollen forecast from Google Pollen API.
 * Includes Juniper/Cedar-specific data and health recommendations.
 */
export default defineEventHandler(async (event) => {
  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>
  const apiKey = cfEnv.GOOGLE_POLLEN_API_KEY || useRuntimeConfig().googlePollenApiKey

  if (!apiKey) {
    throw createError({ statusCode: 503, message: 'Google Pollen API key not configured' })
  }

  try {
    const forecast = await fetchGooglePollenForecast(apiKey, 5)

    return {
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
        grass: {
          upi: day.grassUPI,
        },
        activeSpecies: day.activeSpecies,
        healthRecommendations: day.healthRecommendations,
        inSeason: day.inSeason,
      })),
      source: 'google-pollen-api',
    }
  } catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `Google Pollen API failed: ${(err as Error).message}`,
    })
  }
})
