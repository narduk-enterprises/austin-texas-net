<!-- eslint-disable narduk/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
import type {
  GeoJSONFeatureCollection,
  GeoJSONFeatureProperties,
  OverlayStyle,
} from '~/components/AppMapKit.vue'

/**
 * neighborhoods/[slug].vue — Individual neighborhood page.
 * Fetches neighborhood data from the API by slug.
 * Data-driven alternative to the static [category]/[slug].vue catch-all.
 */

interface NeighborhoodData {
  id: number
  name: string
  slug: string
  lat: number
  lng: number
  city: string
  region: string
  zipCode: string | null
  description: string | null
  longDescription: string | null
  population: number | null
  featured: boolean
}

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data, error } = await useFetch<{
  neighborhood: NeighborhoodData
  spots: Array<{
    id: string
    name: string
    neighborhood?: string
    neighborhoodRank?: number
    priceRange?: string
    knownFor?: string
    description?: string
    rating?: number
    url?: string
    [key: string]: unknown
  }>
}>(`/api/neighborhoods/${slug.value}`)

if (error.value || !data.value?.neighborhood) {
  throw createError({ statusCode: 404, statusMessage: 'Neighborhood not found', fatal: true })
}

const neighborhood = computed(() => data.value!.neighborhood)
const spots = computed(() => data.value!.spots || [])

const displayName = computed(() => neighborhood.value.name)
const cityLabel = computed(() => {
  const city = neighborhood.value.city
  return city && city !== 'Austin' ? `, ${city}` : ''
})

useSeo({
  title: `${displayName.value}${cityLabel.value} — Austin Neighborhood Guide`,
  description:
    neighborhood.value.description ||
    `Explore ${displayName.value}${cityLabel.value} — local dining, activities, real estate, and everything you need to know about this Austin-area neighborhood.`,
  ogImage: {
    title: displayName.value,
    description: neighborhood.value.description ?? undefined,
    category: 'neighborhoods',
  },
})

useWebPageSchema({
  name: `${displayName.value} Neighborhood Guide`,
  description:
    neighborhood.value.description ||
    `Guide to ${displayName.value}${cityLabel.value} — dining, activities, and neighborhood info.`,
})

const { items: breadcrumbs } = useBreadcrumbs()

// ── GeoJSON boundary data (single neighborhood) ─────────────
const { data: neighborhoodGeojson } = await useFetch<GeoJSONFeatureCollection>(
  '/api/neighborhoods/geojson',
  { key: `neighborhood-geojson-${slug.value}`, query: { slug: slug.value } },
)

function overlayStyleFn(_properties: GeoJSONFeatureProperties): OverlayStyle {
  /* eslint-disable narduk/no-inline-hex -- MapKit overlay style */
  return {
    strokeColor: '#0d9488',
    strokeOpacity: 0.9,
    fillColor: '#14b8a6',
    fillOpacity: 0.15,
    lineWidth: 2.5,
  }
  /* eslint-enable narduk/no-inline-hex */
}

// Fetch sibling neighborhoods in the same region
const { data: regionData } = await useFetch('/api/neighborhoods', {
  query: { region: neighborhood.value.region },
})

const siblings = computed(() =>
  (regionData.value?.neighborhoods ?? [])
    .filter((n: { slug: string }) => n.slug !== slug.value)
    .slice(0, 6),
)

// Cross-category links
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
          <!-- Map pin icon -->
          <div
            class="size-20 rounded-3xl inline-flex items-center justify-center mb-6"
            style="
              background: linear-gradient(135deg, var(--color-orange-500), var(--color-orange-700));
            "
          >
            <UIcon name="i-lucide-map-pin" class="size-10 text-white" />
          </div>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            {{ displayName }}
          </h1>

          <div class="flex items-center justify-center gap-2 mb-4">
            <UBadge
              v-if="neighborhood.city && neighborhood.city !== 'Austin'"
              color="neutral"
              variant="subtle"
              size="md"
              :label="neighborhood.city"
            />
            <UBadge
              v-if="neighborhood.region"
              color="primary"
              variant="subtle"
              size="md"
              :label="neighborhood.region"
            />
            <UBadge
              v-if="neighborhood.zipCode"
              color="neutral"
              variant="outline"
              size="md"
              :label="neighborhood.zipCode"
            />
          </div>

          <p class="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed">
            {{
              neighborhood.description ||
              `Explore ${displayName}${cityLabel} — dining, entertainment, real estate, and local life in this Austin-area neighborhood.`
            }}
          </p>
        </div>
      </section>

      <!-- Neighborhood Boundary Map (static, non-interactive) -->
      <section
        v-if="neighborhoodGeojson"
        class="neighborhood-map-section mb-8 -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:overflow-hidden lg:border lg:border-default"
      >
        <ClientOnly>
          <AppMapKit
            :geojson="neighborhoodGeojson"
            :overlay-style-fn="overlayStyleFn"
            :bounding-padding="0.3"
            :min-span-delta="0.03"
            :is-scroll-enabled="false"
            :is-zoom-enabled="false"
            :is-rotate-enabled="false"
            :shows-points-of-interest="false"
            :center-label="displayName"
          />
          <template #fallback>
            <div class="mapkit-placeholder">
              <div class="mapkit-spinner" />
              <p class="text-sm text-muted mt-3">Loading map…</p>
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Quick Facts -->
      <section class="rounded-2xl border border-default bg-elevated p-6 sm:p-8 mb-8">
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-5">Quick Facts</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center">
            <p class="text-xs text-dimmed uppercase tracking-wide mb-1">Region</p>
            <p class="text-sm font-semibold">{{ neighborhood.region || '—' }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-dimmed uppercase tracking-wide mb-1">City</p>
            <p class="text-sm font-semibold">{{ neighborhood.city || 'Austin' }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-dimmed uppercase tracking-wide mb-1">ZIP Code</p>
            <p class="text-sm font-semibold">{{ neighborhood.zipCode || '—' }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-dimmed uppercase tracking-wide mb-1">Coordinates</p>
            <p class="text-sm font-semibold">
              {{ neighborhood.lat.toFixed(2) }}°N, {{ Math.abs(neighborhood.lng).toFixed(2) }}°W
            </p>
          </div>
        </div>
      </section>

      <!-- Long Description / Backstory -->
      <section
        v-if="neighborhood.longDescription"
        class="rounded-2xl border border-default bg-elevated p-6 sm:p-8 mb-8"
      >
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-5">
          About {{ displayName }}
        </h2>
        <div
          class="prose-neighborhood text-[0.92rem] leading-[1.85] text-muted whitespace-pre-line"
        >
          {{ neighborhood.longDescription }}
        </div>
      </section>

      <!-- Top Spots in Neighborhood -->
      <section v-if="spots.length > 0" class="mb-8">
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4 text-center">
          Best in {{ displayName }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="spot in spots"
            :key="spot.id"
            class="group bg-elevated border border-default rounded-2xl p-5 transition-all hover:border-accented hover:shadow-sm"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <span
                  v-if="spot.neighborhoodRank"
                  class="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[0.65rem] font-bold"
                >
                  {{ spot.neighborhoodRank }}
                </span>
                <h3 class="font-bold text-[0.95rem]">{{ spot.name }}</h3>
              </div>
              <UBadge v-if="spot.priceRange" color="neutral" variant="soft" size="xs">
                {{ spot.priceRange }}
              </UBadge>
            </div>
            <p
              v-if="spot.knownFor"
              class="text-[0.7rem] font-semibold text-primary uppercase tracking-wide mb-2"
            >
              {{ spot.knownFor }}
            </p>
            <p class="text-[0.8rem] text-muted leading-relaxed line-clamp-3 mb-4">
              {{ spot.description }}
            </p>
            <div class="flex items-center justify-between mt-auto">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-star" class="size-3 text-warning" />
                <span class="text-[0.7rem] font-bold">{{ spot.rating || '—' }}</span>
              </div>
              <UButton
                v-if="spot.url"
                :to="spot.url"
                target="_blank"
                rel="noopener noreferrer"
                variant="link"
                color="primary"
                size="xs"
                icon="i-lucide-external-link"
                label="Website"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Coming soon placeholder (if no spots yet) -->
      <section v-else class="rounded-2xl border border-default bg-elevated p-6 sm:p-8 mb-8">
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">What's Coming</h2>
        <div class="text-sm text-muted leading-relaxed space-y-3">
          <p>
            We're building <strong class="text-default">{{ displayName }}</strong
            >'s neighborhood guide as part of
            <NuxtLink to="/neighborhoods/" class="text-primary hover:underline"
              >Neighborhoods</NuxtLink
            >
            on Austin-Texas.net — a set of free, fast, locally-focused tools powered by live data.
          </p>
          <p>
            When this page is fully built out, you'll find local dining and drinks, real estate
            trends, things to do, parks and green spaces, and community insights — all specific to
            <strong class="text-default">{{ displayName }}</strong
            >.
          </p>
        </div>
      </section>

      <!-- Sibling neighborhoods in same region -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in {{ neighborhood.region }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="n in siblings"
            :key="n.slug"
            :to="`/neighborhoods/${n.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-elevated p-4 transition-all duration-200 hover:border-accented hover:shadow-sm"
          >
            <div>
              <h3 class="text-sm font-semibold mb-1">{{ n.name }}</h3>
              <p class="text-xs text-muted line-clamp-1">{{ n.city }}</p>
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-dimmed group-hover:text-primary transition-colors shrink-0 ml-3"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- Back to all neighborhoods -->
      <section class="mb-8">
        <UButton
          to="/neighborhoods/"
          variant="outline"
          color="neutral"
          size="lg"
          label="View all neighborhoods"
          icon="i-lucide-arrow-left"
        />
      </section>

      <!-- Cross-links -->
      <section class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 rounded-xl border border-default bg-elevated px-4 py-3 transition-all duration-200 hover:border-accented"
          >
            <UIcon :name="c.icon" class="size-4" :class="c.color" />
            <span class="text-sm font-medium">{{ c.title }}</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </UContainer>
</template>

<style scoped>
/* Static neighborhood map — prevent scroll hijacking on mobile */
.neighborhood-map-section :deep(.mapkit-wrapper) {
  height: 250px;
}

@media (min-width: 640px) {
  .neighborhood-map-section :deep(.mapkit-wrapper) {
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .neighborhood-map-section :deep(.mapkit-wrapper) {
    height: 350px;
  }
}

/* Ensure touch events pass through the static map to page scroll */
.neighborhood-map-section :deep(.mapkit-canvas) {
  touch-action: auto !important;
  pointer-events: none;
}
</style>
