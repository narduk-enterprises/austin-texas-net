<script setup lang="ts">
/**
 * HomeHero — Texan rope-lettering hero with Austin icons.
 * Uses the user's custom SVG logo. Scales naturally across viewports.
 * Austin skyline PNG backdrop at low opacity behind it.
 */
</script>

<template>
  <section class="relative">
    <!-- Austin skyline backdrop — very low opacity, pinned to bottom -->
    <div class="absolute inset-x-0 bottom-0 pointer-events-none select-none" aria-hidden="true">
      <img
        src="/images/austin-skyline.png"
        alt=""
        width="1200"
        height="400"
        class="w-full h-auto opacity-[0.025] dark:opacity-[0.04]"
        loading="eager"
      />
    </div>

    <!-- Content -->
    <UContainer class="relative py-4 md:py-6 lg:py-8 flex flex-col items-center">
      <img
        src="/images/austin-logo-rope-all-things.svg"
        alt="AUSTIN-TEXAS.NET — Live, local intelligence."
        width="600"
        height="200"
        class="w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto animate-fade-up"
        loading="eager"
      />
      <!-- Hidden h1 for SEO — screen readers and crawlers see this -->
      <h1 class="sr-only">AUSTIN-TEXAS.NET — Live, local intelligence</h1>
      
      <HomeSearch class="animate-fade-up-delay-1 mt-6 md:mt-8 w-full px-4" />
    </UContainer>
  </section>
</template>
