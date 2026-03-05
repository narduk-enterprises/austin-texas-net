<script setup lang="ts">
/**
 * /outdoors/swimming-holes/ — Best Swimming Holes Near Austin
 *
 * Guide to natural swimming spots in the Austin area — springs,
 * creek pools, and Hill Country swimming holes.
 *
 * Search Radar keyword: "best swimming holes austin tx" (8,100 monthly volume)
 */


const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('outdoors')!
const siblings = category.subApps.filter((a) => a.slug !== 'swimming-holes')
const crossLinks = categories.value.filter((c) => c.slug !== 'outdoors').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

useSeo({
  title: 'Best Swimming Holes Near Austin, Texas — Springs, Pools & Natural Water',
  description:
    "Complete guide to the best swimming holes near Austin — Barton Springs, Hamilton Pool, Jacob's Well, Krause Springs, and hidden gems with hours, fees, and tips.",
  ogImage: {
    category: category.title,
      },
})

useSchemaOrg([
  defineWebPage({
    name: 'Best Swimming Holes Near Austin, Texas — Springs, Pools & Natural Water',
    description:
      "Guide to natural swimming spots near Austin including Barton Springs Pool, Hamilton Pool Preserve, Jacob's Well, and Krause Springs.",
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best swimming hole near Austin?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Barton Springs Pool is Austin's crown jewel — a 68°F spring-fed pool right in Zilker Park. For a more adventurous experience, Hamilton Pool Preserve (45 min west) features a dramatic grotto with a 50-foot waterfall cascading into a natural pool.",
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a reservation for Hamilton Pool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — Hamilton Pool requires advance reservations through the Travis County Parks website. Reservations open 30 days in advance and sell out within minutes. $15 per vehicle. Swimming may be restricted when bacteria levels are high.',
        },
      },
    ],
  },
])

// ── Swimming Holes ──────────────────────────────────────────
interface SwimmingHole {
  name: string
  distance: string
  waterTemp: string
  fee: string
  features: string[]
  tip: string
  reservation: string
}

const spots: SwimmingHole[] = [
  {
    name: 'Barton Springs Pool',
    distance: 'In Austin (Zilker Park)',
    waterTemp: '68–70°F year-round',
    fee: '$5 adults / $3 juniors / Free early morning',
    reservation: 'No reservation needed',
    features: [
      'Iconic 3-acre, spring-fed pool in the heart of Zilker Park',
      'Crystal-clear water maintains 68°F year-round — even in summer',
      'Historic bathhouse with lounging areas and diving board',
      'The unofficial soul of Austin — locals have been swimming here since the 1800s',
    ],
    tip: "Go before 8am for free entry and the pool almost to yourself. South bank (the grassy side) is the locals' spot. The cold plunge effect is addictive — you'll be back.",
  },
  {
    name: 'Hamilton Pool Preserve',
    distance: '45 min west of Austin',
    waterTemp: '50–75°F (seasonal)',
    fee: '$15/vehicle + reservation required',
    reservation: 'Mandatory — book 30 days ahead on Travis County Parks website',
    features: [
      'Dramatic collapsed grotto with 50-foot waterfall cascading into a jade pool',
      'One of the most photographed natural sites in Texas',
      'Short 0.25-mile trail descends into the canyon',
      'Swimming availability depends on bacteria testing — check before going',
    ],
    tip: 'Set a calendar reminder for exactly 30 days before your visit — reservations sell out in minutes. Morning slots get the best light for photos. Bring water shoes for the rocky bottom.',
  },
  {
    name: "Jacob's Well",
    distance: '50 min southwest (Wimberley)',
    waterTemp: '68°F year-round',
    fee: '$9/person + reservation required',
    reservation: 'Mandatory — book online through Hays County',
    features: [
      'Crystal-clear artesian spring emerging from a 140-foot vertical cave',
      'Second longest underwater cave in Texas — 4,500+ feet mapped',
      'The water is so clear you can see 30+ feet down into the cave opening',
      'Surrounded by lush cypress trees in the Texas Hill Country',
    ],
    tip: "The water is COLD — 68°F hits different when you're swimming over a 140-foot abyss. There's a 30-minute session limit per group. Weekday mornings have the fewest people. Do NOT attempt to dive into the cave — multiple deaths on record.",
  },
  {
    name: 'Krause Springs',
    distance: '45 min west (Spicewood)',
    waterTemp: '68°F year-round',
    fee: '$9/person (cash only)',
    reservation: 'No reservation — first come, first served',
    features: [
      'Private spring-fed natural pool with rope swings and waterfalls',
      'Multiple pools at different levels surrounded by ancient cypress trees',
      'Camping available overnight with shaded tent sites',
      'One of the few remaining old-school swimming holes — no reservations needed',
    ],
    tip: "Cash only — there's no ATM. Arrive by 10am on summer weekends or you'll wait. The lower pool is more scenic; the upper pool is warmer. Bring your own food — there are no concessions.",
  },
  {
    name: 'Blue Hole (Wimberley)',
    distance: '50 min southwest (Wimberley)',
    waterTemp: '72°F (summer)',
    fee: '$9/person + reservation required',
    reservation: 'Mandatory — book via City of Wimberley',
    features: [
      'Spring-fed section of Cypress Creek with ancient cypress trees',
      'Wide, calm swimming area with grassy banks and picnic areas',
      'Small-town charm in the heart of Wimberley',
      'One of the most beautiful natural swimming spots in the Hill Country',
    ],
    tip: 'The rope swing is an Austin-area rite of passage. Go on a weekday to avoid the crowd. The creek flows best in spring — by late summer it can be low.',
  },
  {
    name: 'Sculpture Falls (Barton Creek Greenbelt)',
    distance: 'In Austin (Greenbelt)',
    waterTemp: '65–80°F (seasonal)',
    fee: 'Free',
    reservation: 'No reservation needed',
    features: [
      'Natural limestone waterfall and swimming hole on Barton Creek',
      'Wide, flat rock formations perfect for lounging',
      'Reached via a 1.5-mile hike from the Gus Fruh trailhead',
      "Austin's best free swimming hole — the Greenbelt's crown jewel",
    ],
    tip: "Check flow levels before going — if Barton Creek is below 30 CFS at Lost Creek gauge, the falls won't be flowing. After heavy rain, the water is muddy but the flow is spectacular. Don't bring glass containers.",
  },
  {
    name: 'Deep Eddy Pool',
    distance: 'In Austin (West Austin)',
    waterTemp: '68–70°F year-round',
    fee: '$4 adults / $2 juniors',
    reservation: 'No reservation needed',
    features: [
      'Oldest swimming pool in Texas — operating since 1915',
      'Fed by an artesian well with consistent 68°F water',
      'Large main pool + separate wading pool for kids',
      'Lap swimming, lounging, and a beloved local tradition',
    ],
    tip: 'Deep Eddy is less crowded than Barton Springs and has better shade. Free splash movie nights on summer Thursdays. The pool closes for cleaning on specific days — check the schedule before going.',
  },
]

// ── Safety Tips ─────────────────────────────────────────────
const safetyTips = [
  {
    icon: 'i-lucide-droplets',
    tip: 'Check water levels first',
    detail:
      'Austin swimming holes are fed by creeks and springs. After drought, many can be stagnant or dry. Use LCRA flow data.',
  },
  {
    icon: 'i-lucide-cloud-rain',
    tip: 'Never swim after heavy rain',
    detail:
      'Flash floods happen fast in Central Texas. High water = high bacteria counts. Wait 48 hours after major rain.',
  },
  {
    icon: 'i-lucide-skull',
    tip: 'Know the depth before diving',
    detail:
      'Submerged rocks and shifting creek beds cause serious injuries every year. Never dive headfirst into an unknown area.',
  },
  {
    icon: 'i-lucide-sun',
    tip: 'Sunscreen + hydration are essential',
    detail:
      "You'll burn faster near water from reflection. Bring SPF 50+ and more water than you think you'll need.",
  },
]

// ── FAQ items ───────────────────────────────────────────────
const faqItems = [
  {
    label: 'What is the best swimming hole near Austin?',
    content:
      "Barton Springs Pool is Austin's best and most accessible — a 3-acre, 68°F spring-fed pool in Zilker Park. For a dramatic natural experience, Hamilton Pool Preserve's collapsed grotto with a 50-foot waterfall is unforgettable (reservation required). Jacob's Well in Wimberley has the clearest water — you can see 30 feet down into the cave.",
  },
  {
    label: 'Which Austin swimming holes are free?',
    content:
      'The Barton Creek Greenbelt swimming holes (Sculpture Falls, Twin Falls, Gus Fruh) are completely free. Barton Springs Pool is free before 8am. Deep Eddy offers discounted rates. Everything else has an entrance fee ranging from $5–$15.',
  },
  {
    label: 'When is the best time to swim in Austin?',
    content:
      "May through September is prime swimming season. Spring-fed pools (Barton Springs, Deep Eddy, Jacob's Well) maintain 68°F year-round, making them swimmable even in winter for the bold. The Greenbelt swimming holes depend on rainfall — best after spring rains, potentially dry by late summer.",
  },
  {
    label: 'Do I need reservations for swimming holes near Austin?',
    content:
      "Hamilton Pool, Jacob's Well, and Blue Hole all require advance reservations. Barton Springs, Deep Eddy, and Krause Springs are walk-up. Greenbelt swimming holes are free and unrestricted. Book Hamilton Pool exactly 30 days ahead — slots sell out in minutes.",
  },
  {
    label: 'Are Austin swimming holes safe for kids?',
    content:
      "Barton Springs and Deep Eddy have shallow areas and lifeguards — great for families. The Greenbelt holes have no lifeguards and uneven rocky bottoms. Krause Springs and Blue Hole are family-friendly with gradual entries. Jacob's Well is NOT recommended for young children due to the open cave and cold water.",
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
              Best Swimming Holes Near Austin
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          From spring-fed pools to hidden Hill Country swimming holes, Austin has some of the best
          natural water in Texas. Here's every spot you need to know — with hours, fees, and the
          local tips that make the difference.
        </p>
      </div>

      <!-- ══════ Swimming Hole Cards ══════ -->
      <section class="space-y-4 mb-10">
        <div
          v-for="(spot, idx) in spots"
          :key="spot.name"
          class="rounded-2xl border border-default bg-default p-6 sm:p-8"
          :class="`animate-fade-up-delay-${Math.min(idx + 1, 3)}`"
        >
          <h2 class="text-lg font-bold mb-2">{{ spot.name }}</h2>
          <div class="flex flex-wrap gap-4 text-xs text-muted mb-4">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-map-pin" class="size-3.5" />
              {{ spot.distance }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-thermometer" class="size-3.5" />
              {{ spot.waterTemp }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-ticket" class="size-3.5" />
              {{ spot.fee }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-calendar" class="size-3.5" />
              {{ spot.reservation }}
            </span>
          </div>

          <ul class="space-y-1.5 mb-4">
            <li
              v-for="feature in spot.features"
              :key="feature"
              class="flex items-start gap-2 text-sm"
            >
              <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5" :class="category.color" />
              <span class="text-muted">{{ feature }}</span>
            </li>
          </ul>

          <div class="flex items-start gap-2 p-3 rounded-xl bg-elevated text-xs">
            <UIcon
              name="i-lucide-lightbulb"
              class="size-4 shrink-0 mt-0.5"
              :class="category.color"
            />
            <span class="text-muted"
              ><strong class="text-default">Insider tip:</strong> {{ spot.tip }}</span
            >
          </div>
        </div>
      </section>

      <!-- ══════ Safety Tips ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">Swimming Safety</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="tip in safetyTips"
            :key="tip.tip"
            class="flex items-start gap-3 p-4 rounded-xl border border-default bg-default"
          >
            <UIcon :name="tip.icon" class="size-5 shrink-0 mt-0.5" :class="category.color" />
            <div>
              <p class="text-sm font-semibold mb-0.5">{{ tip.tip }}</p>
              <p class="text-xs text-muted leading-relaxed">{{ tip.detail }}</p>
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

      <!-- ══════ More in Outdoors ══════ -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in Outdoors
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/outdoors/${app.slug}/`"
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
