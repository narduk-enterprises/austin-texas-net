/**
 * GET /api/weather/alerts
 *
 * Returns active NWS weather alerts for Austin, TX.
 */
export default defineEventHandler(async () => {
  try {
    const alerts = await fetchAlerts()

    return {
      alerts,
      count: alerts.length,
      source: 'nws',
    }
  } catch (error) {
    console.error('NWS alerts error:', error)
    return {
      alerts: [],
      count: 0,
      source: 'error',
      error: 'Unable to fetch alert data. Please try again shortly.',
    }
  }
})
