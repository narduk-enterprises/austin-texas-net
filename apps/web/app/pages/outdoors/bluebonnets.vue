<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<!-- eslint-disable atx/no-native-layout -- External attribution links to iNaturalist -->
<script setup lang="ts">
/**
 * Bluebonnet Guide — content-first layout with on-demand interactive map.
 *
 * Shows SEO content, best viewing spots, and season info above the fold.
 * The MapKit interactive map loads only when the user clicks the CTA,
 * opening in a fullscreen overlay — zero MapKit JS on initial page load.
 *
 * Data sourced from iNaturalist's citizen-science platform.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'
const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('outdoors')!
const siblings = category.subApps.filter((a) => a.slug !== 'bluebonnets')
const crossLinks = categories.value.filter((c) => c.slug !== 'outdoors').slice(0, 4)
// ── Year filter ────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const selectedYear = ref<string>(String(currentYear))

const yearOptions = computed(() => {
  const opts = [{ label: 'All Time', value: 'all' }]
  for (let y = currentYear; y >= currentYear - 4; y--) {
    opts.push({ label: String(y), value: String(y) })
  }
  return opts
})

// ── Fetch observations ─────────────────────────────────────
const apiUrl = computed(() => {
  const base = '/api/bluebonnets/observations'
  return selectedYear.value === 'all' ? base : `${base}?year=${selectedYear.value}`
})

interface ObservationPoint {
  lat: number
  lng: number
  observed_on: string
  photo_url: string | null
  observer: string
  place: string
  url: string
  quality_grade: string
}

const { data, status } = await useFetch<{
  observations: ObservationPoint[]
  total: number
  fetched: number
  yearRange: { min: number; max: number }
}>(apiUrl, { watch: [apiUrl] })

const observations = computed(() => data.value?.observations ?? [])
const totalCount = computed(() => data.value?.total ?? 0)

// ── Map overlay state ──────────────────────────────────────
const showMap = ref(false)

// ── Center map on Texas once map is ready ───────────────────
const mapRef = ref<{
  setRegion: (center: { lat: number; lng: number }, span?: { lat: number; lng: number }) => void
  zoomToFit: () => void
}>()

// Data is already available from SSR; the map mounts later via ClientOnly.
// Watch for mapRef becoming available, then recenter on Texas.
watch(
  mapRef,
  (map) => {
    if (map && observations.value.length > 0) {
      nextTick(() => {
        setTimeout(() => {
          map.setRegion({ lat: 31.0, lng: -100.4 }, { lat: 12, lng: 12 })
        }, 100)
      })
    }
  },
  { once: true },
)

// ── Map items (pin annotations) ────────────────────────────
interface BluebonnetItem {
  id: string
  lat: number
  lng: number
  quality_grade: string
  has_photo: boolean
}

const mapItems = computed<BluebonnetItem[]>(() =>
  observations.value.map((obs, i) => ({
    id: `bb-${i}`,
    lat: obs.lat,
    lng: obs.lng,
    quality_grade: obs.quality_grade || 'needs_id',
    has_photo: !!obs.photo_url,
  })),
)

// ── Selected observation (click-to-view) ───────────────────
const selectedId = ref<string | null>(null)
const hasEverSelected = ref(false)

const selectedObs = computed<ObservationPoint | null>(() => {
  if (!selectedId.value) return null
  const idx = parseInt(selectedId.value.replace('bb-', ''))
  return observations.value[idx] ?? null
})

watch(selectedId, (id) => {
  if (id) hasEverSelected.value = true
})

// Clear selection when year changes
watch(selectedYear, () => {
  selectedId.value = null
})

// ── Bluebonnet pin factory ─────────────────────────────────

const BLUEBONNET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
  <g transform="translate(16,14)">
    <ellipse cx="0" cy="-7" rx="3.5" ry="6" fill="#5b5fc7" />
    <ellipse cx="6.5" cy="-2" rx="3.5" ry="6" fill="#6e72d4" transform="rotate(72)" />
    <ellipse cx="4" cy="5.5" rx="3.5" ry="6" fill="#5b5fc7" transform="rotate(144)" />
    <ellipse cx="-4" cy="5.5" rx="3.5" ry="6" fill="#6e72d4" transform="rotate(216)" />
    <ellipse cx="-6.5" cy="-2" rx="3.5" ry="6" fill="#5b5fc7" transform="rotate(288)" />
    <circle cx="0" cy="0" r="3" fill="#f7c948" />
  </g>
  <rect x="14.5" y="22" width="3" height="8" rx="1.5" fill="#3d9a50" />
  <ellipse cx="12" cy="26" rx="4" ry="2" fill="#3d9a50" transform="rotate(-30 12 26)" />
</svg>`

function createBluebonnetPin(
  item: BluebonnetItem,
  _isSelected: boolean,
): any {
  if (import.meta.client) {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = BLUEBONNET_SVG
    wrapper.style.cursor = 'pointer'

    // Opacity based on quality grade
    if (item.quality_grade === 'research') {
      wrapper.style.opacity = '1'
    } else if (item.has_photo) {
      wrapper.style.opacity = '0.7'
    } else {
      wrapper.style.opacity = '0.45'
    }

    // Subtle drop shadow for depth
    wrapper.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'

    return {
      element: wrapper,
      cleanup: () => {
        // cleanup observers if any
      },
    }
  }
  return { element: {} as HTMLElement }
}

// ── Bluebonnet cluster factory ──────────────────────────────
// Small flower SVG for cluster bouquet (no stem, just the bloom)
const CLUSTER_FLOWER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
  <g transform="translate(12,12)">
    <ellipse cx="0" cy="-5" rx="2.8" ry="4.8" fill="#5b5fc7"/>
    <ellipse cx="5" cy="-1.5" rx="2.8" ry="4.8" fill="#6e72d4" transform="rotate(72)"/>
    <ellipse cx="3" cy="4.5" rx="2.8" ry="4.8" fill="#5b5fc7" transform="rotate(144)"/>
    <ellipse cx="-3" cy="4.5" rx="2.8" ry="4.8" fill="#6e72d4" transform="rotate(216)"/>
    <ellipse cx="-5" cy="-1.5" rx="2.8" ry="4.8" fill="#5b5fc7" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="2.2" fill="#f7c948"/>
  </g>
</svg>`

// Bouquet layout positions (offset x, y from center in px) for each flower size tier
const BOUQUET_POSITIONS = [
  // 3 flowers: small clusters
  [
    { x: 0, y: -8 },
    { x: -7, y: 5 },
    { x: 7, y: 5 },
  ],
  // 5 flowers: medium/large clusters
  [
    { x: 0, y: -10 },
    { x: -9, y: -2 },
    { x: 9, y: -2 },
    { x: -5, y: 8 },
    { x: 5, y: 8 },
  ],
]

function createBluebonnetCluster(
  _cluster: { memberAnnotations: unknown[]; coordinate: unknown },
  count: number,
): HTMLElement | any {
  if (import.meta.client) {
    const el = document.createElement('div')
    el.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;'

    // Choose layout tier based on count
    const positions =
      (count > 15 ? BOUQUET_POSITIONS[1] : BOUQUET_POSITIONS[0]) ?? BOUQUET_POSITIONS[0]!
    const flowerSize = count > 15 ? 20 : 18
    const wrapperSize = count > 15 ? 52 : 44

    // Build bouquet of flowers
    let flowersHtml = ''
    for (const pos of positions) {
      flowersHtml += `<div style="
      position:absolute;
      width:${flowerSize}px;height:${flowerSize}px;
      left:50%;top:50%;
      transform:translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px));
      filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));
    ">${CLUSTER_FLOWER}</div>`
    }

    const badgeSize = count > 99 ? 22 : 18
    const fontSize = count > 99 ? 9 : 10
    flowersHtml += `<div style="
      position:absolute;bottom:-4px;right:-4px;
      min-width:${badgeSize}px;height:${badgeSize}px;padding:0 4px;
      border-radius:${badgeSize}px;
      background:linear-gradient(145deg,#4a4eae,#3b3f99);
      box-shadow:0 1px 4px rgba(0,0,0,0.3),0 0 0 2px white;
      display:flex;align-items:center;justify-content:center;
      font-size:${fontSize}px;font-weight:800;font-family:var(--font-display);
      color:white;line-height:1;
    ">${count}</div>`

    el.innerHTML = `<div style="
      position:relative;width:${wrapperSize}px;height:${wrapperSize}px;
      transition:transform 0.2s ease;cursor:pointer;
    " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${flowersHtml}</div>`

    return el
  }
  return {} as HTMLElement
}

/** Format ISO date string as human-readable (e.g. "March 15, 2025") */
function formatObsDate(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

usePageSeo({
  title: 'Austin Bluebonnet Map — Where to See Texas Wildflowers',
  description:
    'Find bluebonnets near Austin with our interactive sighting map. See where Texas bluebonnets are blooming now, best spots, peak season timing, and viewing tips.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('outdoors'),
  },
})

// ── Best spots data ────────────────────────────────────
const bestSpots = [
  {
    name: 'Lady Bird Johnson Wildflower Center',
    area: 'Southwest Austin',
    desc: 'Cultivated and wild bluebonnet fields on 284 acres. The best "guaranteed" display.',
  },
  {
    name: 'McKinney Falls State Park',
    area: 'Southeast Austin',
    desc: '726 acres with bluebonnets along hiking trails and creek beds.',
  },
  {
    name: 'Loop 360 (Capital of Texas Hwy)',
    area: 'Central Austin',
    desc: 'TxDOT-maintained wildflower corridors between Hwy 183 and MoPac.',
  },
  {
    name: 'Muleshoe Bend Recreation Area',
    area: '1 hour NW',
    desc: 'Riverfront meadows with sweeping wildflower views.',
  },
  {
    name: 'Brushy Creek Lake Park',
    area: 'Cedar Park',
    desc: '90-acre park with nature trails through bluebonnet fields.',
  },
  {
    name: 'Circle C Metropolitan Park',
    area: 'South Austin',
    desc: 'Trails with large patches of bluebonnets and Indian paintbrush.',
  },
  {
    name: 'Willow City Loop',
    area: 'Fredericksburg',
    desc: '13-mile scenic drive through ranch country. One of the most iconic Hill Country drives.',
  },
  {
    name: 'Old Settlers Park',
    area: 'Round Rock',
    desc: 'Bluebonnets mixed with red Indian paintbrush along picnic areas.',
  },
]

// ── FAQ data for schema + template ─────────────────────
const faqs = [
  {
    question: 'When is bluebonnet season in Austin?',
    answer:
      'Bluebonnet season in Austin typically runs from late February through mid-April, with peak bloom usually occurring in late March to early April. Timing varies year to year depending on fall rainfall and winter temperatures.',
  },
  {
    question: 'Where are the best places to see bluebonnets near Austin?',
    answer:
      'Top spots include the Lady Bird Johnson Wildflower Center, McKinney Falls State Park, Loop 360 (Capital of Texas Highway), Muleshoe Bend Recreation Area, and the Willow City Loop near Fredericksburg. Many Hill Country roadsides also produce excellent displays.',
  },
  {
    question: 'Is it illegal to pick bluebonnets in Texas?',
    answer:
      'Contrary to popular myth, there is no specific Texas law making it illegal to pick bluebonnets. However, it is illegal to trespass on private property, damage public parks, or disturb highway rights-of-way — all of which you would likely violate when picking them. The best practice is to leave them for others to enjoy.',
  },
  {
    question: 'What is the state flower of Texas?',
    answer:
      'The Texas bluebonnet (Lupinus texensis) has been the state flower of Texas since 1901. It is a species of lupine native to the south-central United States, easily recognized by its vibrant blue-violet flower spikes with white tips.',
  },
  {
    question: 'How long do bluebonnets bloom?',
    answer:
      'Individual bluebonnet plants bloom for about 3 to 4 weeks. However, because different plants bloom at different times across the state, the overall season can last 6 to 8 weeks from south to north Texas.',
  },
  {
    question: 'What do bluebonnet seeds need to grow?',
    answer:
      'Bluebonnet seeds require a period of cold temperatures (cold stratification) and adequate fall rainfall to germinate. Seeds that fall in spring lie dormant through summer, germinate after fall rains, grow as rosettes through winter, and bloom the following spring.',
  },
]

useSchemaOrg([
  defineWebPage({
    name: 'Austin Bluebonnet Map — Where to See Texas Wildflowers',
    description:
      'Interactive map of Texas bluebonnet sightings near Austin and across the state. Find where wildflowers are blooming, best viewing spots, and peak season timing.',
  }),
])

// FAQPage structured data — injected via useHead for reliable SSR
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }),
    },
  ],
})
</script>

<template>
  <!-- eslint-disable atx/no-native-layout -- External attribution links to iNaturalist -->
  <div>
    <SubAppTopbar title="Bluebonnet Sightings Map" />
    <UContainer class="py-8 md:py-12">
      <!-- ══════ Hero Section ══════ -->
      <div class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="flex items-center justify-center size-12 rounded-2xl"
            :class="category.bgColor"
          >
            <UIcon name="i-lucide-flower-2" class="size-6" :class="category.color" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Austin Bluebonnet Map
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Texas bluebonnets (<em>Lupinus texensis</em>) bloom across Central Texas every spring.
          Explore
          <strong class="text-default">{{ totalCount.toLocaleString() }}</strong>
          citizen-science observations from
          <ULink
            href="https://www.inaturalist.org"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
            >iNaturalist</ULink
          >.
        </p>
      </div>

      <!-- ══════ Map CTA Card ══════ -->
      <section class="mb-10 animate-fade-up-delay-1">
        <div class="map-cta-card">
          <div class="map-cta-bg" />
          <div
            class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
          >
            <div class="flex-1 min-w-0">
              <h2 class="text-lg sm:text-xl font-bold font-display text-white mb-1">
                Explore the Interactive Map
              </h2>
              <p class="text-sm text-white/70 leading-relaxed">
                See every bluebonnet sighting across Texas. Tap flowers to view photos, filter by
                year, and zoom from statewide to street level.
              </p>
            </div>
            <UButton
              size="lg"
              color="neutral"
              variant="solid"
              icon="i-lucide-map"
              label="Open Map"
              class="shrink-0 font-bold shadow-lg"
              @click="showMap = true"
            />
          </div>

          <!-- Stats row -->
          <div
            class="relative z-10 flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/15"
          >
            <div class="flex items-center gap-1.5 text-sm text-white/80">
              <UIcon name="i-lucide-flower-2" class="size-4" />
              <strong class="text-white">{{ totalCount.toLocaleString() }}</strong>
              <span>observations</span>
            </div>
            <div class="flex items-center gap-1.5 text-sm text-white/80">
              <UIcon name="i-lucide-calendar" class="size-4" />
              <span>Peak season: <strong class="text-white">March – April</strong></span>
            </div>
            <div
              v-if="status === 'pending'"
              class="flex items-center gap-1.5 text-sm text-white/60"
            >
              <div class="size-2 rounded-full bg-white/40 animate-pulse" />
              <span>Loading…</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ Best Spots ══════ -->
      <section class="mb-10 animate-fade-up-delay-1">
        <h2 class="text-xl sm:text-2xl font-bold font-display mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-map-pin" class="size-5 text-primary" />
          Best Bluebonnet Spots Near Austin
        </h2>
        <div class="grid sm:grid-cols-2 gap-3">
          <div v-for="spot in bestSpots" :key="spot.name" class="spot-card">
            <div class="flex items-start gap-2.5">
              <UIcon name="i-lucide-flower-2" class="size-4 text-primary shrink-0 mt-0.5" />
              <div class="min-w-0">
                <h3 class="text-sm font-bold text-default">{{ spot.name }}</h3>
                <p class="text-xs text-muted mt-0.5">
                  <span class="font-medium text-default/70">{{ spot.area }}</span> — {{ spot.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ When Do Bluebonnets Bloom ══════ -->
      <section class="mb-10">
        <h2 class="text-xl sm:text-2xl font-bold font-display mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-calendar" class="size-5 text-primary" />
          When Do Bluebonnets Bloom in Austin?
        </h2>
        <div class="prose-card">
          <p>
            Texas bluebonnet season typically begins in
            <strong>late February</strong> and runs through <strong>mid-April</strong>. Peak bloom
            around Austin and the Hill Country usually occurs in
            <strong>late March to early April</strong>, although exact timing depends on fall
            rainfall and winter temperatures.
          </p>
          <p>
            Mild winters with good fall rain produce earlier, more spectacular displays. Hot, dry
            conditions can shorten the season. The bloom generally moves from south to north across
            Texas over about 6 to 8 weeks.
          </p>
        </div>
      </section>

      <!-- ══════ Viewing Tips ══════ -->
      <section class="mb-10">
        <h2 class="text-xl sm:text-2xl font-bold font-display mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-camera" class="size-5 text-primary" />
          Tips for Viewing &amp; Photographing Bluebonnets
        </h2>
        <div class="grid sm:grid-cols-2 gap-3">
          <div class="tip-card">
            <UIcon name="i-lucide-sun" class="size-5 text-primary shrink-0" />
            <div>
              <h3 class="text-sm font-bold text-default mb-0.5">Best Time of Day</h3>
              <p class="text-xs text-muted leading-relaxed">
                Early morning and late afternoon produce the best light. Overcast days work
                beautifully for even lighting without harsh shadows.
              </p>
            </div>
          </div>
          <div class="tip-card">
            <UIcon name="i-lucide-footprints" class="size-5 text-primary shrink-0" />
            <div>
              <h3 class="text-sm font-bold text-default mb-0.5">Stay on Paths</h3>
              <p class="text-xs text-muted leading-relaxed">
                Walk around patches rather than through them. Trampled flowers won't reseed,
                reducing next year's bloom.
              </p>
            </div>
          </div>
          <div class="tip-card">
            <UIcon name="i-lucide-bug" class="size-5 text-primary shrink-0" />
            <div>
              <h3 class="text-sm font-bold text-default mb-0.5">Watch for Wildlife</h3>
              <p class="text-xs text-muted leading-relaxed">
                Fields attract bees and butterflies. Fire ants and snakes may be present — wear
                closed-toe shoes.
              </p>
            </div>
          </div>
          <div class="tip-card">
            <UIcon name="i-lucide-shield-check" class="size-5 text-primary shrink-0" />
            <div>
              <h3 class="text-sm font-bold text-default mb-0.5">Respect Private Property</h3>
              <p class="text-xs text-muted leading-relaxed">
                Many roadside displays are on private land. Don't trespass, and always park safely
                off the road.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ About the Texas Bluebonnet ══════ -->
      <section class="mb-10">
        <h2 class="text-xl sm:text-2xl font-bold font-display mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-leaf" class="size-5 text-primary" />
          About the Texas Bluebonnet
        </h2>
        <div class="prose-card">
          <p>
            The <strong>Texas bluebonnet</strong> (<em>Lupinus texensis</em>) has been the
            <strong>state flower of Texas since 1901</strong>. It's a species of lupine native to
            the south-central United States, part of the legume family. The distinctive flower
            spikes feature deep blue-violet petals with a white tip that turns red-purple after
            pollination.
          </p>
          <p>
            Bluebonnets are <strong>winter annuals</strong> — seeds germinate in fall after the
            first good rains, grow as low rosettes through winter, and send up flower stalks in
            spring. After setting seed, the plants die back completely. The seeds can remain viable
            in the soil for years, waiting for the right conditions to germinate.
          </p>
          <p>
            As a legume, bluebonnets fix nitrogen in the soil through symbiotic bacteria in their
            roots, making them ecologically important for enriching Texas prairie soils. They're a
            keystone species of the Texas wildflower ecosystem.
          </p>
        </div>
      </section>

      <!-- ══════ FAQ ══════ -->
      <section class="mb-10">
        <h2 class="text-xl sm:text-2xl font-bold font-display mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-circle-help" class="size-5 text-primary" />
          Frequently Asked Questions
        </h2>
        <UAccordion
          :items="faqs.map((f, i) => ({ label: f.question, content: f.answer, value: String(i) }))"
          type="multiple"
        />
      </section>

      <!-- ══════ More in Outdoors ══════ -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-3">
          More in Outdoors
        </h2>
        <div class="grid sm:grid-cols-2 gap-2">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/outdoors/${app.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30"
          >
            <div class="min-w-0">
              <h3 class="text-sm font-semibold">{{ app.title }}</h3>
              <p class="text-xs text-muted truncate">{{ app.description }}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0 ml-2">
              <UBadge
                :color="app.status === 'live' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
                :label="app.status === 'live' ? 'Live' : 'Soon'"
              />
              <UIcon
                name="i-lucide-chevron-right"
                class="size-3.5 text-dimmed group-hover:text-primary transition-colors"
              />
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- ══════ Explore More Categories ══════ -->
      <section class="mb-8">
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-3">Explore More</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2 rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30"
          >
            <UIcon :name="c.icon" class="size-4" :class="c.color" />
            <span class="text-sm font-medium">{{ c.title }}</span>
          </NuxtLink>
        </div>
      </section>

      <!-- iNaturalist attribution -->
      <div class="pt-4 border-t border-default text-xs text-dimmed leading-relaxed">
        Data from
        <ULink
          href="https://www.inaturalist.org"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
          >iNaturalist</ULink
        >. Observations contributed by citizen scientists for
        <ULink
          href="https://www.inaturalist.org/taxa/49564-Lupinus-texensis"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
          >Lupinus texensis</ULink
        >.
      </div>
    </UContainer>

    <!-- ══════ Fullscreen Map Modal ══════ -->
    <UModal
      v-model:open="showMap"
      :ui="{ content: 'sm:max-w-full sm:h-dvh sm:rounded-none' }"
      fullscreen
    >
      <template #content>
        <div class="flex flex-col h-dvh">
          <!-- Map topbar -->
          <div class="map-modal-topbar shrink-0 z-20">
            <div class="flex items-center gap-3 min-w-0">
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="i-lucide-arrow-left"
                class="topbar-close-btn"
                @click="showMap = false"
              />
              <div class="flex items-center gap-2">
                <div class="flex items-center justify-center size-7 rounded-full bg-white/15">
                  <UIcon name="i-lucide-flower-2" class="size-3.5 text-white" />
                </div>
                <h2 class="text-sm font-bold font-display truncate text-white">
                  Bluebonnet Sightings
                </h2>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UButton
                variant="ghost"
                size="xs"
                icon="i-lucide-maximize-2"
                label="Reset"
                class="topbar-ghost-btn"
                @click="mapRef?.zoomToFit()"
              />
              <div class="topbar-year-pill">
                <UIcon name="i-lucide-calendar" class="size-3.5 shrink-0 text-white/60" />
                <USelect
                  v-model="selectedYear"
                  :items="yearOptions"
                  size="xs"
                  class="min-w-[90px] topbar-select"
                />
              </div>
              <div class="topbar-badge">
                <template v-if="status !== 'pending'">
                  <strong class="text-white">{{ observations.length.toLocaleString() }}</strong>
                  <span class="text-white/60">shown</span>
                </template>
                <template v-else>
                  <div class="size-2 rounded-full bg-white/40 animate-pulse" />
                  <span class="text-white/60">Loading…</span>
                </template>
              </div>
            </div>
          </div>

          <!-- Map + optional side panel -->
          <div class="map-modal-body flex flex-1 min-h-0">
            <!-- Selected observation panel (slide over on mobile, side panel on desktop) -->
            <aside
              v-if="selectedObs"
              class="w-full sm:w-[360px] sm:max-w-[360px] border-r border-default overflow-y-auto p-4 bg-default order-2 sm:order-1 shrink-0"
            >
              <UButton
                variant="link"
                color="neutral"
                size="sm"
                icon="i-lucide-arrow-left"
                label="Back to Map"
                class="text-xs font-bold uppercase tracking-widest mb-4"
                @click="selectedId = null"
              />

              <div class="spot-detail-panel">
                <!-- Hero photo -->
                <div v-if="selectedObs.photo_url" class="spot-hero-wrapper">
                  <img
                    :src="selectedObs.photo_url"
                    alt="Bluebonnet observation"
                    class="spot-hero-img"
                    loading="lazy"
                  />
                  <div class="spot-hero-gradient" />
                </div>
                <div
                  v-else
                  class="w-full h-36 rounded-t-2xl bg-elevated flex items-center justify-center"
                >
                  <UIcon name="i-lucide-image-off" class="size-10 text-dimmed" />
                </div>

                <div class="spot-detail-body">
                  <div class="flex items-start gap-3 mb-3">
                    <div
                      class="flex items-center justify-center size-9 rounded-full shrink-0"
                      :class="category.bgColor"
                    >
                      <UIcon name="i-lucide-flower-2" class="size-4" :class="category.color" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="text-lg font-extrabold font-display leading-tight">
                        Texas Bluebonnet
                      </h3>
                      <p
                        v-if="selectedObs.place"
                        class="text-xs text-muted mt-0.5 flex items-center gap-1"
                      >
                        <UIcon name="i-lucide-map-pin" class="size-3 shrink-0" />
                        {{ selectedObs.place }}
                      </p>
                    </div>
                  </div>

                  <!-- Meta row -->
                  <div class="flex flex-wrap items-center gap-1.5 mb-4">
                    <UBadge
                      v-if="selectedObs.observed_on"
                      :label="formatObsDate(selectedObs.observed_on)"
                      color="neutral"
                      variant="subtle"
                      size="xs"
                      icon="i-lucide-calendar"
                    />
                    <UBadge
                      :label="selectedObs.observer"
                      color="neutral"
                      variant="subtle"
                      size="xs"
                      icon="i-lucide-user"
                    />
                    <UBadge
                      label="Lupinus texensis"
                      color="success"
                      variant="subtle"
                      size="xs"
                      icon="i-lucide-leaf"
                    />
                  </div>

                  <UButton
                    :to="selectedObs.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="soft"
                    color="primary"
                    size="xs"
                    trailing-icon="i-lucide-external-link"
                    label="View on iNaturalist"
                  />
                </div>
              </div>
            </aside>

            <!-- Map fills remaining space -->
            <div class="relative flex-1 min-w-0 order-1 sm:order-2">
              <ClientOnly>
                <AppMapKit
                  ref="mapRef"
                  v-model:selected-id="selectedId"
                  :items="mapItems"
                  :create-pin-element="createBluebonnetPin"
                  :create-cluster-element="createBluebonnetCluster"
                  clustering-identifier="bluebonnets"
                  :annotation-size="{ width: 28, height: 28 }"
                  :fallback-center="{ lat: 31.0, lng: -99.5 }"
                  :bounding-padding="1.2"
                  :zoom-span="{ lat: 0.15, lng: 0.2 }"
                  preserve-region
                  texas-mask
                />
                <template #fallback>
                  <div class="map-loading-state">
                    <div class="map-loading-shimmer" />
                    <div class="map-loading-content">
                      <div class="map-loading-icon">
                        <UIcon name="i-lucide-flower-2" class="size-8 text-primary/80" />
                      </div>
                      <p class="text-sm font-medium text-muted mt-3">Preparing map…</p>
                      <div class="flex items-center gap-1.5 mt-2">
                        <div class="size-1.5 rounded-full bg-primary/40 animate-pulse" />
                        <div
                          class="size-1.5 rounded-full bg-primary/30 animate-pulse"
                          style="animation-delay: 0.2s"
                        />
                        <div
                          class="size-1.5 rounded-full bg-primary/20 animate-pulse"
                          style="animation-delay: 0.4s"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </ClientOnly>

              <!-- Interaction hint -->
              <Transition name="fade">
                <div v-if="!hasEverSelected && observations.length > 0" class="hint-chip">
                  <UIcon name="i-lucide-mouse-pointer-click" class="size-4" />
                  <span>Tap a flower to see the photo</span>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<!-- eslint-disable atx/no-style-block-layout -->
<style scoped>
/* ── Map CTA card ──────────────────────────────────────────── */
.map-cta-card {
  position: relative;
  padding: 24px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #3b3f99, #5b5fc7 50%, #4e8a3e);
}

.map-cta-bg {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='24' height='24' opacity='0.08'%3E%3Cg transform='translate(16,14)'%3E%3Cellipse cx='0' cy='-7' rx='3.5' ry='6' fill='%23fff'/%3E%3Cellipse cx='6.5' cy='-2' rx='3.5' ry='6' fill='%23fff' transform='rotate(72)'/%3E%3Cellipse cx='4' cy='5.5' rx='3.5' ry='6' fill='%23fff' transform='rotate(144)'/%3E%3Cellipse cx='-4' cy='5.5' rx='3.5' ry='6' fill='%23fff' transform='rotate(216)'/%3E%3Cellipse cx='-6.5' cy='-2' rx='3.5' ry='6' fill='%23fff' transform='rotate(288)'/%3E%3Ccircle cx='0' cy='0' r='3' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: repeat;
  pointer-events: none;
}

/* ── Spot cards ────────────────────────────────────────────── */
.spot-card {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  transition: border-color 0.2s ease;
}

.spot-card:hover {
  border-color: var(--ui-color-primary);
}

/* ── Tip cards ─────────────────────────────────────────────── */
.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
}

/* ── Prose card ────────────────────────────────────────────── */
.prose-card {
  padding: 20px 24px;
  border-radius: 12px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
}

.prose-card p {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--ui-text-muted);
  margin-bottom: 0.75rem;
}

.prose-card p:last-child {
  margin-bottom: 0;
}

.prose-card strong {
  color: var(--ui-text);
}

/* ── Spot detail panel (inside map modal) ──────────────────── */
.spot-detail-panel {
  border-radius: 12px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

:is(.dark) .spot-detail-panel {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.spot-detail-body {
  padding: 16px 20px 20px;
}

.spot-hero-wrapper {
  position: relative;
  width: 100%;
  max-height: 260px;
  overflow: hidden;
}

.spot-hero-img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  display: block;
}

.spot-hero-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(to top, var(--ui-bg), transparent);
  pointer-events: none;
}

/* ── Floating hint chip ─────────────────────────────────────── */
.hint-chip {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

:is(.dark) .hint-chip {
  background: rgba(255, 255, 255, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Animate in ─────────────────────────────────────────────── */
.animate-fade-up {
  animation: fadeUp 0.5s ease both;
}

.animate-fade-up-delay-1 {
  animation: fadeUp 0.5s ease 0.1s both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Map modal topbar ──────────────────────────────────────── */
.map-modal-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 48px;
  background: linear-gradient(135deg, #3b3f99, #4e8a3e);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.topbar-close-btn {
  color: white !important;
}

.topbar-close-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}

.topbar-ghost-btn {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 11px;
}

.topbar-ghost-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  color: white !important;
}

.topbar-year-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.topbar-select :deep(select) {
  background: transparent !important;
  border: none !important;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.topbar-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
}

/* ── Map fills modal viewport ──────────────────────────────── */
.map-modal-body :deep(.mapkit-wrapper) {
  height: 100%;
  max-height: none;
  min-height: 0;
  border-bottom: none;
}

/* ── Map loading state ─────────────────────────────────────── */
.map-loading-state {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--ui-bg-elevated);
  overflow: hidden;
}

.map-loading-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--ui-primary-rgb, 132, 204, 22), 0.04) 40%,
    rgba(var(--ui-primary-rgb, 132, 204, 22), 0.08) 50%,
    rgba(var(--ui-primary-rgb, 132, 204, 22), 0.04) 60%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: map-shimmer 2s ease-in-out infinite;
}

@keyframes map-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.map-loading-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ui-bg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  animation: map-icon-pulse 2s ease-in-out infinite;
}

@keyframes map-icon-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}
</style>
