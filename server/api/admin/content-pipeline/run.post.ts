/**
 * POST /api/admin/content-pipeline/run
 *
 * Trigger a content pipeline run for a single topic.
 * Performs Tavily research → OpenAI curation → stores results in D1.
 *
 * Body: { topicId: number }
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { contentPipelineTopics, contentPipelineRuns } from '~~/server/database/schema'

const bodySchema = z.object({
  topicId: z.number().int().positive(),
})

// ─── Tavily search ──────────────────────────────────────────
async function tavilySearch(apiKey: string, query: string): Promise<string> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 5,
      search_depth: 'advanced',
      include_answer: true,
    }),
  })

  if (!res.ok) {
    throw new Error(`Tavily search failed (${res.status}): ${await res.text()}`)
  }

  const data = (await res.json()) as {
    answer?: string
    results?: Array<{ title: string; url: string; content: string }>
  }

  const parts: string[] = []
  if (data.answer) {
    parts.push(`## AI Summary for "${query}"\n${data.answer}\n`)
  }
  for (const r of data.results || []) {
    parts.push(`### ${r.title}\nURL: ${r.url}\n${r.content}\n`)
  }
  return parts.join('\n---\n')
}

// ─── OpenAI spot curation ───────────────────────────────────
async function curateSpots(
  apiKey: string,
  topicLabel: string,
  contentType: string,
  maxSpots: number,
  researchContext: string,
): Promise<{ spots: Array<Record<string, unknown>>; tokensUsed: number }> {
  const prompt = `You are a local Austin, TX expert curating a "Top ${maxSpots}" list for "${topicLabel}".

## Recent research
${researchContext.slice(0, 8000)}

## Instructions
1. Pick the ${maxSpots} best spots based on the research
2. Rank them by quality and relevance
3. Write a fresh, opinionated 1-2 sentence description for each
4. Return EXACTLY ${maxSpots} spots

## Output Format
Return a JSON object with key "spots" containing an array of objects:
- id: kebab-case identifier (e.g. "franklin-bbq")
- name: official name
- slug: same as id
- lat: latitude (number)
- lng: longitude (number)
- address: full street address
- neighborhood: Austin neighborhood name
- rank: 1-${maxSpots}
- category: "${topicLabel}"
- knownFor: signature item or highlight (short phrase)
- description: 1-2 sentences, local and opinionated
- priceRange: "$", "$$", or "$$$"
- rating: 0-5 (one decimal)

Return ONLY valid JSON.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You return valid JSON. Always wrap arrays in an object with a "spots" key.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenAI API failed (${res.status}): ${await res.text()}`)
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>
    usage?: { total_tokens: number }
  }

  const content = data.choices[0]?.message?.content
  if (!content) throw new Error('Empty OpenAI response')

  const parsed = JSON.parse(content) as { spots?: Array<Record<string, unknown>> }
  const spots = parsed.spots || []
  const tokensUsed = data.usage?.total_tokens || 0

  return { spots, tokensUsed }
}

// ─── Handler ────────────────────────────────────────────────
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { topicId } = bodySchema.parse(await readBody(event))
  const db = useDatabase()

  // Load topic config
  const topic = await db
    .select()
    .from(contentPipelineTopics)
    .where(eq(contentPipelineTopics.id, topicId))
    .get()

  if (!topic) {
    throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
  }

  // Get API keys
  const config = useRuntimeConfig()
  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>
  const openaiKey = cfEnv.OPENAI_API_KEY || config.openaiApiKey
  const tavilyKey = cfEnv.TAVILY_API_KEY || config.tavilyApiKey

  if (!openaiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY not configured' })
  }
  if (!tavilyKey) {
    throw createError({ statusCode: 500, statusMessage: 'TAVILY_API_KEY not configured' })
  }

  // Create the run record
  const [run] = await db
    .insert(contentPipelineRuns)
    .values({
      categorySlug: topic.categorySlug,
      topicKey: topic.topicKey,
      status: 'running',
    })
    .returning()

  if (!run) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create run record' })
  }

  try {
    // Parse search queries
    const queries: string[] = JSON.parse(topic.searchQueries || '[]')
    if (queries.length === 0) {
      throw new Error('No search queries configured for this topic')
    }

    // Step 1: Research via Tavily
    const researchParts: string[] = []
    for (const q of queries) {
      const result = await tavilySearch(tavilyKey, q)
      researchParts.push(result)
    }
    const researchContext = researchParts.join('\n\n')

    // Step 2: Curate spots via OpenAI
    const { spots, tokensUsed } = await curateSpots(
      openaiKey,
      topic.topicLabel,
      topic.contentType,
      topic.maxSpots,
      researchContext,
    )

    // Update run record with success
    await db
      .update(contentPipelineRuns)
      .set({
        status: 'completed',
        spotsGenerated: spots.length,
        tokensUsed,
        outputPreview: JSON.stringify(spots, null, 2),
        completedAt: new Date().toISOString(),
      })
      .where(eq(contentPipelineRuns.id, run.id))

    return {
      ok: true,
      runId: run.id,
      spotsGenerated: spots.length,
      tokensUsed,
      spots,
    }
  } catch (err) {
    // Update run record with failure
    const errorMsg = err instanceof Error ? err.message : String(err)
    await db
      .update(contentPipelineRuns)
      .set({
        status: 'failed',
        error: errorMsg,
        completedAt: new Date().toISOString(),
      })
      .where(eq(contentPipelineRuns.id, run.id))

    throw createError({ statusCode: 500, statusMessage: errorMsg })
  }
})
