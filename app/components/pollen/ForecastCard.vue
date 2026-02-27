<script setup lang="ts">
/**
 * ForecastCard — daily pollen forecast tile with cedar/tree UPI and active species.
 * No emojis. Uses severity color bars and clean typography.
 */

defineProps<{
  dayName: string
  date: string
  level: string
  count: number
  treeUpi: number
  treeCategory: string
  activeSpecies: string[]
  inSeason: boolean
}>()

function getLevelColor(level: string): string {
  return severityColor(level)
}
</script>

<template>
  <div
    class="relative bg-elevated border border-default rounded-2xl py-5 px-4 overflow-hidden transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-accented"
  >
    <div
      class="absolute top-0 left-0 right-0 h-[3px] opacity-80"
      :style="{ backgroundColor: getLevelColor(level) }"
    />
    <div class="flex justify-between items-baseline mb-4">
      <span class="font-bold text-base text-muted">{{ dayName }}</span>
      <span class="text-xs text-dimmed tabular-nums">{{ date.split('-').slice(1).join('/') }}</span>
    </div>

    <div
      class="text-[1.75rem] font-bold leading-none tabular-nums"
      :style="{ color: getLevelColor(level) }"
    >
      {{ count > 0 ? count.toLocaleString() : '—' }}
    </div>
    <div class="text-[0.65rem] text-dimmed uppercase tracking-[0.06em] mt-0.5 mb-2.5">
      grains/m³ (est.)
    </div>

    <div
      class="inline-block py-[3px] px-2.5 rounded-full text-[0.7rem] font-semibold tracking-[0.02em]"
      :style="{ backgroundColor: getLevelColor(level) + '18', color: getLevelColor(level) }"
    >
      {{ level }}
    </div>

    <div class="border-t border-default my-3.5" />

    <div class="grid grid-cols-2 gap-2">
      <div class="flex flex-col gap-px">
        <span class="text-[0.6rem] text-dimmed uppercase tracking-[0.08em]">Tree Pollen</span>
        <span
          class="text-[0.8rem] text-muted font-medium tabular-nums"
          :style="{ color: getLevelColor(treeCategory) }"
          >{{ treeCategory }}</span
        >
      </div>
      <div class="flex flex-col gap-px">
        <span class="text-[0.6rem] text-dimmed uppercase tracking-[0.08em]">Cedar</span>
        <span
          class="text-[0.8rem] text-muted font-medium tabular-nums"
          :style="{ color: getLevelColor(level) }"
          >{{ level }}</span
        >
      </div>
      <div v-if="activeSpecies.length > 0" class="flex flex-col gap-px col-span-full">
        <span class="text-[0.6rem] text-dimmed uppercase tracking-[0.08em]">Active Species</span>
        <span class="text-xs leading-[1.3] text-muted font-medium tabular-nums">{{
          activeSpecies.slice(0, 4).join(', ')
        }}</span>
      </div>
      <div class="flex flex-col gap-px">
        <span class="text-[0.6rem] text-dimmed uppercase tracking-[0.08em]">Season</span>
        <span class="text-[0.8rem] text-muted font-medium tabular-nums">{{
          inSeason ? 'Active' : 'Off-season'
        }}</span>
      </div>
    </div>
  </div>
</template>
