import { AUSTIN_BRIDGE_COORDINATES } from '~/data/bat-spots'

export const AUSTIN_TIME_ZONE = 'America/Chicago'

export interface ZonedDateParts {
  year: number
  month: number
  day: number
}

export interface SunsetComputation {
  dayOfYear: number
  sunsetMinutes: number
  sunsetDate: Date
}

function toRadians(degrees: number) {
  return degrees * (Math.PI / 180)
}

function toDegrees(radians: number) {
  return radians * (180 / Math.PI)
}

function clampMinutes(value: number) {
  if (!Number.isFinite(value)) {
    return 19 * 60
  }

  if (value < 0) {
    return 0
  }

  if (value > 1439) {
    return 1439
  }

  return value
}

function parseDatePart(parts: Intl.DateTimeFormatPart[], key: Intl.DateTimeFormatPartTypes) {
  return Number(parts.find(part => part.type === key)?.value || 0)
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const year = parseDatePart(parts, 'year')
  const month = parseDatePart(parts, 'month')
  const day = parseDatePart(parts, 'day')
  const hour = parseDatePart(parts, 'hour')
  const minute = parseDatePart(parts, 'minute')
  const second = parseDatePart(parts, 'second')

  const interpretedUtc = Date.UTC(year, month - 1, day, hour, minute, second)
  return (interpretedUtc - date.getTime()) / 60000
}

export function getZonedDateParts(date: Date): ZonedDateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: AUSTIN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: parseDatePart(parts, 'year'),
    month: parseDatePart(parts, 'month'),
    day: parseDatePart(parts, 'day'),
  }
}

function getDayOfYear(parts: ZonedDateParts) {
  const utcStart = Date.UTC(parts.year, 0, 0)
  const utcCurrent = Date.UTC(parts.year, parts.month - 1, parts.day)
  return Math.floor((utcCurrent - utcStart) / 86400000)
}

export function localClockToDate(parts: ZonedDateParts, localMinutesFromMidnight: number) {
  const roundedMinutes = Math.round(localMinutesFromMidnight)
  const hour = Math.floor(roundedMinutes / 60)
  const minute = ((roundedMinutes % 60) + 60) % 60

  const localUtcLike = Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute, 0)

  let offset = getTimeZoneOffsetMinutes(new Date(localUtcLike), AUSTIN_TIME_ZONE)
  let utcMillis = localUtcLike - offset * 60000

  offset = getTimeZoneOffsetMinutes(new Date(utcMillis), AUSTIN_TIME_ZONE)
  utcMillis = localUtcLike - offset * 60000

  return new Date(utcMillis)
}

export function calculateSunset(parts: ZonedDateParts): SunsetComputation {
  const dayOfYear = getDayOfYear(parts)

  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1)
  const equationOfTime = 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  )

  const declination = 0.006918
    - 0.399912 * Math.cos(gamma)
    + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma)
    + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma)
    + 0.00148 * Math.sin(3 * gamma)

  const latitudeRad = toRadians(AUSTIN_BRIDGE_COORDINATES.latitude)
  const zenith = toRadians(90.833)
  const hourAngle = Math.acos(
    (Math.cos(zenith) / (Math.cos(latitudeRad) * Math.cos(declination)))
    - (Math.tan(latitudeRad) * Math.tan(declination)),
  )

  const localNoonGuess = localClockToDate(parts, 12 * 60)
  const timezoneOffsetMinutes = getTimeZoneOffsetMinutes(localNoonGuess, AUSTIN_TIME_ZONE)
  const solarNoonMinutes = 720 - (4 * AUSTIN_BRIDGE_COORDINATES.longitude) - equationOfTime + timezoneOffsetMinutes
  const sunsetMinutes = clampMinutes(solarNoonMinutes + toDegrees(hourAngle) * 4)

  return {
    dayOfYear,
    sunsetMinutes,
    sunsetDate: localClockToDate(parts, sunsetMinutes),
  }
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + (minutes * 60000))
}

export function shiftAustinDate(parts: ZonedDateParts, days: number) {
  const noonUtc = Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0)
  return getZonedDateParts(new Date(noonUtc))
}
