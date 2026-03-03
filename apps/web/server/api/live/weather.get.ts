/**
 * GET /api/live/weather
 *
 * Returns current weather conditions, 7-day forecast, hourly forecast,
 * and active weather alerts for Austin, TX.
 *
 * Uses the NWS (National Weather Service) API — free, no API key needed.
 * Austin grid: EWX/156,91 · Station: KATT · Zone: TXZ192
 *
 * Cached for 30 minutes to avoid hammering NWS rate limits.
 */
export default defineCachedEventHandler(
  async () => {
    // Fetch all NWS data in parallel
    const [current, forecast, hourly, alerts] = await Promise.allSettled([
      fetchCurrentConditions(),
      fetchForecast(),
      fetchHourlyForecast(),
      fetchAlerts(),
    ])

    return {
      source: 'nws',
      current: current.status === 'fulfilled' ? current.value : null,
      forecast: forecast.status === 'fulfilled' ? forecast.value : [],
      hourly: hourly.status === 'fulfilled' ? hourly.value.slice(0, 24) : [],
      alerts: alerts.status === 'fulfilled' ? alerts.value : [],
      errors: [
        current.status === 'rejected' ? `current: ${current.reason}` : null,
        forecast.status === 'rejected' ? `forecast: ${forecast.reason}` : null,
        hourly.status === 'rejected' ? `hourly: ${hourly.reason}` : null,
        alerts.status === 'rejected' ? `alerts: ${alerts.reason}` : null,
      ].filter(Boolean),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    maxAge: 60 * 30, // Cache for 30 minutes
    name: 'live-weather',
  },
)
