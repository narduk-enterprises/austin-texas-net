<!-- eslint-disable atx/no-raw-tailwind-colors -- NWS severity-level colors for alert indicators -->
<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /weather/current-conditions/ — Live Austin Weather
 *
 * Shows current conditions from NWS Camp Mabry station (KATT):
 * temperature, feels-like, humidity, wind, pressure, visibility,
 * dewpoint, and any active weather alerts.
 */
import type { NwsCurrentConditions, NwsAlert } from '~~/server/utils/nws'

import { getCategoryHexColor } from '~/utils/categoryHexColors'
import { getConditionIcon } from '~/utils/weatherIcons'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('weather')!
const siblings = category.subApps.filter((a) => a.slug !== 'current-conditions')
const crossLinks = categories.value.filter((c) => c.slug !== 'weather').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Weather Now — Current Conditions, Temperature & Wind',
  description:
    'Real-time Austin weather from NWS Camp Mabry — current temperature, humidity, wind speed, barometric pressure, and active weather alerts.',
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('weather'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Weather Now — Current Conditions, Temperature & Wind',
    description: 'Live weather conditions for Austin, Texas from the National Weather Service.',
  }),
])

const { data: weatherData } = await useFetch<{
  conditions: NwsCurrentConditions | null
  alerts: NwsAlert[]
}>('/api/weather/current')

const conditions = computed(() => weatherData.value?.conditions ?? null)
const alerts = computed(() => weatherData.value?.alerts ?? [])

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return ts
  }
}

function alertSeverityColor(severity: string): 'error' | 'warning' | 'info' | 'neutral' {
  if (severity === 'Extreme') return 'error'
  if (severity === 'Severe') return 'error'
  if (severity === 'Moderate') return 'warning'
  return 'info'
}

const statCards = computed(() => {
  const c = conditions.value
  if (!c) return []
  return [
    {
      label: 'Humidity',
      value: c.humidity !== null ? `${c.humidity}%` : 'N/A',
      icon: 'i-lucide-droplets',
    },
    { label: 'Wind', value: `${c.windSpeed} ${c.windDirection}`, icon: 'i-lucide-wind' },
    {
      label: 'Pressure',
      value: c.pressure !== null ? `${c.pressure} inHg` : 'N/A',
      icon: 'i-lucide-gauge',
    },
    { label: 'Visibility', value: c.visibility, icon: 'i-lucide-eye' },
    {
      label: 'Dew Point',
      value: c.dewpoint !== null ? `${c.dewpoint}°F` : 'N/A',
      icon: 'i-lucide-thermometer',
    },
    {
      label: 'Feels Like',
      value: c.feelsLike !== null ? `${c.feelsLike}°F` : 'N/A',
      icon: 'i-lucide-thermometer-sun',
    },
  ]
})
</script>

<template>
  <div>
    <SubAppTopbar title="Current Weather" />
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
      <!-- Header -->
      <div class="flex items-center gap-3 mb-8 animate-fade-up">
        <div class="flex items-center justify-center size-12 rounded-2xl" :class="category.bgColor">
          <UIcon :name="category.icon" class="size-6" :class="category.color" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
            Current Conditions
          </h1>
        </div>
      </div>

      <!-- Active Alerts Banner -->
      <section v-if="alerts.length > 0" class="mb-8 space-y-3 animate-fade-up">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="rounded-xl border-2 p-4"
          :class="{
            'border-red-500/40 bg-red-50 dark:bg-red-950/20':
              alert.severity === 'Extreme' || alert.severity === 'Severe',
            'border-amber-500/40 bg-amber-50 dark:bg-amber-950/20': alert.severity === 'Moderate',
            'border-sky-500/40 bg-sky-50 dark:bg-sky-950/20': alert.severity === 'Minor',
          }"
        >
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-alert-triangle" class="size-5 shrink-0 mt-0.5 text-amber-600" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <UBadge
                  :color="alertSeverityColor(alert.severity)"
                  variant="subtle"
                  size="xs"
                  :label="alert.event"
                />
                <span class="text-xs text-dimmed">{{ alert.senderName }}</span>
              </div>
              <p class="text-sm font-semibold mb-1">{{ alert.headline }}</p>
              <p v-if="alert.instruction" class="text-xs text-muted leading-relaxed">
                {{ alert.instruction }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Hero: Current Temperature -->
      <section v-if="conditions" class="weather-hero mb-10 animate-fade-up-delay-1">
        <div class="weather-hero-temp">
          <UIcon
            :name="getConditionIcon(conditions.description)"
            class="size-16 sm:size-20"
            :class="category.color"
          />
          <div class="text-6xl sm:text-7xl font-extrabold font-display tracking-tight">
            {{ conditions.temperature ?? '--'
            }}<span class="text-3xl font-bold text-muted">°F</span>
          </div>
        </div>
        <div class="weather-hero-info">
          <p class="text-lg sm:text-xl font-bold mb-1">{{ conditions.description }}</p>
          <p
            v-if="conditions.feelsLike !== null && conditions.feelsLike !== conditions.temperature"
            class="text-sm text-muted mb-2"
          >
            Feels like {{ conditions.feelsLike }}°F
          </p>
          <p class="text-xs text-dimmed">
            Updated {{ formatTimestamp(conditions.timestamp) }} · NWS Station
            {{ conditions.station }}
          </p>
        </div>
      </section>

      <!-- Loading state -->
      <section v-else class="text-center py-16 mb-10">
        <UIcon name="i-lucide-loader" class="size-10 text-muted animate-spin mb-4" />
        <p class="text-muted">Loading weather data…</p>
      </section>

      <!-- Stat Cards -->
      <section
        v-if="statCards.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10 animate-fade-up-delay-2"
      >
        <div
          v-for="stat in statCards"
          :key="stat.label"
          class="flex flex-col items-center gap-2 rounded-xl border border-default bg-default p-4 text-center"
        >
          <UIcon :name="stat.icon" class="size-5 text-muted" />
          <span class="text-xs font-bold uppercase tracking-widest text-dimmed">{{
            stat.label
          }}</span>
          <span class="text-lg font-extrabold font-display">{{ stat.value }}</span>
        </div>
      </section>

      <!-- About Section -->
      <section class="mb-10 animate-fade-up-delay-3">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">
            About Austin Weather
          </h2>
          <div class="text-sm text-muted leading-relaxed space-y-3">
            <p>
              Austin weather data is provided by the
              <strong class="text-default">National Weather Service</strong> from the
              <strong class="text-default">Camp Mabry observation station (KATT)</strong>, located
              in central Austin. This is the same station used by local media and emergency
              services.
            </p>
            <p>
              Austin's <strong class="text-default">subtropical climate</strong> features hot
              summers (100°F+ heat waves from June–September), mild winters with occasional ice
              storms, and unpredictable spring severe weather. Always check conditions before
              heading outdoors.
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

.weather-hero-temp {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.weather-hero-info {
  flex: 1;
  min-width: 0;
}
</style>
