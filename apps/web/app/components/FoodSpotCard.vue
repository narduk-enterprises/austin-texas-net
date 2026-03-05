<script setup lang="ts">
interface FoodSpot {
  name: string
  address: string
  neighborhood?: string
  region?: string
  lat: number
  lng: number
}

defineProps<{
  spot: FoodSpot
  isSelected?: boolean
}>()

defineEmits<{
  directions: [spot: FoodSpot]
}>()

function appleMapsUrl(spot: FoodSpot): string {
  return `https://maps.apple.com/?q=${encodeURIComponent(spot.name)}&ll=${spot.lat},${spot.lng}`
}
</script>

<template>
  <div
    class="glass-card flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02]"
    :class="isSelected ? 'ring-2 ring-primary border-primary/50' : 'border-default'"
  >
    <div class="flex flex-1 flex-col p-5">
      <div class="mb-3">
        <h3 class="font-display text-lg font-bold leading-tight">{{ spot.name }}</h3>
        <p v-if="spot.neighborhood" class="mt-0.5 text-sm text-primary font-medium">
          {{ spot.neighborhood }}
        </p>
      </div>

      <div class="mt-auto space-y-2">
        <div class="flex items-center gap-2 text-xs text-dimmed">
          <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
          <span class="truncate">{{ spot.address }}</span>
        </div>
        <div
          v-if="spot.region && spot.region !== 'Unknown'"
          class="flex items-center gap-2 text-xs text-dimmed"
        >
          <UIcon name="i-lucide-compass" class="size-3.5 shrink-0" />
          <span>{{ spot.region }} Austin</span>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <UButton
          size="sm"
          block
          class="flex-1"
          icon="i-lucide-navigation"
          @click="$emit('directions', spot)"
        >
          Directions
        </UButton>
        <UButton
          size="sm"
          variant="outline"
          color="neutral"
          icon="i-lucide-external-link"
          aria-label="Open in Apple Maps"
          :to="appleMapsUrl(spot)"
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
    </div>
  </div>
</template>
