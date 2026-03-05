<!-- eslint-disable atx/no-raw-tailwind-colors -- NWS severity + freeze-risk indicator colors -->
<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /weather/freeze-alerts/ — Austin Freeze Alert Tracker
 *
 * Freeze warnings, pipe protection alerts, and winter weather
 * status for Austin from NWS data.
 */
import type { NwsCurrentConditions, NwsAlert, NwsForecastPeriod } from '~~/server/utils/nws'

import { formatTimestamp } from '~/utils/formatTimestamp'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('weather')!
const siblings = category.subApps.filter((a) => a.slug !== 'freeze-alerts')
const crossLinks = categories.value.filter((c) => c.slug !== 'weather').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

useSeo({
  title: 'Austin Freeze Alerts — Winter Weather Warnings & Pipe Protection',
  description:
    'Austin freeze alerts and winter weather status. Track freeze warnings, frost advisories, and pipe protection alerts for Central Texas.',
  ogImage: {
    category: category.title,
      },
})

useWebPageSchema({
    name: 'Austin Freeze Alerts — Winter Weather Warnings & Pipe Protection',
    description: 'Freeze warning and winter weather tracker for Austin, Texas.',
  })

const { data: currentData } = await useFetch<{
  conditions: NwsCurrentConditions | null
  alerts: NwsAlert[]
}>('/api/weather/current')

const { data: forecastData } = await useFetch<{
  periods: NwsForecastPeriod[]
}>('/api/weather/forecast')

const conditions = computed(() => currentData.value?.conditions ?? null)
const alerts = computed(() => currentData.value?.alerts ?? [])
const forecast = computed(() => forecastData.value?.periods ?? [])

// Filter for freeze/winter-specific alerts
const freezeAlerts = computed(() => {
  return alerts.value.filter((a) => {
    const e = a.event.toLowerCase()
    return (
      e.includes('freeze') ||
      e.includes('frost') ||
      e.includes('winter') ||
      e.includes('ice') ||
      e.includes('cold') ||
      e.includes('wind chill') ||
      e.includes('blizzard') ||
      e.includes('sleet')
    )
  })
})

// Freeze risk status
const freezeStatus = computed(() => {
  const temp = conditions.value?.temperature
  if (temp === null || temp === undefined) return { level: 'Unknown', color: 'neutral' as const }

  if (freezeAlerts.value.length > 0) return { level: 'Active Alert', color: 'error' as const }
  if (temp <= 28) return { level: 'Hard Freeze', color: 'error' as const }
  if (temp <= 32) return { level: 'Freezing', color: 'error' as const }
  if (temp <= 36) return { level: 'Near Freeze', color: 'warning' as const }
  if (temp <= 45) return { level: 'Chilly', color: 'info' as const }
  return { level: 'No Freeze Risk', color: 'success' as const }
})

// Find upcoming low temperatures from night periods
const upcomingLows = computed(() => {
  return forecast.value
    .filter((p) => !p.isDaytime)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      low: p.temperature,
      conditions: p.shortForecast,
      isFreezing: p.temperature <= 32,
    }))
})

// Pipe protection tips
const pipeProtectionTips = [
  {
    icon: 'i-lucide-droplets',
    text: 'Let faucets drip slightly (cold & hot) when temps drop below 28°F.',
  },
  {
    icon: 'i-lucide-home',
    text: 'Open cabinet doors under sinks to let warm air circulate around pipes.',
  },
  { icon: 'i-lucide-thermometer', text: 'Keep thermostat at 55°F or higher, even when away.' },
  {
    icon: 'i-lucide-wrench',
    text: 'Insulate exposed pipes in attics, garages, and along exterior walls.',
  },
  { icon: 'i-lucide-droplet-off', text: 'Disconnect and drain outdoor garden hoses.' },
  { icon: 'i-lucide-shield', text: 'Cover outdoor faucets with insulated faucet covers.' },
]
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <!-- Header -->
      <!-- Breadcrumbs -->
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />

      <div class="flex items-center gap-3 mb-8 animate-fade-up">
        <div class="flex items-center justify-center size-12 rounded-2xl" :class="category.bgColor">
          <UIcon name="i-lucide-snowflake" class="size-6" :class="category.color" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
            Freeze Alerts
          </h1>
        </div>
      </div>

      <!-- Active Freeze Alerts -->
      <section v-if="freezeAlerts.length > 0" class="mb-8 space-y-3 animate-fade-up">
        <div
          v-for="alert in freezeAlerts"
          :key="alert.id"
          class="rounded-xl border-2 border-default/40 bg-muted dark:bg-elevated/20 p-4"
        >
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-snowflake" class="size-5 shrink-0 mt-0.5 text-primary" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <UBadge color="error" variant="subtle" size="xs" :label="alert.event" />
                <span class="text-xs text-dimmed">{{ alert.senderName }}</span>
              </div>
              <p class="text-sm font-semibold mb-2">{{ alert.headline }}</p>
              <p v-if="alert.instruction" class="text-xs text-muted leading-relaxed">
                {{ alert.instruction }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Status Hero -->
      <section v-if="conditions" class="weather-hero mb-10 animate-fade-up-delay-1">
        <div class="text-center sm:text-left">
          <div class="flex items-center gap-3 mb-3">
            <UBadge
              :color="freezeStatus.color"
              variant="subtle"
              size="lg"
              icon="i-lucide-snowflake"
              :label="freezeStatus.level"
            />
          </div>
          <div class="text-5xl sm:text-6xl font-extrabold font-display tracking-tight mb-2">
            {{ conditions.temperature ?? '--'
            }}<span class="text-2xl font-bold text-muted">°F</span>
          </div>
          <p v-if="conditions.windChill !== null" class="text-sm text-muted">
            Wind chill: {{ conditions.windChill }}°F
          </p>
          <p class="text-xs text-dimmed mt-2">
            Updated {{ formatTimestamp(conditions.timestamp) }}
          </p>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-base text-muted leading-relaxed">
            Austin is generally warm, but <strong class="text-default">arctic cold fronts</strong>
            (locally called "blue northers") can drop temperatures 30–40°F in hours. The February
            2021 Winter Storm Uri brought record lows of -2°F and exposed the city's vulnerability
            to prolonged freezes. Monitor this page during winter weather events.
          </p>
        </div>
      </section>

      <!-- Loading -->
      <section v-else class="text-center py-16 mb-10">
        <UIcon name="i-lucide-loader" class="size-10 text-muted animate-spin mb-4" />
        <p class="text-muted">Loading weather data…</p>
      </section>

      <!-- Upcoming Overnight Lows -->
      <section v-if="upcomingLows.length" class="mb-10 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Upcoming Overnight Lows
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            v-for="night in upcomingLows"
            :key="night.name"
            class="flex flex-col items-center gap-2 rounded-xl border p-4 text-center"
            :class="
              night.isFreezing
                ? 'border-default/30 bg-muted dark:bg-elevated/20'
                : 'border-default bg-default'
            "
          >
            <span class="text-sm font-bold">{{ night.name }}</span>
            <span
              class="text-2xl font-extrabold font-display"
              :class="night.isFreezing ? 'text-primary dark:text-muted' : ''"
            >
              {{ night.low }}°F
            </span>
            <UBadge
              v-if="night.isFreezing"
              color="warning"
              variant="subtle"
              size="xs"
              label="Freeze Risk"
            />
            <span class="text-xs text-muted">{{ night.conditions }}</span>
          </div>
        </div>
      </section>

      <!-- Pipe Protection -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Pipe Protection Checklist
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(tip, i) in pipeProtectionTips"
            :key="i"
            class="flex items-start gap-3 p-4 rounded-xl border border-default bg-default"
          >
            <UIcon :name="tip.icon" class="size-5 shrink-0 mt-0.5 text-primary" />
            <p class="text-sm text-muted leading-relaxed">{{ tip.text }}</p>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="mb-10 animate-fade-up-delay-3">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">
            Austin Freeze Facts
          </h2>
          <div class="text-sm text-muted leading-relaxed space-y-3">
            <p>
              Austin averages <strong class="text-default">15–25 freezing nights per year</strong>,
              mostly between December and February. Most are brief overnight freezes that thaw by
              mid-morning.
            </p>
            <p>
              However, <strong class="text-default">hard freeze events</strong> (sustained
              temperatures below 28°F for 4+ hours) occur 2–5 times annually and pose the greatest
              risk to pipes, plants, and outdoor pets. Bridges and overpasses freeze first.
            </p>
            <p>
              The NWS issues <strong class="text-default">Freeze Warnings</strong> when temperatures
              are expected to drop to 32°F or below and
              <strong class="text-default">Hard Freeze Warnings</strong> for temperatures at or
              below 28°F.
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
</style>
