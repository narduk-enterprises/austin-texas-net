<script setup lang="ts">
import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('events')!
const siblings = category.subApps.filter((a) => a.slug !== 'trail-of-lights')
const crossLinks = categories.value.filter((c) => c.slug !== 'events').slice(0, 4)

const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Trail of Lights Guide',
  description: 'Everything you need to know about the Austin Trail of Lights in Zilker Park. Dates, parking info, and tips for this beloved holiday tradition.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('events'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Trail of Lights Guide',
    description: 'Complete guide to the Austin Trail of Lights holiday event in Zilker Park.',
  }),
])
</script>

<template>
  <div>
    <SubAppTopbar title="Trail of Lights" />
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
      
      <div class="space-y-8 sm:space-y-12">
        <!-- Hero Section -->
        <section class="text-center py-8 sm:py-12 animate-fade-up">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-medium mb-4">
            <UIcon name="i-lucide-party-popper" class="size-3.5" />
            Holiday Magic
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display mb-4">
            Austin Trail of Lights
          </h1>
          <p class="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Austin's most beloved holiday tradition. A 1.25-mile walk through Zilker Park featuring more than 2 million lights, 90 lighted holiday trees, and more than 70 other holiday displays.
          </p>
        </section>

        <!-- Information Cards -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up-delay-1">
          <div class="glass-card p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
                <UIcon name="i-lucide-calendar" class="size-4" />
              </div>
              <h3 class="font-semibold">When</h3>
            </div>
            <p class="text-sm text-muted">Runs annually from early December through December 23rd. The Zilker Tree is usually lit on the Sunday following Thanksgiving.</p>
          </div>
          
          <div class="glass-card p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
                <UIcon name="i-lucide-ticket" class="size-4" />
              </div>
              <h3 class="font-semibold">Tickets</h3>
            </div>
            <p class="text-sm text-muted">Check the schedule closely — up to half the nights in December offer free general admission. Other nights require purchased tickets online in advance.</p>
          </div>
          
          <div class="glass-card p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
                <UIcon name="i-lucide-car" class="size-4" />
              </div>
              <h3 class="font-semibold">Parking</h3>
            </div>
            <p class="text-sm text-muted">Pre-paid parking passes are required if you want to park at Zilker. Alternatively, use the shuttle from Republic Square or take a ride share to the designated drop-off zone.</p>
          </div>
        </section>

        <!-- History Content -->
        <section class="glass-card p-6 sm:p-8 animate-fade-up-delay-2">
          <h2 class="text-xl font-semibold font-display mb-4">A Texas Tradition Since 1965</h2>
          <div class="text-sm text-muted space-y-4 leading-relaxed">
            <p>
              It began in 1965 as the "Yule Fest," a small gathering with a single yule log and a modest lighting ceremony. It was a gift to the city of Austin from its Parks and Recreation Department.
            </p>
            <p>
              Today, the Austin Trail of Lights is an extravagant community-wide celebration that draws hundreds of thousands of visitors from Central Texas and around the world. The event is deeply rooted in local culture, featuring local food trucks, Austin musicians, and community groups.
            </p>
            <p>
              The centerpiece of the park during the season is the Zilker Holiday Tree — a stunning temporary "tree" built around one of Austin's original moontowers. Standing 155 feet tall, the tree is composed of 39 streamers holding thousands of multi-colored LED bulbs in a dizzying spiral pattern. Spinning under the Zilker Tree is a rite of passage for every Austinite.
            </p>
          </div>
        </section>

        <!-- ══════ More in Events ══════ -->
        <section v-if="siblings.length" class="mb-8 animate-fade-up-delay-2">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Events</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <NuxtLink
              v-for="app in siblings"
              :key="app.slug"
              :to="`/events/${app.slug}/`"
              class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
            >
              <div>
                <h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3>
                <p class="text-xs text-muted line-clamp-1">{{ app.description }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0 ml-3">
                <UBadge
                  :color="app.status === 'live' ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                  :label="app.status === 'live' ? 'Live' : 'Coming Soon'"
                />
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4 text-dimmed group-hover:text-primary transition-colors"
                />
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- ══════ Explore More ══════ -->
        <section class="mb-6 animate-fade-up-delay-2">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <NuxtLink
              v-for="c in crossLinks"
              :key="c.slug"
              :to="`/${c.slug}/`"
              class="flex items-center gap-2.5 rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30"
            >
              <UIcon :name="c.icon" class="size-4" :class="c.color" />
              <span class="text-sm font-medium">{{ c.title }}</span>
            </NuxtLink>
          </div>
        </section>

      </div>
    </UContainer>
  </div>
</template>
