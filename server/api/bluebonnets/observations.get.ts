import { sql, and, gte, lte, desc } from 'drizzle-orm'
import { z } from 'zod'
import * as tables from '../../database/schema'

/**
 * GET /api/bluebonnets/observations
 *
 * Returns Bluebonnet observations from our D1 database (ingested daily).
 *
 * Query params:
 *   - year (optional): filter to a specific observation year
 *
 * Response: { observations: BluebonnetPoint[], total, yearRange }
 *
 * Cached for 1 hour.
 */

interface BluebonnetPoint {
  lat: number
  lng: number
  observed_on: string
  photo_url: string | null
  observer: string
  place: string
  url: string
  quality_grade: string
}

export default defineCachedEventHandler(
  async (event) => {
    const db = useDatabase()
    const query = await getValidatedQuery(
      event,
      z.object({ year: z.coerce.number().optional() }).parse,
    )
    const year = query.year

    const conditions = []
    if (year) {
      conditions.push(
        and(
          gte(tables.bluebonnetObservations.observedOn, `${year}-01-01`),
          lte(tables.bluebonnetObservations.observedOn, `${year}-12-31`),
        ),
      )
    }

    const observations = await db
      .select()
      .from(tables.bluebonnetObservations)
      .where(and(...conditions))
      .orderBy(desc(tables.bluebonnetObservations.observedOn))
      .all()

    // Map to frontend format
    const points: BluebonnetPoint[] = observations.map((obs) => ({
      lat: obs.lat,
      lng: obs.lng,
      observed_on: obs.observedOn,
      photo_url: obs.photoUrl,
      observer: obs.observer,
      place: obs.place,
      url: obs.url,
      quality_grade: obs.qualityGrade || 'needs_id',
    }))

    // Compute year range (could also be done via SQL aggregation, but this is cached and fast enough)
    // We fetch ALL years if no year param? No, if no year param, we fetch ALL.
    // If year param is present, we only get that year's data.
    // The frontend usually requests year stats separately or infers from data.
    // To support year selector, we should probably return min/max year from DB.

    // Let's get min/max year efficiently
    const rangeResult = await db
      .select({
        minDate: sql<string>`min(${tables.bluebonnetObservations.observedOn})`,
        maxDate: sql<string>`max(${tables.bluebonnetObservations.observedOn})`,
      })
      .from(tables.bluebonnetObservations)
      .get()

    let yearRange = { min: new Date().getFullYear(), max: new Date().getFullYear() }
    if (rangeResult && rangeResult.minDate && rangeResult.maxDate) {
      const minYear = parseInt(rangeResult.minDate.substring(0, 4))
      const maxYear = parseInt(rangeResult.maxDate.substring(0, 4))
      yearRange = { min: minYear, max: maxYear }
    }

    return {
      observations: points,
      total: points.length,
      fetched: points.length,
      yearRange,
    }
  },
  {
    maxAge: 60 * 60 * 1, // 1 hour
    name: 'bluebonnet-observations-d1',
    getKey: (event) => {
      const query = getQuery(event) // eslint-disable-line atx/require-validated-query -- sync getKey callback, not handler
      return `bluebonnets-d1-${query.year || 'all'}`
    },
  },
)
