<!-- eslint-disable atx/no-fetch-in-component -- Admin tool page -->
<!-- eslint-disable atx/no-inline-hex -- Map overlay and palette colors -->
<!-- eslint-disable atx/no-native-form, atx/no-native-input -- Admin tool checkbox toggles -->
<script setup lang="ts">
definePageMeta({ title: 'Grid Crawler', middleware: 'auth' })

const { ensureLoaded } = useAuth()
await ensureLoaded()

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Status data ──────────────────────────────────────────────
interface GridStatus {
  grid: { rows: number; cols: number; totalPoints: number; spacingMeters: number }
  progress: {
    crawled: number
    labeled: number
    unlabeled: number
    remaining: number
    percent: string
    estimatedDaysRemaining: number
  }
  lastPosition: { row: number; col: number } | null
  neighborhoods: { uniqueCount: number; byName: Array<{ name: string; points: number }> }
}

const status = ref<GridStatus | null>(null)
const statusLoading = ref(false)

async function loadStatus() {
  statusLoading.value = true
  try {
    status.value = await $fetch<GridStatus>('/api/admin/neighborhood-grid/status')
  } catch (err: any) {
    console.error('Failed to load status:', err)
  } finally {
    statusLoading.value = false
  }
}

// Load on mount
onMounted(loadStatus)

// ─── Crawl ────────────────────────────────────────────────────
const batchSize = ref(500)
const startLat = ref<number | null>(30.445) // 7603 Bellflower Cove
const startLng = ref<number | null>(-97.792)
const resetGrid = ref(false)
const crawlLoading = ref(false)
const crawlResult = ref<any>(null)
const crawlError = ref<string | null>(null)

async function runCrawl() {
  crawlLoading.value = true
  crawlError.value = null
  crawlResult.value = null

  try {
    const body: any = { batchSize: batchSize.value, delayMs: 50 }
    if (startLat.value != null && startLng.value != null) {
      body.startLat = startLat.value
      body.startLng = startLng.value
    }
    if (resetGrid.value) {
      body.reset = true
      resetGrid.value = false // auto-uncheck after use
    }
    const data = await $fetch('/api/admin/neighborhood-grid/crawl', {
      method: 'POST',
      body,
    })
    crawlResult.value = data
    // Ensure crawled neighborhoods are visible
    if (data.neighborhoodsFound?.length) {
      for (const n of data.neighborhoodsFound) hiddenNeighborhoods.delete(n)
    }
    // Clear start coords after first run so subsequent batches auto-resume
    startLat.value = null
    startLng.value = null
    // Refresh status and shapes after crawl
    await Promise.all([loadStatus(), loadShapes(), loadPoints()])
  } catch (err: any) {
    crawlError.value = err?.data?.message || err?.message || 'Unknown error'
  } finally {
    crawlLoading.value = false
  }
}

// ─── Shapes / GeoJSON ─────────────────────────────────────────
const shapesLoading = ref(false)
const shapes = ref<any>(null)

async function loadShapes() {
  shapesLoading.value = true
  try {
    shapes.value = await $fetch('/api/admin/neighborhood-grid/shapes?minPoints=3')
  } catch (err: any) {
    console.error('Failed to load shapes:', err)
  } finally {
    shapesLoading.value = false
  }
}

// Load shapes on mount too (if any exist from prior crawls)
onMounted(loadShapes)

// ─── Crawled points for dot visualization ─────────────────────
interface CrawledPoint {
  lat: number
  lng: number
  neighborhood: string | null
}
const crawledPoints = ref<CrawledPoint[]>([])
const showDots = ref(true)

async function loadPoints() {
  try {
    crawledPoints.value = await $fetch<CrawledPoint[]>('/api/admin/neighborhood-grid/points')
  } catch (err: any) {
    console.error('Failed to load points:', err)
  }
}

onMounted(loadPoints)

// ─── Map annotation items (labels only) ─────────────────────────
interface LabelItem {
  id: string
  lat: number
  lng: number
  name: string
}

// ─── Visibility toggles ──────────────────────────────────────
const hiddenNeighborhoods = reactive(new Set<string>())

function toggleNeighborhood(name: string) {
  if (hiddenNeighborhoods.has(name)) {
    hiddenNeighborhoods.delete(name)
  } else {
    hiddenNeighborhoods.add(name)
  }
}

function showAll() {
  hiddenNeighborhoods.clear()
}
function hideAll() {
  const all = shapes.value?.features?.map((f: any) => f.properties.name as string) || []
  for (const n of all) hiddenNeighborhoods.add(n)
}

// Filtered shapes for map (only visible neighborhoods)
const filteredShapes = computed(() => {
  if (!shapes.value?.features?.length) return null
  return {
    ...shapes.value,
    features: shapes.value.features.filter((f: any) => !hiddenNeighborhoods.has(f.properties.name)),
  }
})

// Label items from shape centroids
const labelItems = computed<LabelItem[]>(() => {
  if (!filteredShapes.value?.features?.length) return []
  return filteredShapes.value.features
    .filter((f: any) => f.properties.centerLat && f.properties.centerLng)
    .map((f: any) => ({
      id: f.properties.name,
      lat: f.properties.centerLat,
      lng: f.properties.centerLng,
      name: f.properties.name,
    }))
})

function createLabelElement(item: LabelItem) {
  const el = document.createElement('div')
  el.style.cssText =
    'font-size:12px;font-weight:700;color:#1e293b;white-space:nowrap;pointer-events:none;text-shadow:0 0 4px #fff,0 0 4px #fff,0 0 8px #fff'
  el.textContent = item.name
  return { element: el }
}

// ─── Circle overlays for crawled point dots ──────────────────
// Zoom-responsive: radius adjusts so dots always look ~3px on screen
const mapLatDelta = ref(0.15) // default: city-level zoom
const viewportBounds = ref({ minLat: 30.1, maxLat: 30.5, minLng: -98.0, maxLng: -97.5 })

let regionChangeTimer: ReturnType<typeof setTimeout> | null = null
function onRegionChange(span: {
  latDelta: number
  lngDelta: number
  centerLat?: number
  centerLng?: number
}) {
  if (regionChangeTimer) clearTimeout(regionChangeTimer)
  regionChangeTimer = setTimeout(() => {
    mapLatDelta.value = span.latDelta
    if (span.centerLat != null && span.centerLng != null) {
      const bufLat = span.latDelta * 0.6
      const bufLng = span.lngDelta * 0.6
      viewportBounds.value = {
        minLat: span.centerLat - bufLat,
        maxLat: span.centerLat + bufLat,
        minLng: span.centerLng - bufLng,
        maxLng: span.centerLng + bufLng,
      }
    }
  }, 300)
}

// Dot radius in meters — scales with zoom so dots are always tiny
const dotRadius = computed(() => {
  // latDelta ~0.15 (city) → ~50m, ~0.01 (street) → ~4m
  return Math.max(4, mapLatDelta.value * 350)
})

const circleItems = computed(() => {
  if (!showDots.value || !crawledPoints.value.length) return []
  const radius = dotRadius.value
  const { minLat, maxLat, minLng, maxLng } = viewportBounds.value
  return crawledPoints.value
    .filter((p) => {
      // Visibility toggle
      if (p.neighborhood && hiddenNeighborhoods.has(p.neighborhood)) return false
      // Viewport culling
      if (p.lat < minLat || p.lat > maxLat || p.lng < minLng || p.lng > maxLng) return false
      return true
    })
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      radius,
      color: p.neighborhood ? getNeighborhoodColor(p.neighborhood) : '#94a3b8',
      opacity: 0.6,
    }))
})

// All neighborhoods from shapes for the checkbox list
const allShapeNames = computed(() => {
  return shapes.value?.features?.map((f: any) => f.properties.name as string).sort() || []
})

// Color palette for neighborhood polygons
const NEIGHBORHOOD_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#84cc16',
  '#0ea5e9',
  '#7c3aed',
  '#c026d3',
  '#e11d48',
  '#059669',
  '#0284c7',
]

function getNeighborhoodColor(name: string) {
  const allNames = shapes.value?.features?.map((f: any) => f.properties.name) || []
  const idx = allNames.indexOf(name)
  return NEIGHBORHOOD_COLORS[idx % NEIGHBORHOOD_COLORS.length] || '#3b82f6'
}

function overlayStyleFn(properties: any) {
  const color = getNeighborhoodColor(properties.name)
  return {
    strokeColor: color,
    strokeOpacity: 0.9,
    fillColor: color,
    fillOpacity: 0.25,
    lineWidth: 2,
  }
}

// Selected feature for tooltip
const selectedFeature = ref<any>(null)

function onFeatureSelect(feature: any) {
  selectedFeature.value = feature
}

// Computed helpers
const progressPercent = computed(() => {
  if (!status.value) return 0
  const { crawled, remaining } = status.value.progress
  return crawled + remaining > 0 ? Math.round((crawled / (crawled + remaining)) * 100) : 0
})

const topNeighborhoods = computed(() => {
  return status.value?.neighborhoods.byName.slice(0, 50) ?? []
})

const shapeCount = computed(() => shapes.value?.features?.length || 0)

// ─── Click-to-crawl ──────────────────────────────────────────
const clickCrawlEnabled = ref(true)
const clickCrawlLoading = ref(false)
const clickCrawlStatus = ref<string | null>(null)

async function onMapClick(coords: { lat: number; lng: number }) {
  if (!clickCrawlEnabled.value || clickCrawlLoading.value) return

  clickCrawlLoading.value = true
  clickCrawlStatus.value = `Crawling around ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}…`

  try {
    const data = await $fetch<any>('/api/admin/neighborhood-grid/crawl', {
      method: 'POST',
      body: {
        focusLat: coords.lat,
        focusLng: coords.lng,
        focusRadiusKm: 0.5,
        focusStepMeters: 100,
        batchSize: 200,
        delayMs: 30,
      },
    })
    clickCrawlStatus.value = data.message
    // Ensure crawled neighborhoods are visible
    if (data.neighborhoodsFound?.length) {
      for (const n of data.neighborhoodsFound) hiddenNeighborhoods.delete(n)
    }
    // Auto-refresh shapes and status
    await Promise.all([loadShapes(), loadStatus(), loadPoints()])
  } catch (err: any) {
    clickCrawlStatus.value = `Error: ${err?.data?.message || err?.message || 'Unknown'}`
  } finally {
    clickCrawlLoading.value = false
    // Clear status after 5s
    setTimeout(() => {
      clickCrawlStatus.value = null
    }, 5000)
  }
}

function setMyAddress() {
  startLat.value = 30.445
  startLng.value = -97.792
}

function setDowntownAddress() {
  startLat.value = 30.267
  startLng.value = -97.743
}

function clearAddress() {
  startLat.value = null
  startLng.value = null
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto py-8 px-4 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-grid-3x3" class="size-7 text-primary" />
        <div>
          <h1 class="text-2xl font-bold">Neighborhood Grid Crawler</h1>
          <p class="text-sm text-dimmed">
            Reverse geocode Austin to discover neighborhood boundaries via dependentLocalities
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <UButton
          variant="outline"
          color="neutral"
          to="/admin/apple-maps"
          icon="i-lucide-map-pin"
          size="sm"
        >
          API Tester
        </UButton>
        <UButton variant="outline" color="neutral" to="/admin" icon="i-lucide-arrow-left" size="sm">
          Admin
        </UButton>
      </div>
    </div>

    <!-- Live Map Preview -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-map" class="size-4 text-primary" />
            <span class="font-semibold">Shape Preview</span>
            <UBadge v-if="shapeCount" variant="subtle" color="success" size="xs"
              >{{ shapeCount }} polygons</UBadge
            >
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-1.5 text-xs cursor-pointer select-none">
              <input v-model="showDots" type="checkbox" class="rounded" />
              <span>Show dots</span>
            </label>
            <label class="flex items-center gap-1.5 text-xs cursor-pointer select-none">
              <input v-model="clickCrawlEnabled" type="checkbox" class="rounded" />
              <span>Click to crawl</span>
            </label>
            <UButton
              size="xs"
              variant="soft"
              color="primary"
              icon="i-lucide-refresh-cw"
              :loading="shapesLoading"
              @click="loadShapes"
            >
              Refresh
            </UButton>
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-3">
        <!-- Map -->
        <div class="rounded-lg overflow-hidden border border-default" style="height: 500px">
          <AppMapKit
            :items="labelItems"
            :create-pin-element="createLabelElement"
            :circles="circleItems"
            :geojson="filteredShapes"
            :overlay-style-fn="overlayStyleFn"
            :fallback-center="{ lat: 30.35, lng: -97.75 }"
            :bounding-padding="0.1"
            :annotation-size="{ width: 140, height: 18 }"
            @feature-select="onFeatureSelect"
            @map-click="onMapClick"
            @region-change="onRegionChange"
          />
        </div>

        <!-- Click-to-crawl status -->
        <div
          v-if="clickCrawlLoading || clickCrawlStatus"
          class="flex items-center gap-2 text-sm px-1"
        >
          <div v-if="clickCrawlLoading" class="size-3 rounded-full bg-primary animate-pulse" />
          <UIcon v-else name="i-lucide-check" class="size-3.5 text-success" />
          <span :class="clickCrawlLoading ? 'text-primary' : 'text-dimmed'">{{
            clickCrawlStatus
          }}</span>
        </div>
        <p v-else-if="clickCrawlEnabled && shapeCount" class="text-xs text-dimmed text-center">
          💡 Click anywhere on the map to crawl that area at high resolution (0.5km radius, 100m
          step)
        </p>

        <!-- Selected neighborhood tooltip -->
        <div
          v-if="selectedFeature"
          class="border border-primary/25 rounded-lg p-3 flex items-center justify-between bg-primary/5"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="size-4 text-primary" />
            <span class="font-semibold">{{ selectedFeature.properties.name }}</span>
          </div>
          <div class="flex gap-2">
            <UBadge variant="subtle" color="neutral" size="xs"
              >{{ selectedFeature.properties.pointCount }} points</UBadge
            >
            <UButton size="xs" variant="ghost" color="neutral" @click="selectedFeature = null">
              <UIcon name="i-lucide-x" class="size-3" />
            </UButton>
          </div>
        </div>

        <!-- Neighborhood toggles -->
        <div v-if="allShapeNames.length" class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-dimmed"
              >Toggle Neighborhoods ({{ allShapeNames.length }})</span
            >
            <div class="flex gap-2">
              <UButton size="xs" variant="ghost" color="neutral" @click="showAll">Show All</UButton>
              <UButton size="xs" variant="ghost" color="neutral" @click="hideAll">Hide All</UButton>
            </div>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <label
              v-for="name in allShapeNames"
              :key="name"
              class="flex items-center gap-1.5 text-sm cursor-pointer select-none"
            >
              <input
                type="checkbox"
                :checked="!hiddenNeighborhoods.has(name)"
                class="rounded"
                @change="toggleNeighborhood(name)"
              />
              <span
                class="inline-block w-2.5 h-2.5 rounded-full"
                :style="{ backgroundColor: getNeighborhoodColor(name) }"
              />
              <span>{{ name }}</span>
            </label>
          </div>
        </div>

        <p v-if="!shapeCount" class="text-sm text-dimmed text-center py-2">
          No shapes yet — run a crawl batch to discover neighborhoods, then shapes will appear here
          automatically.
        </p>
      </div>
    </UCard>

    <!-- Progress Overview -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-semibold">Crawl Progress</span>
          <UButton
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-lucide-refresh-cw"
            :loading="statusLoading"
            @click="loadStatus"
          >
            Refresh
          </UButton>
        </div>
      </template>

      <div v-if="status" class="flex flex-col gap-4">
        <!-- Progress bar -->
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium"
              >{{ status.progress.crawled.toLocaleString() }} of
              {{ status.grid.totalPoints.toLocaleString() }} points</span
            >
            <span class="text-dimmed">{{ status.progress.percent }}</span>
          </div>
          <div class="w-full bg-default rounded-full h-3 border border-default">
            <div
              class="bg-primary h-full rounded-full transition-all duration-500"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
        </div>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="border border-default rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-primary">
              {{ status.neighborhoods.uniqueCount }}
            </div>
            <div class="text-xs text-dimmed">Neighborhoods Found</div>
          </div>
          <div class="border border-default rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-success">
              {{ status.progress.labeled.toLocaleString() }}
            </div>
            <div class="text-xs text-dimmed">Labeled Points</div>
          </div>
          <div class="border border-default rounded-lg p-3 text-center">
            <div class="text-2xl font-bold">{{ status.progress.unlabeled.toLocaleString() }}</div>
            <div class="text-xs text-dimmed">Unlabeled Points</div>
          </div>
          <div class="border border-default rounded-lg p-3 text-center">
            <div class="text-2xl font-bold">~{{ status.progress.estimatedDaysRemaining }}d</div>
            <div class="text-xs text-dimmed">Days Remaining</div>
          </div>
        </div>

        <!-- Grid info -->
        <div class="text-xs text-dimmed flex flex-wrap gap-4">
          <span>Grid: {{ status.grid.rows }} rows × {{ status.grid.cols }} cols</span>
          <span>Spacing: {{ status.grid.spacingMeters }}m</span>
          <span v-if="status.lastPosition"
            >Last: row {{ status.lastPosition.row }}, col {{ status.lastPosition.col }}</span
          >
        </div>
      </div>

      <div v-else class="text-center py-6 text-dimmed text-sm">Loading status...</div>
    </UCard>

    <!-- Crawl Controls -->
    <UCard>
      <template #header>
        <span class="font-semibold">Run Batch</span>
      </template>

      <div class="flex flex-col gap-4">
        <!-- Start location -->
        <div class="flex flex-wrap items-end gap-3">
          <UInput
            v-model.number="startLat"
            type="number"
            step="0.001"
            label="Start Lat"
            placeholder="auto-resume"
            class="w-[140px]"
          />
          <UInput
            v-model.number="startLng"
            type="number"
            step="0.001"
            label="Start Lng"
            placeholder="auto-resume"
            class="w-[140px]"
          />
          <UButton size="xs" variant="ghost" color="neutral" @click="setMyAddress">
            📍 My Address
          </UButton>
          <UButton size="xs" variant="ghost" color="neutral" @click="setDowntownAddress">
            🏛️ Downtown
          </UButton>
          <UButton size="xs" variant="ghost" color="neutral" @click="clearAddress">
            ↩ Auto-resume
          </UButton>
        </div>

        <!-- Batch size + controls -->
        <div class="flex flex-wrap items-end gap-3">
          <UInput
            v-model.number="batchSize"
            type="number"
            label="Batch Size"
            placeholder="500"
            :min="1"
            :max="2000"
            class="w-[140px]"
          />
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input v-model="resetGrid" type="checkbox" class="rounded" />
            <span class="text-error">Reset grid first</span>
          </label>
          <UButton color="primary" icon="i-lucide-play" :loading="crawlLoading" @click="runCrawl">
            Start Crawl
          </UButton>
        </div>
        <p class="text-xs text-dimmed">
          Grid: ~20K points (urban Austin only). Each point = 1 API call. At 500 points with 50ms
          delay, a batch takes ~25s. Leave lat/lng blank to auto-resume from last crawled position.
        </p>
      </div>
    </UCard>

    <!-- Crawl Result -->
    <UCard v-if="crawlError" class="border-error/25">
      <div class="flex items-center gap-3 text-error">
        <UIcon name="i-lucide-alert-circle" class="size-5" />
        <span class="text-sm font-medium">{{ crawlError }}</span>
      </div>
    </UCard>

    <UCard v-if="crawlResult">
      <template #header>
        <span class="font-semibold">Crawl Result</span>
      </template>
      <div class="flex flex-col gap-3">
        <p class="text-sm">{{ crawlResult.message }}</p>
        <div class="flex flex-wrap gap-2">
          <UBadge variant="subtle" color="success" size="xs"
            >{{ crawlResult.crawled }} crawled</UBadge
          >
          <UBadge variant="subtle" color="primary" size="xs"
            >{{ crawlResult.withNeighborhood }} with neighborhood</UBadge
          >
          <UBadge v-if="crawlResult.failed > 0" variant="subtle" color="error" size="xs"
            >{{ crawlResult.failed }} failed</UBadge
          >
          <UBadge variant="subtle" color="neutral" size="xs"
            >{{ crawlResult.uniqueNeighborhoodsInBatch }} unique in batch</UBadge
          >
        </div>
        <div v-if="crawlResult.neighborhoodsFound?.length" class="flex flex-wrap gap-1">
          <UBadge
            v-for="n in crawlResult.neighborhoodsFound"
            :key="n"
            variant="soft"
            color="primary"
            size="xs"
          >
            {{ n }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- Neighborhoods Found -->
    <UCard v-if="topNeighborhoods.length">
      <template #header>
        <span class="font-semibold"
          >Neighborhoods Discovered ({{ status?.neighborhoods.uniqueCount || 0 }})</span
        >
      </template>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="n in topNeighborhoods"
          :key="n.name"
          class="border border-default rounded-lg px-3 py-2 text-sm flex items-center gap-2"
        >
          <span class="font-medium">{{ n.name }}</span>
          <UBadge variant="subtle" color="neutral" size="xs">{{ n.points }} pts</UBadge>
        </div>
      </div>
    </UCard>
  </div>
</template>
