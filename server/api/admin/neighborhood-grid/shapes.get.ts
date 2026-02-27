/**
 * GET /api/admin/neighborhood-grid/shapes
 *
 * Computes GeoJSON polygon boundaries from accumulated grid points.
 * Uses convex hull algorithm on points labeled with each neighborhood name.
 *
 * Query params (optional):
 *   minPoints — minimum points required for a neighborhood shape (default: 5)
 *   neighborhood — filter to a single neighborhood name
 */
import { z } from 'zod'
import { sql, isNotNull } from 'drizzle-orm'
import { neighborhoodGrid } from '~~/server/database/schema'
import { convexHull, hullToGeoJSONRing } from '~~/server/utils/convexHull'

const querySchema = z.object({
  minPoints: z.coerce.number().min(3).optional().default(5),
  neighborhood: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const { minPoints, neighborhood: filterNeighborhood } = querySchema.parse(query)

  const db = useDatabase()

  // Get all labeled points, optionally filtered
  let condition = isNotNull(neighborhoodGrid.neighborhood)
  if (filterNeighborhood) {
    condition = sql`neighborhood = ${filterNeighborhood}`
  }

  const points = await db
    .select({
      neighborhood: neighborhoodGrid.neighborhood,
      lat: neighborhoodGrid.lat,
      lng: neighborhoodGrid.lng,
    })
    .from(neighborhoodGrid)
    .where(condition)
    .all()

  // Group points by neighborhood
  const byNeighborhood = new Map<string, Array<{ lat: number; lng: number }>>()
  for (const p of points) {
    if (!p.neighborhood) continue
    const list = byNeighborhood.get(p.neighborhood) || []
    list.push({ lat: p.lat, lng: p.lng })
    byNeighborhood.set(p.neighborhood, list)
  }

  // Compute convex hull for each neighborhood with enough points
  interface GeoJSONFeature {
    type: 'Feature'
    geometry: { type: string; coordinates: number[][][] }
    properties: {
      name: string
      pointCount: number
      centerLat: number
      centerLng: number
      source: string
    }
  }

  const features: GeoJSONFeature[] = []

  for (const [name, pts] of byNeighborhood.entries()) {
    if (pts.length < minPoints) continue

    const hull = convexHull(pts)
    if (hull.length < 3) continue

    const ring = hullToGeoJSONRing(hull)

    // Compute centroid
    const centerLat = pts.reduce((s, p) => s + p.lat, 0) / pts.length
    const centerLng = pts.reduce((s, p) => s + p.lng, 0) / pts.length

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
      properties: {
        name,
        pointCount: pts.length,
        centerLat: Math.round(centerLat * 1e6) / 1e6,
        centerLng: Math.round(centerLng * 1e6) / 1e6,
        source: 'apple-maps-grid-crawler',
      },
    })
  }

  // Sort by name
  features.sort((a, b) => a.properties.name.localeCompare(b.properties.name))

  return {
    type: 'FeatureCollection',
    features,
    _meta: {
      totalNeighborhoods: byNeighborhood.size,
      withEnoughPoints: features.length,
      skipped: byNeighborhood.size - features.length,
      minPointsThreshold: minPoints,
    },
  }
})
