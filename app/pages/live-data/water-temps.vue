<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /live-data/water-temps/ — Live Water Temperatures
 *
 * Map-based page showing USGS water monitoring stations around Austin.
 * Each pin shows the current reading. Tapping a pin opens a detail
 * panel with the station info and a historical trend chart.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

interface WaterSpot {
  id: string
  name: string
  lat: number
  lng: number
  value: number
  unit: string
  parameterCode: string
  displayValue: string
  timestamp: string
}

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('live-data')!
const siblings = category.subApps.filter((a) => a.slug !== 'water-temps' && a.status === 'live')
const crossLinks = categories.value.filter((c) => c.slug !== 'live-data').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Water Temperatures — Live Readings & Map',
  description:
    'Live water temperatures for Barton Springs, Lady Bird Lake, and Austin-area waterways. Real-time USGS data with historical charts.',
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('live-data'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Water Temperatures — Live Readings',
    description: 'Live water temperatures from USGS monitoring stations across the Austin area.',
  }),
])

// Fetch spots from API
const { data: apiData } = await useFetch<{ spots: WaterSpot[] }>('/api/live/water-temps')
const spots = computed<WaterSpot[]>(() => apiData.value?.spots || [])

// Selection state
const selectedId = ref<string | null>(null)
const selectedSpot = computed<WaterSpot | null>(
  () => spots.value.find((s) => s.id === selectedId.value) ?? null,
)

// History chart data
const historyDays = ref(30)
const {
  data: historyData,
  status: historyStatus,
  refresh: refreshHistory,
} = await useFetch<{
  data: Array<{ value: number; timestamp: string }>
}>(
  () =>
    `/api/live/water-temps/history?siteId=${selectedId.value || '08155500'}&days=${historyDays.value}`,
  {
    watch: false,
    immediate: false,
  },
)

watch(selectedId, (id) => {
  if (id) refreshHistory()
})

function onPeriodChange(days: number) {
  historyDays.value = days
  refreshHistory()
}

const chartData = computed(() => historyData.value?.data || [])

// Pin factory for AppMapKit
function createPinElement(
  spot: WaterSpot,
  isSelected: boolean,
): { element: HTMLElement; cleanup?: () => void } {
  const el = document.createElement('div')
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:max-content;${isSelected ? 'z-index:100;' : 'z-index:1;'}">
      <div style="display:flex;align-items:center;justify-content:center;padding:4px 10px;border-radius:20px;background:linear-gradient(145deg,#06b6d4,#0e7490);color:white;font-size:13px;font-weight:800;font-family:var(--font-display);box-shadow:0 2px 8px rgba(6,182,212,0.4)${isSelected ? ',0 0 0 3px rgba(6,182,212,0.3)' : ''};transition:transform 0.2s;${isSelected ? 'transform:scale(1.15);' : ''}">${spot.displayValue}</div>
      <span style="font-size:11px;font-weight:700;font-family:var(--font-display);color:#1e293b;text-shadow:0 0 4px white,0 0 4px white,1px 0 3px white,-1px 0 3px white;white-space:nowrap;max-width:100px;overflow:hidden;text-overflow:ellipsis;">${spot.name}</span>
    </div>
  `
  return { element: el }
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ts
  }
}
</script>

<template>
  <div>
    <!-- Map -->
    <ClientOnly>
      <AppMapKit
        v-model:selected-id="selectedId"
        :items="spots"
        :create-pin-element="createPinElement"
        :bounding-padding="0.1"
        :zoom-span="{ lat: 0.005, lng: 0.006 }"
        :annotation-size="{ width: 120, height: 56 }"
      />
      <template #fallback>
        <div class="mapkit-placeholder">
          <div class="text-center">
            <UIcon name="i-lucide-map" class="size-10 text-muted mb-2" />
            <p class="text-sm text-muted">Loading map…</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Content -->
    <UContainer class="py-8 md:py-12">
      <!-- Breadcrumbs -->
      <UBreadcrumb
        v-if="breadcrumbs.length > 0 && !selectedSpot"
        :items="breadcrumbs"
        class="mb-6"
      />

      <!-- Header (hidden when selected) -->
      <div v-if="!selectedSpot" class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-12 rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-thermometer" class="size-6 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Water Temperatures
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Live water temperatures from USGS monitoring stations across Austin.
          <strong class="text-default">Tap any pin on the map</strong> to see current readings and
          historical trends.
        </p>
      </div>

      <!-- Selected Station Detail -->
      <section v-if="selectedSpot" class="mb-10 animate-fade-up">
        <UButton
          variant="link"
          color="neutral"
          size="xs"
          icon="i-lucide-arrow-left"
          class="text-xs font-bold uppercase tracking-widest mb-5"
          @click="selectedId = null"
        >
          Back to All Stations
        </UButton>

        <div
          class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm dark:shadow-md"
        >
          <!-- Station Info -->
          <div class="flex items-start gap-4 mb-4">
            <div
              class="flex items-center justify-center size-11 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg"
            >
              <UIcon name="i-lucide-thermometer" class="size-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-xl sm:text-2xl font-extrabold font-display leading-tight mb-1">
                {{ selectedSpot.name }}
              </h2>
              <p class="text-sm text-muted">USGS Station {{ selectedSpot.id }}</p>
            </div>
          </div>

          <!-- Current Reading -->
          <div class="flex flex-wrap items-center gap-3 mb-5">
            <div
              class="flex flex-col items-center rounded-xl border border-primary/20 bg-primary/8 px-4 py-2.5"
            >
              <span class="text-2xl font-extrabold font-display text-primary">{{
                selectedSpot.displayValue
              }}</span>
              <span class="text-[0.7rem] font-semibold uppercase tracking-wider text-muted"
                >Current</span
              >
            </div>
            <div
              v-if="selectedSpot.parameterCode === '00010'"
              class="flex flex-col items-center rounded-xl border border-primary/20 bg-primary/8 px-4 py-2.5"
            >
              <span class="text-2xl font-extrabold font-display text-primary"
                >{{ selectedSpot.value.toFixed(1) }}°C</span
              >
              <span class="text-[0.7rem] font-semibold uppercase tracking-wider text-muted"
                >Celsius</span
              >
            </div>
            <UBadge color="info" variant="subtle" size="sm" label="USGS Live" />
          </div>

          <p class="text-xs text-muted mb-6">
            Last updated {{ formatTimestamp(selectedSpot.timestamp) }} · Data is provisional
          </p>

          <!-- Historical Chart -->
          <ClientOnly>
            <LiveDataChart
              :data="chartData"
              title="Temperature Trend"
              :unit="selectedSpot.parameterCode === '00010' ? '°F' : 'ft'"
              accent-color="#06b6d4"
              :loading="historyStatus === 'pending'"
              embedded
              @period-change="onPeriodChange"
            />
          </ClientOnly>
        </div>
      </section>

      <!-- Station List (when nothing selected) -->
      <section v-else class="mb-10 animate-fade-up-delay-1">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Monitoring Stations
        </h2>
        <div class="space-y-3">
          <UButton
            v-for="spot in spots"
            :key="spot.id"
            variant="ghost"
            color="neutral"
            class="group flex w-full items-center gap-3 rounded-[14px] border border-default bg-default px-4 py-3.5 transition-all duration-200 hover:-translate-y-px hover:border-primary/40 hover:shadow-sm"
            @click="selectedId = spot.id"
          >
            <div
              class="flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-sm shrink-0"
            >
              <UIcon name="i-lucide-thermometer" class="size-4 text-white" />
            </div>
            <div class="flex-1 min-w-0 text-left">
              <h3 class="text-sm sm:text-base font-bold truncate">{{ spot.name }}</h3>
              <p class="text-xs text-muted">
                USGS {{ spot.id }} · Updated {{ formatTimestamp(spot.timestamp) }}
              </p>
            </div>
            <div
              class="flex items-center rounded-full bg-gradient-to-br from-primary to-primary/70 px-2.5 py-1 text-[13px] font-extrabold font-display text-white shadow-sm"
            >
              {{ spot.displayValue }}
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-muted group-hover:text-primary transition-colors shrink-0"
            />
          </UButton>
        </div>
      </section>

      <!-- More in Live Data -->
      <section v-if="siblings.length && !selectedSpot" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in Live Data
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/live-data/${app.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div>
              <h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3>
              <p class="text-xs text-muted line-clamp-1">{{ app.description }}</p>
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-dimmed group-hover:text-primary transition-colors"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- Explore More -->
      <section v-if="!selectedSpot" class="mb-6 animate-fade-up-delay-3">
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
