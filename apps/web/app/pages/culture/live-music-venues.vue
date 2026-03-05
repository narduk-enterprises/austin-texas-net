<script setup lang="ts">
/**
 * /culture/live-music-venues/ — Best Live Music Venues in Austin
 *
 * Guide to Austin's iconic live music venues — from legendary stages
 * to dive bars, organized by neighborhood and genre.
 *
 * Search Radar keyword: "best live music venues austin texas" (9,900 monthly volume)
 */



const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('culture')!
const siblings = category.subApps.filter((a) => a.slug !== 'live-music-venues')
const crossLinks = categories.value.filter((c) => c.slug !== 'culture').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

useSeo({
  title: 'Best Live Music Venues in Austin — The Live Music Capital Guide',
  description:
    "Complete guide to Austin's best live music venues — from legendary stages like Stubbs and Continental Club to hidden gems on Red River. Find shows by genre and neighborhood.",
  ogImage: {
    category: category.title,
  },
})

useWebPageSchema({
  name: 'Best Live Music Venues in Austin — The Live Music Capital Guide',
  description:
    'Comprehensive guide to live music venues in Austin, Texas — from iconic stages to dive bars, organized by neighborhood and genre.',
})

useFAQSchema([
  {
    question: 'Where can I see free live music in Austin?',
    answer: "Most bars on 6th Street have free live music nightly. The Saxon Pub, C-Boy's Heart & Soul, and Continental Club often have no cover on weeknights. Blues on the Green at Zilker Park is a free summer concert series. Many East Austin bars like Moontower Saloon offer free music.",
  },
  {
    question: 'What is the most famous music venue in Austin?',
    answer: "The Continental Club on South Congress is Austin's most iconic venue, operating since 1955. Stubbs BBQ is the most famous for major concerts. Antone's is the legendary blues venue. The Broken Spoke is the last great Texas honky-tonk.",
  },
])

// ── Venue data ──────────────────────────────────────────────
interface Venue {
  name: string
  neighborhood: string
  genres: string[]
  vibe: string
  highlights: string[]
  coverCharge: string
  capacity: string
}

const venues: Venue[] = [
  {
    name: 'Continental Club',
    neighborhood: 'South Congress',
    genres: ['Rock', 'Country', 'Blues', 'Rockabilly'],
    vibe: 'Legendary dive bar with nightly live music since 1955',
    highlights: [
      "Austin's most iconic music venue — the Continental is sacred ground",
      'Dale Watson residency — country royalty plays here regularly',
      'Happy Hour shows are free and often the best sets of the night',
      'Upstairs gallery hosts jazz, funk, and experimental acts',
    ],
    coverCharge: 'Free – $20 depending on the night',
    capacity: '200',
  },
  {
    name: 'Stubbs BBQ',
    neighborhood: 'Red River',
    genres: ['Rock', 'Hip-Hop', 'Country', 'Electronic'],
    vibe: 'Legendary outdoor amphitheater + indoor stage + world-class BBQ',
    highlights: [
      '2,100-capacity outdoor amphitheater under the Texas sky',
      'Sunday Gospel Brunch — all-you-can-eat BBQ and live gospel music',
      'Major touring acts — from Willie Nelson to Billie Eilish',
      'Indoor stage for intimate shows alongside the main amphitheater',
    ],
    coverCharge: '$20 – $75+ for major acts',
    capacity: '2,100 outdoor / 350 indoor',
  },
  {
    name: 'Mohawk',
    neighborhood: 'Red River',
    genres: ['Indie', 'Punk', 'Electronic', 'Hip-Hop'],
    vibe: 'Three-stage Red River anchor with rooftop views',
    highlights: [
      'Indoor stage, outdoor stage, and rooftop — three shows in one night',
      'Heart of the Red River Cultural District music scene',
      'Free parking lot shows on many weeknights',
      'Best lineup curation in Austin for indie and emerging acts',
    ],
    coverCharge: 'Free – $30',
    capacity: '1,000 total across all stages',
  },
  {
    name: "Antone's Nightclub",
    neighborhood: 'East 5th Street',
    genres: ['Blues', 'R&B', 'Soul', 'Rock'],
    vibe: 'Austin\'s "Home of the Blues" since 1975',
    highlights: [
      'Founded by Clifford Antone — hosted Stevie Ray Vaughan, B.B. King, James Brown',
      'The spiritual home of Austin blues culture',
      'Intimate 300-cap room with perfect sight lines',
      'Still books the best blues, soul, and R&B acts in the country',
    ],
    coverCharge: '$10 – $40',
    capacity: '300',
  },
  {
    name: 'The Broken Spoke',
    neighborhood: 'South Lamar',
    genres: ['Country', 'Western Swing', 'Two-Step'],
    vibe: 'Last great Texas honky-tonk — sawdust floors since 1964',
    highlights: [
      'Real-deal honky-tonk — Bob Wills, Willie Nelson, George Strait have all played here',
      'Free two-step dance lessons before the live band starts',
      'Chicken-fried steak dinners in the attached restaurant',
      "James White built it in 1964 and it hasn't changed since",
    ],
    coverCharge: '$5 – $15',
    capacity: '350',
  },
  {
    name: "C-Boy's Heart & Soul",
    neighborhood: 'South Congress',
    genres: ['Blues', 'Soul', 'Funk', 'R&B'],
    vibe: 'Intimate South Congress joint specializing in blues and soul',
    highlights: [
      'Soul Man Sam hosts a legendary soul revue on Tuesdays',
      'Adjacent to Continental Club — do both in one night',
      "Intimate room where you're 10 feet from the stage",
      "Best blues and soul programming in Austin after Antone's",
    ],
    coverCharge: 'Free – $15',
    capacity: '150',
  },
  {
    name: 'The Parish',
    neighborhood: 'East 6th Street',
    genres: ['Indie', 'Electronic', 'Hip-Hop', 'Rock'],
    vibe: 'Upstairs venue on 6th with the best sound in downtown',
    highlights: [
      'Elevated stage with excellent acoustics and sight lines',
      'Perfect mid-size venue for emerging touring acts',
      'Upstairs location keeps out the Dirty Sixth bar-crawl crowd',
      'Regular DJ nights and electronic music events',
    ],
    coverCharge: '$10 – $30',
    capacity: '450',
  },
  {
    name: 'Saxon Pub',
    neighborhood: 'South Lamar',
    vibe: "The songwriter's living room — Austin's best listening room",
    genres: ['Americana', 'Folk', 'Singer-Songwriter'],
    highlights: [
      'The definitive Austin songwriter venue — intimate and respectful',
      "Songwriters' open mic and acoustic showcases nightly",
      "Bob Schneider's long-running residency",
      'No-nonsense listening room where the music comes first',
    ],
    coverCharge: 'Free – $15',
    capacity: '150',
  },
  {
    name: 'ACL Live at The Moody Theater',
    neighborhood: 'West 2nd Street',
    genres: ['All Genres'],
    vibe: 'Home of Austin City Limits TV — the iconic PBS taping venue',
    highlights: [
      'Home of the longest-running music TV show in American history',
      'Free tapings of Austin City Limits — apply for tickets online',
      'Major concert venue for A-list touring acts',
      'State-of-the-art 2,750-seat theater with perfect acoustics',
    ],
    coverCharge: '$30 – $100+',
    capacity: '2,750',
  },
]

// ── Neighborhoods ───────────────────────────────────────────
const neighborhoods = [
  {
    name: 'Red River Cultural District',
    description:
      'The indie music epicenter. Mohawk, Stubbs, Chess Club, Empire, and Cheer Up Charlies within walking distance.',
    icon: 'i-lucide-guitar',
  },
  {
    name: 'South Congress',
    description:
      "Continental Club, C-Boy's, and the Saxon Pub — legendary stages with local character.",
    icon: 'i-lucide-music',
  },
  {
    name: 'East 6th Street',
    description:
      'The newer, cooler 6th — The Parish, Volstead, and craft cocktail bars with DJ nights.',
    icon: 'i-lucide-headphones',
  },
  {
    name: 'Dirty Sixth',
    description:
      'College bar chaos with free live music at 20+ venues nightly. Skip after midnight on weekends.',
    icon: 'i-lucide-beer',
  },
]

// ── FAQ items ───────────────────────────────────────────────
const faqItems = [
  {
    label: 'Where can I see free live music in Austin?',
    content:
      "Most bars on 6th Street have free live music nightly with no cover charge. Continental Club, C-Boy's, and Saxon Pub often have free shows on weeknights. The Red River Cultural District (Mohawk's parking lot shows) offers free music regularly. In summer, Blues on the Green at Zilker Park is a free concert series.",
  },
  {
    label: 'What night is best for live music in Austin?',
    content:
      "Thursday, Friday, and Saturday have the most options. However, locals prefer Tuesday through Thursday — smaller crowds, lower cover charges, and often better acts. Many iconic residencies (Soul Man Sam at C-Boy's, Dale Watson at Continental Club) happen mid-week.",
  },
  {
    label: 'What makes Austin the "Live Music Capital of the World"?',
    content:
      'Austin has more live music venues per capita than any other city — over 250 venues host live music on any given night. The title was officially adopted in 1991 by the Texas Legislature. The culture is rooted in the 1970s "Cosmic Cowboy" movement, Willie Nelson\'s move from Nashville, and the PBS show Austin City Limits.',
  },
  {
    label: 'How do I find out what shows are happening tonight?',
    content:
      "Do512 (do512.com) is the best events aggregator. The Austin Chronicle's music listings are comprehensive. Showlist Austin (showlistaustin.com) tracks every live show. For venue-specific listings, follow venues on Instagram — most post their weekly lineup every Monday.",
  },
  {
    label: 'Which Austin venue has the best sound?',
    content:
      "ACL Live at The Moody Theater has the best acoustics — it was purpose-built for the PBS show. For smaller venues, The Parish and Antone's are known for excellent sound. Saxon Pub's intimate room is perfect for singer-songwriters. Stubbs outdoor amphitheater is unbeatable for the atmosphere.",
  },
]
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <!-- Breadcrumbs -->
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />

      <!-- ══════ Header ══════ -->
      <div class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="flex items-center justify-center size-12 rounded-2xl"
            :class="category.bgColor"
          >
            <UIcon :name="category.icon" class="size-6" :class="category.color" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Best Live Music Venues in Austin
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Austin is the Live Music Capital of the World — with 250+ venues hosting shows on any
          given night. From legendary honky-tonks to world-class amphitheaters, here's your complete
          venue guide.
        </p>
      </div>

      <!-- ══════ Venue Cards ══════ -->
      <section class="space-y-4 mb-10">
        <div
          v-for="(venue, idx) in venues"
          :key="venue.name"
          class="rounded-2xl border border-default bg-default p-6 sm:p-8"
          :class="`animate-fade-up-delay-${Math.min(idx + 1, 3)}`"
        >
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <h2 class="text-lg font-bold">{{ venue.name }}</h2>
            <UBadge :label="venue.neighborhood" color="neutral" variant="subtle" size="xs" />
          </div>
          <p class="text-sm text-muted mb-3">{{ venue.vibe }}</p>

          <div class="flex flex-wrap gap-1.5 mb-4">
            <UBadge
              v-for="genre in venue.genres"
              :key="genre"
              :label="genre"
              color="primary"
              variant="subtle"
              size="xs"
            />
          </div>

          <ul class="space-y-1.5 mb-4">
            <li
              v-for="highlight in venue.highlights"
              :key="highlight"
              class="flex items-start gap-2 text-sm"
            >
              <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5" :class="category.color" />
              <span class="text-muted">{{ highlight }}</span>
            </li>
          </ul>

          <div class="flex flex-wrap gap-4 text-xs text-muted">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-ticket" class="size-3.5" />
              Cover: {{ venue.coverCharge }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-users" class="size-3.5" />
              Capacity: {{ venue.capacity }}
            </span>
          </div>
        </div>
      </section>

      <!-- ══════ Music Neighborhoods ══════ -->
      <section class="mb-10 animate-fade-up-delay-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Music Neighborhoods
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="hood in neighborhoods"
            :key="hood.name"
            class="flex items-start gap-3 p-5 rounded-2xl border border-default bg-elevated"
          >
            <div
              class="flex items-center justify-center size-10 rounded-xl shrink-0"
              :class="category.bgColor"
            >
              <UIcon :name="hood.icon" class="size-5" :class="category.color" />
            </div>
            <div>
              <h3 class="text-sm font-bold mb-1">{{ hood.name }}</h3>
              <p class="text-xs text-muted leading-relaxed">{{ hood.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ FAQ ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Frequently Asked Questions
        </h2>
        <UAccordion :items="faqItems" multiple />
      </section>

      <!-- ══════ More in Culture ══════ -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Culture</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/culture/${app.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div>
              <h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3>
              <p class="text-xs text-muted line-clamp-1">{{ app.description }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-3">
              <UBadge
                :color="app.status === 'live' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
                :label="app.status === 'live' ? 'Live' : 'Coming Soon'"
              />
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4 text-dimmed group-hover:text-primary transition-colors"
              />
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- ══════ Explore More ══════ -->
      <section class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30"
          >
            <UIcon :name="c.icon" class="size-4" :class="c.color" />
            <span class="text-sm font-medium">{{ c.title }}</span>
          </NuxtLink>
        </div>
      </section>
    </UContainer>
  </div>
</template>
