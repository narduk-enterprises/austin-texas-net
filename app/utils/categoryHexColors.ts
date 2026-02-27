/**
 * categoryHexColors — maps category slugs to their brand hex color.
 *
 * Used by OG image templates that need raw hex values
 * (Satori doesn't understand Tailwind classes).
 * Derived from the Tailwind color classes in useSiteData().
 */
export const categoryHexColors: Record<string, string> = {
  food: '#d97706', // amber-600
  events: '#059669', // emerald-600
  outdoors: '#7c3aed', // violet-600
  health: '#e11d48', // rose-600
  weather: '#0284c7', // sky-600
  more: '#475569', // slate-600
  'live-data': '#0891b2', // cyan-600
  'real-estate': '#0d9488', // teal-600
  neighborhoods: '#ea580c', // orange-600
  culture: '#4f46e5', // indigo-600
  fun: '#db2777', // pink-600
}

/**
 * Get the hex color for a category slug.
 * Falls back to the site's primary lime-green.
 */
export function getCategoryHexColor(slug: string): string {
  return categoryHexColors[slug] ?? '#84cc16'
}
