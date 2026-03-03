/// <reference types="@cloudflare/workers-types" />

/**
 * Capture the D1 binding from the Cloudflare Workers env on the original
 * HTTP request so it stays reachable during Nitro's internal SSR `$fetch`
 * calls (which create a new H3 event without `context.cloudflare`).
 */
let _d1: D1Database | null = null

export function getCachedD1(): D1Database | null {
  return _d1
}

export default defineEventHandler((event) => {
  const d1 = (event.context.cloudflare?.env as { DB?: D1Database } | undefined)?.DB
  if (d1) _d1 = d1
})
