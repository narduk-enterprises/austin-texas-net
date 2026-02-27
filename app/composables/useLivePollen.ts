import type { PollenData } from '~/types/live'

interface PollenApiResponse {
  count: number
  level: string
  type: string
  updatedAt: string
  details: Array<{ label: string; severity: string }>
}

/**
 * useLivePollen — fetches current pollen data from /api/live/pollen.
 */
export function useLivePollen() {
  return useLiveData<PollenApiResponse, PollenData>(
    '/api/live/pollen',
    (raw) => ({
      count: raw.count,
      level: raw.level,
      type: raw.type,
    }),
  )
}
