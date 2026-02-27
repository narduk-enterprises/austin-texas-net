import { sql } from 'drizzle-orm'
import { z } from 'zod'

/**
 * GET /api/real-estate/developments
 *
 * Returns development permits as map-compatible spots from D1.
 * Supports: ?limit=100 (default 200)
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const query = await getValidatedQuery(
    event,
    z.object({ limit: z.coerce.number().optional().default(200) }).parse,
  )
  const limit = query.limit

  try {
    // eslint-disable-next-line atx/prefer-drizzle-operators -- raw SQL query, not Drizzle query builder
    const result = await db.run(sql`
      SELECT * FROM development_permits
      WHERE lat IS NOT NULL AND lng IS NOT NULL
      ORDER BY issue_date DESC
      LIMIT ${limit}
    `)

    interface PermitRow {
      permit_number: string
      lat: number
      lng: number
      description: string
      units: number | null
      valuation: number | null
      issue_date: string
      work_class: string
      status: string
      address: string
      neighborhood: string | null
    }

    const rows = (result.results ?? []) as PermitRow[]
    return {
      permits: rows.map((r) => ({
        id: r.permit_number,
        name: r.description || `Permit ${r.permit_number}`,
        lat: r.lat,
        lng: r.lng,
        description: r.description,
        units: r.units,
        valuation: r.valuation,
        issueDate: r.issue_date,
        workClass: r.work_class,
        status: r.status,
        address: r.address,
        neighborhood: r.neighborhood,
        displayValue: r.units
          ? `${r.units} units`
          : r.valuation
            ? `$${Math.round(r.valuation / 1000)}K`
            : 'New',
      })),
      source: 'db',
    }
  } catch {
    return { permits: [], source: 'error' }
  }
})
