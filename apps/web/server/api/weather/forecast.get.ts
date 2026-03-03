/**
 * GET /api/weather/forecast
 *
 * Returns the 7-day forecast for Austin from NWS (14 periods: day/night pairs).
 */
export default defineEventHandler(async () => {
  try {
    const periods = await fetchForecast()

    return {
      periods,
      source: 'nws',
    }
  } catch (error) {
    console.error('NWS forecast error:', error)
    return {
      periods: [],
      source: 'error',
      error: 'Unable to fetch forecast data. Please try again shortly.',
    }
  }
})
