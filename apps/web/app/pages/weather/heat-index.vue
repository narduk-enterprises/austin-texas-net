<!-- eslint-disable atx/no-raw-tailwind-colors -- NWS heat-index / wind-chill scale colors -->
<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /weather/heat-index/ — Austin Heat Index & Feels-Like Tracker
 *
 * Shows the current heat index or wind chill (seasonal) with
 * safety tips and hourly feels-like temperature trends.
 */
import type { NwsCurrentConditions, NwsForecastPeriod } from '~~/server/utils/nws'

import { formatTimestamp } from '~/utils/formatTimestamp'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('weather')!
const siblings = category.subApps.filter((a) => a.slug !== 'heat-index')
const crossLinks = categories.value.filter((c) => c.slug !== 'weather').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

useSeo({
  title: 'Austin Heat Index — Feels-Like Temperature & Safety Tips',
  description:
    'Current heat index and feels-like temperature for Austin, TX. Includes wind chill in winter, heat safety levels, and protection tips.',
  ogImage: {
    category: category.title,
      },
})

useWebPageSchema({
    name: 'Austin Heat Index — Feels-Like Temperature & Safety Tips',
    description: 'Heat index and feels-like temperature tracker for Austin, Texas.',
  })

const { data: currentData } = await useFetch<{
  conditions: NwsCurrentConditions | null
}>('/api/weather/current')

const { data: forecastData } = await useFetch<{
  periods: NwsForecastPeriod[]
}>('/api/weather/forecast')

const conditions = computed(() => currentData.value?.conditions ?? null)
const forecast = computed(() => forecastData.value?.periods ?? [])

// Determine if it's a heat or cold situation
const isHeatSeason = computed(() => {
  const temp = conditions.value?.temperature
  if (temp === null || temp === undefined) return true
  return temp >= 50
})

const feelsLike = computed(() => {
  if (!conditions.value) return null
  return conditions.value.feelsLike ?? conditions.value.temperature
})

// Heat/cold safety level
const safetyLevel = computed(() => {
  const fl = feelsLike.value
  if (fl === null)
    return { level: 'Unknown', color: 'neutral' as const, icon: 'i-lucide-thermometer' }

  if (isHeatSeason.value) {
    if (fl >= 125)
      return { level: 'Extreme Danger', color: 'error' as const, icon: 'i-lucide-flame' }
    if (fl >= 105)
      return { level: 'Danger', color: 'error' as const, icon: 'i-lucide-alert-triangle' }
    if (fl >= 90)
      return {
        level: 'Extreme Caution',
        color: 'warning' as const,
        icon: 'i-lucide-alert-triangle',
      }
    if (fl >= 80) return { level: 'Caution', color: 'warning' as const, icon: 'i-lucide-info' }
    return { level: 'Comfortable', color: 'success' as const, icon: 'i-lucide-check-circle' }
  } else {
    if (fl <= 0)
      return { level: 'Extreme Cold', color: 'error' as const, icon: 'i-lucide-snowflake' }
    if (fl <= 15) return { level: 'Very Cold', color: 'error' as const, icon: 'i-lucide-snowflake' }
    if (fl <= 32)
      return { level: 'Cold — Freeze Risk', color: 'warning' as const, icon: 'i-lucide-snowflake' }
    if (fl <= 45)
      return { level: 'Chilly', color: 'info' as const, icon: 'i-lucide-thermometer-snowflake' }
    return { level: 'Comfortable', color: 'success' as const, icon: 'i-lucide-check-circle' }
  }
})

// Safety tips based on season and feels-like
const safetyTips = computed(() => {
  if (isHeatSeason.value) {
    const fl = feelsLike.value ?? 80
    const base = [
      { icon: 'i-lucide-droplets', text: 'Stay hydrated — drink water before you feel thirsty.' },
      { icon: 'i-lucide-sun', text: 'Wear sunscreen, hat, and light-colored clothing outdoors.' },
      { icon: 'i-lucide-clock', text: 'Avoid strenuous activity during peak sun (10am–4pm).' },
    ]
    if (fl >= 105) {
      return [
        {
          icon: 'i-lucide-house',
          text: 'Stay indoors in air conditioning. This is dangerous heat.',
        },
        { icon: 'i-lucide-car', text: 'Never leave children or pets in parked vehicles.' },
        ...base,
      ]
    }
    return base
  } else {
    return [
      { icon: 'i-lucide-shirt', text: 'Dress in layers — Austin cold snaps can drop fast.' },
      {
        icon: 'i-lucide-droplets',
        text: 'Protect pipes — drip faucets when temps dip below 28°F.',
      },
      {
        icon: 'i-lucide-car',
        text: 'Watch for ice on bridges and overpasses, especially I-35 and MoPac.',
      },
      { icon: 'i-lucide-home', text: 'Bring pets indoors when wind chill drops below freezing.' },
    ]
  }
})

// Upcoming high temperatures from forecast
const upcomingTemps = computed(() => {
  return forecast.value
    .filter((p) => p.isDaytime)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      high: p.temperature,
      conditions: p.shortForecast,
    }))
})
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <!-- Header -->
      <!-- Breadcrumbs -->
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />

      <div class="flex items-center gap-3 mb-8 animate-fade-up">
        <div class="flex items-center justify-center size-12 rounded-2xl" :class="category.bgColor">
          <UIcon :name="category.icon" class="size-6" :class="category.color" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
            {{ isHeatSeason ? 'Heat Index' : 'Wind Chill' }}
          </h1>
        </div>
      </div>

      <!-- Hero: Feels-Like Temperature -->
      <section v-if="conditions" class="weather-hero mb-10 animate-fade-up-delay-1">
        <div class="text-center sm:text-left">
          <div class="text-6xl sm:text-7xl font-extrabold font-display tracking-tight mb-2">
            {{ feelsLike ?? '--' }}<span class="text-3xl font-bold text-muted">°F</span>
          </div>
          <p class="text-sm text-muted mb-1">
            {{ isHeatSeason ? 'Heat Index' : 'Wind Chill' }} · Actual temp
            {{ conditions.temperature }}°F
          </p>
          <div class="flex items-center gap-2 mt-3">
            <UBadge
              :color="safetyLevel.color"
              variant="subtle"
              size="md"
              :icon="safetyLevel.icon"
              :label="safetyLevel.level"
            />
          </div>
          <p class="text-xs text-dimmed mt-3">
            Updated {{ formatTimestamp(conditions.timestamp) }}
          </p>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-base text-muted leading-relaxed">
            <template v-if="isHeatSeason">
              The heat index combines air temperature and humidity to show what the temperature
              <strong class="text-default">actually feels like</strong> on your body. In Austin's
              humid summers, the heat index can exceed the actual temperature by 10–20°F.
            </template>
            <template v-else>
              The wind chill factor combines air temperature and wind speed to show the
              <strong class="text-default">perceived temperature</strong> on exposed skin. Austin's
              occasional northers can make moderate cold feel dangerously bitter.
            </template>
          </p>
        </div>
      </section>

      <!-- Loading -->
      <section v-else class="text-center py-16 mb-10">
        <UIcon name="i-lucide-loader" class="size-10 text-muted animate-spin mb-4" />
        <p class="text-muted">Loading weather data…</p>
      </section>

      <!-- Current Details -->
      <section
        v-if="conditions"
        class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 animate-fade-up-delay-2"
      >
        <div
          class="flex flex-col items-center gap-2 rounded-xl border border-default bg-default p-4 text-center"
        >
          <UIcon name="i-lucide-thermometer" class="size-5 text-muted" />
          <span class="text-xs font-bold uppercase tracking-widest text-dimmed">Actual Temp</span>
          <span class="text-lg font-extrabold font-display"
            >{{ conditions.temperature ?? '--' }}°F</span
          >
        </div>
        <div
          class="flex flex-col items-center gap-2 rounded-xl border border-default bg-default p-4 text-center"
        >
          <UIcon name="i-lucide-droplets" class="size-5 text-muted" />
          <span class="text-xs font-bold uppercase tracking-widest text-dimmed">Humidity</span>
          <span class="text-lg font-extrabold font-display"
            >{{ conditions.humidity ?? '--' }}%</span
          >
        </div>
        <div
          class="flex flex-col items-center gap-2 rounded-xl border border-default bg-default p-4 text-center"
        >
          <UIcon name="i-lucide-wind" class="size-5 text-muted" />
          <span class="text-xs font-bold uppercase tracking-widest text-dimmed">Wind</span>
          <span class="text-lg font-extrabold font-display">{{ conditions.windSpeed }}</span>
        </div>
        <div
          class="flex flex-col items-center gap-2 rounded-xl border border-default bg-default p-4 text-center"
        >
          <UIcon name="i-lucide-thermometer-sun" class="size-5 text-muted" />
          <span class="text-xs font-bold uppercase tracking-widest text-dimmed">Dew Point</span>
          <span class="text-lg font-extrabold font-display"
            >{{ conditions.dewpoint ?? '--' }}°F</span
          >
        </div>
      </section>

      <!-- Upcoming Highs -->
      <section v-if="upcomingTemps.length" class="mb-10 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">Upcoming Highs</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            v-for="day in upcomingTemps"
            :key="day.name"
            class="flex flex-col items-center gap-2 rounded-xl border border-default bg-default p-4 text-center"
          >
            <span class="text-sm font-bold">{{ day.name }}</span>
            <span class="text-2xl font-extrabold font-display">{{ day.high }}°F</span>
            <span class="text-xs text-muted">{{ day.conditions }}</span>
          </div>
        </div>
      </section>

      <!-- Safety Tips -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          {{ isHeatSeason ? 'Heat Safety Tips' : 'Cold Weather Tips' }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(tip, i) in safetyTips"
            :key="i"
            class="flex items-start gap-3 p-4 rounded-xl border border-default bg-default"
          >
            <UIcon :name="tip.icon" class="size-5 shrink-0 mt-0.5" :class="category.color" />
            <p class="text-sm text-muted leading-relaxed">{{ tip.text }}</p>
          </div>
        </div>
      </section>

      <!-- Heat Index Scale -->
      <section class="mb-10 animate-fade-up-delay-3">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">
            {{ isHeatSeason ? 'NWS Heat Index Scale' : 'Wind Chill Scale' }}
          </h2>
          <div v-if="isHeatSeason" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="flex items-center gap-2 p-2 rounded-lg">
              <div class="size-3 rounded-full shrink-0 bg-elevated" />
              <div>
                <span class="text-xs font-bold">Comfortable</span>
                <span class="text-[0.65rem] text-dimmed ml-1">&lt; 80°F</span>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 rounded-lg">
              <div class="size-3 rounded-full shrink-0 bg-elevated" />
              <div>
                <span class="text-xs font-bold">Caution</span>
                <span class="text-[0.65rem] text-dimmed ml-1">80–90°F</span>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 rounded-lg">
              <div class="size-3 rounded-full shrink-0 bg-elevated" />
              <div>
                <span class="text-xs font-bold">Extreme Caution</span>
                <span class="text-[0.65rem] text-dimmed ml-1">90–105°F</span>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 rounded-lg">
              <div class="size-3 rounded-full shrink-0 bg-elevated" />
              <div>
                <span class="text-xs font-bold">Danger</span>
                <span class="text-[0.65rem] text-dimmed ml-1">105°F+</span>
              </div>
            </div>
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="flex items-center gap-2 p-2 rounded-lg">
              <div class="size-3 rounded-full shrink-0 bg-elevated" />
              <div>
                <span class="text-xs font-bold">Comfortable</span>
                <span class="text-[0.65rem] text-dimmed ml-1">&gt; 45°F</span>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 rounded-lg">
              <div class="size-3 rounded-full shrink-0 bg-elevated" />
              <div>
                <span class="text-xs font-bold">Chilly</span>
                <span class="text-[0.65rem] text-dimmed ml-1">32–45°F</span>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 rounded-lg">
              <div class="size-3 rounded-full shrink-0 bg-elevated" />
              <div>
                <span class="text-xs font-bold">Cold — Freeze Risk</span>
                <span class="text-[0.65rem] text-dimmed ml-1">15–32°F</span>
              </div>
            </div>
            <div class="flex items-center gap-2 p-2 rounded-lg">
              <div class="size-3 rounded-full shrink-0 bg-elevated" />
              <div>
                <span class="text-xs font-bold">Extreme Cold</span>
                <span class="text-[0.65rem] text-dimmed ml-1">&lt; 15°F</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- More in Weather -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Weather</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/weather/${app.slug}/`"
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

      <!-- Explore More -->
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

<style scoped>
.weather-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 24px;
  border-radius: 20px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

@media (min-width: 640px) {
  .weather-hero {
    flex-direction: row;
    padding: 36px 40px;
    gap: 40px;
  }
}

:is(.dark) .weather-hero {
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
}
</style>
