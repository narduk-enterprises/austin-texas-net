/**
 * useMapIcons — Single source of truth for category icon SVG paths.
 *
 * Because map pins render inside isolated createApp() micro-apps
 * without Nuxt's plugin context, we can't use <UIcon>. Instead we
 * embed Lucide SVG path data and render raw <svg> elements.
 *
 * This composable is shared by Pin.vue, SpotList.vue, and SpotDetail.vue
 * so every view renders the exact same icon for a given category.
 *
 * All icons: viewBox="0 0 24 24", stroke="currentColor", strokeWidth=2.
 */

/** SVG path `d` strings keyed by Nuxt UI / Iconify icon name */
const iconPaths: Record<string, string[]> = {
  'i-lucide-flame': [
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  ],
  'i-lucide-beef': [
    'M15.2 2.9a2 2 0 0 1 1.4-.6c1.7 0 4.4 2.7 4.4 4.4a2 2 0 0 1-.6 1.4L14 14.5a7 7 0 0 1-5 2l-6 .5.5-6a7 7 0 0 1 2-5z',
    'M9 9a3 3 0 0 0 0 6',
    'M15 9a3 3 0 0 1 0 6',
    'M12 9v6',
  ],
  'i-lucide-coffee': [
    'M10 2v2', 'M14 2v2', 'M6 2v2',
    'M16 8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2',
    'M2 8h14v5a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z',
    'M2 21h16',
  ],
  'i-lucide-wine': [
    'M8 22h8', 'M12 18v4', 'M7.5 2h9',
    'M7 7c0 3.5 2 6 5 6s5-2.5 5-6l-1-5H8z',
  ],
  'i-lucide-truck': [
    'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h1',
    'M15 18H9',
    'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14',
    'M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'M17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  ],
  'i-lucide-utensils-crossed': [
    'M3 2l7.5 7.5',
    'M13 2l-9.2 9.2a3.1 3.1 0 0 0 0 4.4l.6.6a3.1 3.1 0 0 0 4.4 0L18 7',
    'M18 2l-2.8 2.8',
    'M20.6 14.7a3.1 3.1 0 0 0-4.4 0l-.6.6a3.1 3.1 0 0 0 0 4.4L22 14.7',
    'M3 21l8-8',
  ],
  'i-lucide-utensils': [
    'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2',
    'M7 2v20',
    'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z',
    'M21 15v7',
  ],
  'i-lucide-map-pin': [
    'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z',
    'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  ],
}

const fallbackPaths = iconPaths['i-lucide-map-pin']!

export function useMapIcons() {
  /** Get SVG path data for the given icon name. Falls back to map-pin. */
  function getIconPaths(icon?: string): string[] {
    if (!icon) return fallbackPaths
    return iconPaths[icon] ?? fallbackPaths
  }

  return { getIconPaths }
}
