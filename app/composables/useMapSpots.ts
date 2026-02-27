import type { MapSpot } from '~/types/mapSpot'

/**
 * useMapSpots — fetches map spots for a given food/activity category.
 *
 * Wraps the `/api/map-spots` endpoint and returns typed spot data.
 */
export function useMapSpots() {
  const fetchCategorySpots = async (category: string) => {
    return await $fetch<{ spots: MapSpot[] }>('/api/map-spots', {
      query: { category },
    })
  }

  return {
    fetchCategorySpots,
  }
}
