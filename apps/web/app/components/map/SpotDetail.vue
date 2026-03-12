<script setup lang="ts">
/**
 * MapSpotDetail — Full detail panel for a selected map spot.
 *
 * Shows icon pin (matching the map and list), name, address, badges,
 * rating stars, known-for callout, and description.
 * Uses the shared useMapIcons() composable for icon SVG paths.
 */
import type { MapSpot, MapPageConfig } from '~/types/mapSpot'

const props = defineProps<{
  spot: MapSpot
  config: MapPageConfig
}>()

const emit = defineEmits<{
  back: []
}>()

const { getIconPaths } = useMapIcons()
const iconPaths = computed(() => getIconPaths(props.config.categoryIcon))

const stars = computed(() => {
  if (!props.spot.rating) return { full: 0, half: false, empty: 5 }
  const full = Math.floor(props.spot.rating)
  const half = props.spot.rating % 1 >= 0.5
  return { full, half, empty: 5 - full - (half ? 1 : 0) }
})
</script>

<template>
  <section class="mb-10 animate-fade-up">
    <UButton
      variant="link"
      color="neutral"
      size="sm"
      icon="i-lucide-arrow-left"
      label="Back to Rankings"
      class="text-xs font-bold uppercase tracking-widest mb-5"
      @click="emit('back')"
    />

    <div class="spot-detail-panel">
      <!-- Photo hero -->
      <div v-if="spot.photoUrl" class="spot-detail-photo-wrapper">
        <img :src="spot.photoUrl" :alt="spot.name" class="spot-detail-photo" loading="lazy" />
        <span v-if="spot.photoAttribution" class="spot-detail-attribution">
          {{ spot.photoAttribution }}
        </span>
      </div>

      <!-- Name + icon rank pin -->
      <div class="flex items-start gap-4 mb-4">
        <div v-if="spot.rank" class="spot-detail-pin">
          <div
            class="spot-detail-icon"
            :style="
              config.pinColor
                ? {
                    background: `linear-gradient(145deg, ${config.pinColor}, color-mix(in srgb, ${config.pinColor} 55%, #000))`,
                  }
                : undefined
            "
          >
            <!-- eslint-disable-next-line narduk/no-inline-svg -- dynamic icon paths from useMapIcons() -->
            <svg
              class="spot-detail-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path v-for="(d, i) in iconPaths" :key="i" :d="d" />
            </svg>
          </div>
          <span class="spot-detail-rank">{{ spot.rank }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl sm:text-2xl font-extrabold font-display leading-tight mb-1">
            {{ spot.name }}
          </h2>
          <p class="text-sm text-muted">{{ spot.address }}</p>
        </div>
      </div>

      <!-- Meta badges -->
      <div class="flex flex-wrap items-center gap-2 mb-5">
        <UBadge
          v-if="spot.neighborhood"
          :label="spot.neighborhood"
          color="neutral"
          variant="subtle"
          size="sm"
        />
        <UBadge v-if="spot.area" :label="spot.area" color="info" variant="subtle" size="sm" />
        <UBadge
          v-if="spot.priceRange"
          :label="spot.priceRange"
          color="success"
          variant="subtle"
          size="sm"
        />
        <div v-if="spot.rating" class="flex items-center gap-1 ml-auto">
          <template v-for="i in stars.full" :key="`df${i}`">
            <!-- eslint-disable-next-line narduk/no-raw-tailwind-colors -- amber star fill colour -->
            <UIcon name="i-lucide-star" class="size-4 text-muted fill-amber-400" />
          </template>
          <template v-if="stars.half">
            <!-- eslint-disable-next-line narduk/no-raw-tailwind-colors -- half-star muted colour -->
            <UIcon name="i-lucide-star-half" class="size-4 text-muted" />
          </template>
          <template v-for="i in stars.empty" :key="`de${i}`">
            <UIcon name="i-lucide-star" class="size-4 text-default/15" />
          </template>
          <span class="text-sm font-bold text-muted ml-1">{{ spot.rating }}</span>
        </div>
      </div>

      <!-- Known for -->
      <div v-if="spot.knownFor" class="spot-detail-known-for mb-5">
        <!-- eslint-disable-next-line narduk/no-inline-svg -- dynamic icon paths from useMapIcons() -->
        <svg
          class="spot-detail-known-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path v-for="(d, i) in iconPaths" :key="i" :d="d" />
        </svg>
        <div>
          <!-- eslint-disable narduk/no-raw-tailwind-colors -- amber accent colors -->
          <span
            class="text-xs font-bold uppercase tracking-wider text-primary dark:text-muted"
            >Known For</span
          >

          <p class="text-sm font-semibold text-primary dark:text-muted mt-0.5">
            {{ spot.knownFor }}
          </p>
        </div>
      </div>

      <!-- Description -->
      <p v-if="spot.description" class="text-base text-muted leading-relaxed">
        {{ spot.description }}
      </p>

      <!-- Action buttons -->
      <div class="spot-detail-actions">
        <UButton
          size="md"
          icon="i-lucide-navigation"
          class="flex-1"
          :to="`https://maps.apple.com/?daddr=${spot.lat},${spot.lng}`"
          target="_blank"
          rel="noopener noreferrer"
        >
          Directions
        </UButton>
        <UButton
          size="md"
          variant="outline"
          color="neutral"
          icon="i-lucide-external-link"
          :to="`https://maps.apple.com/?q=${encodeURIComponent(spot.name)}&ll=${spot.lat},${spot.lng}`"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Apple Maps"
        />
      </div>
    </div>
  </section>
</template>

<!-- eslint-disable narduk/no-style-block-layout -- scoped panel transitions require precise CSS beyond inline classes -->
<style scoped>
.spot-detail-panel {
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

@media (max-width: 640px) {
  .spot-detail-panel {
    padding: 16px;
    border-radius: 14px;
  }
}

:is(.dark) .spot-detail-panel {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

/* Photo hero */
.spot-detail-photo-wrapper {
  position: relative;
  margin: -20px -24px 16px;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

.spot-detail-photo {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

@media (max-width: 640px) {
  .spot-detail-photo {
    aspect-ratio: 3 / 2;
  }

  .spot-detail-photo-wrapper {
    margin: -16px -16px 14px;
    border-radius: 14px 14px 0 0;
  }
}

.spot-detail-attribution {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.85);
  font-size: 10px;
  border-radius: 6px 0 0 0;
}

/* Icon pin — matches map and list */
.spot-detail-pin {
  position: relative;
  flex-shrink: 0;
}

.spot-detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(145deg, #d97706, #7c2d12);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
}

.spot-detail-svg {
  width: 22px;
  height: 22px;
  color: white;
}

.spot-detail-rank {
  position: absolute;
  bottom: -3px;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 10px;
  background: white;
  color: #92400e;
  font-size: 11px;
  font-weight: 800;
  font-family: var(--font-display);
  line-height: 1;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

:is(.dark) .spot-detail-rank {
  background: #1c1c1e;
  color: #fbbf24;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

/* Known for callout */
.spot-detail-known-for {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

:is(.dark) .spot-detail-known-for {
  background: rgba(245, 158, 11, 0.06);
  border-color: rgba(245, 158, 11, 0.15);
}

.spot-detail-known-svg {
  width: 16px;
  height: 16px;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Action buttons */
.spot-detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--ui-border);
}
</style>
