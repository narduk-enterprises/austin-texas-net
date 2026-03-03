<script setup lang="ts">
/**
 * StatCard — premium stat tile with animated count-up and optional suffix
 * No emojis. Uses semantic labels and subtle glassmorphic styling.
 */

const props = withDefaults(defineProps<{
  label: string
  value: number
  suffix?: string
  color?: string
}>(), {
  suffix: '',
  color: POLLEN_ACCENT
})

const displayValue = ref(0)

function animateValue(target: number) {
  const duration = 1200
  const start = performance.now()
  const startVal = displayValue.value

  function step(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    displayValue.value = Math.round(startVal + (target - startVal) * ease)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

watch(() => props.value, (newVal) => {
  if (import.meta.client) animateValue(newVal)
}, { immediate: true })

const formattedValue = computed(() => {
  return displayValue.value.toLocaleString()
})
</script>

<template>
  <div class="stat-card">
    <div class="stat-indicator" :style="{ backgroundColor: color }" />
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">
      <span :style="{ color }">{{ formattedValue }}</span>
      <span v-if="suffix" class="stat-suffix">{{ suffix }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 18px 16px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.stat-card:hover {
  border-color: var(--color-border-hover);
}

.stat-indicator {
  width: 4px;
  height: 20px;
  border-radius: 2px;
  margin-bottom: 12px;
  opacity: 0.7;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-suffix {
  font-size: 0.8rem;
  color: var(--color-text-faint);
  font-weight: 500;
}
</style>
