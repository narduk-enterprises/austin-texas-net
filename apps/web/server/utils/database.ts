/// <reference types="@cloudflare/workers-types" />
import type { H3Event } from 'h3'
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import { getCachedD1 } from '../middleware/d1'
import * as schema from '../database/schema'

export { users, sessions } from '../database/schema'

/**
 * Return a Drizzle ORM instance for the current request (app schema).
 *
 * Tries `event.context.cloudflare.env.DB` first (direct HTTP requests),
 * then falls back to the module-scoped D1 captured by the d1 middleware
 * (needed for Nitro's internal SSR `$fetch` calls whose H3 event lacks
 * the Cloudflare context).
 */
export function useDatabase(event: H3Event): DrizzleD1Database<typeof schema> {
  if (event.context._db) {
    return event.context._db as unknown as DrizzleD1Database<typeof schema>
  }

  const d1 = (event.context.cloudflare?.env as { DB?: D1Database } | undefined)?.DB ?? getCachedD1()
  if (!d1) {
    throw createError({
      statusCode: 500,
      message: 'D1 database binding not available. Ensure DB is configured in wrangler.json.',
    })
  }

  const db = drizzle(d1, { schema })
  ;(event.context as { _db?: DrizzleD1Database<typeof schema> })._db = db
  return db
}
