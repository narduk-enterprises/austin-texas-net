/**
 * IndexNow Submission endpoint
 *
 * POST /api/admin/indexnow/submit
 * Body: { urls: string[] }
 *
 * Submits URLs to IndexNow for priority crawling by Bing, Yandex, DuckDuckGo, etc.
 * Docs: https://www.indexnow.org/documentation
 */
import { z } from 'zod'

const bodySchema = z.object({
  urls: z.array(z.string().url()).min(1).max(10000),
})

const SITE_HOST = 'austin-texas.net'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const indexNowKey = config.indexNowKey || ''

  if (!indexNowKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'INDEXNOW_KEY not configured',
    })
  }

  const body = bodySchema.parse(await readBody(event))

  // IndexNow batch API — submit to Bing's endpoint (propagates to all participating engines)
  const response = await $fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      host: SITE_HOST,
      key: indexNowKey,
      keyLocation: `https://${SITE_HOST}/${indexNowKey}.txt`,
      urlList: body.urls,
    },
  }).catch((err) => {
    throw createError({
      statusCode: 502,
      statusMessage: `IndexNow API error: ${err.message}`,
    })
  })

  return {
    submitted: body.urls.length,
    urls: body.urls,
    response: response || 'OK',
  }
})
