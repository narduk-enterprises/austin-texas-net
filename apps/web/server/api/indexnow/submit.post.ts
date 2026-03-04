/**
 * IndexNow URL submission API route.
 *
 * POST /api/indexnow/submit
 * Body: { urls: string[] }   (optional — defaults to sitemap URLs)
 *
 * Submits URLs to IndexNow-compatible search engines (Bing, Yandex, Seznam, Naver).
 * Requires INDEXNOW_KEY to be set.
 *
 * Usage after deploy:
 *   curl -X POST https://your-site.com/api/indexnow/submit \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls": ["https://your-site.com/", "https://your-site.com/about"]}'
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const key = (config.public.indexNowKey as string) || ''
  const siteUrl = (config.public.appUrl as string) || ''

  if (!key) {
    throw createError({ statusCode: 400, message: 'INDEXNOW_KEY not configured' })
  }
  if (!siteUrl) {
    throw createError({ statusCode: 400, message: 'SITE_URL not configured' })
  }

  const body = await readBody<{ urls?: string[] }>(event).catch(() => ({} as { urls?: string[] }))
  let urls = body?.urls || []

  // Default: submit all URLs from the sitemap endpoint if no URLs provided
  if (!urls.length) {
    const base = siteUrl.replace(/\/$/, '')
    try {
      const sitemapUrls = await $fetch<Array<{ loc: string }>>('/api/sitemap-urls')
      if (sitemapUrls && Array.isArray(sitemapUrls)) {
        urls = sitemapUrls.map(u => {
          const path = u.loc.startsWith('/') ? u.loc : `/${u.loc}`
          return base + path
        })
      }
    } catch (err: unknown) {
      console.error('[IndexNow] Failed to fetch sitemap URLs:', err instanceof Error ? err.message : err)
    }

    // Fallback if fetch fails
    if (!urls.length) {
      urls = [
        base + '/',
        base + '/sitemap.xml',
      ]
    }
  }

  const host = new URL(siteUrl).host
  const keyLocation = `${siteUrl.replace(/\/$/, '')}/${key}.txt`

  // IndexNow batch API — submit to Bing (which shares with all IndexNow engines)
  const indexNowPayload = {
    host,
    key,
    keyLocation,
    urlList: urls,
  }

  const results: { engine: string; status: number; ok: boolean }[] = []

  // Bing is the primary IndexNow endpoint; it shares with Yandex, Seznam, Naver
  const engines = [
    'https://api.indexnow.org/indexnow',
  ]

  for (const engine of engines) {
    try {
      const response = await fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      })
      results.push({
        engine,
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
      })
    } catch (_error: unknown) {
      console.warn(`[IndexNow] Failed to ping ${engine}:`, _error instanceof Error ? _error.message : _error)
      results.push({
        engine,
        status: 0,
        ok: false,
      })
    }
  }

  // Also ping Google with the sitemap location
  try {
    const sitemapFallback = `${siteUrl.replace(/\/$/, '')}/sitemap.xml`
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapFallback)}`
    const googleRes = await fetch(googlePingUrl)
    results.push({
      engine: 'https://www.google.com/ping',
      status: googleRes.status,
      ok: googleRes.status >= 200 && googleRes.status < 300,
    })
  } catch (_error: unknown) {
    console.warn(`[Google Ping] Failed to ping Google:`, _error instanceof Error ? _error.message : _error)
    results.push({
      engine: 'https://www.google.com/ping',
      status: 0,
      ok: false,
    })
  }

  return {
    submitted: urls.length,
    urls,
    results,
  }
})
