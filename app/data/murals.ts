export interface Mural {
  id: number
  name: string
  artist: string
  address: string
  neighborhood: string
  description: string
  year: number
  tags: string[]
  lat: number
  lng: number
}

export const murals: Mural[] = [
  {
    id: 1,
    name: 'Greetings from Austin',
    artist: 'Todd Sanders & Rory Skagen',
    address: '1720 S 1st St',
    neighborhood: 'South First',
    description: 'The iconic postcard-style mural that became Austin\'s most photographed landmark. A love letter to the city in vintage typography.',
    year: 1998,
    tags: ['iconic', 'vintage', 'photo-spot'],
    lat: 30.2505,
    lng: -97.7536
  },
  {
    id: 2,
    name: 'I Love You So Much',
    artist: 'Amy Cook',
    address: '1300 S Congress Ave',
    neighborhood: 'South Congress',
    description: 'Spray-painted on the side of Jo\'s Coffee, this simple declaration became a worldwide symbol of Austin\'s warmth.',
    year: 2010,
    tags: ['iconic', 'romantic', 'photo-spot'],
    lat: 30.2494,
    lng: -97.7487
  },
  {
    id: 3,
    name: 'You\'re My Butter Half',
    artist: 'United Way for Greater Austin',
    address: '2000 E MLK Jr Blvd',
    neighborhood: 'East Austin',
    description: 'A playful toast-and-butter mural that has become one of Austin\'s most beloved Instagram backdrops.',
    year: 2015,
    tags: ['fun', 'photo-spot', 'food'],
    lat: 30.2764,
    lng: -97.7183
  },
  {
    id: 4,
    name: 'Jeremiah the Innocent',
    artist: 'Daniel Johnston',
    address: '2100 Guadalupe St',
    neighborhood: 'Drag/UT Area',
    description: 'The iconic Hi, How Are You frog by legendary Austin musician and artist Daniel Johnston, a symbol of Austin\'s creative spirit.',
    year: 1993,
    tags: ['iconic', 'music', 'historic'],
    lat: 30.2862,
    lng: -97.7424
  },
  {
    id: 5,
    name: 'Willie Nelson Mural',
    artist: 'Federico Archuleta',
    address: '617 E 7th St',
    neighborhood: 'East 6th',
    description: 'A stunning photorealistic portrait of the Red Headed Stranger, celebrating Austin\'s country music legend.',
    year: 2016,
    tags: ['music', 'portrait', 'photo-spot'],
    lat: 30.2679,
    lng: -97.7362
  },
  {
    id: 6,
    name: 'HOPE Outdoor Gallery Remnants',
    artist: 'Various Artists',
    address: '1101 Baylor St',
    neighborhood: 'Castle Hills',
    description: 'While the original HOPE Gallery has been relocated, the spirit of Austin\'s largest legal graffiti park lives on through community art projects.',
    year: 2011,
    tags: ['graffiti', 'community', 'historic'],
    lat: 30.2822,
    lng: -97.7538
  },
  {
    id: 7,
    name: 'Cosmic Coffee Murals',
    artist: 'Various Artists',
    address: '121 Pickle Rd',
    neighborhood: 'South Austin',
    description: 'A sprawling collection of murals adorning the walls, containers, and fences of this beloved South Austin coffee shop and beer garden.',
    year: 2019,
    tags: ['collection', 'coffee', 'colorful'],
    lat: 30.2180,
    lng: -97.7804
  },
  {
    id: 8,
    name: 'Tau Ceti Mural',
    artist: 'Josef Kristofoletti',
    address: '1511 S 1st St',
    neighborhood: 'South First',
    description: 'A massive, vibrant geometric mural inspired by the ATLAS particle detector at CERN, blending science and art.',
    year: 2013,
    tags: ['geometric', 'science', 'large-scale'],
    lat: 30.2524,
    lng: -97.7536
  },
  {
    id: 9,
    name: 'East Austin Faces',
    artist: 'El Federico',
    address: '1209 E Cesar Chavez St',
    neighborhood: 'East Austin',
    description: 'Colorful portraits celebrating the diverse faces and stories of East Austin\'s vibrant community.',
    year: 2018,
    tags: ['portrait', 'community', 'colorful'],
    lat: 30.2588,
    lng: -97.7312
  },
  {
    id: 10,
    name: 'Love from Austin',
    artist: 'Various Artists',
    address: '908 E 5th St',
    neighborhood: 'East 6th',
    description: 'A rotating gallery wall featuring collaborations between local and visiting artists, always evolving.',
    year: 2020,
    tags: ['rotating', 'collaborative', 'photo-spot'],
    lat: 30.2651,
    lng: -97.7352
  },
  {
    id: 11,
    name: 'Biscuit Paint Wall',
    artist: 'Various Artists',
    address: '1906 S Congress Ave',
    neighborhood: 'South Congress',
    description: 'The exterior of Biscuit Paint Wall restaurant features rotating murals by Austin artists, making it a constantly fresh photo destination.',
    year: 2017,
    tags: ['rotating', 'photo-spot', 'food'],
    lat: 30.2445,
    lng: -97.7496
  },
  {
    id: 12,
    name: 'Congress Avenue Bridge Bats',
    artist: 'Niz',
    address: '100 Congress Ave',
    neighborhood: 'Downtown',
    description: 'A whimsical mural celebrating Austin\'s famous Mexican free-tailed bats that emerge from the Congress Avenue Bridge each evening.',
    year: 2019,
    tags: ['wildlife', 'whimsical', 'downtown'],
    lat: 30.2613,
    lng: -97.7450
  },
]

export const neighborhoods = [...new Set(murals.map(m => m.neighborhood))].sort()
export const allTags = [...new Set(murals.flatMap(m => m.tags))].sort()
