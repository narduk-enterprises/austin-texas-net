/**
 * Radar — Google Autocomplete expansion.
 *
 * Fetches autocomplete suggestions from Google's suggest API
 * to discover long-tail keyword variations.
 */
import type { AutocompleteSuggestion } from './types'

const GOOGLE_SUGGEST_URL = 'https://suggestqueries.google.com/complete/search'

async function fetchSuggestions(query: string): Promise<string[]> {
  const url = new URL(GOOGLE_SUGGEST_URL)
  url.searchParams.set('client', 'firefox')
  url.searchParams.set('q', query)
  url.searchParams.set('gl', 'us')
  url.searchParams.set('hl', 'en')

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })

  if (!res.ok) return []

  const data = (await res.json()) as [string, string[]]
  return data[1] ?? []
}

/**
 * Expand a seed keyword via Google Autocomplete.
 * Uses two strategies:
 *   1. Suffix expansion: "keyword " (with trailing space)
 *   2. Alpha expansion: "keyword a", "keyword b", etc.
 */
export async function fetchAutocompleteSuggestions(
  keyword: string,
): Promise<AutocompleteSuggestion[]> {
  const results = new Map<string, AutocompleteSuggestion>()
  const lc = keyword.toLowerCase().trim()

  // Suffix expansion
  const suffixSuggestions = await fetchSuggestions(`${lc} `)
  for (const s of suffixSuggestions) {
    const normalized = s.toLowerCase().trim()
    if (normalized !== lc && !results.has(normalized)) {
      results.set(normalized, { keyword: normalized, source: 'suffix' })
    }
  }

  // Alpha expansion (sample 4 letters to stay within rate limits)
  const letters = ['a', 'b', 'f', 'w']
  for (const letter of letters) {
    const alphaSuggestions = await fetchSuggestions(`${lc} ${letter}`)
    for (const s of alphaSuggestions) {
      const normalized = s.toLowerCase().trim()
      if (normalized !== lc && !results.has(normalized)) {
        results.set(normalized, { keyword: normalized, source: 'alpha' })
      }
    }
  }

  return [...results.values()]
}
