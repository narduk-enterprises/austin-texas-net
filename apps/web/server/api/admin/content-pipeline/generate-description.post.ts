/**
 * POST /api/admin/content-pipeline/generate-description
 *
 * Generates a snappy, local-flavored description for a topic using OpenAI.
 *
 * Body: { topicLabel: string, categoryLabel: string }
 */
import { z } from 'zod'

const bodySchema = z.object({
  topicLabel: z.string().min(1),
  categoryLabel: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { topicLabel, categoryLabel } = bodySchema.parse(await readBody(event))

  // Get API keys
  const config = useRuntimeConfig()
  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>
  const openaiKey = cfEnv.OPENAI_API_KEY || config.openaiApiKey

  if (!openaiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OPENAI_API_KEY not configured' })
  }

  const prompt = `Write a snappy, opinionated, and local-flavored one-sentence description for a curated list of "${topicLabel}" in Austin, Texas. 
The list is part of the "${categoryLabel}" category on our city utility site, Austin-Texas.net.
Avoid generic marketing fluff. Sound like a knowledgeable local editor. 
Max 200 characters.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional local editor for an Austin, TX city guide. You write concise, punchy, and helpful descriptions.',
        },
        { role: 'user', content: prompt },
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

  const description = data.choices[0]?.message?.content?.trim() || ''

  return { description }
})
