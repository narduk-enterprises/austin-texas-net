/**
 * convexHull — Shared convex hull (Graham scan) utility.
 *
 * Used by both the admin shapes API and the shape generation endpoint.
 */

export interface Point2D {
  lat: number
  lng: number
}

/**
 * Cross product of vectors OA and OB where O is origin.
 */
function cross(o: Point2D, a: Point2D, b: Point2D): number {
  return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng)
}

/**
 * Compute convex hull of a set of 2D points using Graham scan.
 * Returns points in counter-clockwise order.
 */
export function convexHull(points: Point2D[]): Point2D[] {
  if (points.length < 3) return points

  // Find the bottom-most (min lat) point, break ties by min lng
  let pivot = points[0]!
  for (const p of points) {
    if (p.lat < pivot.lat || (p.lat === pivot.lat && p.lng < pivot.lng)) {
      pivot = p
    }
  }

  // Sort by polar angle relative to pivot
  const sorted = points
    .filter((p) => p !== pivot)
    .sort((a, b) => {
      const angleA = Math.atan2(a.lat - pivot.lat, a.lng - pivot.lng)
      const angleB = Math.atan2(b.lat - pivot.lat, b.lng - pivot.lng)
      if (angleA !== angleB) return angleA - angleB
      // Same angle — closer point first
      const distA = (a.lng - pivot.lng) ** 2 + (a.lat - pivot.lat) ** 2
      const distB = (b.lng - pivot.lng) ** 2 + (b.lat - pivot.lat) ** 2
      return distA - distB
    })

  const hull = [pivot, sorted[0]!]

  for (let i = 1; i < sorted.length; i++) {
    let top = hull[hull.length - 1]!
    let nextToTop = hull[hull.length - 2]!
    const current = sorted[i]!

    // While the turn from nextToTop → top → current is not counter-clockwise, pop
    while (hull.length >= 2 && cross(nextToTop, top, current) <= 0) {
      hull.pop()
      top = hull[hull.length - 1]!
      nextToTop = hull[hull.length - 2]!
    }

    hull.push(current)
  }

  return hull
}

/**
 * Build a closed GeoJSON Polygon ring from a hull.
 * Returns [lng, lat][] with first == last.
 */
export function hullToGeoJSONRing(hull: Point2D[]): number[][] {
  const ring = hull.map((p) => [p.lng, p.lat])
  ring.push(ring[0]!)
  return ring
}
