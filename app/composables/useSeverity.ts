/**
 * Severity levels for Austin pollen data.
 *
 * Single source of truth for severity labels, colors, and thresholds.
 * Used across pollen components and pages.
 */

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Very High' | 'Severe'

export interface SeverityInfo {
  level: SeverityLevel
  color: string
  range: string
  description: string
}

/**
 * Severity color map — maps level names to hex colors.
 * Also handles aliases (None, Very Low, Moderate, N/A).
 */
const SEVERITY_COLORS: Record<string, string> = {
  'None': '#64748B',
  'Very Low': '#22C55E',
  'Low': '#22C55E',
  'Medium': '#EAB308',
  'Moderate': '#EAB308',
  'High': '#F97316',
  'Very High': '#EF4444',
  'Severe': '#A855F7',
}

const FALLBACK_COLOR = '#9CA3AF'

/** Accent color used for generic pollen metrics (e.g., trend line) */
export const POLLEN_ACCENT = '#10B981'

/**
 * Get the hex color for a severity level.
 *
 * @param level - Severity level string (Low, Medium, High, Very High, Severe, etc.)
 * @returns Hex color string
 */
export function severityColor(level: string): string {
  return SEVERITY_COLORS[level] ?? FALLBACK_COLOR
}

/**
 * Get severity level + color from a raw grain count.
 *
 * @param count - Pollen grains per cubic meter
 * @returns Object with level name and hex color
 */
export function severityFromCount(count: number): { level: SeverityLevel; color: string } {
  if (count < 50) return { level: 'Low', color: SEVERITY_COLORS['Low']! }
  if (count < 500) return { level: 'Medium', color: SEVERITY_COLORS['Medium']! }
  if (count < 1500) return { level: 'High', color: SEVERITY_COLORS['High']! }
  if (count < 5000) return { level: 'Very High', color: SEVERITY_COLORS['Very High']! }
  return { level: 'Severe', color: SEVERITY_COLORS['Severe']! }
}

/**
 * The full severity scale — used for legend/about pages.
 */
export const SEVERITY_SCALE: SeverityInfo[] = [
  { level: 'Low', range: '0 – 50', color: SEVERITY_COLORS['Low']!, description: 'Minimal pollen. Most people unaffected.' },
  { level: 'Medium', range: '50 – 500', color: SEVERITY_COLORS['Medium']!, description: 'Moderate. Sensitive individuals may notice symptoms.' },
  { level: 'High', range: '500 – 1,500', color: SEVERITY_COLORS['High']!, description: 'High levels. Allergy sufferers should limit outdoor time.' },
  { level: 'Very High', range: '1,500 – 5,000', color: SEVERITY_COLORS['Very High']!, description: 'Very high. Stay indoors if possible. Keep windows closed.' },
  { level: 'Severe', range: '5,000+', color: SEVERITY_COLORS['Severe']!, description: 'Extreme levels. Avoid outdoor activity.' },
]
