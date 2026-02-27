export interface BatTip {
  id: string
  title: string
  detail: string
}

export interface BatFact {
  id: string
  label: string
  value: string
}

export const batTips: BatTip[] = [
  {
    id: 'arrive-early',
    title: 'Arrive 30 minutes early',
    detail: 'Parking and sidewalks fill quickly near sunset, especially on warm weekends and festival nights.',
  },
  {
    id: 'stay-after-dark',
    title: 'Expect a rolling emergence',
    detail: 'The first wave can start around 20 minutes after sunset, then intensify for 30-60 minutes.',
  },
  {
    id: 'watch-wind',
    title: 'Weather changes visibility',
    detail: 'Clear and calm nights usually produce the longest visible stream. Cloud cover can hide the flight path.',
  },
  {
    id: 'bring-essentials',
    title: 'Bring water and bug spray',
    detail: 'Evening humidity is high around the lake. Lightweight layers and mosquito protection make it easier to stay.',
  },
]

export const batFacts: BatFact[] = [
  {
    id: 'colony-size',
    label: 'Estimated colony size',
    value: '~1.5 million Mexican free-tailed bats in peak season',
  },
  {
    id: 'largest-urban',
    label: 'Scale',
    value: 'One of the largest urban bat colonies in North America',
  },
  {
    id: 'diet',
    label: 'Nightly impact',
    value: 'Consumes tons of insects through the warm season',
  },
  {
    id: 'eco-value',
    label: 'Migration pattern',
    value: 'Most bats migrate south from late fall through winter',
  },
]

export const activeSeasonContext = 'March through October is the primary viewing season when the bridge colony is consistently active at dusk.'
export const dormantSeasonContext = 'November through February is typically dormant. Many bats migrate, so emergence can be sparse or absent.'
