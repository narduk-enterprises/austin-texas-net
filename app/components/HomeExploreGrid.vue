<script setup lang="ts">
/**
 * HomeExploreGrid — editorial directory with big mobile touch targets.
 * No cards, no boxes. Bold headings + sub-links in responsive columns.
 * Background handled at page level.
 */
const { categories } = useSiteData()
</script>

<template>
  <section class="pb-8 md:pb-12">
    <UContainer>
      <div class="columns-1 sm:columns-2 lg:columns-3 gap-x-8 md:gap-x-12">
        <div
          v-for="(cat, i) in categories"
          :key="cat.slug"
          class="break-inside-avoid mb-4 md:mb-6 animate-card-enter"
          :style="{ animationDelay: `${i * 40}ms` }"
        >
          <!-- Category heading — oversized tap target -->
          <!-- eslint-disable atx/no-raw-tailwind-colors -- brand hover colors -->
          <NuxtLink
            :to="`/${cat.slug}/`"
            class="group flex items-center gap-3 min-h-[52px] py-3 -mx-3 px-3 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-white/5 active:bg-emerald-100/50 dark:active:bg-white/10 transition-colors"
          >
            <div
              class="flex items-center justify-center size-10 rounded-xl shrink-0"
              :class="cat.bgColor"
            >
              <UIcon :name="cat.icon" class="size-5" :class="cat.color" />
            </div>
            <h3 class="text-lg font-extrabold tracking-tight font-display text-default">
              {{ cat.title }}
            </h3>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-5 text-muted/40 group-hover:text-default/60 ml-auto shrink-0 transition-colors"
            />
          </NuxtLink>

          <!-- Sub-app links — each is a big full-width tap target -->
          <div class="pl-[52px]">
            <NuxtLink
              v-for="app in cat.subApps.filter(a => a.status === 'live').slice(0, 3)"
              :key="app.slug"
              :to="`/${cat.slug}/${app.slug}/`"
              class="flex items-center min-h-[44px] py-2 text-[15px] font-medium text-default/70 hover:text-default active:text-default transition-colors"
            >
              {{ app.title }}
            </NuxtLink>
            
            <!-- Show all link if there are more than 3 live apps -->
            <NuxtLink
              v-if="cat.subApps.filter(a => a.status === 'live').length > 3"
              :to="`/${cat.slug}/`"
              class="flex items-center gap-1.5 min-h-[44px] py-2 text-[14px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mt-1"
            >
              Show all
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
