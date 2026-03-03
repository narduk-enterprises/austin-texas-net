export interface HauntedPlace {
  id: number
  name: string
  type: 'building' | 'hotel' | 'outdoor' | 'cemetery' | 'theater'
  address: string
  neighborhood: string
  story: string
  ghostName: string
  scareFactor: 1 | 2 | 3 | 4 | 5
  yearEstablished: number
  isOpenToPublic: boolean
  tourAvailable: boolean
  lat: number
  lng: number
}

export const hauntedPlaces: HauntedPlace[] = [
  {
    id: 1, name: 'The Driskill Hotel', type: 'hotel', address: '604 Brazos St', neighborhood: 'Downtown',
    story: 'Built in 1886 by cattle baron Jesse Driskill, the hotel has reported sightings of his ghost still roaming the halls. Room 525 is infamous for guests seeing a woman in 1930s attire staring from the mirror. Two brides have died here on their honeymoons under mysterious circumstances.',
    ghostName: 'Colonel Jesse Driskill', scareFactor: 4, yearEstablished: 1886,
    isOpenToPublic: true, tourAvailable: true, lat: 30.2678, lng: -97.7406
  },
  {
    id: 2, name: 'Littlefield House', type: 'building', address: '24th St & Whitis Ave', neighborhood: 'UT Campus',
    story: 'Major George Littlefield built this Victorian mansion in 1893. After his wife Alice died, staff reported seeing her ghost drifting through the upper floors in a white dress. Civil War soldiers have been spotted on the grounds, likely connected to Littlefield\'s Confederate service.',
    ghostName: 'Alice Littlefield', scareFactor: 3, yearEstablished: 1893,
    isOpenToPublic: false, tourAvailable: true, lat: 30.2858, lng: -97.7398
  },
  {
    id: 3, name: 'Oakwood Cemetery', type: 'cemetery', address: '1601 Navasota St', neighborhood: 'East Austin',
    story: 'Austin\'s oldest city cemetery dating to 1839. Eerie fog rolls in at night and visitors report cold spots, disembodied footsteps, and ghostly figures among the crumbling headstones of governors, Civil War soldiers, and Austin\'s founding families.',
    ghostName: 'Various spirits', scareFactor: 5, yearEstablished: 1839,
    isOpenToPublic: true, tourAvailable: true, lat: 30.2720, lng: -97.7263
  },
  {
    id: 4, name: 'Paramount Theatre', type: 'theater', address: '713 Congress Ave', neighborhood: 'Downtown',
    story: 'This 1915 theater is haunted by a ghostly man in a top hat seen sitting in the balcony during performances. Actors report hearing applause from an empty theater during late-night rehearsals and feeling an invisible presence on stage.',
    ghostName: 'The Man in the Top Hat', scareFactor: 3, yearEstablished: 1915,
    isOpenToPublic: true, tourAvailable: false, lat: 30.2680, lng: -97.7432
  },
  {
    id: 5, name: 'Tavern on 6th', type: 'building', address: '617 E 6th St', neighborhood: 'East 6th',
    story: 'Originally a 1866 general store, this building has been a brothel, boarding house, and now a bar. Staff report glasses flying off shelves, doors slamming shut, and a spectral woman in a red dress seen ascending the staircase.',
    ghostName: 'The Woman in Red', scareFactor: 4, yearEstablished: 1866,
    isOpenToPublic: true, tourAvailable: false, lat: 30.2675, lng: -97.7352
  },
  {
    id: 6, name: 'Moonshine Patio Bar & Grill', type: 'building', address: '303 Red River St', neighborhood: 'Downtown',
    story: 'Operating from one of Austin\'s original 1850s buildings, staff report silverware rearranging itself, phantom footsteps upstairs, and a ghostly child\'s laughter echoing through the limestone walls.',
    ghostName: 'The Laughing Child', scareFactor: 3, yearEstablished: 1850,
    isOpenToPublic: true, tourAvailable: false, lat: 30.2643, lng: -97.7378
  },
  {
    id: 7, name: 'Clay Pit', type: 'building', address: '1601 Guadalupe St', neighborhood: 'Downtown',
    story: 'Built in 1852, this building served as the Texas State Lunatic Asylum annex. Diners report cold drafts, utensils moving, and the ghostly image of a woman in white appearing in the basement dining room.',
    ghostName: 'The Asylum Ghost', scareFactor: 4, yearEstablished: 1852,
    isOpenToPublic: true, tourAvailable: false, lat: 30.2782, lng: -97.7433
  },
  {
    id: 8, name: 'Treaty Oak', type: 'outdoor', address: '507 Baylor St', neighborhood: 'Downtown',
    story: 'This 500+ year old live oak survived a 1989 poisoning attempt that nearly killed it. Locals say the tree emanates a sorrowful energy and that the spirit of the person who poisoned it haunts the grounds, unable to rest.',
    ghostName: 'The Poisoner\'s Remorse', scareFactor: 2, yearEstablished: 1500,
    isOpenToPublic: true, tourAvailable: true, lat: 30.2736, lng: -97.7504
  },
]

export const placeTypes = [...new Set(hauntedPlaces.map(p => p.type))].sort()
export const scareFactors = [1, 2, 3, 4, 5] as const
