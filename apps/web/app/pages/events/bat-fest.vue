<script setup lang="ts">
import { viewingSpots } from '~/data/bat-spots'

const runtimeConfig = useRuntimeConfig()

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('events')!
const siblings = category.subApps.filter((a) => a.slug !== 'bat-fest')
const crossLinks = categories.value.filter((c) => c.slug !== 'events').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

const {
  coordinates,
  seasonStatus,
  countdownState,
  todayDateLabel,
  todaySunsetLabel,
  todayEmergenceLabel,
  recommendedArrivalLabel,
  weeklyForecast,
} = useBatBridgeData()

usePageSeo({
  title: 'Bat Bridge Sunset | Congress Ave Bat Emergence Countdown',
  description: 'Austin bat bridge countdown, tonight sunset timing, season status, best viewing spots, and a 7-day emergence outlook.',
})

const siteUrl = computed(() => (runtimeConfig.public.appUrl || 'https://austin-texas.net').replace(/\/$/, ''))

const attractionJsonLd = computed(() => {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: 'Congress Avenue Bridge Bat Colony',
    description: 'Nightly bat emergence viewing guide with sunset timing, season status, and Austin viewing locations.',
    url: siteUrl.value,
    isAccessibleForFree: true,
    touristType: ['Family travelers', 'Nature enthusiasts', 'Local visitors'],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Congress Avenue Bridge',
      addressLocality: 'Austin',
      addressRegion: 'TX',
      postalCode: '78704',
      addressCountry: 'US',
    },
    potentialAction: {
      '@type': 'ViewAction',
      target: siteUrl.value,
      name: 'Check tonight bat emergence forecast',
    },
  }
})

useHead(() => ({
  script: [
    {
      key: 'bat-bridge-jsonld',
      type: 'application/ld+json',
      children: JSON.stringify(attractionJsonLd.value),
    },
  ],
}))
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
              Congress Ave Bat Bridge Sunset
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Austin bat bridge countdown, tonight's sunset timing, season status, best viewing spots, and a 7-day emergence outlook.
        </p>
      </div>

      <div class="relative isolate min-h-full overflow-hidden rounded-2xl border border-default bg-default mb-10">
        <div aria-hidden="true" class="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden="true" class="pointer-events-none absolute -right-20 top-8 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
        <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-4 hidden justify-around px-6 md:flex">
          <UIcon name="i-lucide-bat" class="size-4 text-primary/35 bat-float" />
          <UIcon name="i-lucide-bat" class="size-3.5 text-primary/30 bat-float bat-float-delay" />
          <UIcon name="i-lucide-bat" class="size-4 text-primary/35 bat-float" />
        </div>

    <div class="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <BatCountdownHero
        :countdown-state="countdownState"
        :today-date-label="todayDateLabel"
        :today-sunset-label="todaySunsetLabel"
        :today-emergence-label="todayEmergenceLabel"
        :recommended-arrival-label="recommendedArrivalLabel"
        :season-status="seasonStatus"
      />

      <BatViewingSpotsMap :spots="viewingSpots" />

      <BatTipsSection />

      <BatWeeklyForecast :forecast="weeklyForecast" />

      <div class="pb-2 text-center text-xs text-dimmed sm:text-sm">
        Bat emergence estimates use Austin astronomical calculations (30.2672°N, 97.7431°W) with a +20 minute emergence offset.
      </div>
    </div>
  </div>

  <!-- ══════ More in Events ══════ -->
  <section v-if="siblings.length" class="mb-8">
    <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
      More in Events
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <NuxtLink
        v-for="app in siblings"
        :key="app.slug"
        :to="`/${category.slug}/${app.slug}/`"
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
