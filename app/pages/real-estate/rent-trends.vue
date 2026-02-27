<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /real-estate/rent-trends/ — Rent Price Trends by Zip Code
 *
 * Map-based page showing Austin-area median rents from Zillow ZORI.
 * Each pin shows the current median monthly rent for a zip code.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

interface RentSpot {
  id: string
  name: string
  lat: number
  lng: number
  medianRent: number
  yoyChange: number | null
  period: string
  displayValue: string
}

// Reuse zip code coordinates from home prices
const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  '78701': { lat: 30.27, lng: -97.7431 },
  '78702': { lat: 30.2621, lng: -97.7208 },
  '78703': { lat: 30.2937, lng: -97.7636 },
  '78704': { lat: 30.242, lng: -97.7638 },
  '78705': { lat: 30.2906, lng: -97.7417 },
  '78721': { lat: 30.2703, lng: -97.691 },
  '78722': { lat: 30.2822, lng: -97.7139 },
  '78723': { lat: 30.3078, lng: -97.6905 },
  '78724': { lat: 30.3199, lng: -97.6345 },
  '78726': { lat: 30.433, lng: -97.8303 },
  '78727': { lat: 30.4253, lng: -97.7197 },
  '78728': { lat: 30.4467, lng: -97.6937 },
  '78729': { lat: 30.4564, lng: -97.7676 },
  '78730': { lat: 30.365, lng: -97.8271 },
  '78731': { lat: 30.3474, lng: -97.7644 },
  '78732': { lat: 30.378, lng: -97.8888 },
  '78733': { lat: 30.32, lng: -97.875 },
  '78735': { lat: 30.265, lng: -97.846 },
  '78741': { lat: 30.229, lng: -97.7199 },
  '78744': { lat: 30.193, lng: -97.735 },
  '78745': { lat: 30.206, lng: -97.794 },
  '78746': { lat: 30.31, lng: -97.805 },
  '78748': { lat: 30.177, lng: -97.804 },
  '78749': { lat: 30.23, lng: -97.853 },
  '78750': { lat: 30.406, lng: -97.791 },
  '78751': { lat: 30.3128, lng: -97.7234 },
  '78752': { lat: 30.33, lng: -97.71 },
  '78753': { lat: 30.373, lng: -97.677 },
  '78756': { lat: 30.323, lng: -97.739 },
  '78757': { lat: 30.353, lng: -97.736 },
  '78758': { lat: 30.387, lng: -97.713 },
  '78759': { lat: 30.399, lng: -97.759 },
  '78610': { lat: 30.081, lng: -97.84 },
  '78613': { lat: 30.507, lng: -97.821 },
  '78660': { lat: 30.439, lng: -97.62 },
  '78664': { lat: 30.536, lng: -97.662 },
  '78681': { lat: 30.51, lng: -97.737 },
}

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('real-estate')!
const siblings = category.subApps.filter((a) => a.slug !== 'rent-trends' && a.status === 'live')
const crossLinks = categories.value.filter((c) => c.slug !== 'real-estate').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Rent Prices by Zip Code — 2025 Rental Data',
  description:
    'Explore median rent prices across Austin zip codes. Interactive map with Zillow rent data, year-over-year changes, and neighborhood rental comparisons.',
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('real-estate'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Rent Prices by Zip Code',
    description:
      'Interactive map of median rents across Austin-area zip codes from Zillow Observed Rent Index data.',
  }),
])

const { data: apiData } = await useFetch<{
  prices: Array<{ zipCode: string; period: string; medianRent: number; yoyChange: number | null }>
}>('/api/real-estate/rent-trends?latest=true')

const spots = computed<RentSpot[]>(() => {
  const prices = apiData.value?.prices || []
  return prices
    .filter((p) => ZIP_COORDS[p.zipCode])
    .map((p) => ({
      id: p.zipCode,
      name: `Zip ${p.zipCode}`,
      lat: ZIP_COORDS[p.zipCode]!.lat,
      lng: ZIP_COORDS[p.zipCode]!.lng,
      medianRent: p.medianRent,
      yoyChange: p.yoyChange,
      period: p.period,
      displayValue: `$${p.medianRent.toLocaleString()}`,
    }))
})

const selectedId = ref<string | null>(null)
const selectedSpot = computed<RentSpot | null>(
  () => spots.value.find((s) => s.id === selectedId.value) ?? null,
)

const sortBy = ref<'rent-high' | 'rent-low' | 'yoy-high' | 'yoy-low'>('rent-high')
const sortedSpots = computed(() => {
  const list = [...spots.value]
  switch (sortBy.value) {
    case 'rent-high':
      return list.sort((a, b) => b.medianRent - a.medianRent)
    case 'rent-low':
      return list.sort((a, b) => a.medianRent - b.medianRent)
    case 'yoy-high':
      return list.sort((a, b) => (b.yoyChange ?? 0) - (a.yoyChange ?? 0))
    case 'yoy-low':
      return list.sort((a, b) => (a.yoyChange ?? 0) - (b.yoyChange ?? 0))
    default:
      return list
  }
})

function createPinElement(
  spot: RentSpot,
  isSelected: boolean,
): { element: HTMLElement; cleanup?: () => void } {
  const rent = spot.medianRent

  /* eslint-disable atx/no-inline-hex -- MapKit pin gradient */
  const fillColor =
    rent >= 2500 ? '#7c3aed' : rent >= 1800 ? '#3b82f6' : rent >= 1200 ? '#22c55e' : '#f59e0b'
  /* eslint-enable atx/no-inline-hex */

  const el = document.createElement('div')
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:max-content;${isSelected ? 'z-index:100;' : 'z-index:1;'}">
      <div style="display:flex;align-items:center;justify-content:center;padding:4px 10px;border-radius:20px;background:linear-gradient(145deg,${fillColor},color-mix(in srgb,${fillColor} 60%,#000));color:white;font-size:12px;font-weight:800;font-family:var(--font-display);box-shadow:0 2px 8px ${fillColor}66${isSelected ? `,0 0 0 3px ${fillColor}4d` : ''};transition:transform 0.2s;${isSelected ? 'transform:scale(1.15);' : ''}">${spot.displayValue}</div>
      <span style="font-size:10px;font-weight:700;font-family:var(--font-display);color:#1e293b;text-shadow:0 0 4px white,0 0 4px white,1px 0 3px white,-1px 0 3px white;white-space:nowrap;">${spot.id}</span>
    </div>
  `
  return { element: el }
}

function formatYoy(change: number | null): string {
  if (change == null) return '—'
  const pct = (change * 100).toFixed(1)
  return change >= 0 ? `+${pct}%` : `${pct}%`
}

function yoyColor(change: number | null): string {
  if (change == null) return 'text-muted'
  return change >= 0 ? 'text-red-500' : 'text-green-500' // Rent increases are bad for renters
}
</script>

<template>
  <div>
    <ClientOnly>
      <AppMapKit
        v-model:selected-id="selectedId"
        :items="spots"
        :create-pin-element="createPinElement"
        :bounding-padding="0.08"
        :zoom-span="{ lat: 0.03, lng: 0.035 }"
        :annotation-size="{ width: 100, height: 46 }"
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

    <UContainer class="py-8 md:py-12">
      <UBreadcrumb
        v-if="breadcrumbs.length > 0 && !selectedSpot"
        :items="breadcrumbs"
        class="mb-6"
      />

      <div v-if="!selectedSpot" class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-12 rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-building-2" class="size-6 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Rent Trends
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Median monthly rents across Austin-area zip codes from the Zillow Observed Rent Index.
          <strong class="text-default">Tap any pin</strong> to see rent data and year-over-year
          changes.
        </p>
      </div>

      <!-- Selected Zip Detail -->
      <section v-if="selectedSpot" class="mb-10 animate-fade-up">
        <UButton
          variant="link"
          color="neutral"
          size="xs"
          icon="i-lucide-arrow-left"
          class="text-xs font-bold uppercase tracking-widest mb-5"
          @click="selectedId = null"
        >
          Back to All Zips
        </UButton>

        <div
          class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm dark:shadow-md"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="flex items-center justify-center size-11 rounded-full bg-linear-to-br from-primary to-primary/70 shadow-lg"
            >
              <UIcon name="i-lucide-building-2" class="size-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-xl sm:text-2xl font-extrabold font-display leading-tight mb-1">
                Zip Code {{ selectedSpot.id }}
              </h2>
              <p class="text-sm text-muted">As of {{ selectedSpot.period }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span class="text-xl font-extrabold font-display"
                >{{ selectedSpot.displayValue }}/mo</span
              >
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Median Rent</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span
                class="text-xl font-extrabold font-display"
                :class="yoyColor(selectedSpot.yoyChange)"
              >
                {{ formatYoy(selectedSpot.yoyChange) }}
              </span>
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Year-over-Year</span
              >
            </div>
          </div>
          <UBadge color="info" variant="subtle" size="sm" label="Zillow ZORI" class="mb-3" />
        </div>
      </section>

      <!-- Zip List -->
      <section v-if="!selectedSpot" class="mb-10 animate-fade-up-delay-1">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted">
            Austin-Area Zip Codes
          </h2>
          <USelect
            v-model="sortBy"
            size="xs"
            :items="[
              { label: 'Rent: High → Low', value: 'rent-high' },
              { label: 'Rent: Low → High', value: 'rent-low' },
              { label: 'YoY: High → Low', value: 'yoy-high' },
              { label: 'YoY: Low → High', value: 'yoy-low' },
            ]"
          />
        </div>
        <div class="space-y-3">
          <UButton
            v-for="spot in sortedSpots"
            :key="spot.id"
            variant="ghost"
            color="neutral"
            class="group flex w-full items-center gap-3 rounded-[14px] border border-default bg-default px-4 py-3.5 transition-all duration-200 hover:-translate-y-px hover:border-primary/40 hover:shadow-sm"
            @click="selectedId = spot.id"
          >
            <div
              class="flex items-center justify-center min-w-[80px] shrink-0 rounded-[10px] border border-primary/15 bg-primary/8 px-2.5 py-1.5 text-sm font-extrabold font-display"
            >
              {{ spot.displayValue }}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <h3 class="text-sm sm:text-base font-bold truncate">Zip {{ spot.id }}</h3>
              <p class="text-xs text-muted">
                {{ spot.period }} ·
                <span :class="yoyColor(spot.yoyChange)">{{ formatYoy(spot.yoyChange) }} YoY</span>
              </p>
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-muted group-hover:text-primary transition-colors shrink-0"
            />
          </UButton>
        </div>
      </section>

      <!-- More / Explore -->
      <section v-if="siblings.length && !selectedSpot" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in Real Estate
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/real-estate/${app.slug}/`"
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
