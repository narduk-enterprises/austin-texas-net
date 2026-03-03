/// <reference types="@cloudflare/workers-types" />
import type { H3Event } from 'h3'
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '../database/schema'

export { users, sessions } from '../database/schema'

/**
 * Return a Drizzle ORM instance for the current request (app schema).
 * Pass the event from defineEventHandler, or useDatabase(event) in handlers.
 */
export function useDatabase(event: H3Event): DrizzleD1Database<typeof schema> {
  if (event.context._db) {
    return event.context._db as unknown as DrizzleD1Database<typeof schema>
  }

  const d1 = (event.context.cloudflare?.env as { DB?: D1Database })?.DB
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
