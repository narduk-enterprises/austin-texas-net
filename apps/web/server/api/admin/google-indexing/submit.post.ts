/**
 * Google Indexing API — request (re)indexing of URLs
 *
 * POST /api/admin/google-indexing/submit
 * Body: { urls: string[] }
 *
 * Uses the Google Indexing API to notify Google about new or updated URLs.
 * Requires: Google Indexing API enabled in GCP project.
 * Docs: https://developers.google.com/search/apis/indexing-api/v3/quickstart
 */
import { z } from 'zod'

const INDEXING_SCOPES = ['https://www.googleapis.com/auth/indexing']

const bodySchema = z.object({
  urls: z.array(z.string().url()).min(1).max(200),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = bodySchema.parse(await readBody(event))

  const results: Array<{ url: string; status: string; error?: string }> = []

  for (const url of body.urls) {
    try {
      await googleApiFetch(
        'https://indexing.googleapis.com/v3/urlNotifications:publish',
        INDEXING_SCOPES,
        {
          method: 'POST',
          body: JSON.stringify({
            url,
            type: 'URL_UPDATED',
          }),
        },
      )
      results.push({ url, status: 'submitted' })
    } catch (err: unknown) {
      const error = err as { statusMessage?: string; message?: string }
      results.push({
        url,
        status: 'error',
        error: error.statusMessage || error.message || 'Unknown error',
      })
    }
  }

  const submitted = results.filter((r) => r.status === 'submitted').length
  const failed = results.filter((r) => r.status === 'error').length

  return {
    submitted,
    failed,
    total: body.urls.length,
    results,
  }
})
