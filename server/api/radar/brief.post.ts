import { eq } from 'drizzle-orm'
import { z } from 'zod'

const bodySchema = z.object({
  keywordId: z.number().int().positive(),
})

/**
 * POST /api/radar/brief
 *
 * Generate a content brief for a keyword.
 * Returns suggested title, meta, content outline, and internal links.
 * Admin-only.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()
  const { keywordId } = bodySchema.parse(await readBody(event))

  const [kw] = await db.select()
    .from(schema.keywords)
    .where(eq(schema.keywords.id, keywordId))
    .limit(1)

  if (!kw) {
    throw createError({ statusCode: 404, message: 'Keyword not found' })
  }

  // Generate brief from keyword data
  const internalLinks = suggestInternalLinks(kw.keyword)
  const coverage = matchKeywordToApp(kw.keyword)
  const subtypes: KeywordSubtype[] = kw.subtypes ? JSON.parse(kw.subtypes) : tagSubtypes(kw.keyword)

  const isGuide = subtypes.includes('GUIDE')
  const isEvent = subtypes.includes('EVENT')
  const isMap = subtypes.includes('MAP')
  const isSeasonal = subtypes.includes('SEASONAL')

  // Build suggested title
  const titleKw = kw.keyword.replace(/\b\w/g, c => c.toUpperCase())
  let suggestedTitle = `${titleKw} — ${new Date().getFullYear()} Guide`
  if (isEvent) suggestedTitle = `${titleKw} — What to Know in ${new Date().getFullYear()}`
  if (isMap) suggestedTitle = `${titleKw} — Map & Locations`
  if (isSeasonal) suggestedTitle = `${titleKw} — ${new Date().getFullYear()} Season Guide`

  // Build meta description
  const metaDescription = `Everything you need to know about ${kw.keyword}. ` +
    `Updated for ${new Date().getFullYear()} with local tips and insider details.`

  // Build content outline
  const outline: string[] = [
    `# ${suggestedTitle}`,
    '',
    `## Overview`,
    `Introduce ${kw.keyword} for visitors and locals.`,
    '',
  ]

  if (isGuide) {
    outline.push(`## Getting Started`, `Practical tips and recommendations.`, '')
  }
  if (isMap) {
    outline.push(`## Map & Locations`, `Interactive map of relevant spots.`, '')
  }
  if (isEvent) {
    outline.push(`## Schedule & Details`, `Dates, times, and logistics.`, '')
  }
  if (isSeasonal) {
    outline.push(`## Best Time to Visit`, `Seasonal timing and what to expect.`, '')
  }

  outline.push(
    `## Tips from Locals`,
    `Insider knowledge and hidden gems.`,
    '',
    `## Related`,
    ...internalLinks.map(l => `- [${l}](${l})`),
  )

  // Save suggested title back
  await db.update(schema.keywords)
    .set({
      suggestedTitle,
      suggestedInternalLinks: JSON.stringify(internalLinks),
      lastSeen: new Date().toISOString(),
    })
    .where(eq(schema.keywords.id, keywordId))

  return {
    keyword: kw.keyword,
    suggestedTitle,
    metaDescription,
    outline: outline.join('\n'),
    internalLinks,
    coverage,
    subtypes,
    difficulty: kw.difficulty,
    strategicScore: kw.strategicScore,
    monthlyVolume: kw.monthlyVolume,
  }
})
