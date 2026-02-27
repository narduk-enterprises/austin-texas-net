export interface ViewingSpot {
  id: string
  name: string
  subtitle: string
  description: string
  latitude: number
  longitude: number
  address: string
  mapsQuery: string
}

export const AUSTIN_BRIDGE_COORDINATES = {
  latitude: 30.2672,
  longitude: -97.7431,
} as const

export const viewingSpots: ViewingSpot[] = [
  {
    id: 'bridge-east-sidewalk',
    name: 'Congress Ave Bridge Sidewalk (East)',
    subtitle: 'Closest overhead view of the colony',
    description: 'Stand along the east sidewalk to see bats spiral directly beneath you as they leave the bridge crevices.',
    latitude: 30.262013,
    longitude: -97.742737,
    address: '100 S Congress Ave, Austin, TX 78704',
    mapsQuery: 'Congress Avenue Bridge East Sidewalk Austin TX',
  },
  {
    id: 'statesman-center',
    name: 'Statesman Bat Observation Center',
    subtitle: 'Ground-level family viewing area',
    description: 'Popular lawn and boardwalk vantage with room to sit, spread out, and watch the stream over the lake.',
    latitude: 30.259861,
    longitude: -97.747441,
    address: '305 S Congress Ave, Austin, TX 78704',
    mapsQuery: 'Statesman Bat Observation Center Austin TX',
  },
  {
    id: 'tgi-fridays-patio',
    name: "TGI Friday's Patio",
    subtitle: 'Dinner + bat flight views',
    description: 'Patio seating near the bridge gives an elevated line of sight while staying close to food and drinks.',
    latitude: 30.258793,
    longitude: -97.741934,
    address: '500 E Riverside Dr, Austin, TX 78704',
    mapsQuery: "TGI Friday's patio Austin bats",
  },
  {
    id: 'kayak-lake',
    name: 'Kayak / Paddleboard on the Lake',
    subtitle: 'On-water perspective under the bridge',
    description: 'Launching near Lady Bird Lake gives a dramatic view as the emergence stream forms and heads east.',
    latitude: 30.264638,
    longitude: -97.749145,
    address: '74 Trinity St, Austin, TX 78701',
    mapsQuery: 'Lady Bird Lake kayak launch near Congress Bridge',
  },
  {
    id: 'boat-tour-dock',
    name: 'Austin Bats Boat Tour Dock',
    subtitle: 'Guided on-water bat watching',
    description: 'Reserve a sunset cruise for narrated viewing with a direct route to the bridge emergence corridor.',
    latitude: 30.260063,
    longitude: -97.745879,
    address: '208 Barton Springs Rd, Austin, TX 78704',
    mapsQuery: 'Austin bats boat tour dock',
  },
]

export function appleMapsUrl(spot: Pick<ViewingSpot, 'mapsQuery' | 'latitude' | 'longitude'>) {
  const query = encodeURIComponent(spot.mapsQuery)
  return `https://maps.apple.com/?q=${query}&ll=${spot.latitude},${spot.longitude}`
}
