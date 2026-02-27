<script setup lang="ts">
/**
 * HomeQuickChips — popular page shortcuts as soft pill badges
 * wrapped in a subtle elevated band for visual separation.
 */
const chips = [
  { label: 'Breakfast Tacos', to: '/food/breakfast-tacos/', color: 'warning' as const },
  { label: 'Happy Hours', to: '/food/happy-hours/', color: 'warning' as const },
  { label: 'Water Temps', to: '/outdoors/water-temps/', color: 'success' as const },
  { label: 'Bluebonnets', to: '/outdoors/bluebonnets/', color: 'success' as const },
  { label: 'Rent Heatmap', to: '/real-estate/rent-heatmap/', color: 'info' as const },
  { label: 'Culture', to: '/culture/', color: 'neutral' as const },
]
</script>

<template>
  <section class="pb-8 md:pb-12">
    <UContainer>
      <!-- eslint-disable atx/no-raw-tailwind-colors -- brand stone palette -->
      <div
        class="rounded-2xl bg-stone-50/60 dark:bg-elevated/50 border border-stone-200/50 dark:border-default p-5 md:p-6 animate-fade-up-delay-2"
      >
        <div class="flex items-center gap-2 mb-4">
          <UIcon name="i-lucide-trending-up" class="size-4 text-primary" />
          <p class="text-xs font-bold uppercase tracking-wider text-muted">Popular</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="chip in chips"
            :key="chip.to"
            :label="chip.label"
            :color="chip.color"
            variant="soft"
            size="lg"
            :to="chip.to"
            as="NuxtLink"
            class="cursor-pointer hover:scale-105 hover:shadow-sm active:scale-100 transition-all duration-200"
          />
        </div>
      </div>
    </UContainer>
  </section>
</template>
