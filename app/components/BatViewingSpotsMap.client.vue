<script setup lang="ts">
import { appleMapsUrl, type ViewingSpot } from '~/data/bat-spots'

const props = defineProps<{
  spots: ViewingSpot[]
}>()

const runtimeConfig = useRuntimeConfig()
const mapkitJsApiKey = String(runtimeConfig.public.mapkitToken || '')

const mapElement = ref<HTMLElement | null>(null)
const selectedSpotId = ref(props.spots[0]?.id || '')
const loadError = ref('')
const mapReady = ref(false)

const selectedSpot = computed(() => {
  return props.spots.find(spot => spot.id === selectedSpotId.value) || props.spots[0]
})

let mapKitLoadPromise: Promise<any> | null = null
let mapInstance: any | null = null
let renderedAnnotations: any[] = []

function markerColor(isSelected: boolean) {
  // eslint-disable-next-line atx/no-inline-hex
  return isSelected ? '#6d28d9' : '#4338ca'
}

function annotationForSpot(spotId: string) {
  return renderedAnnotations.find(annotation => String(annotation?.spotId) === spotId)
}

function updateAnnotationStyles() {
  for (const annotation of renderedAnnotations) {
    const isSelected = String(annotation?.spotId) === selectedSpotId.value
    annotation.color = markerColor(isSelected)
    annotation.displayPriority = isSelected ? 1000 : 500
  }
}

function focusSpotOnMap(spot: ViewingSpot) {
  if (!mapInstance || !(window as any).mapkit) {
    return
  }

  const mapkit = (window as any).mapkit
  const coordinate = new mapkit.Coordinate(spot.latitude, spot.longitude)
  const span = new mapkit.CoordinateSpan(0.01, 0.01)

  mapInstance.setRegionAnimated(new mapkit.CoordinateRegion(coordinate, span))

  const annotation = annotationForSpot(spot.id)
  if (annotation && typeof mapInstance.selectAnnotation === 'function') {
    mapInstance.selectAnnotation(annotation)
  }
}

function renderAnnotations() {
  if (!mapInstance || !(window as any).mapkit) {
    return
  }

  const mapkit = (window as any).mapkit

  if (renderedAnnotations.length > 0) {
    mapInstance.removeAnnotations(renderedAnnotations)
  }

  renderedAnnotations = props.spots.map((spot, index) => {
    const isSelected = spot.id === selectedSpotId.value

    const annotation = new mapkit.MarkerAnnotation(
      new mapkit.Coordinate(spot.latitude, spot.longitude),
      {
        title: spot.name,
        subtitle: spot.subtitle,
        color: markerColor(isSelected),
        glyphText: String(index + 1),
        // eslint-disable-next-line atx/no-inline-hex
        glyphColor: '#ffffff',
        animates: true,
        displayPriority: isSelected ? 1000 : 500,
      },
    )

    annotation.spotId = spot.id
    return annotation
  })

  mapInstance.addAnnotations(renderedAnnotations)
}

async function loadMapkitJsLibrary() {
  if ((window as any).mapkit?.loadedLibraries?.length) {
    return (window as any).mapkit
  }

  if (mapKitLoadPromise) {
    return mapKitLoadPromise
  }

  mapKitLoadPromise = new Promise((resolve, reject) => {
    const callbackName = `__mapkitReady_${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')

    ;(window as any)[callbackName] = () => {
      const mapkit = (window as any).mapkit
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (window as any)[callbackName]

      if (!mapkit?.loadedLibraries?.length) {
        reject(new Error('MapKit JS loaded without required libraries'))
        return
      }

      resolve(mapkit)
    }

    script.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.core.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.callback = callbackName
    script.dataset.libraries = 'full-map,services,overlays'
    script.dataset.token = mapkitJsApiKey

    script.onerror = () => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (window as any)[callbackName]
      reject(new Error('Failed to load Apple MapKit JS'))
    }

    document.head.appendChild(script)
  })

  return mapKitLoadPromise
}

function initializeMap() {
  if (!mapElement.value || !(window as any).mapkit) {
    return
  }

  const mapkit = (window as any).mapkit
  const center = new mapkit.Coordinate(30.2672, -97.7431)
  const span = new mapkit.CoordinateSpan(0.05, 0.05)

  mapInstance = new mapkit.Map(mapElement.value, {
    region: new mapkit.CoordinateRegion(center, span),
    showsCompass: mapkit.FeatureVisibility.Visible,
    showsMapTypeControl: true,
    isRotationEnabled: false,
  })

  mapInstance.addEventListener('select', (event: any) => {
    const spotId = String(event?.annotation?.spotId || '')
    if (spotId) {
      selectedSpotId.value = spotId
    }
  })

  renderAnnotations()
  updateAnnotationStyles()

  if (selectedSpot.value) {
    focusSpotOnMap(selectedSpot.value)
  }

  mapReady.value = true
}

function selectSpot(spot: ViewingSpot) {
  selectedSpotId.value = spot.id
  if (mapReady.value) {
    updateAnnotationStyles()
    focusSpotOnMap(spot)
  }
}

onMounted(async () => {
  if (!mapkitJsApiKey) {
    loadError.value = 'MAPKIT_JS_API_KEY is not configured yet. Use the spot links below to open Apple Maps directly.'
    return
  }

  try {
    await loadMapkitJsLibrary()
    initializeMap()
  } catch {
    if (window.location.hostname.endsWith('.pages.dev')) {
      loadError.value = 'MapKit JS token is scoped to *.atx-apps.com. Open this app on its custom domain.'
      return
    }

    loadError.value = 'Apple MapKit JS failed to initialize. Use the location cards below for directions.'
  }
})

onBeforeUnmount(() => {
  if (mapInstance && renderedAnnotations.length > 0) {
    mapInstance.removeAnnotations(renderedAnnotations)
  }

  mapInstance?.destroy?.()
  mapInstance = null
})

watch(selectedSpotId, () => {
  if (!mapReady.value || !selectedSpot.value) {
    return
  }

  updateAnnotationStyles()
  focusSpotOnMap(selectedSpot.value)
})
</script>

<template>
  <section class="glass-card p-5 sm:p-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-primary">Best Viewing Spots</h2>
        <p class="mt-1 text-sm text-dimmed">Tap any spot to focus it on the map and open directions.</p>
      </div>
      <div class="inline-flex items-center gap-2 rounded-full border border-default bg-muted px-3 py-1.5 text-xs uppercase tracking-wide text-dimmed">
        <UIcon name="i-lucide-map-pin" class="size-4" />
        Apple Maps
      </div>
    </div>

    <div v-if="loadError" class="mb-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
      {{ loadError }}
    </div>

    <div v-else ref="mapElement" class="h-[320px] w-full rounded-2xl border border-default bg-muted sm:h-[420px]" />

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <article
        v-for="spot in spots"
        :key="spot.id"
        class="rounded-xl border p-4"
        :class="spot.id === selectedSpotId ? 'border-primary/40 bg-elevated ring-1 ring-primary/30' : 'border-default bg-muted'"
      >
        <p class="text-sm font-semibold text-primary">{{ spot.name }}</p>
        <p class="mt-0.5 text-xs uppercase tracking-wide text-dimmed">{{ spot.subtitle }}</p>
        <p class="mt-2 text-sm leading-relaxed text-muted">{{ spot.description }}</p>
        <p class="mt-2 text-xs text-dimmed">{{ spot.address }}</p>

        <div class="mt-3 flex flex-wrap gap-2">
          <UButton
            size="sm"
            color="primary"
            variant="soft"
            icon="i-lucide-crosshair"
            @click="selectSpot(spot)"
          >
            Focus
          </UButton>
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-navigation"
            :to="appleMapsUrl(spot)"
            target="_blank"
          >
            Directions
          </UButton>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
:deep(.mk-map-view) {
  border-radius: 1rem;
  overflow: hidden;
}
</style>
