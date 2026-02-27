<!-- eslint-disable atx/no-raw-tailwind-colors -- NWS severity-level + radar UI colors -->
<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /weather/radar/ — Austin Weather Radar
 *
 * Embedded NWS NEXRAD radar viewer for Central Texas (KGRK station).
 * Also shows any active weather alerts.
 */
import type { NwsAlert } from '~~/server/utils/nws'
import { RADAR_STATION, RADAR_EMBED_URL, RADAR_FULL_URL } from '~~/server/utils/nws'

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('weather')!
const siblings = category.subApps.filter((a) => a.slug !== 'radar')
const crossLinks = categories.value.filter((c) => c.slug !== 'weather').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Weather Radar — Live NEXRAD Rain & Storm Tracker',
  description:
    'Live NEXRAD weather radar for Austin, TX. Track rain, thunderstorms, and severe weather in real-time across Central Texas.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('weather'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Weather Radar — Live NEXRAD Rain & Storm Tracker',
    description:
      'Live NEXRAD weather radar for Austin and Central Texas from the National Weather Service.',
  }),
])

const { data: alertData } = await useFetch<{ alerts: NwsAlert[] }>('/api/weather/alerts')
const alerts = computed(() => alertData.value?.alerts ?? [])

function alertSeverityColor(severity: string): 'error' | 'warning' | 'info' | 'neutral' {
  if (severity === 'Extreme' || severity === 'Severe') return 'error'
  if (severity === 'Moderate') return 'warning'
  return 'info'
}
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <!-- Breadcrumbs -->
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />

      <!-- Header -->
      <div class="flex items-center gap-3 mb-8 animate-fade-up">
        <div class="flex items-center justify-center size-12 rounded-2xl" :class="category.bgColor">
          <UIcon :name="category.icon" class="size-6" :class="category.color" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
            Weather Radar
          </h1>
        </div>
      </div>

      <p
        class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed mb-6 animate-fade-up-delay-1"
      >
        Live NEXRAD radar for Central Texas from station
        <strong class="text-default">{{ RADAR_STATION }}</strong
        >. Track rain, storms, and precipitation in real time.
      </p>

      <!-- Active Alerts -->
      <section v-if="alerts.length > 0" class="mb-6 space-y-3 animate-fade-up-delay-1">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="rounded-xl border-2 p-4"
          :class="{
            'border-default/40 bg-muted dark:bg-elevated/20':
              alert.severity === 'Extreme' || alert.severity === 'Severe',
            'border-default/40 bg-muted dark:bg-elevated/20': alert.severity === 'Moderate',
            'border-default/40 bg-muted dark:bg-elevated/20': alert.severity === 'Minor',
          }"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" class="size-4 text-primary shrink-0" />
            <UBadge
              :color="alertSeverityColor(alert.severity)"
              variant="subtle"
              size="xs"
              :label="alert.event"
            />
            <span class="text-sm font-semibold truncate">{{ alert.headline }}</span>
          </div>
        </div>
      </section>

      <!-- Radar Embed -->
      <section class="mb-10 animate-fade-up-delay-2">
        <div class="rounded-2xl border border-default overflow-hidden bg-elevated">
          <ClientOnly>
            <iframe
              :src="RADAR_EMBED_URL"
              title="NWS NEXRAD Radar — Central Texas"
              class="w-full border-0"
              style="height: 500px"
              loading="lazy"
              allowfullscreen
            />
            <template #fallback>
              <div class="flex items-center justify-center bg-elevated" style="height: 500px">
                <div class="text-center">
                  <UIcon name="i-lucide-radar" class="size-10 text-muted mb-2" />
                  <p class="text-sm text-muted">Loading radar…</p>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
        <div class="flex items-center justify-between mt-3">
          <p class="text-xs text-dimmed">
            Source: National Weather Service · Station {{ RADAR_STATION }}
          </p>
          <UButton
            :to="RADAR_FULL_URL"
            target="_blank"
            rel="noopener noreferrer"
            variant="link"
            size="xs"
            color="primary"
            label="Full-Screen Radar"
            icon="i-lucide-external-link"
          />
        </div>
      </section>

      <!-- About Radar -->
      <section class="mb-10 animate-fade-up-delay-3">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">
            About This Radar
          </h2>
          <div class="text-sm text-muted leading-relaxed space-y-3">
            <p>
              The <strong class="text-default">KGRK NEXRAD station</strong> at Fort Cavazos
              (formerly Fort Hood) covers the entire Central Texas region including Austin, San
              Antonio, Waco, and the Hill Country. It provides dual-polarization radar data that can
              distinguish between rain, hail, and debris.
            </p>
            <p>
              During <strong class="text-default">severe weather season</strong> (March–June),
              monitor this radar for approaching supercells, squall lines, and tornado-producing
              storms. Austin's position between the Edwards Plateau and the Coastal Plains creates a
              natural convergence zone for severe weather.
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
