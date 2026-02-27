import { activeSeasonContext, dormantSeasonContext } from '~/data/bat-facts'
import { AUSTIN_BRIDGE_COORDINATES } from '~/data/bat-spots'
import { AUSTIN_TIME_ZONE, addMinutes, calculateSunset, getZonedDateParts, shiftAustinDate, type ZonedDateParts } from './useAustinSunset'

const EMERGENCE_DELAY_MINUTES = 20
const ARRIVAL_LEAD_MINUTES = 30
const EMERGENCE_WINDOW_MINUTES = 90

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: AUSTIN_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: AUSTIN_TIME_ZONE,
  weekday: 'short',
})

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: AUSTIN_TIME_ZONE,
  month: 'short',
  day: 'numeric',
})

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: AUSTIN_TIME_ZONE,
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

type Tone = 'success' | 'warning' | 'error'

export interface SeasonStatus {
  label: 'Active' | 'Dormant'
  context: string
  tone: Tone
  isActive: boolean
}

export interface ForecastDay {
  id: string
  weekday: string
  shortDate: string
  sunsetLabel: string
  emergenceLabel: string
  arrivalLabel: string
  condition: 'Clear' | 'Partly Cloudy' | 'Cloudy'
  visibility: 'Excellent' | 'Good' | 'Limited'
  cloudCoverPercent: number
  tone: Tone
  isToday: boolean
}

function getSeasonStatus(parts: ZonedDateParts): SeasonStatus {
  const activeSeason = parts.month >= 3 && parts.month <= 10

  if (activeSeason) {
    return {
      label: 'Active',
      context: activeSeasonContext,
      tone: 'success',
      isActive: true,
    }
  }

  return {
    label: 'Dormant',
    context: dormantSeasonContext,
    tone: 'warning',
    isActive: false,
  }
}

function estimateCloudCover(parts: ZonedDateParts, dayOfYear: number) {
  const harmonic = Math.sin((dayOfYear + parts.year) * 0.63) + Math.cos((dayOfYear - 17) * 0.31)
  const normalized = (harmonic + 2) / 4
  return Math.round(normalized * 100)
}

function classifyConditions(cloudCoverPercent: number) {
  if (cloudCoverPercent < 35) {
    return {
      condition: 'Clear' as const,
      visibility: 'Excellent' as const,
      tone: 'success' as const,
    }
  }

  if (cloudCoverPercent < 70) {
    return {
      condition: 'Partly Cloudy' as const,
      visibility: 'Good' as const,
      tone: 'warning' as const,
    }
  }

  return {
    condition: 'Cloudy' as const,
    visibility: 'Limited' as const,
    tone: 'error' as const,
  }
}

function buildForecastDay(parts: ZonedDateParts, isToday: boolean): ForecastDay {
  const sunset = calculateSunset(parts)
  const emergenceDate = addMinutes(sunset.sunsetDate, EMERGENCE_DELAY_MINUTES)
  const arrivalDate = addMinutes(emergenceDate, -ARRIVAL_LEAD_MINUTES)

  const cloudCoverPercent = estimateCloudCover(parts, sunset.dayOfYear)
  const weather = classifyConditions(cloudCoverPercent)

  return {
    id: `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`,
    weekday: weekdayFormatter.format(sunset.sunsetDate),
    shortDate: shortDateFormatter.format(sunset.sunsetDate),
    sunsetLabel: timeFormatter.format(sunset.sunsetDate),
    emergenceLabel: timeFormatter.format(emergenceDate),
    arrivalLabel: timeFormatter.format(arrivalDate),
    condition: weather.condition,
    visibility: weather.visibility,
    cloudCoverPercent,
    tone: weather.tone,
    isToday,
  }
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    totalMilliseconds: milliseconds,
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}

export function useBatBridgeData() {
  const now = ref(new Date())

  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  const todayParts = computed(() => getZonedDateParts(now.value))
  const tomorrowParts = computed(() => shiftAustinDate(todayParts.value, 1))

  const todaySunset = computed(() => calculateSunset(todayParts.value))
  const tonightEmergence = computed(() => addMinutes(todaySunset.value.sunsetDate, EMERGENCE_DELAY_MINUTES))
  const tonightArrival = computed(() => addMinutes(tonightEmergence.value, -ARRIVAL_LEAD_MINUTES))
  const tomorrowSunset = computed(() => calculateSunset(tomorrowParts.value))
  const tomorrowEmergence = computed(() => addMinutes(tomorrowSunset.value.sunsetDate, EMERGENCE_DELAY_MINUTES))

  const seasonStatus = computed(() => getSeasonStatus(todayParts.value))

  const countdownState = computed(() => {
    const current = now.value
    const emergenceStart = tonightEmergence.value
    const emergenceWindowEnd = addMinutes(emergenceStart, EMERGENCE_WINDOW_MINUTES)

    if (current.getTime() < emergenceStart.getTime()) {
      const diff = emergenceStart.getTime() - current.getTime()
      return {
        headline: 'Estimated Emergence In',
        detail: 'Mexican free-tailed bats typically begin streaming out around 20 minutes after sunset.',
        targetTimeLabel: timeFormatter.format(emergenceStart),
        countdown: formatCountdown(diff),
      }
    }

    if (current.getTime() <= emergenceWindowEnd.getTime()) {
      return {
        headline: 'Emergence Likely Underway',
        detail: 'You are inside the nightly flight window. Peak stream can continue 30-60 minutes.',
        targetTimeLabel: timeFormatter.format(emergenceStart),
        countdown: formatCountdown(0),
      }
    }

    const diff = tomorrowEmergence.value.getTime() - current.getTime()
    return {
      headline: 'Tonight Window Passed',
      detail: 'Next estimate is tomorrow evening. Arrive early for easier parking and better bridge spots.',
      targetTimeLabel: timeFormatter.format(tomorrowEmergence.value),
      countdown: formatCountdown(diff),
    }
  })

  const weeklyForecast = computed<ForecastDay[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const dayParts = shiftAustinDate(todayParts.value, index)
      return buildForecastDay(dayParts, index === 0)
    })
  })

  return {
    timeZone: AUSTIN_TIME_ZONE,
    coordinates: AUSTIN_BRIDGE_COORDINATES,
    seasonStatus,
    countdownState,
    todayDateLabel: computed(() => fullDateFormatter.format(now.value)),
    todaySunsetLabel: computed(() => timeFormatter.format(todaySunset.value.sunsetDate)),
    todayEmergenceLabel: computed(() => timeFormatter.format(tonightEmergence.value)),
    recommendedArrivalLabel: computed(() => timeFormatter.format(tonightArrival.value)),
    weeklyForecast,
  }
}
