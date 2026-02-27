<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /real-estate/new-developments/ — New Development Permits
 *
 * Map-based page showing recent new construction permits from the City of Austin.
 * Each pin shows a development permit on the map.
 * List view shows permit details: description, units, valuation, date.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

interface PermitSpot {
  id: string
  name: string
  lat: number
  lng: number
  description: string
  units: number | null
  valuation: number | null
  issueDate: string
  workClass: string
  status: string
  address: string
  displayValue: string
}

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('real-estate')!
const siblings = category.subApps.filter(
  (a) => a.slug !== 'new-developments' && a.status === 'live',
)
const crossLinks = categories.value.filter((c) => c.slug !== 'real-estate').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'New Developments in Austin — Construction Permits & Building Map',
  description:
    'Track new construction in Austin with an interactive map of building permits. See where new homes, apartments, and developments are being built.',
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('real-estate'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'New Developments in Austin',
    description:
      'Interactive map of new construction building permits in Austin from City of Austin open data.',
  }),
])

const { data: apiData } = await useFetch<{ permits: PermitSpot[] }>('/api/real-estate/developments')

const spots = computed<PermitSpot[]>(() => apiData.value?.permits || [])

const selectedId = ref<string | null>(null)
const selectedSpot = computed<PermitSpot | null>(
  () => spots.value.find((s) => s.id === selectedId.value) ?? null,
)

function createPinElement(
  spot: PermitSpot,
  isSelected: boolean,
): { element: HTMLElement; cleanup?: () => void } {
  /* eslint-disable atx/no-inline-hex -- MapKit pin gradient */
  const fillColor =
    (spot.units ?? 0) >= 50 ? '#7c3aed' : (spot.units ?? 0) >= 10 ? '#3b82f6' : '#22c55e'
  /* eslint-enable atx/no-inline-hex */

  const el = document.createElement('div')
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:linear-gradient(145deg,${fillColor},color-mix(in srgb,${fillColor} 60%,#000));border:2px solid white;box-shadow:0 2px 8px ${fillColor}66${isSelected ? `,0 0 0 3px ${fillColor}4d` : ''};transition:transform 0.2s;${isSelected ? 'transform:scale(1.3);' : ''}">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 21v-4h4v4"/></svg>
    </div>
  `
  return { element: el }
}

function formatValuation(val: number | null): string {
  if (val == null) return '—'
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${Math.round(val / 1000)}K`
  return `$${val.toLocaleString()}`
}
</script>

<template>
  <div>
    <ClientOnly>
      <AppMapKit
        v-model:selected-id="selectedId"
        :items="spots"
        :create-pin-element="createPinElement"
        :bounding-padding="0.05"
        :zoom-span="{ lat: 0.01, lng: 0.015 }"
        :annotation-size="{ width: 30, height: 30 }"
        clustering-identifier="dev-permits"
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
            <UIcon name="i-lucide-construction" class="size-6 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              New Developments
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          New construction building permits across Austin from City of Austin open data.
          <strong class="text-default">Tap any pin</strong> to see permit details.
        </p>
      </div>

      <!-- Selected Permit Detail -->
      <section v-if="selectedSpot" class="mb-10 animate-fade-up">
        <UButton
          variant="link"
          color="neutral"
          size="xs"
          icon="i-lucide-arrow-left"
          class="text-xs font-bold uppercase tracking-widest mb-5"
          @click="selectedId = null"
        >
          Back to All Permits
        </UButton>

        <div
          class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm dark:shadow-md"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="flex items-center justify-center size-11 rounded-full bg-linear-to-br from-primary to-primary/70 shadow-lg"
            >
              <UIcon name="i-lucide-building" class="size-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-lg sm:text-xl font-extrabold font-display leading-tight mb-1">
                {{ selectedSpot.name }}
              </h2>
              <p class="text-sm text-muted">
                Permit #{{ selectedSpot.id }} · {{ selectedSpot.issueDate }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div
              v-if="selectedSpot.units"
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span class="text-xl font-extrabold font-display">{{ selectedSpot.units }}</span>
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Units</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span class="text-xl font-extrabold font-display">{{
                formatValuation(selectedSpot.valuation)
              }}</span>
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Valuation</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span class="text-sm font-extrabold font-display">{{ selectedSpot.workClass }}</span>
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Type</span
              >
            </div>
          </div>

          <div v-if="selectedSpot.address" class="text-sm text-muted mb-3">
            <UIcon name="i-lucide-map-pin" class="size-3.5 inline-block mr-1" />
            {{ selectedSpot.address }}
          </div>

          <UBadge
            color="info"
            variant="subtle"
            size="sm"
            label="City of Austin Open Data"
            class="mb-3"
          />
        </div>
      </section>

      <!-- Permit List -->
      <section v-if="!selectedSpot" class="mb-10 animate-fade-up-delay-1">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Recent Permits ({{ spots.length }})
        </h2>
        <div class="space-y-3">
          <UButton
            v-for="spot in spots.slice(0, 50)"
            :key="spot.id"
            variant="ghost"
            color="neutral"
            class="group flex w-full items-center gap-3 rounded-[14px] border border-default bg-default px-4 py-3.5 transition-all duration-200 hover:-translate-y-px hover:border-primary/40 hover:shadow-sm"
            @click="selectedId = spot.id"
          >
            <div
              class="flex items-center justify-center size-9 shrink-0 rounded-full bg-primary/10"
            >
              <UIcon name="i-lucide-building" class="size-4 text-primary" />
            </div>
            <div class="flex-1 min-w-0 text-left">
              <h3 class="text-sm font-bold truncate">{{ spot.name }}</h3>
              <p class="text-xs text-muted truncate">
                {{ spot.issueDate }}
                <span v-if="spot.units"> · {{ spot.units }} units</span>
                <span v-if="spot.valuation"> · {{ formatValuation(spot.valuation) }}</span>
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
