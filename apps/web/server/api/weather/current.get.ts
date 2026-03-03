/**
 * GET /api/weather/current
 *
 * Returns current weather conditions for Austin from NWS Camp Mabry station.
 * Also includes any active weather alerts.
 */
export default defineEventHandler(async () => {
  try {
    const [conditions, alerts] = await Promise.all([
      fetchCurrentConditions(),
      fetchAlerts(),
    ])

    return {
      conditions,
      alerts,
      source: 'nws',
    }
  } catch (error) {
    console.error('NWS current conditions error:', error)
    return {
      conditions: null,
      alerts: [],
      source: 'error',
      error: 'Unable to fetch weather data. Please try again shortly.',
    }
  }
})
