<!-- eslint-disable vue/no-v-html, atx/no-fetch-in-component -- CMS HTML; neighborhood filter fetch -->
<script setup lang="ts">
/**
 * MapContentPage — Full page wrapper for the Map Content Type pattern.
 *
 * Composes MapContentView (map + pins), MapSpotList (ranked list),
 * and MapSpotDetail (expanded detail). This is the single component
 * that each page (breakfast-tacos, BBQ, live-music, etc.) uses.
 *
 * Provides a `#related` slot so each page can add its own
 * "More in Food" / "Explore More" sections.
 *
 * URL sync: when a spot is selected, ?spot=<slug> is added to the URL.
 * On page load, if ?spot= is present, the spot is auto-selected.
 * This gives every spot a unique, shareable, crawlable URL.
 */
import type { MapSpot, MapPageConfig } from '~/types/mapSpot'

const props = defineProps<{
  config: MapPageConfig
  spots: MapSpot[]
}>()

const route = useRoute()
const router = useRouter()

const { getCategoryBySlug } = useSiteData()
const category = computed(() => getCategoryBySlug(props.config.parentCategory))

const mapView = ref<{ scrollToSpot: (id: string) => void } | null>(null)

// ── Slugify helper ─────────────────────────────────────────────
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replaceAll('\'', '')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '')
}

/** Build a lookup from slug → spot for URL matching */
const spotBySlug = computed(() => {
  const map = new Map<string, MapSpot>()
  for (const spot of props.spots) {
    map.set(slugify(spot.name), spot)
  }
  return map
})

// ── Selection state (synced with URL) ──────────────────────────
const selectedId = ref<string | null>(null)

// On mount, check for ?spot= query param and auto-select
const initialSpotSlug = route.query.spot as string | undefined
if (initialSpotSlug) {
  const match = spotBySlug.value.get(initialSpotSlug)
  if (match) {
    selectedId.value = match.id
  }
}

// Sync selectedId → URL query param
watch(selectedId, (newId) => {
  if (import.meta.server) return
  if (newId) {
    const spot = props.spots.find((s) => s.id === newId)
    if (spot) {
      const slug = slugify(spot.name)
      if (route.query.spot !== slug) {
        router.replace({ query: { ...route.query, spot: slug } })
      }
    }
  } else {
    if (route.query.spot) {
      const { spot: _, ...rest } = route.query
      router.replace({ query: Object.keys(rest).length ? rest : undefined })
    }
  }
})

// ── Area / Region filter ───────────────────────────────────────
const selectedRegion = ref('all')

// Fetch neighborhoods to build neighborhood-name → region lookup
const { data: neighborhoodData } = await useFetch<{
  neighborhoods: { name: string; region: string }[]
}>('/api/neighborhoods')

const regionLookup = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const n of neighborhoodData.value?.neighborhoods ?? []) {
    map[n.name.toLowerCase()] = n.region ?? ''
  }
  return map
})

/** Resolve a spot's neighborhood string to a region */
function spotRegion(spot: MapSpot): string {
  return regionLookup.value[spot.neighborhood.toLowerCase()] ?? ''
}

/** Regions that actually have spots on this page (keeps the dropdown relevant) */
const availableRegions = computed(() => {
  const set = new Set<string>()
  for (const spot of props.spots) {
    const r = spotRegion(spot)
    if (r) set.add(r)
  }
  return [...set].sort()
})

const regionOptions = computed(() => [
  { label: 'All Areas', value: 'all' },
  ...availableRegions.value.map((r) => ({ label: r, value: r })),
])

const filteredSpots = computed<MapSpot[]>(() => {
  if (selectedRegion.value === 'all') return props.spots
  return props.spots.filter((s) => spotRegion(s) === selectedRegion.value)
})

const selectedSpot = computed<MapSpot | null>(() => {
  if (!selectedId.value) return null
  // Search all spots (not just filtered) so URL deep links always work
  return props.spots.find((s) => s.id === selectedId.value) ?? null
})

// ── SEO — update title/description when a spot is selected ─────
const spotSeoTitle = computed(() => {
  if (!selectedSpot.value) return props.config.title
  return `${selectedSpot.value.name} — ${props.config.title}`
})

const spotSeoDescription = computed(() => {
  if (!selectedSpot.value) return props.config.description
  const s = selectedSpot.value
  return s.description || `${s.name} in ${s.neighborhood}, Austin — ${s.knownFor}`
})

useSeoMeta({
  title: spotSeoTitle,
  ogTitle: spotSeoTitle,
  description: spotSeoDescription,
  ogDescription: spotSeoDescription,
})

// ── LocalBusiness JSON-LD for Google local search ──────────────
// Emits structured data for map spots — either a single LocalBusiness
// when a specific spot is selected, or an ItemList of all spots.
const localBusinessJsonLd = computed(() => {
  const siteUrl = 'https://austin-texas.net'

  function spotToLocalBusiness(spot: MapSpot) {
    return {
      '@type': 'LocalBusiness',
      name: spot.name,
      ...(spot.description && { description: spot.description }),
      ...(spot.address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: spot.address,
          addressLocality: 'Austin',
          addressRegion: 'TX',
          addressCountry: 'US',
        },
      }),
      geo: {
        '@type': 'GeoCoordinates',
        latitude: spot.lat,
        longitude: spot.lng,
      },
      ...(spot.url && { url: spot.url }),
      ...(spot.priceRange && { priceRange: spot.priceRange }),
      ...(spot.rating && spot.rating > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: spot.rating,
          bestRating: 5,
        },
      }),
    }
  }

  if (selectedSpot.value) {
    // Single selected spot
    return {
      '@context': 'https://schema.org',
      ...spotToLocalBusiness(selectedSpot.value),
    }
  }

  // ItemList of all spots for the category page view
  if (props.spots.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: props.config.title,
    itemListElement: props.spots.slice(0, 20).map((spot, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        ...spotToLocalBusiness(spot),
        url: `${siteUrl}${route.path}?spot=${slugify(spot.name)}`,
      },
    })),
  }
})

useHead(() => ({
  script: localBusinessJsonLd.value
    ? [
        {
          key: 'local-business-jsonld',
          type: 'application/ld+json',
          children: JSON.stringify(localBusinessJsonLd.value),
        },
      ]
    : [],
}))

// ── Spot URL helper (used by SpotList for crawlable links) ─────
function spotUrl(spot: MapSpot): string {
  return `${route.path}?spot=${slugify(spot.name)}`
}

function selectOnMap(slug: string) {
  mapView.value?.scrollToSpot(slug)
}

function clearSelection() {
  selectedId.value = null
}

// Clear detail selection when region changes
watch(selectedRegion, () => clearSelection())
</script>

<template>
  <SubAppShell
    :title="config.title"
    :detail-active="!!selectedSpot"
    :spot-name="selectedSpot?.name"
  >
    <!-- ─── Left panel: data & controls ─── -->
    <template #panel>
      <!-- Header (hidden when a spot is selected) -->
      <div v-if="!selectedSpot" class="animate-fade-up">
        <div class="flex items-center gap-3 mb-3">
          <div
            v-if="category"
            class="flex items-center justify-center size-10 rounded-xl"
            :class="category.bgColor"
          >
            <UIcon :name="category.icon" class="size-5" :class="category.color" />
          </div>
          <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight font-display">
            {{ config.title }}
          </h1>
        </div>

        <!-- eslint-disable vue/no-v-html -- CMS author-controlled text -->
        <p class="text-sm text-muted leading-relaxed mb-4" v-html="config.introText" />
        <!-- eslint-enable vue/no-v-html -->

        <!-- Area filter -->
        <div
          v-if="regionOptions.length > 2"
          class="flex w-fit items-center gap-2 rounded-xl border border-default bg-elevated px-3 py-2 mb-4"
        >
          <UIcon name="i-lucide-map-pin" class="size-4 shrink-0 text-muted" />
          <USelect
            v-model="selectedRegion"
            :items="regionOptions"
            size="sm"
            class="min-w-[140px] max-w-[200px]"
          />
          <span v-if="selectedRegion !== 'all'" class="text-xs text-muted">
            {{ filteredSpots.length }} of {{ spots.length }} spots
          </span>
        </div>
      </div>

      <!-- Selected Spot Detail (replaces list) -->
      <MapSpotDetail
        v-if="selectedSpot"
        :spot="selectedSpot"
        :config="config"
        @back="clearSelection"
      />

      <!-- Ranked List (default) -->
      <MapSpotList
        v-else
        :spots="filteredSpots"
        :accent-color="config.accentColor"
        :category-icon="config.categoryIcon"
        :pin-color="config.pinColor"
        :spot-url-fn="spotUrl"
        @select="selectOnMap"
      />

      <!-- Page-specific related sections (hidden when viewing a spot detail) -->
      <div v-if="!selectedSpot" class="mt-auto pt-4">
        <slot name="related" />
      </div>
    </template>

    <!-- ─── Right: Map fills remaining space ─── -->
    <template #content>
      <ClientOnly>
        <MapContentView
          ref="mapView"
          v-model:selected-id="selectedId"
          :spots="filteredSpots"
          :config="config"
        />
        <template #fallback>
          <div class="mapkit-placeholder">
            <div class="text-center">
              <UIcon name="i-lucide-map" class="mb-2 size-10 text-muted" />
              <p class="text-sm text-muted">Loading map…</p>
            </div>
          </div>
        </template>
      </ClientOnly>
    </template>
  </SubAppShell>
</template>
