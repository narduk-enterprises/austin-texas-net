<!-- eslint-disable atx/no-inline-hex -- USDM drought classification standard colors -->
<script setup lang="ts">
/**
 * /weather/drought-status/ — Central Texas Drought Monitor
 *
 * Embeds the U.S. Drought Monitor map for Texas with
 * drought classifications, watering restrictions, and resource links.
 */
import { DROUGHT_MONITOR_MAP_URL, DROUGHT_MONITOR_PAGE_URL } from '~~/server/utils/nws'

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('weather')!
const siblings = category.subApps.filter((a) => a.slug !== 'drought-status')
const crossLinks = categories.value.filter((c) => c.slug !== 'weather').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Drought Status — U.S. Drought Monitor & Watering Restrictions',
  description:
    'Central Texas drought conditions from the U.S. Drought Monitor. Current drought classification, watering restriction status, and LCRA water supply updates.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('weather'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Drought Status — U.S. Drought Monitor & Watering Restrictions',
    description: 'Drought monitor and watering restriction tracker for Austin and Central Texas.',
  }),
])

const droughtLevels = [
  {
    code: 'D0',
    label: 'Abnormally Dry',
    color: '#FFFF00',
    description: 'Going into drought: short-term dryness. Coming out: lingering effects.',
  },
  {
    code: 'D1',
    label: 'Moderate Drought',
    color: '#FCD37F',
    description: 'Some crop damage, water shortages developing. Voluntary water restrictions.',
  },
  {
    code: 'D2',
    label: 'Severe Drought',
    color: '#FFAA00',
    description: 'Crop losses likely, water restrictions imposed. Fire risk elevated.',
  },
  {
    code: 'D3',
    label: 'Extreme Drought',
    color: '#E60000',
    description: 'Major crop losses. Widespread water shortages. Stage 2+ restrictions.',
  },
  {
    code: 'D4',
    label: 'Exceptional Drought',
    color: '#730000',
    description: 'Exceptional and widespread crop losses. Water emergencies. Highest restrictions.',
  },
]

const resources = [
  {
    label: 'Austin Water Stage Info',
    url: 'https://www.austintexas.gov/department/water-conservation',
    icon: 'i-lucide-droplets',
  },
  { label: 'LCRA Water Supply', url: 'https://www.lcra.org/water/', icon: 'i-lucide-waves' },
  { label: 'U.S. Drought Monitor — Texas', url: DROUGHT_MONITOR_PAGE_URL, icon: 'i-lucide-map' },
  {
    label: 'Travis County Burn Ban',
    url: 'https://www.traviscountytx.gov/fire-marshal/burn-ban',
    icon: 'i-lucide-flame',
  },
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
          <UIcon name="i-lucide-sun" class="size-6" :class="category.color" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
            Drought Status
          </h1>
        </div>
      </div>

      <p
        class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed mb-8 animate-fade-up-delay-1"
      >
        Central Texas drought conditions from the
        <strong class="text-default">U.S. Drought Monitor</strong>. Updated weekly every Thursday.
      </p>

      <!-- Drought Map -->
      <section class="mb-10 animate-fade-up-delay-1">
        <div class="rounded-2xl border border-default bg-default overflow-hidden p-4 sm:p-6">
          <img
            :src="DROUGHT_MONITOR_MAP_URL"
            alt="U.S. Drought Monitor — Texas"
            class="w-full rounded-xl"
            loading="lazy"
          />
          <div class="flex items-center justify-between mt-4">
            <p class="text-xs text-dimmed">Source: U.S. Drought Monitor · Updated weekly</p>
            <UButton
              :to="DROUGHT_MONITOR_PAGE_URL"
              target="_blank"
              rel="noopener noreferrer"
              variant="link"
              size="xs"
              color="primary"
              label="Full Map"
              icon="i-lucide-external-link"
            />
          </div>
        </div>
      </section>

      <!-- Drought Classification Scale -->
      <section class="mb-10 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Drought Classification Scale
        </h2>
        <div class="space-y-3">
          <div
            v-for="level in droughtLevels"
            :key="level.code"
            class="flex items-start gap-4 p-4 rounded-xl border border-default bg-default"
          >
            <div
              class="size-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs"
              :style="{
                backgroundColor: level.color,
                color: level.code === 'D4' ? 'white' : 'var(--ui-color-slate-800, #1e293b)'
              }"
            >
              {{ level.code }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-bold mb-0.5">{{ level.label }}</h3>
              <p class="text-xs text-muted leading-relaxed">{{ level.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Austin Watering Restrictions -->
      <section class="mb-10 animate-fade-up-delay-3">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">
            Austin Watering Restrictions
          </h2>
          <div class="text-sm text-muted leading-relaxed space-y-3">
            <p>
              <strong class="text-default">Austin Water</strong> enforces year-round watering
              schedules regardless of drought status. During droughts, the city escalates through
              <strong class="text-default">Stage 1–5 restrictions</strong>:
            </p>
            <ul class="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong class="text-default">Stage 1:</strong> Twice-per-week watering, no watering
                10am–7pm.
              </li>
              <li>
                <strong class="text-default">Stage 2:</strong> Once-per-week watering, hose-end
                timers required.
              </li>
              <li>
                <strong class="text-default">Stage 3:</strong> Once every other week. Car washing
                restricted.
              </li>
              <li>
                <strong class="text-default">Stage 4:</strong> No outdoor watering except drip
                irrigation for trees.
              </li>
              <li>
                <strong class="text-default">Stage 5:</strong> Emergency water management. No
                outdoor use.
              </li>
            </ul>
            <p>
              The <strong class="text-default">LCRA</strong> (Lower Colorado River Authority)
              manages the water supply for Austin and the Highland Lakes. Lake Travis levels are the
              primary indicator for drought severity in our region.
            </p>
          </div>
        </div>
      </section>

      <!-- Resources -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">Resources</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UButton
            v-for="res in resources"
            :key="res.url"
            :to="res.url"
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            color="neutral"
            class="group flex items-center gap-3 rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm w-full justify-start"
          >
            <UIcon :name="res.icon" class="size-5 text-muted shrink-0" />
            <span class="text-sm font-semibold">{{ res.label }}</span>
            <UIcon name="i-lucide-external-link" class="size-3 text-dimmed ml-auto" />
          </UButton>
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
