/**
 * Do512 Events Scraper
 *
 * Fetches weekend events from Do512.com — Austin's best events calendar.
 * Parses the public event listing HTML pages for structured data.
 *
 * Do512 HTML structure (verified Feb 2026):
 *   - Event cards: <div class="ds-listing event-card ds-event-category-{category}">
 *   - Title: <span class="ds-listing-event-title-text" itemprop="name">
 *   - Venue: <a href="/venues/..."><span itemprop="name">
 *   - Time: <div class="ds-event-time dtstart">
 *   - URL: <a href="/events/YYYY/M/D/slug-tickets" itemprop="url">
 */

// ─── Types ───────────────────────────────────────────────

export interface Do512Event {
  name: string
  date: string // Human-readable: "Friday, Feb 14 at 7:30 PM"
  dateISO: string // ISO string for sorting
  venue: string
  category: EventCategory
  url: string
  isFree: boolean
  imageUrl: string
}

export type EventCategory =
  | 'music'
  | 'food'
  | 'outdoor'
  | 'family'
  | 'arts'
  | 'nightlife'
  | 'community'
  | 'other'

export interface EventsResult {
  events: Do512Event[]
  weekendStart: string // Friday ISO date
  weekendEnd: string // Sunday ISO date
  totalScraped: number
  source: string
  fetchedAt: string
}

// ─── Do512 category → our category mapping ───────────────

const DO512_CATEGORY_MAP: Record<string, EventCategory> = {
  'live-music': 'music',
  'dj-parties': 'nightlife',
  'dj-s-parties': 'nightlife',
  'food-drink': 'food',
  'community-local': 'community',
  comedy: 'arts',
  'film-drive-in-s': 'arts',
  drag: 'arts',
  'variety-other': 'other',
  'art-design': 'arts',
  'sports-recreation': 'outdoor',
  family: 'family',
  'charity-causes': 'community',
  'fashion-beauty': 'other',
  'tech-gaming': 'other',
  'health-wellness': 'outdoor',
}

function mapDo512Category(do512Cat: string): EventCategory {
  return DO512_CATEGORY_MAP[do512Cat] ?? 'other'
}

// ─── Weekend Date Helpers ────────────────────────────────

/**
 * Get dates for the upcoming weekend (Friday–Sunday).
 * If today is Fri/Sat/Sun, returns *this* weekend's remaining days.
 */
function getWeekendDates(): Date[] {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const dates: Date[] = []

  if (day === 5) {
    // Friday → Fri, Sat, Sun
    for (let i = 0; i <= 2; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      dates.push(d)
    }
  } else if (day === 6) {
    // Saturday → Sat, Sun
    for (let i = 0; i <= 1; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      dates.push(d)
    }
  } else if (day === 0) {
    // Sunday → just today
    dates.push(new Date(now))
  } else {
    // Mon-Thu → next Fri, Sat, Sun
    const daysToFriday = 5 - day
    for (let i = 0; i <= 2; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + daysToFriday + i)
      dates.push(d)
    }
  }

  return dates
}

// ─── Scraper ─────────────────────────────────────────────

/**
 * Scrape events from Do512's public pages for the upcoming weekend.
 * Fetches one page per day (Fri, Sat, Sun) to get comprehensive coverage.
 */
export async function scrapeDo512Events(): Promise<EventsResult> {
  const weekendDates = getWeekendDates()
  const allEvents: Do512Event[] = []

  // Fetch each day in parallel
  const dayResults = await Promise.allSettled(weekendDates.map((date) => scrapeDo512Day(date)))

  for (const result of dayResults) {
    if (result.status === 'fulfilled') {
      allEvents.push(...result.value)
    }
  }

  // Deduplicate by name + venue (events can span multiple days)
  const seen = new Set<string>()
  const unique = allEvents.filter((e) => {
    const key = `${e.name}|${e.venue}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const startStr = weekendDates[0] ? formatDateStr(weekendDates[0]) : ''
  const endStr = weekendDates[weekendDates.length - 1]
    ? formatDateStr(weekendDates[weekendDates.length - 1]!)
    : ''

  return {
    events: unique.sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    weekendStart: startStr,
    weekendEnd: endStr,
    totalScraped: allEvents.length,
    source: unique.length > 0 ? 'do512' : 'none',
    fetchedAt: new Date().toISOString(),
  }
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Scrape events for a single day from Do512.
 * URL format: https://do512.com/events/2026/2/14
 */
async function scrapeDo512Day(date: Date): Promise<Do512Event[]> {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // Do512 uses 1-indexed months without padding
  const day = date.getDate()

  const url = `https://do512.com/events/${year}/${month}/${day}`

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) {
    throw new Error(`Do512 returned ${response.status} for ${url}`)
  }

  const html = await response.text()
  return parseDo512Html(html, date)
}

/**
 * Parse Do512's event listing HTML into structured events.
 *
 * HTML patterns (verified Feb 2026):
 *   Card:  <div class="ds-listing event-card ds-event-category-live-music">
 *   Title: <span class="ds-listing-event-title-text" itemprop="name">Event Name</span>
 *   Venue: <a href="/venues/venue-slug"><span itemprop="name">Venue Name</span></a>
 *   Time:  <div class="ds-event-time dtstart">7:30PM</div>
 *   URL:   <a href="/events/2026/2/14/event-slug-tickets" itemprop="url">
 *   Image: <div class="ds-cover-image" style="background-image:url('...');">
 */
function parseDo512Html(html: string, date: Date): Do512Event[] {
  const events: Do512Event[] = []
  const dateStr = formatDateStr(date)

  // Split HTML into event card blocks
  // Each card starts with: <div ... class="ds-listing event-card ds-event-category-..."
  const cardPattern =
    /<div[^>]*class="ds-listing event-card ds-event-category-([^"]+)"[^>]*>([\s\S]*?)(?=<div[^>]*class="ds-listing event-card|<div class="ds-events-group|<div class="ds-display-ad|<footer|$)/gi
  let match: RegExpExecArray | null

  while ((match = cardPattern.exec(html)) !== null) {
    const do512Cat = match[1] ?? 'other'
    const cardHtml = match[2] ?? ''

    // Extract event name
    const nameMatch = cardHtml.match(/ds-listing-event-title-text[^>]*>([^<]+)/)
    const name = nameMatch?.[1]?.trim()
    if (!name) continue

    // Extract venue name (Schema.org itemprop="name" inside venue link)
    const venueMatch = cardHtml.match(
      /<a[^>]*href="\/venues\/[^"]*"[^>]*>\s*<span[^>]*itemprop="name"[^>]*>([^<]+)/,
    )
    const venue = venueMatch?.[1]?.trim() ?? 'TBA'

    // Extract time
    const timeMatch = cardHtml.match(/ds-event-time[^>]*>([^<]+)/)
    const time = timeMatch?.[1]?.trim() ?? ''

    // Extract URL
    const urlMatch = cardHtml.match(/href="(\/events\/[^"]+)"/)
    const eventPath = urlMatch?.[1] ?? ''

    // Extract image
    const imgMatch = cardHtml.match(/ds-cover-image[^>]*style="background-image:url\('([^']+)'\)/)
    const imageUrl = imgMatch?.[1] ?? ''

    // Check if free event (has "WIN" button or "FREE" tag)
    const isFree = /ds-btn-win|FREE/i.test(cardHtml)

    // Build human-readable date string
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const dayNum = date.getDate()
    const dateDisplay = time
      ? `${dayName}, ${monthName} ${dayNum} at ${time}`
      : `${dayName}, ${monthName} ${dayNum}`

    events.push({
      name,
      date: dateDisplay,
      dateISO: `${dateStr}T${parseTime(time)}`,
      venue,
      category: mapDo512Category(do512Cat),
      url: eventPath ? `https://do512.com${eventPath}` : '',
      isFree,
      imageUrl,
    })
  }

  return events
}

/**
 * Parse time string like "7:30PM" into 24-hour format for ISO sorting.
 */
function parseTime(time: string): string {
  if (!time) return '00:00:00'

  const match = time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i)
  if (!match) return '00:00:00'

  let hours = parseInt(match[1] ?? '0', 10)
  const minutes = match[2] ?? '00'
  const ampm = match[3]?.toUpperCase()

  if (ampm === 'PM' && hours < 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0

  return `${String(hours).padStart(2, '0')}:${minutes}:00`
}
