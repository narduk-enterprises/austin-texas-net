<script setup lang="ts">
/**
 * MapSpotList — Ranked list of map spots.
 *
 * Shows each spot with a category icon pin (matching the map), name,
 * known-for highlight, neighborhood, rating, and a map-pin action icon.
 * Uses the shared useMapIcons() composable for icon SVG paths.
 */
import type { MapSpot } from '~/types/mapSpot'

const props = defineProps<{
  spots: MapSpot[]
  accentColor?: string
  categoryIcon?: string
  pinColor?: string
  /** Returns a crawlable URL for a given spot (e.g. ?spot=midnight-cowboy) */
  spotUrlFn?: (spot: MapSpot) => string
}>()

const emit = defineEmits<{
  select: [slug: string]
}>()

const { getIconPaths } = useMapIcons()
</script>

<template>
  <section class="mb-10 animate-fade-up-delay-1">
    <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">The Rankings</h2>
    <div class="space-y-3">
      <!-- eslint-disable-next-line narduk/no-native-button -- complex card layout with NuxtLink for SEO -->
      <NuxtLink
        v-for="spot in spots"
        :key="spot.slug"
        :to="props.spotUrlFn?.(spot) || '#'"
        class="map-list-item group"
        @click.prevent="emit('select', spot.slug)"
      >
        <div class="map-list-pin">
          <!-- Photo thumbnail or category icon -->
          <div v-if="spot.photoUrl" class="map-list-photo">
            <img :src="spot.photoUrl" :alt="spot.name" class="map-list-photo-img" loading="lazy" />
          </div>
          <div
            v-else
            class="map-list-icon"
            :class="{ 'is-top-3': spot.rank <= 3 }"
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
              class="map-list-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path v-for="(d, i) in getIconPaths(categoryIcon)" :key="i" :d="d" />
            </svg>
          </div>
          <span class="map-list-rank">{{ spot.rank }}</span>
        </div>
        <div class="flex-1 min-w-0 text-left">
          <div class="flex items-center gap-2 mb-0.5">
            <h3 class="text-sm sm:text-base font-bold truncate">{{ spot.name }}</h3>
            <UBadge
              v-if="spot.priceRange"
              :label="spot.priceRange"
              color="success"
              variant="subtle"
              size="xs"
            />
          </div>
          <!-- eslint-disable-next-line narduk/no-raw-tailwind-colors -- muted paragraph text colour -->
          <p class="text-xs sm:text-sm text-muted truncate">
            <!-- eslint-disable-next-line narduk/no-raw-tailwind-colors -- primary/muted label colour -->
            <span class="font-medium text-primary dark:text-muted">{{ spot.knownFor }}</span>
            <span class="mx-1.5 text-dimmed">·</span>
            {{ spot.neighborhood }}
            <span v-if="spot.area" class="map-list-area">{{ spot.area }}</span>
          </p>
        </div>
        <div v-if="spot.rating" class="map-list-rating shrink-0">
          <!-- eslint-disable-next-line narduk/no-raw-tailwind-colors -- muted star icon colour -->
          <UIcon name="i-lucide-star" class="size-3.5 text-muted" />
          <span>{{ spot.rating }}</span>
        </div>
        <!-- eslint-disable narduk/no-raw-tailwind-colors -- amber hover accent -->
        <UIcon
          name="i-lucide-map-pin"
          class="size-4 text-muted group-hover:text-primary transition-colors shrink-0"
        />
      </NuxtLink>
    </div>
  </section>
</template>

<!-- eslint-disable narduk/no-style-block-layout -- list item hover transitions and pin animation require scoped CSS -->
<style scoped>
.map-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  transition: all 0.2s ease;
  cursor: pointer;
  /* Better touch targets on mobile */
  min-height: 64px;
}

.map-list-item:hover {
  border-color: var(--color-amber-300);
  box-shadow: 0 2px 12px rgba(217, 119, 6, 0.08);
  transform: translateY(-1px);
}

:is(.dark) .map-list-item:hover {
  border-color: rgba(217, 119, 6, 0.3);
  box-shadow: 0 2px 12px rgba(217, 119, 6, 0.12);
}

.map-list-pin {
  position: relative;
  flex-shrink: 0;
}

.map-list-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--ui-bg-elevated);
  color: var(--ui-text-muted);
  transition: all 0.2s ease;
}

.map-list-icon.is-top-3 {
  background: linear-gradient(145deg, #d97706, #7c2d12);
  color: white;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
}

.map-list-svg {
  width: 18px;
  height: 18px;
}

.map-list-photo {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--ui-border);
}

.map-list-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.map-list-rank {
  position: absolute;
  bottom: -3px;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  background: white;
  color: #92400e;
  font-size: 9px;
  font-weight: 800;
  font-family: var(--font-display);
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

:is(.dark) .map-list-rank {
  background: #1c1c1e;
  color: #fbbf24;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.map-list-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ui-text-muted);
}

.map-list-area {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: var(--ui-bg-elevated);
  color: var(--ui-text-dimmed);
  vertical-align: middle;
}

@media (max-width: 640px) {
  .map-list-item {
    padding: 12px 14px;
    gap: 10px;
  }

  .map-list-area {
    display: none;
  }
}
</style>
