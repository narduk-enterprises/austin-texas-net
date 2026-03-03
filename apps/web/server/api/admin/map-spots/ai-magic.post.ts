/**
 * POST /api/admin/map-spots/ai-magic
 *
 * Enriches map spots with missing descriptions and suggests rankings
 * using OpenAI based on the current context (topic, category).
 */
import { z } from 'zod'

const spotSchema = z.object({
  id: z.string(),
  name: z.string(),
  neighborhood: z.string().optional().nullable(),
  rank: z.number().optional().nullable(),
  neighborhoodRank: z.number().optional().nullable(),
  knownFor: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

const bodySchema = z.object({
  spots: z.array(spotSchema),
  topicLabel: z.string().min(1),
  categoryLabel: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { spots, topicLabel, categoryLabel } = bodySchema.parse(await readBody(event))

  // Get API key
  const config = useRuntimeConfig()
  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>
  const openaiKey = cfEnv.OPENAI_API_KEY || config.openaiApiKey

  if (!openaiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY not configured' })
  }

  const systemPrompt = `You are a professional local editor for Austin-Texas.net. 
Your task is to enrich a list of map spots for the topic "${topicLabel}" under the category "${categoryLabel}".

**Contextual Awareness**:
- Neighborhoods in Austin belong to general "Areas" (regions). 
- Use the following specific regions for the 'area' field:
  - Central
  - North-Central
  - South-Central
  - North
  - North Austin
  - Far North
  - East
  - South
  - Far South
  - West

For each spot:
1. Identify/correct the 'neighborhood' (e.g., "Bouldin Creek" instead of just "South Austin").
2. Assign an 'area' from the list above.
3. If 'description' is missing, write a snappy, helpful, one-to-two sentence description (max 200 chars). Sound like a local.
4. If 'knownFor' is missing, suggest a signature item.
5. Suggest an updated 'rank' (city-wide) and 'neighborhoodRank' (within its neighborhood) based on the entire list.
6. Return 'area' along with other fields.

Return the result as a JSON array of objects with the exact same structure as the input, preserving the 'id'.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ spots }) },
      ],
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw createError({ statusCode: 500, statusMessage: `OpenAI API failed: ${errorText}` })
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>
  }

  const responseText = data.choices[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(responseText)
    // The model might wrap it in a root key like { "spots": [...] }
    const enrichedSpots = Array.isArray(parsed) ? parsed : parsed.spots || []
    return { spots: enrichedSpots }
  } catch (err) {
    console.error('Failed to parse AI response:', responseText, err)
    throw createError({ statusCode: 500, statusMessage: 'Invalid JSON payload from AI' })
  }
})
