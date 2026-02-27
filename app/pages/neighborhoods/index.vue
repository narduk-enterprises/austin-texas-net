<!-- eslint-disable atx/no-inline-hex, atx/no-fetch-in-component -- GeoJSON colors; SSR page data fetching -->
<script setup lang="ts">
import type {
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  GeoJSONFeatureProperties,
  OverlayStyle,
} from '~/components/AppMapKit.vue'

import { getCategoryHexColor } from '~/utils/categoryHexColors'

/**
 * neighborhoods/index.vue — Data-driven neighborhood directory.
 * Fetches all neighborhoods from the API, with search + region/city filters.
 * Shows an interactive polygon boundary map via the shared AppMapKit component.
 */
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('neighborhoods')!

usePageSeo({
  title: 'Austin Neighborhoods — Every Corner of the ATX Metro',
  description:
    'Explore 80+ Austin neighborhoods from Leander to Buda — Downtown, South Congress, East Austin, Mueller, and more. Find your perfect area.',
  ogImageComponent: 'OgImageCategory',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('neighborhoods'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Neighborhoods — Every Corner of the ATX Metro',
    description:
      'Explore 80+ Austin neighborhoods from Leander to Buda — Downtown, South Congress, East Austin, Mueller, and more.',
  }),
])

const { items: breadcrumbs } = useBreadcrumbs()

const { data } = await useFetch('/api/neighborhoods')

// ── GeoJSON boundary data ────────────────────────────────────
const { data: geojson } = await useFetch<GeoJSONFeatureCollection>('/api/neighborhoods/geojson', {
  key: 'neighborhoods-geojson',
})

const REGION_COLORS: Record<string, { stroke: string; fill: string }> = {
  'Far North': { stroke: '#1d4ed8', fill: '#3b82f6' },
  North: { stroke: '#6d28d9', fill: '#8b5cf6' },
  'North Austin': { stroke: '#0e7490', fill: '#06b6d4' },
  'North-Central': { stroke: '#0f766e', fill: '#14b8a6' },
  Central: { stroke: '#b45309', fill: '#f59e0b' },
  East: { stroke: '#be123c', fill: '#f43f5e' },
  'South-Central': { stroke: '#c2410c', fill: '#f97316' },
  South: { stroke: '#15803d', fill: '#22c55e' },
  'Far South': { stroke: '#4d7c0f', fill: '#84cc16' },
  West: { stroke: '#7e22ce', fill: '#a855f7' },
}

const DEFAULT_OVERLAY = { stroke: '#6b7280', fill: '#9ca3af' }

function overlayStyleFn(properties: GeoJSONFeatureProperties): OverlayStyle {
  const regionColor = REGION_COLORS[properties.region ?? ''] ?? DEFAULT_OVERLAY
  return {
    strokeColor: regionColor.stroke,
    strokeOpacity: 0.8,
    fillColor: regionColor.fill,
    fillOpacity: 0.2,
    lineWidth: 1.5,
  }
}

const router = useRouter()

function onFeatureSelect(feature: GeoJSONFeature) {
  const slug = feature.properties.slug
  if (slug) {
    router.push(`/neighborhoods/${slug}/`)
  }
}

interface Neighborhood {
  id: number
  name: string
  slug: string
  lat: number
  lng: number
  city: string
  region: string
  zipCode: string | null
  description: string | null
  featured: boolean
}

// ── Filters ──────────────────────────────────────────────────
const searchQuery = ref('')
const selectedRegion = ref<string | undefined>(undefined)
const selectedCity = ref<string | undefined>(undefined)

const regionOrder = [
  'Far North',
  'North',
  'North Austin',
  'North-Central',
  'Central',
  'East',
  'South-Central',
  'South',
  'Far South',
  'West',
]

// Derive unique cities from data
const cityOptions = computed(() => {
  const neighborhoods = (data.value?.neighborhoods ?? []) as Neighborhood[]
  const cities = [...new Set(neighborhoods.map((n) => n.city).filter(Boolean))]
  return cities.sort()
})

// Derive region options from data (only regions that have neighborhoods)
const regionOptions = computed(() => {
  const neighborhoods = (data.value?.neighborhoods ?? []) as Neighborhood[]
  const existingRegions = new Set(neighborhoods.map((n) => n.region).filter(Boolean))
  return regionOrder.filter((r) => existingRegions.has(r))
})

// Items for USelect — no empty-value "All" item (use placeholder prop instead)
const regionSelectItems = computed(() => regionOptions.value.map((r) => ({ label: r, value: r })))

const citySelectItems = computed(() => cityOptions.value.map((c) => ({ label: c, value: c })))

// ── Filtered + grouped data ──────────────────────────────────
const filteredNeighborhoods = computed(() => {
  let neighborhoods = (data.value?.neighborhoods ?? []) as Neighborhood[]

  // Text search — fuzzy match against name and city
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    neighborhoods = neighborhoods.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.city?.toLowerCase().includes(q) ||
        n.region?.toLowerCase().includes(q) ||
        n.zipCode?.toLowerCase().includes(q),
    )
  }

  // Region filter
  if (selectedRegion.value) {
    neighborhoods = neighborhoods.filter((n) => n.region === selectedRegion.value)
  }

  // City filter
  if (selectedCity.value) {
    neighborhoods = neighborhoods.filter((n) => n.city === selectedCity.value)
  }

  return neighborhoods
})

const groupedByRegion = computed(() => {
  const grouped = new Map<string, Neighborhood[]>()

  for (const region of regionOrder) {
    grouped.set(region, [])
  }

  for (const n of filteredNeighborhoods.value) {
    const region = n.region || 'Other'
    if (!grouped.has(region)) {
      grouped.set(region, [])
    }
    grouped.get(region)!.push(n)
  }

  // Sort each group alphabetically
  for (const [, items] of grouped) {
    items.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Remove empty groups
  return Array.from(grouped.entries()).filter(([, items]) => items.length > 0)
})

const totalCount = computed(
  () => (data.value?.neighborhoods as Neighborhood[] | undefined)?.length ?? 0,
)
const filteredCount = computed(() => filteredNeighborhoods.value.length)
const hasActiveFilters = computed(
  () =>
    searchQuery.value.trim() !== '' || selectedRegion.value != null || selectedCity.value != null,
)

function clearFilters() {
  searchQuery.value = ''
  selectedRegion.value = undefined
  selectedCity.value = undefined
}

// Load Nuxt Content overview
const { data: content } = await useAsyncData('category-content-neighborhoods', () =>
  queryCollection('categories').where('slug', '=', 'neighborhoods').first(),
)

// Cross-link categories
const { categories } = useSiteData()
const crossLinks = computed(() =>
  categories.value.filter((c) => c.slug !== 'neighborhoods').slice(0, 4),
)
</script>

<template>
  <UContainer>
    <div>
      <!-- Hero -->
      <section class="pt-8 pb-6">
        <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
        <div class="text-center">
          <div
            class="size-16 rounded-[18px] inline-flex items-center justify-center mb-4"
            :class="category.color"
            style="background: currentColor"
          >
            <UIcon :name="category.icon" class="size-8 text-white" />
          </div>
          <h1 class="text-[clamp(1.5rem,4vw,2rem)] font-extrabold tracking-[-0.02em] mb-2">
            Austin Neighborhoods
          </h1>
          <p class="text-[0.95rem] text-muted max-w-[520px] mx-auto leading-[1.6]">
            {{ totalCount }} neighborhoods from Leander to Buda — find your corner of the ATX metro.
          </p>
        </div>
      </section>

      <!-- Neighborhood Boundaries Map -->
      <section
        class="mb-6 -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:overflow-hidden lg:border lg:border-default"
      >
        <ClientOnly>
          <AppMapKit
            :geojson="geojson"
            :overlay-style-fn="overlayStyleFn"
            @feature-select="onFeatureSelect"
          />
          <template #fallback>
            <div class="mapkit-placeholder">
              <div class="mapkit-spinner" />
              <p class="text-sm text-muted mt-3">Loading map…</p>
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Region legend -->
      <section v-if="geojson" class="mb-6">
        <div class="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
          <span
            v-for="(colors, region) in REGION_COLORS"
            :key="region"
            class="inline-flex items-center gap-1.5 text-[0.7rem] text-muted"
          >
            <span
              class="size-2.5 rounded-full shrink-0 border"
              :style="{ backgroundColor: colors.fill, borderColor: colors.stroke, opacity: 0.8 }"
            />
            {{ region }}
          </span>
        </div>
      </section>

      <!-- Search + Filters -->
      <section class="mb-6">
        <div class="flex flex-col gap-3">
          <!-- Search input — full width -->
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            size="lg"
            variant="outline"
            placeholder="Search neighborhoods..."
            enter-key-hint="search"
            autocomplete="off"
            :ui="{ root: 'w-full' }"
          />

          <!-- Region + City filters row -->
          <div class="grid grid-cols-2 gap-3">
            <USelect
              v-model="selectedRegion"
              :items="regionSelectItems"
              size="md"
              icon="i-lucide-compass"
              placeholder="All Regions"
            />
            <USelect
              v-model="selectedCity"
              :items="citySelectItems"
              size="md"
              icon="i-lucide-building-2"
              placeholder="All Cities"
            />
          </div>

          <!-- Active filter summary -->
          <div v-if="hasActiveFilters" class="flex items-center justify-between px-1">
            <p class="text-xs text-muted">
              <span class="font-semibold text-default">{{ filteredCount }}</span>
              of {{ totalCount }} neighborhoods
            </p>
            <UButton
              variant="link"
              color="primary"
              size="xs"
              label="Clear filters"
              @click="clearFilters"
            />
          </div>
        </div>
      </section>

      <!-- Nuxt Content overview (hidden when filtering) -->
      <section
        v-if="content && !hasActiveFilters"
        class="bg-elevated border border-default rounded-2xl px-4 py-5 sm:px-6 sm:py-7 mb-6"
      >
        <div class="prose-content text-[0.88rem] leading-[1.8] text-muted">
          <ContentRenderer :value="content" />
        </div>
      </section>

      <!-- No results -->
      <section v-if="filteredCount === 0 && hasActiveFilters" class="text-center py-12">
        <UIcon name="i-lucide-search-x" class="size-10 text-dimmed mb-3" />
        <p class="text-sm text-muted mb-3">No neighborhoods match your filters.</p>
        <UButton
          label="Clear filters"
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-lucide-x"
          @click="clearFilters"
        />
      </section>

      <!-- Neighborhoods grouped by region -->
      <section v-for="[region, neighborhoods] in groupedByRegion" :key="region" class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-muted">
            {{ region }}
          </h2>
          <span class="text-xs text-dimmed font-medium">
            {{ neighborhoods.length }}
            {{ neighborhoods.length === 1 ? 'neighborhood' : 'neighborhoods' }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="n in neighborhoods"
            :key="n.slug"
            :to="`/neighborhoods/${n.slug}/`"
            class="neighborhood-card group bg-elevated border border-default rounded-[14px] p-5 no-underline text-inherit transition-all duration-200 ease-out hover:border-accented hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-[0.95rem] font-bold">{{ n.name }}</h3>
              <span
                v-if="n.city !== 'Austin'"
                class="text-[0.6rem] font-semibold py-0.5 px-2 rounded-full uppercase tracking-[0.04em] bg-accented text-muted shrink-0 ml-2"
              >
                {{ n.city }}
              </span>
            </div>

            <p v-if="n.description" class="text-[0.8rem] text-muted leading-normal mb-3">
              {{ n.description }}
            </p>
            <p v-else class="text-[0.8rem] text-muted leading-normal mb-3">
              Explore {{ n.name }}{{ n.city !== 'Austin' ? `, ${n.city}` : '' }} — local guide,
              dining, and area info.
            </p>

            <div class="flex items-center justify-between">
              <span class="text-[0.7rem] text-dimmed">
                {{ n.zipCode || n.region }}
              </span>
              <span class="text-xs font-semibold text-primary inline-flex items-center">
                Explore
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-3 ml-1 group-hover:translate-x-0.5 transition-transform"
                />
              </span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Cross-links -->
      <section class="mb-2">
        <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-muted mb-3.5">
          More from Austin
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 px-4 py-3.5 bg-elevated border border-default rounded-xl no-underline text-inherit transition-colors duration-200 hover:border-accented"
          >
            <UIcon :name="c.icon" class="size-5" :class="c.color" />
            <span class="text-[0.8rem] font-semibold flex-1">{{ c.title }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-3 text-dimmed" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </UContainer>
</template>

<style scoped>
.prose-content :deep(h2) {
  font-size: 1.05rem;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 10px;
  color: var(--color-text);
}
.prose-content :deep(p) {
  margin-bottom: 14px;
}
.prose-content :deep(strong) {
  color: var(--color-text);
}
</style>
