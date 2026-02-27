<script setup lang="ts">
/**
 * SeverityRing — animated circular gauge for pollen severity
 * Accepts grains/m³ count and maps to 0–100% fill with severity colors.
 * Max reference: 10,000 grains/m³ (realistic Austin peak)
 */

const props = withDefaults(defineProps<{
  count: number     // grains/m³
  size?: number     // SVG diameter in px
  label?: string
}>(), {
  size: 200,
  label: 'Pollen Level'
})

const MAX_GRAINS = 10000

const severity = computed(() => severityFromCount(props.count))

const radius = computed(() => props.size / 2 - 14)
const circumference = computed(() => 2 * Math.PI * radius.value)
const progress = computed(() => Math.min(props.count / MAX_GRAINS, 1))
const dashOffset = computed(() => circumference.value * (1 - progress.value))
</script>

<template>
  <div class="severity-ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <!-- eslint-disable-next-line atx/no-inline-svg -->
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <!-- Track -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="var(--color-ring-track)"
        :stroke-width="10"
      />
      <!-- Glow -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="severity.color"
        :stroke-width="12"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :style="{ filter: `drop-shadow(0 0 8px ${severity.color}40)`, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.6s ease' }"
        transform-origin="center"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
      <!-- Progress -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="severity.color"
        :stroke-width="6"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :style="{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.6s ease' }"
        transform-origin="center"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="ring-content">
      <span class="ring-count" :style="{ color: severity.color }">
        {{ count.toLocaleString() }}
      </span>
      <span class="ring-unit">grains/m³</span>
      <span class="ring-level" :style="{ color: severity.color }">{{ severity.level }}</span>
    </div>
  </div>
</template>

<style scoped>
.severity-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.ring-count {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.ring-unit {
  font-size: 0.7rem;
  color: var(--color-ring-text);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ring-level {
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 4px;
}
</style>
