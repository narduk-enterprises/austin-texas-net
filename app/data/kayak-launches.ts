export interface LaunchSite {
  id: number
  name: string
  waterBody: string
  address: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  amenities: string[]
  description: string
  tips: string
  parking: string
  lat: number
  lng: number
}

export const launchSites: LaunchSite[] = [
  {
    id: 1,
    name: 'Zilker Park Canoe Launch',
    waterBody: 'Lady Bird Lake',
    address: '2100 Barton Springs Rd',
    difficulty: 'beginner',
    amenities: ['restrooms', 'parking', 'rentals', 'picnic-area'],
    description: 'The most popular paddling launch in Austin with easy access to calm, flat water. Kayak and SUP rentals available on-site.',
    tips: 'Arrive before 10am on weekends to avoid crowds. Morning paddles offer the best wildlife sightings.',
    parking: 'Free parking lot, fills up by 11am on weekends',
    lat: 30.2669,
    lng: -97.7729
  },
  {
    id: 2,
    name: 'Red Bud Isle',
    waterBody: 'Lady Bird Lake',
    address: '3401 Redbud Trail',
    difficulty: 'beginner',
    amenities: ['parking', 'dog-friendly'],
    description: 'A peaceful peninsula launch perfect for beginners. Sheltered cove with calm water and excellent bird watching.',
    tips: 'Great spot for sunset paddles. The cove is sheltered from wind, making it ideal for SUP beginners.',
    parking: 'Small lot at the end of Redbud Trail, limited spaces',
    lat: 30.2841,
    lng: -97.7838
  },
  {
    id: 3,
    name: 'Barton Creek Greenbelt — Sculpture Falls',
    waterBody: 'Barton Creek',
    address: '4600 MoPac Expy Service Rd',
    difficulty: 'intermediate',
    amenities: ['hiking-trails'],
    description: 'A more adventurous paddle up Barton Creek. Requires hiking in with your kayak, but rewards with pristine creek scenery.',
    tips: 'Only accessible when creek levels are high enough. Check creek flow gauge before heading out.',
    parking: 'Trailhead parking lot on MoPac frontage road',
    lat: 30.2450,
    lng: -97.8085
  },
  {
    id: 4,
    name: 'Pace Bend Park',
    waterBody: 'Lake Travis',
    address: '2501 Pace Bend Rd N, Spicewood',
    difficulty: 'intermediate',
    amenities: ['camping', 'restrooms', 'swimming', 'parking'],
    description: 'Stunning limestone cliffs and clear Lake Travis water. Multiple launch points along the shoreline.',
    tips: 'Watch for boat traffic, especially on weekends. Early morning paddles are magical with mist on the water.',
    parking: '$10 day use fee per vehicle',
    lat: 30.4508,
    lng: -97.9656
  },
  {
    id: 5,
    name: 'Congress Avenue Kayak Launch',
    waterBody: 'Lady Bird Lake',
    address: '100 S Congress Ave',
    difficulty: 'beginner',
    amenities: ['restrooms', 'bike-trail', 'rentals'],
    description: 'Launch right from downtown Austin and paddle under the iconic Congress Avenue Bridge. Best spot to see the bat colony at dusk.',
    tips: 'Time your paddle for sunset to watch 1.5 million bats emerge from under the bridge. Unforgettable experience.',
    parking: 'Metered street parking, nearby paid lots',
    lat: 30.2610,
    lng: -97.7445
  },
  {
    id: 6,
    name: 'Emma Long Metropolitan Park',
    waterBody: 'Lake Austin',
    address: '1600 City Park Rd',
    difficulty: 'intermediate',
    amenities: ['camping', 'restrooms', 'swimming', 'parking', 'picnic-area'],
    description: 'Beautiful Lake Austin access with a dedicated boat ramp. Swimming area nearby for post-paddle cooling off.',
    tips: 'Can get choppy in the afternoon from boat wakes. Morning paddles are best for calm conditions.',
    parking: '$5 entry fee on weekdays, $10 on weekends',
    lat: 30.3204,
    lng: -97.8267
  },
  {
    id: 7,
    name: 'Waller Creek Outlet',
    waterBody: 'Lady Bird Lake',
    address: '1100 E Cesar Chavez St',
    difficulty: 'beginner',
    amenities: ['bike-trail', 'parking'],
    description: 'A quieter east-side launch point on Lady Bird Lake. Less crowded than Zilker with easy water access.',
    tips: 'Explore the Waller Creek inlet for a sheltered paddle through urban nature. Turtles love this area.',
    parking: 'Street parking on Cesar Chavez',
    lat: 30.2585,
    lng: -97.7342
  },
  {
    id: 8,
    name: 'Sandy Creek Park',
    waterBody: 'Lake Travis',
    address: '9500 Lime Creek Rd',
    difficulty: 'advanced',
    amenities: ['camping', 'restrooms', 'parking'],
    description: 'Remote Lake Travis cove with crystal-clear water. Longer paddle to open water but incredibly scenic.',
    tips: 'Best for experienced paddlers comfortable with open lake conditions. When the lake is full, this is paradise.',
    parking: 'Free gravel lot, limited spaces',
    lat: 30.4773,
    lng: -97.8973
  },
]

export const waterBodies = [...new Set(launchSites.map(s => s.waterBody))].sort()
export const difficulties: LaunchSite['difficulty'][] = ['beginner', 'intermediate', 'advanced']
