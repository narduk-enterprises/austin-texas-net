import type { WeekendEventsData, EventItem } from '~/types/live'

interface EventsApiResponse {
  count: number
  events: EventItem[]
  updatedAt: string
}

/**
 * useWeekendEvents — fetches weekend event summary from /api/live/events.
 */
export function useWeekendEvents() {
  return useLiveData<EventsApiResponse, WeekendEventsData>(
    '/api/live/events',
    (raw) => ({
      count: raw.count,
      events: raw.events,
    }),
  )
}
