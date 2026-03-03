import type { WaterTempData, WaterTempLocation } from '~/types/live'

interface WaterTempApiResponse {
  primary: WaterTempLocation
  secondary: WaterTempLocation[]
  lightingTrails: boolean
  updatedAt: string
}

/**
 * useLiveWaterTemps — fetches current water temperature data from /api/live/water-temps.
 */
export function useLiveWaterTemps() {
  return useLiveData<WaterTempApiResponse, WaterTempData>(
    '/api/live/water-temps',
    (raw) => ({
      primary: raw.primary,
      secondary: raw.secondary,
    }),
  )
}
