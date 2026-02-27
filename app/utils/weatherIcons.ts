/**
 * getConditionIcon — Maps NWS weather description strings to Lucide icon names.
 *
 * Shared across weather pages (current-conditions, 7-day-forecast, etc.)
 * to avoid duplicating the same icon-mapping logic.
 */
export function getConditionIcon(description: string): string {
  const d = description.toLowerCase()
  if (d.includes('thunder') || d.includes('storm')) return 'i-lucide-cloud-lightning'
  if (d.includes('rain') || d.includes('shower') || d.includes('drizzle'))
    return 'i-lucide-cloud-rain'
  if (d.includes('snow') || d.includes('sleet') || d.includes('ice')) return 'i-lucide-snowflake'
  if (d.includes('fog') || d.includes('haze') || d.includes('mist')) return 'i-lucide-cloud-fog'
  if (d.includes('cloudy') || d.includes('overcast')) return 'i-lucide-cloud'
  if (d.includes('partly') || d.includes('mostly sunny')) return 'i-lucide-cloud-sun'
  if (d.includes('wind')) return 'i-lucide-wind'
  if (d.includes('night') || d.includes('clear')) return 'i-lucide-moon'
  return 'i-lucide-sun'
}
