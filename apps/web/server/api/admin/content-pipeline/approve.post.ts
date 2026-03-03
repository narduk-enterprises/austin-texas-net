/**
 * POST /api/admin/content-pipeline/approve
 *
 * Commits spots from a specific pipeline run to the live map_spots table.
 * Body: { runId: number, selectedSpotIds?: string[] }
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { contentPipelineRuns, mapSpotsTable } from '~~/server/database/schema'

const bodySchema = z.object({
  runId: z.number().int().positive(),
  selectedSpotIds: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { runId, selectedSpotIds } = bodySchema.parse(await readBody(event))
  const db = useDatabase(event)

  // 1. Get the run record
  const run = await db
    .select()
    .from(contentPipelineRuns)
    .where(eq(contentPipelineRuns.id, runId))
    .get()

  if (!run || run.status !== 'completed' || !run.outputPreview) {
    throw createError({ statusCode: 400, statusMessage: 'Run not found or not completed' })
  }

  // 2. Parse the staged spots
  interface StagedSpot {
    id: string
    name: string
    lat: number
    lng: number
    address?: string
    neighborhood?: string
    category?: string
    phone?: string
    url?: string
    rank?: number
    neighborhoodRank?: number
    knownFor?: string
    description?: string
    priceRange?: string
    rating?: number
    status?: 'approved' | 'pending' | 'archived'
  }
  const spots = JSON.parse(run.outputPreview) as StagedSpot[]

  // 3. Filter if requested
  const spotsToCommit = selectedSpotIds
    ? spots.filter((s) => selectedSpotIds.includes(s.id))
    : spots

  if (spotsToCommit.length === 0) {
    return { ok: true, committed: 0, message: 'No spots to commit' }
  }

  // 4. Batch upsert into map_spots
  let committed = 0
  const now = new Date().toISOString()

  for (const spot of spotsToCommit) {
    const data = {
      id: spot.id,
      name: spot.name,
      lat: spot.lat,
      lng: spot.lng,
      address: spot.address || null,
      neighborhood: spot.neighborhood || null,
      category: spot.category || null,
      contentType: run.topicKey || 'unknown',
      phone: spot.phone || null,
      url: spot.url || null,
      rank: spot.rank || null,
      neighborhoodRank: spot.neighborhoodRank || null,
      knownFor: spot.knownFor || null,
      description: spot.description || null,
      priceRange: spot.priceRange || '$',
      rating: spot.rating || 0,
      status: spot.status || 'approved',
      sourceRunId: run.id,
      featured: true,
      updatedAt: now,
    }

    // Check if exists for upsert behavior
    const existing = await db
      .select()
      .from(mapSpotsTable)
      .where(eq(mapSpotsTable.id, spot.id))
      .get()

    if (existing) {
      await db.update(mapSpotsTable).set(data).where(eq(mapSpotsTable.id, spot.id))
    } else {
      await db.insert(mapSpotsTable).values({
        ...data,
        createdAt: now,
      })
    }
    committed++
  }

  return { ok: true, committed }
})
