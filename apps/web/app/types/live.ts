/**
 * Shared types for live data modules.
 */

export type LiveStatus = 'idle' | 'pending' | 'success' | 'error'

export interface LiveData<T> {
  value: T | null
  updatedAt: string | null
  status: LiveStatus
}

export interface PollenData {
  count: number
  level: string
  type: string
}

export interface WaterTempLocation {
  location: string
  tempF: number
  depth: string
}

export interface WaterTempData {
  primary: WaterTempLocation
  secondary: WaterTempLocation[]
}

export interface EventItem {
  name: string
  date: string
  venue: string
}

export interface WeekendEventsData {
  count: number
  events: EventItem[]
}
