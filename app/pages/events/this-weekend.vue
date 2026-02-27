<script setup lang="ts">
/**
 * /events/this-weekend/ — Things To Do in Austin This Weekend
 *
 * Curated guide to weekend events in Austin — live music, outdoor activities,
 * family-friendly picks, food events, and free things to do.
 *
 * Search Radar keyword: "things to do austin this weekend" (33,100 monthly volume)
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('events')!
const siblings = category.subApps.filter((a) => a.slug !== 'this-weekend')
const crossLinks = categories.value.filter((c) => c.slug !== 'events').slice(0, 4)

const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Things To Do in Austin This Weekend — Events, Music & Activities',
  description:
    "Your curated guide to what's happening in Austin this weekend — live music, outdoor activities, family events, food festivals, free things to do, and insider picks across ATX.",
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('events'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Things To Do in Austin This Weekend — Events, Music & Activities',
    description:
      'Comprehensive weekend guide to events, concerts, outdoor activities, and family-friendly things to do in Austin, Texas. Updated weekly.',
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is there to do in Austin this weekend?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Austin offers live music at 250+ venues, outdoor activities like kayaking on Lady Bird Lake and hiking Barton Creek Greenbelt, vibrant food truck parks, farmers markets, brewery tours, and seasonal festivals and events every weekend.',
        },
      },
      {
        '@type': 'Question',
        name: 'What free things can I do in Austin this weekend?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Free activities include live music on 6th Street, walking the Ann & Roy Butler Trail around Lady Bird Lake, visiting the Texas State Capitol, exploring murals on South Congress, the Barton Creek Greenbelt, sunset bat watching at Congress Avenue Bridge (seasonal), and free museum days.',
        },
      },
      {
        '@type': 'Question',
        name: 'What outdoor activities are available in Austin this weekend?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Austin offers year-round outdoor activities including swimming at Barton Springs Pool, kayaking and paddleboarding on Lady Bird Lake, hiking at the Barton Creek Greenbelt and Turkey Creek Trail, disc golf at Roy G. Guerrero, and cycling the extensive trail network.',
        },
      },
    ],
  },
])

// ── Weekend Activity Categories ─────────────────────────────
const weekendCategories = [
  {
    icon: 'i-lucide-guitar',
    title: 'Live Music',
    description:
      'Austin is the Live Music Capital of the World. Any given weekend, 250+ venues have live shows — from dive bars on Red River to amphitheaters on the lake.',
    highlights: [
      '6th Street — free cover most venues before 10pm',
      'Red River Cultural District — indie, punk, electronic',
      'Continental Club — legendary South Congress venue',
      "C-Boy's Heart & Soul — blues, funk, and soul on South Congress",
      'Broken Spoke — authentic Texas two-stepping since 1964',
    ],
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
  },
  {
    icon: 'i-lucide-sun',
    title: 'Outdoor Adventures',
    description:
      "With 300+ days of sunshine, Austin's outdoor scene delivers year-round. Trails, lakes, and greenbelts are just minutes from downtown.",
    highlights: [
      'Barton Springs Pool — 68°F spring-fed swimming year-round',
      'Lady Bird Lake — kayak, SUP, and the iconic hike-and-bike trail',
      'Barton Creek Greenbelt — 13 miles of hiking and swimming holes',
      'Mount Bonnell — best sunset views of Lake Austin',
      'McKinney Falls State Park — waterfalls 15 min from downtown',
    ],
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    icon: 'i-lucide-utensils',
    title: 'Food & Drink',
    description:
      "From legendary BBQ to inventive food trailers, Austin's culinary scene makes every weekend a food adventure.",
    highlights: [
      'Franklin Barbecue — worth the wait (get in line by 8am)',
      'Rainey Street — historic homes turned into bars and restaurants',
      "SFC Farmers' Market — Mueller and Sunset Valley, every Saturday",
      'South Congress food crawl — from tacos to Thai to brunch',
      'Craft breweries — Jester King, Pinthouse, Live Oak',
    ],
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    icon: 'i-lucide-baby',
    title: 'Family-Friendly',
    description:
      'Austin is one of the most family-friendly cities in Texas. From interactive museums to splash pads, kids never run out of things to do.',
    highlights: [
      "Thinkery — hands-on children's museum in Mueller",
      'Austin Zoo — small but kid-friendly in the hills off 290',
      'Peter Pan Mini Golf — an Austin institution since 1948',
      'Zilker Zephyr miniature train and Zilker Botanical Garden',
      'Splash pads — Mueller, Liz Carpenter, Butler Shores',
    ],
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30',
  },
  {
    icon: 'i-lucide-ticket',
    title: 'Free Things To Do',
    description:
      "You don't need to spend a dime to have a great weekend in Austin. Some of the best experiences are completely free.",
    highlights: [
      'Texas State Capitol tours — free, no reservation needed',
      'Congress Avenue Bridge bats — 1.5 million bats at sunset (Mar–Oct)',
      'Graffiti Park at Castle Hills — murals and street art',
      'Lady Bird Lake Trail — 10 miles of trail with skyline views',
      'Blues on the Green — free concert series at Zilker Park (summer)',
    ],
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    icon: 'i-lucide-palette',
    title: 'Arts & Culture',
    description:
      "Austin's creative spirit shines through its museums, galleries, theaters, and public art. Every weekend offers something inspiring.",
    highlights: [
      'Blanton Museum of Art — free on Thursdays, $12 weekends',
      'Bullock Texas State History Museum — IMAX and interactive exhibits',
      'South Congress mural walk — "I love you so much" wall and more',
      'The Contemporary Austin — modern art at Jones Center and Laguna Gloria',
      'Paramount Theatre — films, comedy, and live performances since 1915',
    ],
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bgColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
  },
]

// ── Seasonal Picks ──────────────────────────────────────────
const seasonalPicks = [
  {
    season: 'Spring (Mar–May)',
    icon: 'i-lucide-flower-2',
    picks: [
      'Bluebonnet season — peak blooms along 290 and 71',
      'SXSW free events and day parties (March)',
      'Pecan Street Festival (May)',
      'Kayaking Lady Bird Lake before summer heat',
    ],
  },
  {
    season: 'Summer (Jun–Aug)',
    icon: 'i-lucide-sun',
    picks: [
      'Barton Springs Pool — the ultimate 68°F escape',
      'Blues on the Green — free concerts at Zilker',
      'Float the San Marcos or Comal River',
      'Austin Ice Cream Festival (June)',
    ],
  },
  {
    season: 'Fall (Sep–Nov)',
    icon: 'i-lucide-leaf',
    picks: [
      'ACL Music Festival — two weekends in October',
      'Texas Book Festival (October)',
      'Dia de los Muertos celebrations on East César Chávez',
      'Formula 1 at Circuit of the Americas (COTA)',
    ],
  },
  {
    season: 'Winter (Dec–Feb)',
    icon: 'i-lucide-snowflake',
    picks: [
      'Trail of Lights at Zilker Park (December)',
      "Austin's New Year's Eve celebrations on 6th Street",
      'Cedar season survival — check pollen counts daily',
      'Rodeo Austin — livestock, music, and carnival (March)',
    ],
  },
]

// ── Insider Tips ────────────────────────────────────────────
const insiderTips = [
  {
    icon: 'i-lucide-clock',
    title: 'Saturday mornings are golden',
    detail:
      "Hit the SFC Farmers' Market by 9am, then walk to a coffee shop on South Congress. By 11am you're ready for brunch — no lines.",
  },
  {
    icon: 'i-lucide-map-pin',
    title: 'Skip 6th Street on Saturday night',
    detail:
      "It's packed and chaotic. Head to Rainey Street, East Austin, or South Congress for better food, drinks, and vibes.",
  },
  {
    icon: 'i-lucide-sun',
    title: 'The best hours are early and late',
    detail:
      'Summers are brutal 1-5pm. Plan outdoor activities before 11am or after 6pm. Indoor activities (museums, breweries) fill the gap.',
  },
  {
    icon: 'i-lucide-ticket',
    title: 'Check Do512 before every weekend',
    detail:
      'Do512.com is the best events calendar in Austin. Filter by free, family-friendly, or music to find hidden gems every weekend.',
  },
]

// ── FAQ items ───────────────────────────────────────────────
const faqItems = [
  {
    label: 'What is there to do in Austin this weekend?',
    content:
      'Austin offers live music at 250+ venues, outdoor activities like kayaking on Lady Bird Lake and hiking Barton Creek Greenbelt, vibrant food truck parks, farmers markets, brewery tours, and seasonal festivals every weekend. The best starting points are Do512 for events, East Austin for food, and South Congress for shopping and culture.',
  },
  {
    label: 'What free things can I do in Austin this weekend?',
    content:
      'Free activities include live music on Dirty Sixth (most venues have no cover before 10pm), walking the 10-mile Ann & Roy Butler Trail, touring the Texas State Capitol, exploring murals on South Congress and East Austin, hiking the Barton Creek Greenbelt, watching 1.5 million bats emerge from Congress Avenue Bridge at sunset (March–October), and free museum days at the Blanton.',
  },
  {
    label: 'Where can I see live music in Austin this weekend?',
    content:
      "Sixth Street has the highest concentration of live music venues with free admission. The Red River Cultural District (Mohawk, Empire, Chess Club) is the indie scene hub. Continental Club and C-Boy's on South Congress are legendary. Stubbs BBQ hosts major touring acts. For a uniquely Austin experience, try Broken Spoke for two-stepping or Antone's for blues.",
  },
  {
    label: 'What outdoor activities are available in Austin?',
    content:
      'Year-round: swimming at Barton Springs Pool (68°F), kayaking/paddleboarding Lady Bird Lake, hiking Barton Creek Greenbelt and Turkey Creek Trail, biking the Veloway, disc golf at Roy G. Guerrero, and running the Ann & Roy Butler Trail. Mount Bonnell is a quick hike with stunning sunset views. McKinney Falls offers waterfalls 15 minutes from downtown.',
  },
  {
    label: 'What are the best family activities in Austin this weekend?',
    content:
      "Top family picks include the Thinkery (children's museum in Mueller), Austin Zoo, Peter Pan Mini Golf, Zilker Botanical Garden, and splash pads at Mueller and Liz Carpenter. Zilker Park has open fields for picnics and the Zilker Zephyr train. The Austin Nature & Science Center is free. Many breweries are family-friendly during the day.",
  },
  {
    label: 'Where should I eat in Austin this weekend?',
    content:
      "For BBQ: Franklin (arrive by 8am) or Terry Black's (shorter line, similar quality). For tacos: Veracruz All Natural or Valentina's. For food trucks: the Picnic on Barton Springs Road or Cosmic Coffee on South Congress. For brunch: Bouldin Creek Café (vegetarian) or Jacoby's on the river. SFC Farmers' Market runs Saturday mornings.",
  },
]

// ── Useful Resources ────────────────────────────────────────
const resources = [
  {
    name: 'Do512',
    url: 'https://do512.com',
    description: "Austin's best events calendar — free events, concerts, and more",
  },
  {
    name: 'Austin Chronicle Events',
    url: 'https://www.austinchronicle.com/events/',
    description: "Comprehensive weekly events from Austin's alt-weekly",
  },
  {
    name: 'Visit Austin',
    url: 'https://www.austintexas.org',
    description: 'Official tourism guide with trip planning tools',
  },
]
</script>

<template>
  <div>
    <SubAppTopbar title="This Weekend" />
    <UContainer class="py-8 md:py-12">
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
              This Weekend in Austin
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Your curated guide to what's happening in Austin this weekend — live music, outdoor
          adventures, family events, food crawls, free things to do, and local insider picks.
        </p>
      </div>

      <!-- ══════ Weekend Activity Categories ══════ -->
      <section
        v-for="(cat, idx) in weekendCategories"
        :key="cat.title"
        class="mb-6"
        :class="`animate-fade-up-delay-${Math.min(idx + 1, 3)}`"
      >
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center justify-center size-10 rounded-xl" :class="cat.bgColor">
              <UIcon :name="cat.icon" class="size-5" :class="cat.color" />
            </div>
            <h2 class="text-lg font-bold">{{ cat.title }}</h2>
          </div>
          <p class="text-sm text-muted leading-relaxed mb-4">
            {{ cat.description }}
          </p>
          <ul class="space-y-2">
            <li
              v-for="highlight in cat.highlights"
              :key="highlight"
              class="flex items-start gap-2 text-sm"
            >
              <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5" :class="cat.color" />
              <span class="text-muted">{{ highlight }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- ══════ Seasonal Picks ══════ -->
      <section class="mb-10 animate-fade-up-delay-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Seasonal Highlights
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="season in seasonalPicks"
            :key="season.season"
            class="p-5 rounded-2xl border border-default bg-default"
          >
            <div class="flex items-center gap-2 mb-3">
              <UIcon :name="season.icon" class="size-5" :class="category.color" />
              <h3 class="text-sm font-bold">{{ season.season }}</h3>
            </div>
            <ul class="space-y-1.5">
              <li
                v-for="pick in season.picks"
                :key="pick"
                class="text-xs text-muted leading-relaxed flex items-start gap-1.5"
              >
                <span class="shrink-0 mt-1.5 size-1 rounded-full bg-current opacity-40" />
                {{ pick }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ══════ Insider Tips ══════ -->
      <section class="mb-10 animate-fade-up-delay-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Austin Insider Tips
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="tip in insiderTips"
            :key="tip.title"
            class="flex items-start gap-3 p-5 rounded-2xl border border-default bg-elevated"
          >
            <div
              class="flex items-center justify-center size-10 rounded-xl shrink-0"
              :class="category.bgColor"
            >
              <UIcon :name="tip.icon" class="size-5" :class="category.color" />
            </div>
            <div>
              <h3 class="text-sm font-bold mb-1">{{ tip.title }}</h3>
              <p class="text-xs text-muted leading-relaxed">{{ tip.detail }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ Useful Resources ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">Event Resources</h2>
        <div class="space-y-2">
          <div
            v-for="resource in resources"
            :key="resource.name"
            class="flex items-center gap-3 p-4 rounded-xl border border-default bg-default"
          >
            <UIcon name="i-lucide-external-link" class="size-5 shrink-0" :class="category.color" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold">{{ resource.name }}</p>
              <p class="text-xs text-muted">{{ resource.description }}</p>
            </div>
            <UButton
              :to="resource.url"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              color="neutral"
              size="sm"
              label="Visit"
              trailing-icon="i-lucide-arrow-up-right"
            />
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

      <!-- ══════ More in Events ══════ -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Events</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/events/${app.slug}/`"
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
