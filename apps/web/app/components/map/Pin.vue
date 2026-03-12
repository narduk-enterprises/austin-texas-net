<script setup lang="ts">
/**
 * MapPin — Category icon map pin for MapKit JS annotations.
 *
 * A compact circular pin with a Lucide category icon (or venue photo thumbnail),
 * a small rank badge, and a bold name label underneath. Uses inline SVG via
 * useMapIcons() because pins render inside isolated createApp() micro-apps.
 *
 * Styles live in main.css under mapkit-pin-* classes since this component
 * renders inside createApp micro-apps outside the normal Nuxt tree.
 */

const props = defineProps<{
  rank: number
  name: string
  icon: string
  selected: boolean
  pinColor?: string
  photoUrl?: string
}>()

const { getIconPaths } = useMapIcons()
const paths = computed(() => getIconPaths(props.icon))
</script>

<template>
  <div class="mapkit-pin" :class="{ 'is-selected': selected }" data-map-pin>
    <div class="mapkit-pin-bubble">
      <!-- Photo thumbnail or category icon -->
      <div v-if="photoUrl" class="mapkit-pin-circle mapkit-pin-photo">
        <img :src="photoUrl" :alt="name" class="mapkit-pin-photo-img" />
      </div>
      <div
        v-else
        class="mapkit-pin-circle"
        :style="
          pinColor
            ? {
                background: `linear-gradient(145deg, ${pinColor}, color-mix(in srgb, ${pinColor} 55%, #000))`,
              }
            : undefined
        "
      >
        <!-- eslint-disable-next-line narduk/no-inline-svg -- dynamic icon paths from useMapIcons() -->
        <svg
          class="mapkit-pin-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path v-for="(d, i) in paths" :key="i" :d="d" />
        </svg>
      </div>
      <span class="mapkit-pin-rank">{{ rank }}</span>
    </div>
    <span class="mapkit-pin-name">{{ name }}</span>
  </div>
</template>
