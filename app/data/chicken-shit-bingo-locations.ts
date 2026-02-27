export interface BingoInfo {
  venue: string
  fullName: string
  address: string
  neighborhood: string
  schedule: string
  startTime: string
  endTime: string
  coverCharge: string
  bingoCardPrice: string
  description: string
  lat: number
  lng: number
}

export interface FAQ {
  id: number
  question: string
  answer: string
}

export interface Tip {
  id: number
  title: string
  description: string
  icon: string
}

export const bingoInfo: BingoInfo = {
  venue: 'Little Longhorn Saloon',
  fullName: 'Dale Watson\'s Chicken Shit Bingo at the Little Longhorn Saloon',
  address: '5434 Burnet Rd',
  neighborhood: 'Allandale / Burnet Rd',
  schedule: 'Every Sunday',
  startTime: '4:00 PM',
  endTime: '8:00 PM',
  coverCharge: 'Free',
  bingoCardPrice: '$2 per card',
  description: 'The most Austin thing you can possibly do. A live chicken struts around a bingo board on the bar\'s outdoor stage, and wherever it poops, that\'s the winning number. The lucky ticket holder wins the pot (usually $100–$200). Meanwhile, country legend Dale Watson often performs live. It\'s weird, wonderful, and quintessentially Austin.',
  lat: 30.3297,
  lng: -97.7387
}

export const faqs: FAQ[] = [
  { id: 1, question: 'What exactly is Chicken Shit Bingo?', answer: 'A live chicken walks around a numbered bingo board on a stage. When the chicken poops on a number, whoever has that number on their bingo card wins the pot. Yes, this is real. Yes, this is Austin.' },
  { id: 2, question: 'Is this legal?', answer: 'Yes! The Texas Racing Commission has ruled that Chicken Shit Bingo is a game of chance (the chicken determines the outcome) and is not considered illegal gambling under Texas law.' },
  { id: 3, question: 'How much does it cost?', answer: 'No cover charge to enter the bar. Bingo cards are $2 each and you can buy as many as you want. The beer is cheap (Lone Star tallboys are the move).' },
  { id: 4, question: 'What time should I arrive?', answer: 'The bar opens at noon on Sundays and bingo starts at 4pm. Arrive by 2–3pm to get a good spot, especially on nice-weather Sundays. By 4pm, the line can stretch down the block.' },
  { id: 5, question: 'Is it kid-friendly?', answer: 'The bar allows minors accompanied by adults during daytime hours. It\'s a surprisingly family-friendly atmosphere, though it IS a bar. No one will judge you for bringing kids to watch a chicken poop for money.' },
  { id: 6, question: 'Do they serve food?', answer: 'The Little Longhorn is primarily a bar, but food trucks usually set up outside on Sundays. The bar has limited snacks available inside.' },
  { id: 7, question: 'How does the pot work?', answer: 'Everyone who buys a bingo card is in the game. The pot is the total of all card sales. When the chicken hits a number, the person with that number wins the entire pot (minus a small house take). Typical pots range from $100 to $300.' },
  { id: 8, question: 'Is it always on Sundays?', answer: 'Yes, Chicken Shit Bingo happens every Sunday year-round, rain or shine. However, the bar can get extremely crowded on perfect-weather spring and fall Sundays.' },
]

export const tips: Tip[] = [
  { id: 1, title: 'Arrive Early', description: 'Get there by 2pm for a prime spot. By 4pm it\'s standing room only. Grab a Lone Star tallboy and stake out your territory.', icon: 'i-lucide-clock' },
  { id: 2, title: 'Bring Cash', description: 'Bingo cards are cash only ($2 each). The bar also prefers cash for drinks. ATM is available but the line gets long.', icon: 'i-lucide-banknote' },
  { id: 3, title: 'Wear Boots', description: 'Not required, but highly encouraged. You\'re at a honky-tonk watching a chicken. Lean into the experience.', icon: 'i-lucide-footprints' },
  { id: 4, title: 'Don\'t Rush the Chicken', description: 'The chicken does its thing on its own schedule. Sometimes it takes 5 minutes, sometimes 45. That\'s part of the charm. Drink your beer and enjoy the music.', icon: 'i-lucide-timer' },
  { id: 5, title: 'Stay for the Music', description: 'The live country music is genuinely excellent. Dale Watson is a legendary honky-tonk artist, and the bar books great local acts. The bingo is the hook, but the music is the soul.', icon: 'i-lucide-music' },
  { id: 6, title: 'Check the Weather', description: 'The bingo board is outdoors. On rainy Sundays, the crowd thins out dramatically — making it the BEST time to go if you don\'t mind getting a little wet.', icon: 'i-lucide-cloud-rain' },
]
