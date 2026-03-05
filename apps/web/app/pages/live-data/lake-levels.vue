<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /live-data/lake-levels/ — Live Lake Levels
 *
 * Map-based page showing Austin-area reservoir levels from TWDB.
 * Each pin shows the current % full. Tapping a pin opens a detail
 * panel with elevation, capacity, and a historical trend chart.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

definePageMeta({ layout: 'fullscreen' })

interface LakeSpot {
  id: string
  name: string
  lat: number
  lng: number
  elevation: number
  percentFull: number | null
  conservationCapacity: number | null
  conservationStorage: number | null
  displayValue: string
  timestamp: string
}

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('live-data')!
const siblings = category.subApps.filter((a) => a.slug !== 'lake-levels' && a.status === 'live')
const crossLinks = categories.value.filter((c) => c.slug !== 'live-data').slice(0, 4)

usePageSeo({
  title: 'Austin Lake Levels — Lake Travis, Lake Austin & More',
  description:
    'Live lake levels for Lake Travis, Lake Austin, Lake Buchanan, and area reservoirs. Real-time elevation, percent full, and historical charts.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('live-data'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Lake Levels — Real-Time Data',
    description:
      'Live reservoir levels for Austin-area lakes sourced from the Texas Water Development Board.',
  }),
])

// Fetch spots from API
const { data: apiData } = await useFetch<{ spots: LakeSpot[] }>('/api/live/lake-levels')
const spots = computed<LakeSpot[]>(() => apiData.value?.spots || [])

// Selection state
const selectedId = ref<string | null>(null)
const selectedSpot = computed<LakeSpot | null>(
  () => spots.value.find((s) => s.id === selectedId.value) ?? null,
)

// History chart data
const historyDays = ref(30)
const {
  data: historyData,
  status: historyStatus,
  refresh: refreshHistory,
} = await useFetch<{
  data: Array<{ percentFull: number; elevation: number; timestamp: string }>
}>(
  () =>
    `/api/live/lake-levels/history?lake=${selectedId.value || 'Travis'}&days=${historyDays.value}`,
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

const chartData = computed(() => {
  const raw = historyData.value?.data || []
  return raw.map((d) => ({
    timestamp: d.timestamp,
    value: d.percentFull ?? d.elevation,
  }))
})

// Pin factory for AppMapKit
function createPinElement(
  spot: LakeSpot,
  isSelected: boolean,
): { element: HTMLElement } {
  if (import.meta.client) {
    const pct = spot.percentFull != null ? Math.round(spot.percentFull) : null
    /* eslint-disable atx/no-inline-hex -- MapKit pin fill status gradient */
    const fillColor =
      pct != null ? (pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444') : '#06b6d4'
    /* eslint-enable atx/no-inline-hex */

    const el = document.createElement('div')
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;min-width:32px;${isSelected ? 'z-index:100;' : 'z-index:1;'}">
        <div style="width:14px;height:14px;border-radius:50%;background:linear-gradient(145deg,${fillColor},color-mix(in srgb,${fillColor} 60%,#000));border:2px solid white;box-shadow:0 2px 8px ${fillColor}66${isSelected ? `,0 0 0 3px ${fillColor}4d` : ''};transition:transform 0.2s;${isSelected ? 'transform:scale(1.4);' : ''}"></div>
        <span style="margin-top:2px;font-size:10px;font-weight:700;font-family:var(--font-display);color:#1e293b;text-shadow:0 0 4px white,0 0 4px white,1px 0 3px white,-1px 0 3px white;white-space:nowrap;">${spot.name.replace('Lake ', '')}</span>
      </div>
    `
    return { element: el }
  }
  return { element: {} as HTMLElement }
}

function formatNumber(n: number | null): string {
  if (n == null) return '—'
  return n.toLocaleString()
}

function percentFullColor(pct: number | null): string {
  if (pct == null) return 'text-muted'
  if (pct >= 80) return 'text-primary'
  if (pct >= 50) return 'text-primary'
  return 'text-primary'
}

function percentFullBg(pct: number | null): string {
  if (pct == null) return 'bg-muted'
  if (pct >= 80) return 'bg-elevated'
  if (pct >= 50) return 'bg-elevated'
  return 'bg-elevated'
}

function fillBarStyle(pct: number | null): Record<string, string> {
  return { width: `${Math.min(pct || 0, 100)}%` }
}
</script>

<template>
  <SubAppShell title="Lake Levels" :detail-active="!!selectedSpot">
    <!-- ─── Left panel: data & controls ─── -->
    <template #panel>
      <!-- Header (hidden when a lake is selected) -->
      <div v-if="!selectedSpot" class="animate-fade-up">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center size-10 rounded-xl bg-primary/10">
            <UIcon name="i-lucide-waves" class="size-5 text-primary" />
          </div>
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight font-display">
            Lake Levels
          </h1>
        </div>
        <p class="text-sm text-muted leading-relaxed mb-4">
          Real-time reservoir levels for Austin-area lakes from the Texas Water Development Board.
          <strong class="text-default">Tap any lake on the map</strong> to see current data and
          trends.
        </p>
      </div>

      <!-- Selected Lake Detail (aria-live so selection changes are announced) -->
      <section
        v-if="selectedSpot"
        class="animate-fade-up"
        aria-live="polite"
        :aria-atomic="true"
        :aria-label="`Lake details: ${selectedSpot.name}`"
      >
        <UButton
          variant="link"
          color="neutral"
          size="xs"
          icon="i-lucide-arrow-left"
          class="text-xs font-bold uppercase tracking-widest mb-5"
          @click="selectedId = null"
        >
          Back to All Lakes
        </UButton>

        <div
          class="rounded-2xl border border-default bg-default px-5 py-4 shadow-sm dark:shadow-md"
        >
          <div class="flex items-start gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 rounded-full bg-linear-to-br from-primary to-primary/70 shadow-lg"
            >
              <UIcon name="i-lucide-waves" class="size-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-lg sm:text-xl font-extrabold font-display leading-tight mb-1">
                {{ selectedSpot.name }}
              </h2>
              <p class="text-xs text-muted">As of {{ selectedSpot.timestamp }}</p>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="grid grid-cols-2 gap-2.5 mb-4">
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-2.5 py-2"
            >
              <span
                class="text-lg font-extrabold font-display"
                :class="percentFullColor(selectedSpot.percentFull)"
              >
                {{
                  selectedSpot.percentFull != null
                    ? `${Math.round(selectedSpot.percentFull)}%`
                    : '—'
                }}
              </span>
              <span
                class="text-[0.6rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Full</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-2.5 py-2"
            >
              <span class="text-lg font-extrabold font-display">{{
                selectedSpot.elevation.toFixed(1)
              }}</span>
              <span
                class="text-[0.6rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Elevation (ft)</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-2.5 py-2"
            >
              <span class="text-lg font-extrabold font-display">{{
                formatNumber(selectedSpot.conservationCapacity)
              }}</span>
              <span
                class="text-[0.6rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Capacity (ac-ft)</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-2.5 py-2"
            >
              <span class="text-lg font-extrabold font-display">{{
                formatNumber(selectedSpot.conservationStorage)
              }}</span>
              <span
                class="text-[0.6rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Storage (ac-ft)</span
              >
            </div>
          </div>

          <UBadge color="info" variant="subtle" size="sm" label="TWDB / LCRA Data" class="mb-4" />

          <!-- Historical Chart -->
          <ClientOnly>
            <LiveDataChart
              :data="chartData"
              title="Level Trend"
              unit="%"
              accent-color="#3b82f6"
              :loading="historyStatus === 'pending'"
              embedded
              @period-change="onPeriodChange"
            />
          </ClientOnly>
        </div>
      </section>

      <!-- Lake List (default) -->
      <section v-if="!selectedSpot" class="animate-fade-up-delay-1">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-3">
          Austin-Area Reservoirs
        </h2>
        <div class="space-y-2">
          <UButton
            v-for="spot in spots"
            :key="spot.id"
            variant="ghost"
            color="neutral"
            class="group flex w-full items-center gap-3 rounded-[14px] border border-default bg-default px-3.5 py-3 transition-all duration-200 hover:-translate-y-px hover:border-primary/40 hover:shadow-sm cursor-pointer"
            :aria-label="`View ${spot.name}, ${spot.displayValue} full`"
            @click="selectedId = spot.id"
          >
            <div
              class="flex items-center justify-center min-w-[46px] shrink-0 rounded-[10px] border border-primary/15 bg-primary/8 px-2 py-1 text-sm font-extrabold font-display"
              :class="percentFullColor(spot.percentFull)"
            >
              {{ spot.displayValue }}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <h3 class="text-sm font-bold truncate">{{ spot.name }}</h3>
              <p class="text-xs text-muted">
                Elevation {{ spot.elevation.toFixed(1) }} ft · {{ spot.timestamp }}
              </p>
            </div>
            <!-- Mini fill bar -->
            <div class="w-[50px] h-1.5 shrink-0 rounded-full bg-elevated overflow-hidden">
              <div
                class="h-full rounded-full transition-[width] duration-500"
                :class="percentFullBg(spot.percentFull)"
                :style="fillBarStyle(spot.percentFull)"
              />
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-3.5 text-muted group-hover:text-primary transition-colors shrink-0"
            />
          </UButton>
        </div>
      </section>

      <!-- Bottom links (visible when no selection) -->
      <div v-if="!selectedSpot" class="mt-auto pt-4">
        <!-- More in Live Data -->
        <section v-if="siblings.length" class="mb-4">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-2">
            More in Live Data
          </h2>
          <div class="space-y-1.5">
            <NuxtLink
              v-for="app in siblings"
              :key="app.slug"
              :to="`/live-data/${app.slug}/`"
              class="group flex items-center justify-between rounded-lg border border-default bg-default px-3 py-2 transition-all duration-200 hover:border-primary/30"
            >
              <div class="min-w-0">
                <h3 class="text-xs font-semibold">{{ app.title }}</h3>
                <p class="text-[11px] text-muted truncate">{{ app.description }}</p>
              </div>
              <UIcon
                name="i-lucide-chevron-right"
                class="size-3.5 text-dimmed group-hover:text-primary transition-colors"
              />
            </NuxtLink>
          </div>
        </section>

        <!-- Explore More -->
        <section class="mb-4">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-2">Explore More</h2>
          <div class="grid grid-cols-2 gap-1.5">
            <NuxtLink
              v-for="c in crossLinks"
              :key="c.slug"
              :to="`/${c.slug}/`"
              class="flex items-center gap-2 rounded-lg border border-default bg-default px-3 py-2 transition-all duration-200 hover:border-primary/30"
            >
              <UIcon :name="c.icon" class="size-3.5" :class="c.color" />
              <span class="text-xs font-medium">{{ c.title }}</span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </template>

    <!-- ─── Right: Map fills remaining space ─── -->
    <template #content>
      <ClientOnly>
        <AppMapKit
          v-model:selected-id="selectedId"
          :items="spots"
          :create-pin-element="createPinElement"
          :bounding-padding="0.15"
          :zoom-span="{ lat: 0.03, lng: 0.035 }"
          :annotation-size="{ width: 130, height: 56 }"
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
    </template>
  </SubAppShell>
</template>
