import { sql } from 'drizzle-orm'

/**
 * POST /api/real-estate/developments/ingest
 *
 * Fetches building permits from City of Austin SODA API and upserts into D1.
 * Secured with x-api-key header.
 * Designed to be called weekly by a cron trigger.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = getHeader(event, 'x-api-key')

  if (!apiKey || apiKey !== config.ingestApiKey) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = useDatabase()

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS development_permits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      permit_number TEXT NOT NULL UNIQUE,
      lat REAL,
      lng REAL,
      description TEXT,
      units INTEGER,
      valuation REAL,
      issue_date TEXT NOT NULL,
      work_class TEXT,
      status TEXT,
      address TEXT,
      neighborhood TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_dev_permits_issue_date
    ON development_permits (issue_date)
  `)

  let permits
  try {
    permits = await fetchBuildingPermits()
  }
  catch (err: unknown) {
    throw createError({
      statusCode: 502,
      message: `City of Austin permits fetch failed: ${(err as Error).message}`,
    })
  }

  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const permit of permits) {
    try {
      const existing = await db.run(sql`
        SELECT id FROM development_permits
        WHERE permit_number = ${permit.permitNumber}
        LIMIT 1
      `)

      if (existing.results && existing.results.length > 0) {
        await db.run(sql`
          UPDATE development_permits SET
            lat = ${permit.lat},
            lng = ${permit.lng},
            description = ${permit.description},
            units = ${permit.units},
            valuation = ${permit.valuation},
            status = ${permit.status},
            address = ${permit.address}
          WHERE permit_number = ${permit.permitNumber}
        `)
        updated++
      }
      else {
        await db.run(sql`
          INSERT INTO development_permits (permit_number, lat, lng, description, units, valuation, issue_date, work_class, status, address, neighborhood, created_at)
          VALUES (
            ${permit.permitNumber},
            ${permit.lat},
            ${permit.lng},
            ${permit.description},
            ${permit.units},
            ${permit.valuation},
            ${permit.issueDate},
            ${permit.workClass},
            ${permit.status},
            ${permit.address},
            ${permit.neighborhood},
            datetime('now')
          )
        `)
        inserted++
      }
    }
    catch {
      skipped++
    }
  }

  return {
    success: true,
    source: 'city-of-austin',
    stats: { fetched: permits.length, inserted, updated, skipped },
  }
})
