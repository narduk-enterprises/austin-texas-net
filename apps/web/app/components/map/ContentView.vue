<script setup lang="ts">
/**
 * MapContentView — Thin wrapper around AppMapKit for ranked spot maps.
 *
 * Provides the pin factory using MapPin.vue (rank badge + category icon).
 * The parent (MapContentPage) controls selection via v-model:selected-id.
 */
import { createApp, h } from 'vue'
import type { MapSpot, MapPageConfig } from '~/types/mapSpot'
import MapPin from '~/components/map/Pin.vue'

const props = defineProps<{
  spots: MapSpot[]
  config: MapPageConfig
}>()

const selectedId = defineModel<string | null>('selectedId', { default: null })
const mapRef = ref<{ scrollIntoView: () => void } | null>(null)

function createPinElement(
  spot: MapSpot,
  isSelected: boolean,
): { element: HTMLElement; cleanup?: () => void } {
   
  const wrapper = import.meta.client ? document.createElement('div') : ({} as HTMLElement)
  const app = createApp({
    setup() {
      return () =>
        h(MapPin, {
          rank: spot.rank,
          name: spot.name,
          icon: props.config.categoryIcon || 'i-lucide-map-pin',
          selected: isSelected,
          pinColor: props.config.pinColor,
          photoUrl: spot.photoUrl,
        })
    },
  })
  app.mount(wrapper)
  return { element: wrapper, cleanup: () => app.unmount() }
}

function scrollToSpot(id: string) {
  selectedId.value = id
  mapRef.value?.scrollIntoView()
}

defineExpose({ scrollToSpot })
</script>

<template>
  <AppMapKit
    ref="mapRef"
    v-model:selected-id="selectedId"
    :items="spots"
    :create-pin-element="createPinElement"
    :fallback-center="config.mapCenter"
    :clustering-identifier="`map-spots-${config.parentCategory}`"
  />
</template>
