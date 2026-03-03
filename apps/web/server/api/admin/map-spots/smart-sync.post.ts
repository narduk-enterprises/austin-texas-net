/* Drizzle D1 update results include rowsAffected but the type isn't exposed */
/**
 * POST /api/admin/map-spots/smart-sync
 *
 * Performs a multi-stage sync to fill in missing neighborhood and area data.
 * 1. Strict Name Match: Matches map_spots.neighborhood to neighborhoods.name
 * 2. Slug Match: Matches map_spots.neighborhood slugified to neighborhoods.slug
 * 3. AI Enrichment (Fallback): Uses OpenAI to identify the neighborhood and area
 *    for any remaining spots with NULL areas based on name and address.
 */
import { eq, isNull, and, sql, or } from 'drizzle-orm'
import { mapSpotsTable, neighborhoodsTable } from '~~/server/database/schema'

interface DrizzleUpdateResult {
  rowsAffected?: number
}

interface OpenAIChatResponse {
  choices: Array<{ message: { content: string } }>
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const db = useDatabase(event)
  let updatedCount = 0

  // --- Stage 1 & 2: Deterministic Sync (Name & Slug) ---
  // We'll update areas based on direct neighborhood name matches
  const neighborhoods = await db
    .select({
      name: neighborhoodsTable.name,
      slug: neighborhoodsTable.slug,
      area: neighborhoodsTable.region,
    })
    .from(neighborhoodsTable)
    .all()

  for (const n of neighborhoods) {
    // Exact name match
    const res1 = await db
      .update(mapSpotsTable)
      .set({ area: n.area })
      .where(and(eq(mapSpotsTable.neighborhood, n.name), isNull(mapSpotsTable.area)))
    updatedCount += (res1 as unknown as DrizzleUpdateResult).rowsAffected || 0

    // Slug match (if neighborhood name is "Bouldin Creek", it might be stored as "Bouldin Creek" or "bouldin-creek")
    const res2 = await db
      .update(mapSpotsTable)
      .set({
        neighborhood: n.name, // Normalize the name too
        area: n.area,
      })
      .where(
        and(
          or(
            eq(sql`LOWER(REPLACE(${mapSpotsTable.neighborhood}, ' ', '-'))`, n.slug),
            eq(sql`LOWER(${mapSpotsTable.neighborhood})`, n.name.toLowerCase()),
          ),
          isNull(mapSpotsTable.area),
        ),
      )
    updatedCount += (res2 as unknown as DrizzleUpdateResult).rowsAffected || 0
  }

  // --- Stage 3: AI Enrichment (Fallback for missing/vague neighborhoods) ---
  const config = useRuntimeConfig()
  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>
  const openaiKey = cfEnv.OPENAI_API_KEY || config.openaiApiKey

  if (openaiKey) {
    const missingSpots = await db
      .select({
        id: mapSpotsTable.id,
        name: mapSpotsTable.name,
        address: mapSpotsTable.address,
        neighborhood: mapSpotsTable.neighborhood,
      })
      .from(mapSpotsTable)
      .where(isNull(mapSpotsTable.area))
      .limit(50) // Batch it to avoid huge requests
      .all()

    if (missingSpots.length > 0) {
      const regionsList = neighborhoods
        .map((n) => n.area)
        .filter((v, i, a) => v && a.indexOf(v) === i)

      const systemPrompt = `You are an Austin local editor. Help us categorize these map spots into the correct Neighborhood and Area.
Regions (Areas) to use: ${regionsList.join(', ')}.
Canonical Neighborhoods: ${neighborhoods.map((n) => n.name).join(', ')}.

Return a JSON array of objects: { id: string, neighborhood: string, area: string }.
Only return data for the IDs provided. Match against the canonical lists if possible.`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify({ spots: missingSpots }) },
          ],
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as OpenAIChatResponse
        const results = data.choices[0]?.message?.content
          ? JSON.parse(data.choices[0].message.content).spots || []
          : []

        for (const r of results) {
          const updateRes = await db
            .update(mapSpotsTable)
            .set({
              neighborhood: r.neighborhood,
              area: r.area,
            })
            .where(eq(mapSpotsTable.id, r.id))
          updatedCount += (updateRes as unknown as DrizzleUpdateResult).rowsAffected || 0
        }
      }
    }
  }

  return { success: true, updatedCount }
})
