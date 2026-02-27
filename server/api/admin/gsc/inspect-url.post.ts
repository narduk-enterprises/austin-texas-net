/**
 * URL Inspection + Indexing Request endpoint
 *
 * POST /api/admin/gsc/inspect-url
 * Body: { url: string }
 *
 * Uses the URL Inspection API to check indexing status of a specific URL
 * and request (re)indexing if needed.
 */
import { z } from 'zod'

const SITE_URL = 'sc-domain:austin-texas.net'

const bodySchema = z.object({
  url: z.string().url(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = bodySchema.parse(await readBody(event))

  try {
    // URL Inspection API uses the searchconsole v1 endpoint
    const data = await googleApiFetch(
      'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
      GSC_SCOPES,
      {
        method: 'POST',
        body: JSON.stringify({
          inspectionUrl: body.url,
          siteUrl: SITE_URL,
        }),
      },
    )

    const result = (data as Record<string, Record<string, unknown>>).inspectionResult || {}
    const indexStatus = (result.indexStatusResult || {}) as Record<string, unknown>

    return {
      url: body.url,
      verdict: indexStatus.verdict || 'UNKNOWN',
      coverageState: indexStatus.coverageState || 'N/A',
      lastCrawlTime: indexStatus.lastCrawlTime || null,
      pageFetchState: indexStatus.pageFetchState || 'N/A',
      robotsTxtState: indexStatus.robotsTxtState || 'N/A',
      indexingState: indexStatus.indexingState || 'N/A',
      crawledAs: indexStatus.crawledAs || 'N/A',
      referringUrls: indexStatus.referringUrls || [],
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }

    // If URL Inspection API is not enabled, provide helpful message
    if (err.statusCode === 403) {
      throw createError({
        statusCode: 403,
        statusMessage:
          'URL Inspection API access denied. Ensure the service account has Owner permission in GSC and the Search Console API is enabled in GCP.',
      })
    }

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: `URL Inspection error: ${err.statusMessage || err.message}`,
    })
  }
})
