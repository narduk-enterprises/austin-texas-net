/**
 * GET /api/live/aqi
 *
 * Returns current Air Quality Index (AQI) for Austin, TX.
 * Uses EPA AirNow API (requires AIRNOW_API_KEY in runtime config).
 *
 * Falls back to a "no data" response if the API key isn't configured.
 * Cached for 1 hour.
 */
export default defineCachedEventHandler(
  async () => {
    const config = useRuntimeConfig()
    const apiKey = config.airnowApiKey as string | undefined

    if (!apiKey) {
      return {
        source: 'unavailable',
        message: 'AirNow API key not configured. Set NUXT_AIRNOW_API_KEY in environment.',
        current: null,
        forecast: [],
        updatedAt: new Date().toISOString(),
      }
    }

    try {
      const data = await fetchAirNowData(apiKey)

      return {
        source: 'airnow',
        current: {
          aqi: data.overallAqi,
          category: data.overallCategory,
          dominantPollutant: data.dominantPollutant,
          healthMessage: data.healthMessage,
          observations: data.observations.map((o) => ({
            parameter: o.parameterName,
            aqi: o.aqi,
            category: o.category.name,
          })),
        },
        forecast: data.forecast.map((f) => ({
          date: f.dateForecast,
          parameter: f.parameterName,
          aqi: f.aqi,
          category: f.category.name,
          actionDay: f.actionDay,
          discussion: f.discussion,
        })),
        updatedAt: data.fetchedAt,
      }
    } catch (err: unknown) {
      return {
        source: 'error',
        message: `AirNow API error: ${(err as Error).message}`,
        current: null,
        forecast: [],
        updatedAt: new Date().toISOString(),
      }
    }
  },
  {
    maxAge: 60 * 60, // Cache for 1 hour
    name: 'live-aqi',
  },
)
