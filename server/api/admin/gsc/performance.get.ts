import { z } from 'zod'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dimension: z
    .enum(['query', 'page', 'device', 'country', 'searchAppearance'])
    .optional()
    .default('query'),
})

const SITE_URL = 'sc-domain:austin-texas.net'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = await getValidatedQuery(event, querySchema.parse)

  const endDate = query.endDate || new Date().toISOString().split('T')[0]
  const start = new Date(endDate || new Date().toISOString())
  start.setDate(start.getDate() - 30)
  const startDate = query.startDate || start.toISOString().split('T')[0]

  try {
    const data = await googleApiFetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
      GSC_SCOPES,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: [query.dimension],
          rowLimit: 50,
        }),
      },
    )

    const rows = data.rows as Array<Record<string, unknown>> | undefined

    return {
      rows: rows || [],
      startDate,
      endDate,
      dimension: query.dimension,
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: `GSC performance error: ${err.statusMessage || err.message}`,
    })
  }
})
