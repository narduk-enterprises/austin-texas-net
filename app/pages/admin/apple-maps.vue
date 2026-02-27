<!-- eslint-disable atx/no-fetch-in-component -- Admin tool page -->
<script setup lang="ts">
definePageMeta({ title: 'Apple Maps API Tester', middleware: 'auth' })

const { ensureLoaded } = useAuth()
await ensureLoaded()

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Form State ───────────────────────────────────────────────
const endpoint = ref('search')
const query = ref('')
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)
const limit = ref(10)
const resultTypeFilter = ref('')
const includeAddressCategories = ref('')

const endpointOptions = [
  { label: 'Search (POIs)', value: 'search', description: 'General place search via /v1/search' },
  {
    label: 'Geocode (Address → Coords)',
    value: 'geocode',
    description: 'Address to coordinates via /v1/geocode',
  },
  {
    label: 'Reverse Geocode (Coords → Address)',
    value: 'reverseGeocode',
    description: 'Coordinates to address via /v1/reverseGeocode',
  },
  {
    label: 'Neighborhood (SubLocality)',
    value: 'neighborhood',
    description: '/v1/search with resultTypeFilter=Address & SubLocality',
  },
  {
    label: 'Search (Address Results)',
    value: 'searchAddress',
    description: '/v1/search with resultTypeFilter=Address (all categories)',
  },
]

const presets = [
  { label: 'Hyde Park', query: 'Hyde Park', endpoint: 'neighborhood' },
  { label: 'Zilker', query: 'Zilker', endpoint: 'neighborhood' },
  { label: 'Downtown', query: 'Downtown', endpoint: 'neighborhood' },
  { label: 'East César Chávez', query: 'East César Chávez', endpoint: 'neighborhood' },
  { label: 'Mueller', query: 'Mueller', endpoint: 'neighborhood' },
  { label: 'Tarrytown', query: 'Tarrytown', endpoint: 'neighborhood' },
  { label: 'Barton Hills', query: 'Barton Hills', endpoint: 'neighborhood' },
  { label: 'Geocode: Hyde Park', query: 'Hyde Park, Austin, TX', endpoint: 'geocode' },
  { label: 'Rev: Zilker Park', query: '', endpoint: 'reverseGeocode', lat: 30.2669, lng: -97.7729 },
  { label: 'Rev: Hyde Park', query: '', endpoint: 'reverseGeocode', lat: 30.307, lng: -97.7268 },
  { label: 'Rev: Downtown', query: '', endpoint: 'reverseGeocode', lat: 30.2672, lng: -97.7431 },
  { label: 'Rev: East Austin', query: '', endpoint: 'reverseGeocode', lat: 30.2612, lng: -97.7195 },
  { label: 'Rev: South Lamar', query: '', endpoint: 'reverseGeocode', lat: 30.243, lng: -97.7735 },
  { label: 'POI: tacos', query: 'breakfast tacos', endpoint: 'search' },
]

// ─── Results ──────────────────────────────────────────────────
interface TestResult {
  endpoint: string
  requestUrl: string
  status: number
  elapsed: string
  resultCount: number
  neighborhoodFields: any[]
  rawResponse: any
}

const result = ref<TestResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const viewMode = ref<'formatted' | 'raw'>('formatted')
const expandedResults = ref<Set<number>>(new Set())
const history = ref<
  Array<{ endpoint: string; query: string; resultCount: number; elapsed: string }>
>([])
const selectedMapPin = ref<string | null>(null)
const fillLatLngOnClick = ref(false)

// Controls which nested objects are expanded (key = "resultIndex-path")
const expandedPaths = ref<Set<string>>(new Set())

// ─── Map ref & geolocation ────────────────────────────────────
const mapRef = ref<{
  setRegion: (center: { lat: number; lng: number }, span?: { lat: number; lng: number }) => void
  zoomToFit: () => void
} | null>(null)
const locating = ref(false)

function goToMyLocation() {
  if (!navigator.geolocation) return
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locating.value = false
      const myLat = pos.coords.latitude
      const myLng = pos.coords.longitude
      mapRef.value?.setRegion({ lat: myLat, lng: myLng }, { lat: 0.008, lng: 0.008 })
    },
    () => {
      locating.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

// ─── Visible map region (updated on pan/zoom) ─────────────────
const mapRegion = ref<{
  latDelta: number
  lngDelta: number
  centerLat: number
  centerLng: number
} | null>(null)

async function runTest() {
  loading.value = true
  error.value = null
  result.value = null
  expandedResults.value = new Set()
  expandedPaths.value = new Set()
  selectedMapPin.value = null

  try {
    const body: any = { endpoint: endpoint.value }
    if (query.value) body.query = query.value
    // Use explicit lat/lng if set, otherwise fall back to the map's visible center
    const useLat = lat.value ?? mapRegion.value?.centerLat
    const useLng = lng.value ?? mapRegion.value?.centerLng
    if (useLat != null) body.lat = Number(useLat)
    if (useLng != null) body.lng = Number(useLng)
    if (limit.value) body.limit = Number(limit.value)
    if (resultTypeFilter.value) body.resultTypeFilter = resultTypeFilter.value
    if (includeAddressCategories.value)
      body.includeAddressCategories = includeAddressCategories.value

    const data = await $fetch<TestResult>('/api/admin/apple-maps-test', {
      method: 'POST',
      body,
    })

    result.value = data
    history.value.unshift({
      endpoint: data.endpoint,
      query: query.value || `${lat.value},${lng.value}`,
      resultCount: data.resultCount,
      elapsed: data.elapsed,
    })
    if (history.value.length > 20) history.value.pop()
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}

function applyPreset(p: (typeof presets)[number]) {
  endpoint.value = p.endpoint
  query.value = p.query
  if ('lat' in p) lat.value = p.lat!
  if ('lng' in p) lng.value = p.lng!
  runTest()
}

const selectedEndpointInfo = computed(() => endpointOptions.find((e) => e.value === endpoint.value))

// ─── Map-related helpers ──────────────────────────────────────

/** Map-compatible items derived from raw results with coordinates */
const mapItems = computed(() => {
  if (!result.value?.rawResponse?.results) return []
  return result.value.rawResponse.results
    .filter((r: any) => r.coordinate?.latitude && r.coordinate?.longitude)
    .map((r: any, idx: number) => ({
      id: r.muid?.toString() || r.name || `result-${idx}`,
      lat: r.coordinate.latitude as number,
      lng: r.coordinate.longitude as number,
      name: r.name || r.formattedAddressLines?.join(', ') || '—',
      index: idx,
    }))
})

function createPinElement(baseItem: { id: string; lat: number; lng: number }, isSelected: boolean) {
  const item = baseItem as { id: string; lat: number; lng: number; name: string; index: number }
  const el = document.createElement('div')
  el.className = `mapkit-pin${isSelected ? ' is-selected' : ''}`
  el.setAttribute('data-map-pin', '')
  el.innerHTML = `
    <div class="mapkit-pin-bubble">
      <div class="mapkit-pin-circle">
        <span class="mapkit-pin-icon" style="font-size:14px;color:white;font-weight:800;">${item.index + 1}</span>
      </div>
    </div>
    <span class="mapkit-pin-name">${item.name}</span>
  `
  return { element: el }
}

function handleRegionChange(region: {
  latDelta: number
  lngDelta: number
  centerLat: number
  centerLng: number
}) {
  mapRegion.value = region
}

function handleMapClick(coords: { lat: number; lng: number }) {
  if (!fillLatLngOnClick.value) return
  lat.value = Math.round(coords.lat * 1e6) / 1e6
  lng.value = Math.round(coords.lng * 1e6) / 1e6
  selectedMapPin.value = null
}

function searchVisibleArea() {
  if (!mapRegion.value) return
  lat.value = Math.round(mapRegion.value.centerLat * 1e6) / 1e6
  lng.value = Math.round(mapRegion.value.centerLng * 1e6) / 1e6
  runTest()
}

function selectResult(index: number) {
  const items = mapItems.value
  const item = items.find((i: any) => i.index === index)
  if (item) {
    selectedMapPin.value = selectedMapPin.value === item.id ? null : item.id
  }
}

// ─── Helpers for the formatted result view ────────────────────
function getValueType(val: any): string {
  if (val === null || val === undefined) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val
}

function isExpandable(val: any): boolean {
  if (val === null || val === undefined) return false
  if (Array.isArray(val)) return val.length > 0 && typeof val[0] === 'object'
  return typeof val === 'object'
}

function togglePath(key: string) {
  if (expandedPaths.value.has(key)) {
    expandedPaths.value.delete(key)
  } else {
    expandedPaths.value.add(key)
  }
  expandedPaths.value = new Set(expandedPaths.value)
}

function toggleResultRaw(index: number) {
  if (expandedResults.value.has(index)) {
    expandedResults.value.delete(index)
  } else {
    expandedResults.value.add(index)
  }
  expandedResults.value = new Set(expandedResults.value)
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string') return val
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]'
    if (val.every((v: any) => typeof v !== 'object' || v === null)) {
      return val.join(', ')
    }
    return '[' + val.length + ' items]'
  }
  return JSON.stringify(val)
}

function getResultName(item: any): string {
  return item.name || item.formattedAddressLines?.join(', ') || item.displayName || '—'
}

const allResults = computed(() => {
  if (!result.value?.rawResponse?.results) return []
  return result.value.rawResponse.results
})

function flatKeys(obj: any): Array<{ key: string; value: any }> {
  if (!obj || typeof obj !== 'object') return []
  return Object.entries(obj).map(([key, value]) => ({ key, value }))
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto py-8 px-4 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-map-pin" class="size-7 text-primary" />
        <h1 class="text-2xl font-bold">Apple Maps API Tester</h1>
      </div>
      <UButton variant="outline" color="neutral" to="/admin" icon="i-lucide-arrow-left">
        Admin
      </UButton>
    </div>

    <!-- Quick Presets -->
    <UCard>
      <template #header>
        <span class="font-semibold text-sm">Quick Presets</span>
      </template>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="p in presets"
          :key="p.label"
          size="xs"
          variant="soft"
          color="primary"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </UButton>
      </div>
    </UCard>

    <!-- Request Builder -->
    <UCard>
      <template #header>
        <div class="flex flex-col gap-1">
          <span class="font-semibold">Request Builder</span>
          <span v-if="selectedEndpointInfo" class="text-xs text-dimmed">
            {{ selectedEndpointInfo.description }}
          </span>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <USelect v-model="endpoint" :items="endpointOptions" value-key="value" label="Endpoint" />
          <UInput
            v-model="query"
            placeholder="Search query or address"
            icon="i-lucide-search"
            label="Query"
          />
          <UInput
            v-model.number="limit"
            type="number"
            placeholder="10"
            icon="i-lucide-hash"
            label="Limit"
          />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <UInput
            v-model.number="lat"
            type="number"
            step="0.0001"
            placeholder="30.2672"
            icon="i-lucide-navigation"
            label="Latitude"
          />
          <UInput
            v-model.number="lng"
            type="number"
            step="0.0001"
            placeholder="-97.7431"
            icon="i-lucide-navigation"
            label="Longitude"
          />
          <div class="flex items-end">
            <UButton
              variant="outline"
              color="neutral"
              icon="i-lucide-x"
              size="sm"
              :disabled="lat == null && lng == null"
              @click="
                () => {
                  lat = null
                  lng = null
                }
              "
            >
              Clear
            </UButton>
          </div>
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <UInput
            v-model="resultTypeFilter"
            placeholder="e.g. Poi, Address"
            icon="i-lucide-filter"
            label="resultTypeFilter (override)"
          />
          <UInput
            v-model="includeAddressCategories"
            placeholder="e.g. SubLocality, PostalCode"
            icon="i-lucide-tag"
            label="includeAddressCategories (override)"
          />
        </div>

        <UButton
          color="primary"
          icon="i-lucide-send"
          :loading="loading"
          class="self-start"
          @click="runTest"
        >
          Send Request
        </UButton>
      </div>
    </UCard>

    <!-- Error -->
    <UCard v-if="error" class="border-error/25">
      <div class="flex items-center gap-3 text-error">
        <UIcon name="i-lucide-alert-circle" class="size-5" />
        <span class="text-sm font-medium">{{ error }}</span>
      </div>
    </UCard>

    <!-- ═══ MAP PANEL (always visible) ═══ -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-map" class="size-4 text-primary" />
            <span class="font-semibold">Map View</span>
            <UBadge v-if="mapItems.length" variant="subtle" color="neutral" size="xs"
              >{{ mapItems.length }} pins</UBadge
            >
          </div>
          <UCheckbox
            v-model="fillLatLngOnClick"
            label="Click map to fill lat/lng"
            class="text-xs"
          />
        </div>
      </template>
      <div class="amt-map-wrapper">
        <div class="amt-search-area-btn">
          <UButton
            size="sm"
            color="primary"
            variant="solid"
            icon="i-lucide-scan-search"
            :loading="loading"
            @click="searchVisibleArea"
          >
            Search This Area
          </UButton>
        </div>
        <div class="absolute bottom-3 left-3 z-10 flex gap-2">
          <UButton
            size="sm"
            variant="solid"
            color="neutral"
            icon="i-lucide-locate-fixed"
            :loading="locating"
            @click="goToMyLocation"
          >
            My Location
          </UButton>
          <UButton
            v-if="mapItems.length"
            size="sm"
            variant="solid"
            color="neutral"
            icon="i-lucide-maximize"
            @click="mapRef?.zoomToFit()"
          >
            Zoom to Results
          </UButton>
        </div>
        <AppMapKit
          ref="mapRef"
          v-model:selected-id="selectedMapPin"
          :items="mapItems"
          :create-pin-element="createPinElement"
          :fallback-center="{ lat: 30.2672, lng: -97.7431 }"
          :bounding-padding="0.1"
          :annotation-size="{ width: 100, height: 56 }"
          preserve-region
          @region-change="handleRegionChange"
          @map-click="handleMapClick"
        />
      </div>
    </UCard>

    <!-- Results -->
    <template v-if="result">
      <!-- Response Meta -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold">Response</span>
            <div class="flex gap-2 items-center">
              <UBadge
                variant="subtle"
                :color="result.status === 200 ? 'success' : 'error'"
                size="xs"
              >
                {{ result.status }}
              </UBadge>
              <UBadge variant="subtle" color="neutral" size="xs">
                {{ result.elapsed }}
              </UBadge>
              <UBadge variant="subtle" color="primary" size="xs">
                {{ result.resultCount }} results
              </UBadge>
            </div>
          </div>
        </template>
        <div class="text-xs font-mono text-dimmed break-all">
          {{ result.requestUrl }}
        </div>
      </UCard>

      <!-- View Mode Switcher -->
      <div class="flex items-center gap-3">
        <span class="text-sm font-semibold text-dimmed">View:</span>
        <div class="flex rounded-lg overflow-hidden border border-default">
          <UButton
            variant="ghost"
            class="amt-view-tab"
            :class="{ active: viewMode === 'formatted' }"
            @click="viewMode = 'formatted'"
          >
            <UIcon name="i-lucide-layout-list" class="size-3.5" />
            Formatted
          </UButton>
          <UButton
            variant="ghost"
            class="amt-view-tab"
            :class="{ active: viewMode === 'raw' }"
            @click="viewMode = 'raw'"
          >
            <UIcon name="i-lucide-braces" class="size-3.5" />
            Raw JSON
          </UButton>
        </div>
      </div>

      <!-- ═══ RAW VIEW ═══ -->
      <UCard v-if="viewMode === 'raw'">
        <template #header>
          <span class="font-semibold">Full Raw Response</span>
        </template>
        <pre class="amt-raw-json">{{ JSON.stringify(result.rawResponse, null, 2) }}</pre>
      </UCard>

      <!-- ═══ FORMATTED VIEW ═══ -->
      <template v-if="viewMode === 'formatted'">
        <!-- Top-level response keys (outside of results array) -->
        <UCard v-if="result.rawResponse">
          <template #header>
            <span class="font-semibold">Response Metadata</span>
          </template>
          <div class="amt-kv-grid">
            <template v-for="{ key, value } in flatKeys(result.rawResponse)" :key="key">
              <template v-if="key !== 'results'">
                <div class="amt-kv-key">{{ key }}</div>
                <div class="amt-kv-val" :class="'amt-val-' + getValueType(value)">
                  {{ formatValue(value) }}
                </div>
              </template>
            </template>
          </div>
        </UCard>

        <!-- Individual Results -->
        <UCard>
          <template #header>
            <span class="font-semibold">Results ({{ allResults.length }})</span>
          </template>

          <div v-if="allResults.length" class="flex flex-col gap-4">
            <div
              v-for="(item, i) in allResults"
              :key="i"
              class="amt-result-card"
              :class="{ 'ring-2 ring-primary/40': mapItems[Number(i)]?.id === selectedMapPin }"
            >
              <!-- Result Header -->
              <div class="amt-result-header">
                <div
                  class="flex items-center gap-2 min-w-0 cursor-pointer"
                  @click="selectResult(Number(i))"
                >
                  <UBadge variant="solid" color="primary" size="xs">{{ Number(i) + 1 }}</UBadge>
                  <span class="font-semibold text-sm truncate">{{ getResultName(item) }}</span>
                  <UIcon
                    v-if="item.coordinate"
                    name="i-lucide-locate"
                    class="size-3.5 text-dimmed shrink-0"
                  />
                </div>
                <UButton
                  variant="ghost"
                  class="amt-raw-toggle"
                  :class="{ active: expandedResults.has(Number(i)) }"
                  @click="toggleResultRaw(Number(i))"
                >
                  <UIcon name="i-lucide-braces" class="size-3" />
                  {{ expandedResults.has(Number(i)) ? 'Formatted' : 'Raw' }}
                </UButton>
              </div>

              <!-- Per-result Raw JSON -->
              <pre v-if="expandedResults.has(Number(i))" class="amt-raw-json text-[0.65rem]">{{
                JSON.stringify(item, null, 2)
              }}</pre>

              <!-- Per-result Formatted Key/Values -->
              <div v-else class="amt-kv-grid">
                <template v-for="{ key, value } in flatKeys(item)" :key="key">
                  <!-- Simple value -->
                  <template v-if="!isExpandable(value)">
                    <div class="amt-kv-key">{{ key }}</div>
                    <div class="amt-kv-val" :class="'amt-val-' + getValueType(value)">
                      <template v-if="Array.isArray(value) && value.length > 0">
                        <div class="flex gap-1 flex-wrap">
                          <UBadge
                            v-for="(v, vi) in value"
                            :key="vi"
                            variant="subtle"
                            color="info"
                            size="xs"
                          >
                            {{ v }}
                          </UBadge>
                        </div>
                      </template>
                      <template v-else>
                        {{ formatValue(value) }}
                      </template>
                    </div>
                  </template>

                  <!-- Expandable nested object -->
                  <template v-else>
                    <div class="amt-kv-key col-span-2">
                      <UButton
                        variant="ghost"
                        class="amt-expand-btn"
                        @click="togglePath(i + '-' + key)"
                      >
                        <UIcon
                          :name="
                            expandedPaths.has(i + '-' + key)
                              ? 'i-lucide-chevron-down'
                              : 'i-lucide-chevron-right'
                          "
                          class="size-3.5"
                        />
                        <span>{{ key }}</span>
                        <span class="amt-expand-hint">
                          {{
                            Array.isArray(value)
                              ? '[' + value.length + ']'
                              : '{' + Object.keys(value).length + '}'
                          }}
                        </span>
                      </UButton>
                    </div>

                    <!-- Nested object contents -->
                    <template v-if="expandedPaths.has(i + '-' + key)">
                      <!-- Array of objects -->
                      <template v-if="Array.isArray(value)">
                        <div class="col-span-2 amt-nested-block">
                          <div v-for="(arrItem, ai) in value" :key="ai" class="amt-nested-item">
                            <UBadge variant="outline" color="neutral" size="xs" class="mb-1">{{
                              ai
                            }}</UBadge>
                            <div class="amt-kv-grid nested">
                              <template
                                v-for="{ key: nk, value: nv } in flatKeys(arrItem)"
                                :key="nk"
                              >
                                <div class="amt-kv-key">{{ nk }}</div>
                                <div class="amt-kv-val" :class="'amt-val-' + getValueType(nv)">
                                  {{ formatValue(nv) }}
                                </div>
                              </template>
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Plain object -->
                      <template v-else>
                        <div class="col-span-2 amt-nested-block">
                          <div class="amt-kv-grid nested">
                            <template v-for="{ key: nk, value: nv } in flatKeys(value)" :key="nk">
                              <div class="amt-kv-key">{{ nk }}</div>
                              <div class="amt-kv-val" :class="'amt-val-' + getValueType(nv)">
                                <template v-if="typeof nv === 'object' && nv !== null">
                                  <span class="font-mono text-[0.65rem]">{{
                                    JSON.stringify(nv)
                                  }}</span>
                                </template>
                                <template v-else>
                                  {{ formatValue(nv) }}
                                </template>
                              </div>
                            </template>
                          </div>
                        </div>
                      </template>
                    </template>
                  </template>
                </template>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-dimmed text-sm">No results returned</div>
        </UCard>
      </template>
    </template>

    <!-- History -->
    <UCard v-if="history.length">
      <template #header>
        <span class="font-semibold text-sm">Request History ({{ history.length }})</span>
      </template>
      <div class="flex flex-col">
        <div
          v-for="(h, i) in history"
          :key="i"
          class="flex items-center gap-3 py-2 border-b border-default last:border-b-0 text-sm"
        >
          <UBadge variant="subtle" color="neutral" size="xs" class="min-w-[100px] justify-center">
            {{ h.endpoint }}
          </UBadge>
          <span class="flex-1 font-medium truncate">{{ h.query }}</span>
          <span class="tabular-nums text-dimmed text-xs">{{ h.resultCount }} results</span>
          <span class="tabular-nums text-dimmed text-xs">{{ h.elapsed }}</span>
        </div>
      </div>
    </UCard>
  </div>
</template>
