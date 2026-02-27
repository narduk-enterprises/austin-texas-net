export interface DiscGolfCourse {
  id: number
  name: string
  holes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'championship'
  address: string
  neighborhood: string
  description: string
  features: string[]
  fee: string
  rating: number
  lat: number
  lng: number
}

export const courses: DiscGolfCourse[] = [
  {
    id: 1, name: 'Roy G. Guerrero Disc Golf Course', holes: 18, difficulty: 'intermediate',
    address: '400 Grove Blvd', neighborhood: 'East Riverside',
    description: 'Austin\'s most popular disc golf course winding through dense woods along the Colorado River. Tight fairways and technical shots make this a challenging but rewarding round.',
    features: ['wooded', 'water-hazards', 'well-maintained', 'restrooms'],
    fee: 'Free', rating: 4.7, lat: 30.2375, lng: -97.7131
  },
  {
    id: 2, name: 'Circle C Metro Park', holes: 18, difficulty: 'advanced',
    address: '7301 W Slaughter Ln', neighborhood: 'Circle C',
    description: 'A beautifully maintained course with dramatic elevation changes and long, open fairways. One of the highest-rated courses in Texas.',
    features: ['elevation-changes', 'open-fairways', 'scenic', 'parking'],
    fee: 'Free', rating: 4.8, lat: 30.1726, lng: -97.8595
  },
  {
    id: 3, name: 'Zilker Park Disc Golf', holes: 18, difficulty: 'beginner',
    address: '2301 Barton Springs Rd', neighborhood: 'Zilker',
    description: 'A great introductory course in the heart of Austin. Shorter holes with wide fairways make this perfect for beginners and casual rounds.',
    features: ['beginner-friendly', 'scenic', 'central-location', 'swimming-nearby'],
    fee: 'Free', rating: 4.3, lat: 30.2668, lng: -97.7718
  },
  {
    id: 4, name: 'Mary Moore Searight', holes: 18, difficulty: 'intermediate',
    address: '907 W Slaughter Ln', neighborhood: 'South Austin',
    description: 'A solid intermediate course with a good mix of wooded and open holes. Well-maintained with concrete tee pads and dual pin positions.',
    features: ['wooded', 'open-fairways', 'concrete-tees', 'dual-pins'],
    fee: 'Free', rating: 4.5, lat: 30.1685, lng: -97.8124
  },
  {
    id: 5, name: 'Cat Hollow', holes: 18, difficulty: 'intermediate',
    address: '8600 O\'Connor Dr', neighborhood: 'Round Rock',
    description: 'Just north of Austin, this well-designed course features rolling terrain and excellent hole variety. The signature island hole is a local favorite.',
    features: ['island-hole', 'rolling-terrain', 'well-designed', 'parking'],
    fee: 'Free', rating: 4.6, lat: 30.4847, lng: -97.7014
  },
  {
    id: 6, name: 'Wells Branch Greenbelt', holes: 9, difficulty: 'beginner',
    address: '2106 Klattenhoff Dr', neighborhood: 'Wells Branch',
    description: 'A short, beginner-friendly course tucked into a north Austin greenbelt. Perfect for a quick round after work or introducing friends to disc golf.',
    features: ['beginner-friendly', 'short-course', 'greenbelt', 'shaded'],
    fee: 'Free', rating: 4.1, lat: 30.4386, lng: -97.6823
  },
  {
    id: 7, name: 'Bartholomew Park', holes: 9, difficulty: 'beginner',
    address: '5201 Berkman Dr', neighborhood: 'North Loop',
    description: 'A compact course in central Austin with a strong local community. Regular leagues and casual weekly rounds make this a great place to meet fellow players.',
    features: ['community', 'leagues', 'central-location', 'beginner-friendly'],
    fee: 'Free', rating: 4.2, lat: 30.3072, lng: -97.7088
  },
  {
    id: 8, name: 'Wilco Disc Golf', holes: 27, difficulty: 'championship',
    address: '1801 E Old Settlers Blvd', neighborhood: 'Round Rock',
    description: 'A massive 27-hole championship course that regularly hosts PDGA tournaments. Three distinct 9-hole layouts offer incredible variety and challenge.',
    features: ['championship', 'tournaments', '27-holes', 'pro-level'],
    fee: '$3 suggested', rating: 4.9, lat: 30.5106, lng: -97.6620
  },
]

export const difficulties: DiscGolfCourse['difficulty'][] = ['beginner', 'intermediate', 'advanced', 'championship']
