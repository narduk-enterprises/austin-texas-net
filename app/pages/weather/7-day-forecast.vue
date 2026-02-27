<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /weather/7-day-forecast/ — Austin 7-Day Weather Forecast
 *
 * Shows the NWS extended forecast: 14 periods (7 day/night pairs)
 * with temperatures, wind, precipitation chances, and conditions.
 */
import type { NwsForecastPeriod } from '~~/server/utils/nws'

import { getCategoryHexColor } from '~/utils/categoryHexColors'
import { getConditionIcon } from '~/utils/weatherIcons'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('weather')!
const siblings = category.subApps.filter((a) => a.slug !== '7-day-forecast')
const crossLinks = categories.value.filter((c) => c.slug !== 'weather').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin 7-Day Forecast — Daily Highs, Lows & Conditions',
  description:
    'Austin 7-day weather forecast from the National Weather Service — daily temperatures, wind, precipitation chances, and detailed conditions.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('weather'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin 7-Day Forecast — Daily Highs, Lows & Conditions',
    description:
      'Extended weather forecast for Austin, Texas — daily and nightly conditions from the NWS.',
  }),
])

const { data: forecastData } = await useFetch<{
  periods: NwsForecastPeriod[]
}>('/api/weather/forecast')

const periods = computed(() => forecastData.value?.periods ?? [])

// Group into day/night pairs for card display
const dayPairs = computed(() => {
  const pairs: Array<{ day: NwsForecastPeriod; night: NwsForecastPeriod | null }> = []
  const p = periods.value
  let i = 0

  // Handle if first period is a night period
  if (p.length > 0 && !p[0]!.isDaytime) {
    pairs.push({ day: p[0]!, night: null })
    i = 1
  }

  while (i < p.length) {
    const day = p[i]!
    const night = i + 1 < p.length && !p[i + 1]!.isDaytime ? p[i + 1]! : null
    pairs.push({ day, night })
    i += night ? 2 : 1
  }

  return pairs
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
            7-Day Forecast
          </h1>
        </div>
      </div>

      <p
        class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed mb-8 animate-fade-up-delay-1"
      >
        Extended forecast for Austin from the
        <strong class="text-default">National Weather Service</strong>. Includes day and night
        conditions, precipitation chances, and wind.
      </p>

      <!-- Loading -->
      <section v-if="periods.length === 0" class="text-center py-16 mb-10">
        <UIcon name="i-lucide-loader" class="size-10 text-muted animate-spin mb-4" />
        <p class="text-muted">Loading forecast…</p>
      </section>

      <!-- Forecast Cards -->
      <section v-else class="space-y-4 mb-10 animate-fade-up-delay-1">
        <div
          v-for="(pair, idx) in dayPairs"
          :key="idx"
          class="rounded-2xl border border-default bg-default overflow-hidden transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
        >
          <!-- Day period -->
          <div class="flex items-start gap-4 p-4 sm:p-5">
            <div
              class="flex items-center justify-center size-12 rounded-xl shrink-0"
              :class="category.bgColor"
            >
              <UIcon
                :name="getConditionIcon(pair.day.shortForecast)"
                class="size-6"
                :class="category.color"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h2 class="text-base sm:text-lg font-extrabold font-display">
                  {{ pair.day.name }}
                </h2>
                <UBadge
                  v-if="pair.day.probabilityOfPrecipitation"
                  color="info"
                  variant="subtle"
                  size="xs"
                  :icon="'i-lucide-droplets'"
                  :label="`${pair.day.probabilityOfPrecipitation}%`"
                />
              </div>
              <div class="flex items-baseline gap-3 mb-2">
                <span class="text-3xl font-extrabold font-display">
                  {{ pair.day.temperature }}°{{ pair.day.temperatureUnit }}
                </span>
                <span v-if="pair.night" class="text-lg font-bold text-muted">
                  / {{ pair.night.temperature }}°{{ pair.night.temperatureUnit }}
                </span>
              </div>
              <p class="text-sm text-muted mb-1">{{ pair.day.shortForecast }}</p>
              <p class="text-xs text-dimmed">
                Wind {{ pair.day.windSpeed }} {{ pair.day.windDirection }}
              </p>
            </div>
          </div>

          <!-- Detailed forecast -->
          <div class="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-default pt-3">
            <p class="text-xs text-muted leading-relaxed">{{ pair.day.detailedForecast }}</p>
            <p v-if="pair.night" class="text-xs text-muted leading-relaxed mt-2">
              <strong class="text-dimmed">{{ pair.night.name }}:</strong>
              {{ pair.night.detailedForecast }}
            </p>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="mb-10 animate-fade-up-delay-3">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">
            About This Forecast
          </h2>
          <div class="text-sm text-muted leading-relaxed space-y-3">
            <p>
              This forecast is provided by the
              <strong class="text-default">NWS Austin/San Antonio office (EWX)</strong>
              and is the same data used by local TV stations and emergency management. It covers the
              greater Austin metro area.
            </p>
            <p>
              Forecasts are updated multiple times per day. For the most current short-term
              conditions, visit our
              <NuxtLink to="/weather/current-conditions/" class="text-primary hover:underline"
                >Current Conditions</NuxtLink
              >
              page.
            </p>
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
