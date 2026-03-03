<script setup lang="ts">
/**
 * /events/sxsw/ — SXSW Guide
 *
 * Structured guide page for South by Southwest — Austin's biggest
 * annual festival. Covers dates, conference tracks, survival tips,
 * venues, and local insider knowledge.
 *
 * First live child page under the Events category, driven by
 * Search Radar keyword: "sxsw austin" (14,800 monthly volume).
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('events')!
const siblings = category.subApps.filter((a) => a.slug !== 'sxsw')
const crossLinks = categories.value.filter((c) => c.slug !== 'events').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'SXSW 2026 Guide — Dates, Tips & Survival Guide for South by Southwest',
  description:
    'Complete SXSW guide for Austin — 2026 dates, badge info, free shows, venue map, survival tips, and local insider knowledge for South by Southwest.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('events'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'SXSW 2026 Guide — Dates, Tips & Survival Guide for South by Southwest',
    description:
      'Your complete guide to SXSW in Austin, Texas — dates, conference tracks, badge info, survival tips, iconic venues, and local recommendations.',
  }),
  {
    '@type': 'Event',
    name: 'SXSW 2026 — South by Southwest',
    startDate: '2026-03-07',
    endDate: '2026-03-15',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Austin Convention Center',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '500 E Cesar Chavez St',
        addressLocality: 'Austin',
        addressRegion: 'TX',
        postalCode: '78701',
        addressCountry: 'US',
      },
    },
    description:
      "South by Southwest (SXSW) is Austin's biggest annual festival — a convergence of tech, film, and music with 400,000+ attendees over 9 days.",
    organizer: {
      '@type': 'Organization',
      name: 'SXSW LLC',
      url: 'https://www.sxsw.com',
    },
  },
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'When is SXSW 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SXSW 2026 runs from March 7–15, 2026 in Austin, Texas.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a badge for SXSW?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Badges provide access to official panels, screenings, and events. However, hundreds of free unofficial shows, parties, and activations are open to the public — no badge required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is SXSW free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Official SXSW badges range from $895 to $1,895+. However, much of the SXSW experience — unofficial shows, brand activations, food events, and street performances — is completely free.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is SXSW held?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SXSW is centered around the Austin Convention Center downtown, with events spread across 100+ venues on and around East 6th Street, Rainey Street, Red River Cultural District, and South Congress.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best way to get around during SXSW?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Walk, bike, or use scooters for downtown venues. Rideshares surge heavily — expect 3-5x pricing. The MetroRail and CapMetro buses run extended hours. Avoid driving downtown entirely.',
        },
      },
    ],
  },
])

// ── Key facts ──────────────────────────────────────────────
const keyFacts = [
  { icon: 'i-lucide-calendar', label: 'Dates', value: 'March 7–15, 2026' },
  { icon: 'i-lucide-map-pin', label: 'Location', value: 'Austin, TX' },
  { icon: 'i-lucide-users', label: 'Attendance', value: '300,000+' },
  { icon: 'i-lucide-history', label: 'Founded', value: '1987' },
]

// ── Conference tracks ──────────────────────────────────────
const tracks = [
  {
    icon: 'i-lucide-music',
    title: 'Music',
    description:
      '2,000+ artists across 100+ venues. The largest music festival in the world by number of acts.',
    color: 'text-primary dark:text-muted',
    bgColor: 'bg-muted dark:bg-elevated/30',
  },
  {
    icon: 'i-lucide-film',
    title: 'Film & TV',
    description:
      'World premieres, screenings, and panels from independent to major studio releases.',
    color: 'text-primary dark:text-muted',
    bgColor: 'bg-muted dark:bg-elevated/30',
  },
  {
    icon: 'i-lucide-cpu',
    title: 'Interactive',
    description:
      'Tech, AI, startups, gaming, and the future of digital culture. The conference that launched Twitter.',
    color: 'text-primary dark:text-muted',
    bgColor: 'bg-muted dark:bg-elevated/30',
  },
  {
    icon: 'i-lucide-mic',
    title: 'Comedy',
    description:
      'Stand-up showcases, sketch, improv, and podcast tapings from established and emerging comedians.',
    color: 'text-primary dark:text-muted',
    bgColor: 'bg-muted dark:bg-elevated/30',
  },
  {
    icon: 'i-lucide-graduation-cap',
    title: 'SXSWedu',
    description:
      'Education innovation and learning design — the education-focused conference-within-a-conference.',
    color: 'text-primary dark:text-muted',
    bgColor: 'bg-muted dark:bg-elevated/30',
  },
]

// ── Survival tips ──────────────────────────────────────────
const survivalTips = [
  {
    icon: 'i-lucide-footprints',
    tip: 'Wear comfortable shoes.',
    detail: "You'll walk 10–15 miles per day across downtown. Blisters are the #1 SXSW injury.",
  },
  {
    icon: 'i-lucide-droplets',
    tip: 'Hydrate constantly.',
    detail:
      'March in Austin can hit 85°F. Carry a water bottle — free refill stations are everywhere.',
  },
  {
    icon: 'i-lucide-battery-charging',
    tip: 'Bring a portable charger.',
    detail:
      'Your phone is your schedule, map, and ride. It will die by 2pm without a backup battery.',
  },
  {
    icon: 'i-lucide-ear',
    tip: 'Pack earplugs.',
    detail: "Venues are loud. Protect your hearing and you'll last the full 9 days.",
  },
  {
    icon: 'i-lucide-sun',
    tip: 'Sunscreen is non-negotiable.',
    detail: "Even in March, the Austin sun is intense. You'll be outside more than you think.",
  },
  {
    icon: 'i-lucide-bike',
    tip: 'Skip the rideshare.',
    detail:
      'Surge pricing makes Uber/Lyft 3-5x normal. Walk, bike, or scooter between venues downtown.',
  },
  {
    icon: 'i-lucide-ticket',
    tip: 'RSVP to everything early.',
    detail:
      'Free unofficial events fill up fast. RSVP on Do512, Eventbrite, and brand sites weeks ahead.',
  },
  {
    icon: 'i-lucide-utensils',
    tip: 'Eat outside the convention center.',
    detail:
      'Walk 3 blocks in any direction for better, cheaper food. East 6th, Rainey, and food trucks are your friends.',
  },
]

// ── Iconic venues ──────────────────────────────────────────
const venues = [
  {
    name: 'Austin Convention Center',
    type: 'Conference Hub',
    description: 'Ground zero for Interactive and Film panels, keynotes, and the trade show floor.',
  },
  {
    name: 'Stubbs BBQ',
    type: 'Music',
    description:
      'Legendary outdoor amphitheater. Home to the biggest SXSW showcases and after-parties.',
  },
  {
    name: 'Mohawk',
    type: 'Music',
    description:
      'Indoor/outdoor Red River venue. Three stages of rock, punk, hip-hop, and electronic acts.',
  },
  {
    name: 'The Paramount Theatre',
    type: 'Film',
    description: 'Historic 1915 theater for world premiere screenings and celebrity Q&As.',
  },
  {
    name: "Emo's",
    type: 'Music',
    description: "East Riverside staple for punk, metal, and indie showcases since the '90s.",
  },
  {
    name: 'Palmer Events Center',
    type: 'Interactive',
    description:
      'Exhibition hall for the SXSW Trade Show, startup pitches, and immersive experiences.',
  },
]

// ── FAQ items ───────────────────────────────────────────────
const faqItems = [
  {
    label: 'When is SXSW 2026?',
    content:
      'SXSW 2026 runs from March 7–15, 2026 in Austin, Texas. The Interactive and Film conferences kick off first, with Music running through the final weekend.',
  },
  {
    label: 'Do I need a badge for SXSW?',
    content:
      'Badges provide access to official panels, screenings, and events. However, hundreds of free unofficial shows, parties, and activations are open to the public — no badge or wristband required. The "unofficial SXSW" is often better than the official one.',
  },
  {
    label: 'How much does an SXSW badge cost?',
    content:
      'Badge prices vary: Music badges start around $895, Interactive around $1,495, and Platinum (all-access) around $1,895. Early-bird pricing is significantly cheaper — register by October for the best rates.',
  },
  {
    label: 'Is SXSW free?',
    content:
      "Much of the SXSW experience is free. Brand activations, unofficial showcases, food pop-ups, and day parties don't require a badge. Hundreds of free events are listed on Do512, Eventbrite, and social media in the weeks before the festival.",
  },
  {
    label: 'Where is SXSW held?',
    content:
      'SXSW is centered around the Austin Convention Center downtown, with events spread across 100+ venues on and around East 6th Street, Rainey Street, Red River Cultural District, and South Congress Avenue.',
  },
  {
    label: 'What is the best way to get around during SXSW?',
    content:
      'Walk, bike, or use scooters for downtown venues. Rideshares surge heavily — expect 3-5x pricing during peak hours. The MetroRail and CapMetro buses run extended hours. Pedicabs are fun for short hops. Avoid driving downtown entirely.',
  },
  {
    label: 'What should I wear to SXSW?',
    content:
      "Comfortable shoes are the #1 priority — you'll walk 10-15 miles daily. Dress in layers (mornings are cool, afternoons warm). Sunscreen and sunglasses for outdoor events. Austin dress code is casual — jeans and boots work everywhere.",
  },
]

// ── Insider tips ────────────────────────────────────────────
const insiderTips = [
  {
    icon: 'i-lucide-compass',
    title: 'Skip 6th Street at night',
    detail:
      'Dirty Sixth is chaos during SXSW. Head to Rainey Street, East Austin, or South Congress for better vibes and shorter lines.',
  },
  {
    icon: 'i-lucide-star',
    title: 'The best shows are free',
    detail:
      'Brands like Spotify, Hulu, and Verizon throw massive free events with A-list performers. RSVP early on Do512.',
  },
  {
    icon: 'i-lucide-clock',
    title: 'Day parties > night shows',
    detail:
      'The 11am–5pm day party circuit is the signature SXSW experience. Multiple free events with open bars and surprise guests.',
  },
  {
    icon: 'i-lucide-map',
    title: 'Stay east of I-35',
    detail:
      "East Austin has the best food, the best bars, and the best unofficial events — plus it's walkable to the Convention Center.",
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
              SXSW Guide
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          South by Southwest is Austin's biggest annual festival — a 9-day collision of music, film,
          tech, and culture that takes over the entire city every March. Here's everything you need
          to know.
        </p>
      </div>

      <!-- ══════ Key Facts ══════ -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 animate-fade-up-delay-1">
        <div
          v-for="fact in keyFacts"
          :key="fact.label"
          class="flex flex-col items-center text-center p-4 rounded-2xl border border-default bg-default"
        >
          <div
            class="flex items-center justify-center size-10 rounded-xl mb-2"
            :class="category.bgColor"
          >
            <UIcon :name="fact.icon" class="size-5" :class="category.color" />
          </div>
          <span class="text-xs font-bold uppercase tracking-wider text-dimmed mb-1">{{
            fact.label
          }}</span>
          <span class="text-sm font-bold">{{ fact.value }}</span>
        </div>
      </section>

      <!-- ══════ What is SXSW? ══════ -->
      <section class="mb-10 animate-fade-up-delay-1">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">What is SXSW?</h2>
          <div class="text-sm text-muted leading-relaxed space-y-3">
            <p>
              <strong class="text-default">South by Southwest (SXSW)</strong> is the world's largest
              convergence of music, film, and interactive media. Founded in 1987 by Austin Chronicle
              co-founder Roland Swenson, it started as a regional music showcase and grew into a
              global cultural phenomenon.
            </p>
            <p>
              Today SXSW draws over
              <strong class="text-default">300,000 attendees</strong> annually. The Interactive
              conference has become one of the most important tech events in the world — it's where
              Twitter was launched in 2007, Foursquare in 2009, and where AI, VR, and emerging tech
              companies debut every year.
            </p>
            <p>
              The Music festival features
              <strong class="text-default">2,000+ artists</strong> across 100+ venues in what is
              effectively the largest music festival on the planet by number of acts. Meanwhile, the
              Film festival has premiered Oscar winners including <em>Moonlight</em>,
              <em>Bridesmaids</em>, and <em>Us</em>.
            </p>
          </div>
        </div>
      </section>

      <!-- ══════ Conference Tracks ══════ -->
      <section class="mb-10 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Conference Tracks
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="track in tracks"
            :key="track.title"
            class="p-5 rounded-2xl border border-default bg-default"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="flex items-center justify-center size-10 rounded-xl"
                :class="track.bgColor"
              >
                <UIcon :name="track.icon" class="size-5" :class="track.color" />
              </div>
              <h3 class="text-sm font-bold">{{ track.title }}</h3>
            </div>
            <p class="text-xs text-muted leading-relaxed">{{ track.description }}</p>
          </div>
        </div>
      </section>

      <!-- ══════ Survival Tips ══════ -->
      <section class="mb-10 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">Survival Tips</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="item in survivalTips"
            :key="item.tip"
            class="flex items-start gap-3 p-4 rounded-xl border border-default bg-default"
          >
            <UIcon :name="item.icon" class="size-5 shrink-0 mt-0.5" :class="category.color" />
            <div>
              <p class="text-sm font-semibold mb-0.5">{{ item.tip }}</p>
              <p class="text-xs text-muted leading-relaxed">{{ item.detail }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ Iconic Venues ══════ -->
      <section class="mb-10 animate-fade-up-delay-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Iconic SXSW Venues
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="venue in venues"
            :key="venue.name"
            class="p-4 rounded-xl border border-default bg-default"
          >
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-sm font-bold">{{ venue.name }}</h3>
              <UBadge :label="venue.type" color="neutral" variant="subtle" size="xs" />
            </div>
            <p class="text-xs text-muted leading-relaxed">{{ venue.description }}</p>
          </div>
        </div>
      </section>

      <!-- ══════ Local Insider Tips ══════ -->
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

      <!-- ══════ FAQ ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Frequently Asked Questions
        </h2>
        <UAccordion :items="faqItems" multiple />
      </section>

      <!-- ══════ Official Link ══════ -->
      <section class="mb-10">
        <div class="flex items-center gap-3 p-4 rounded-xl border border-default bg-default">
          <UIcon name="i-lucide-external-link" class="size-5 shrink-0" :class="category.color" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold">Official SXSW Website</p>
            <p class="text-xs text-muted">
              Full schedule, badge registration, and official programming.
            </p>
          </div>
          <UButton
            to="https://www.sxsw.com"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            color="neutral"
            size="sm"
            label="Visit"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </div>
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
