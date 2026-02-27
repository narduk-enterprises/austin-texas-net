<script setup lang="ts">
/**
 * Homepage — Austin, Texas — Live Local Intelligence
 * Uses bare 'home' layout — rope logo IS the branding.
 */
definePageMeta({ layout: 'home' })

usePageSeo({
  title: 'Austin, Texas — Live Local Intelligence',
  description: 'Real-time pollen, water temps, events, and where to go in Austin, Texas.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin, Texas — Live Local Intelligence',
    description: 'Real-time pollen, water temps, events, and where to go in Austin, Texas.',
  }),
])
</script>

<template>
  <div class="relative min-h-screen limestone-texture">
    <!-- Full-page warm background behind everything -->
    <!-- eslint-disable atx/no-raw-tailwind-colors -- intentional brand gradient -->
    <div
      class="absolute inset-0 bg-linear-to-b from-sky-200/60 via-emerald-100/40 to-stone-100/30 dark:from-teal-900/40 dark:via-emerald-900/25 dark:to-amber-950/15 pointer-events-none"
    />

    <div class="relative">
      <HomeHero />
      <HomeExploreGrid />
      <HomeQuickChips />
    </div>
  </div>
</template>
