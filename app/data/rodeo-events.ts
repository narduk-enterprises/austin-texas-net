export interface RodeoEvent {
  id: number
  date: string
  type: 'concert' | 'rodeo' | 'livestock' | 'carnival' | 'food'
  title: string
  description: string
  time: string
  venue: string
  ticketPrice: string
}

export interface FoodVendor {
  id: number
  name: string
  specialty: string
  mustTry: string
  priceRange: string
}

export const events: RodeoEvent[] = [
  { id: 1, date: '2026-03-14', type: 'rodeo', title: 'Opening Night Rodeo', description: 'The 2026 Rodeo Austin season kicks off with bull riding, barrel racing, and calf roping in the Travis County Expo Center arena.', time: '7:00 PM', venue: 'Travis County Expo Center', ticketPrice: '$25–$45' },
  { id: 2, date: '2026-03-14', type: 'concert', title: 'Opening Night Concert', description: 'The season opener features a major headline act performing after the rodeo events. Past headliners include Luke Bryan and Miranda Lambert.', time: '9:00 PM', venue: 'Main Stage', ticketPrice: 'Included with rodeo ticket' },
  { id: 3, date: '2026-03-15', type: 'livestock', title: 'Junior Livestock Show', description: 'Watch Texas youth compete with their prized animals in categories including cattle, pigs, goats, lambs, and poultry.', time: '8:00 AM', venue: 'Show Barn', ticketPrice: 'Free with gate admission' },
  { id: 4, date: '2026-03-16', type: 'carnival', title: 'Carnival Midway — Family Day', description: 'Discounted rides and games for the whole family. Over 50 rides, carnival games, and attractions on the expanded 2026 midway.', time: '11:00 AM', venue: 'Midway Grounds', ticketPrice: '$30 unlimited ride wristband' },
  { id: 5, date: '2026-03-17', type: 'food', title: 'BBQ Cook-Off', description: 'Over 30 teams compete for Best BBQ in Austin. Sample brisket, ribs, sausage, and creative entries from top pitmasters.', time: '11:00 AM', venue: 'BBQ Grounds', ticketPrice: '$15 tasting pass' },
  { id: 6, date: '2026-03-20', type: 'rodeo', title: 'Championship Rodeo Night', description: 'The top qualifiers from the week compete for prize money in bull riding, saddle bronc, and team roping.', time: '7:30 PM', venue: 'Travis County Expo Center', ticketPrice: '$35–$55' },
  { id: 7, date: '2026-03-21', type: 'concert', title: 'Headliner Concert Night', description: 'The biggest concert of the 2026 season featuring a national headlining artist performing a full set under the stars.', time: '8:30 PM', venue: 'Main Stage', ticketPrice: '$40–$75' },
  { id: 8, date: '2026-03-22', type: 'rodeo', title: 'Closing Night Rodeo Finals', description: 'The final night of competition crowns the 2026 Rodeo Austin champions with prize purses totaling over $200,000.', time: '7:00 PM', venue: 'Travis County Expo Center', ticketPrice: '$30–$50' },
]

export const foodVendors: FoodVendor[] = [
  { id: 1, name: 'Salt Lick BBQ', specialty: 'Texas BBQ', mustTry: 'Brisket plate with sausage and slaw', priceRange: '$12–$18' },
  { id: 2, name: 'Fletcher\'s Corny Dogs', specialty: 'Corn dogs', mustTry: 'Original corny dog with mustard', priceRange: '$8–$10' },
  { id: 3, name: 'Fried Butter Stand', specialty: 'Deep fried everything', mustTry: 'Deep fried butter with cinnamon', priceRange: '$7–$12' },
  { id: 4, name: 'Turkey Leg Junction', specialty: 'Smoked turkey legs', mustTry: 'Giant smoked turkey leg', priceRange: '$12–$15' },
  { id: 5, name: 'Funnel Cake Factory', specialty: 'Funnel cakes', mustTry: 'Strawberry funnel cake with whipped cream', priceRange: '$8–$12' },
]

export const parkingTips = [
  'Park at the free remote lot at 7311 Decker Ln and take the shuttle ($5 round trip)',
  'Uber/Lyft drop-off zone is at Gate 5 on Decker Lane — easiest option for late-night concerts',
  'VIP parking ($25) is available pre-purchase only and sells out fast. Buy weeks in advance.',
  'Arrive 1+ hour early for Friday/Saturday events — parking fills up quickly',
  'The East gate has less congestion than the main West gate entrance',
]

export const eventTypes = ['concert', 'rodeo', 'livestock', 'carnival', 'food'] as const
