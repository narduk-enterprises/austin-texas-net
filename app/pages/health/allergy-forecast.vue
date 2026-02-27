<script setup lang="ts">
import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('health')!
const siblings = category.subApps.filter((a) => a.slug !== 'allergy-forecast')
const crossLinks = categories.value.filter((c) => c.slug !== 'health').slice(0, 4)

const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Allergy Forecast — Oak, Cedar, Elm & Mold Tracker',
  description: 'Track the daily allergy forecast for Austin TX. Get counts and insights for Cedar, Oak, Elm, Ragweed, and Mold before you head outdoors.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('health'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Allergy Forecast',
    description: 'Current and 5-day allergy forecast for the Austin area.',
  }),
])

// Placeholder data for the static UI shell
const mainAllergens = [
  { name: 'Cedar', level: 'Low', pct: 15, color: 'bg-elevated' },
  { name: 'Oak', level: 'High', pct: 85, color: 'bg-elevated' },
  { name: 'Elm', level: 'Moderate', pct: 45, color: 'bg-elevated' },
  { name: 'Mold', level: 'Low', pct: 20, color: 'bg-elevated' },
]

const upcomingDays = [
  { day: 'Mon', level: 'High', color: 'text-primary bg-elevated/10' },
  { day: 'Tue', level: 'High', color: 'text-primary bg-elevated/10' },
  { day: 'Wed', level: 'Moderate', color: 'text-primary bg-elevated/10' },
  { day: 'Thu', level: 'Low', color: 'text-primary bg-elevated/10' },
  { day: 'Fri', level: 'Low', color: 'text-primary bg-elevated/10' },
]
</script>

<template>
  <div>
    <SubAppTopbar title="Allergy Forecast" />
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
      
      <div class="space-y-8 sm:space-y-12">
        <!-- Hero Section -->
        <section class="text-center py-8 sm:py-12 animate-fade-up">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated/10 text-primary text-xs font-medium mb-4">
            <UIcon name="i-lucide-activity" class="size-3.5" />
            Seasonal Tracking
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display mb-4">
            Austin Allergy Forecast
          </h1>
          <p class="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Stay ahead of Austin's notorious allergy seasons. View current pollen counts and multi-day forecasts for major local allergens.
          </p>
        </section>

        <!-- Current Status Mockup -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up-delay-1">
          <div class="glass-card p-6 border-default border-t-red-500">
            <h3 class="text-sm font-semibold uppercase tracking-widest text-muted mb-4">Top Allergen Today</h3>
            <div class="flex items-center justify-between mb-4">
              <span class="text-3xl font-bold font-display text-default">Oak Pollen</span>
              <div class="px-3 py-1 rounded-md bg-elevated/10 text-primary font-bold text-sm tracking-wide">
                HIGH
              </div>
            </div>
            <p class="text-sm text-dimmed">Oak season typically peaks in mid-to-late spring. Symptoms include itchy eyes, sneezing, and congestion.</p>
          </div>
          
          <div class="glass-card p-6">
            <h3 class="text-sm font-semibold uppercase tracking-widest text-muted mb-4">Allergen Breakdown</h3>
            <div class="space-y-3">
              <div v-for="a in mainAllergens" :key="a.name" class="flex items-center gap-3">
                <span class="text-sm font-medium w-12 shrink-0">{{ a.name }}</span>
                <div class="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700 ease-out" :class="[a.color]" :style="{ width: `${a.pct}%` }"></div>
                </div>
                <span class="text-sm font-semibold w-20 text-right">{{ a.level }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 5-Day Forecast -->
        <section class="mb-10 animate-fade-up-delay-2">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">5-Day Outlook</h2>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div v-for="d in upcomingDays" :key="d.day" class="glass-card p-4 flex flex-col items-center justify-center text-center">
              <span class="text-sm font-bold mb-2">{{ d.day }}</span>
              <div :class="['px-2 py-1 rounded-md text-xs font-bold w-full max-w-[80px]', d.color]">{{ d.level }}</div>
            </div>
          </div>
        </section>

        <!-- Allergy Seasons Details -->
        <section class="glass-card p-6 sm:p-8 animate-fade-up-delay-2">
          <h2 class="text-xl font-semibold font-display mb-4">Austin's Year-Round Allergies</h2>
          <div class="text-sm text-muted space-y-4 leading-relaxed">
            <p><strong>Winter (Dec - Feb): "Cedar Fever"</strong><br>
            Mountain Cedar (Ashe Juniper) releases massive amounts of pollen, causing flu-like symptoms for many Austinites.</p>
            <p><strong>Spring (Mar - May): Oak & Ash</strong><br>
            As Cedar fades, Oak takes over, coating cars in yellow dust. Ash and Pecan trees also contribute heavily.</p>
            <p><strong>Summer & Fall (Aug - Nov): Ragweed & Elm</strong><br>
            Late summer brings Ragweed, while Fall Elm sweeps in during September and October. Mold is prevalent year-round but spikes after heavy rains.</p>
          </div>
        </section>

        <!-- ══════ More in Health ══════ -->
        <section v-if="siblings.length" class="mb-8 animate-fade-up-delay-2">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Health</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <NuxtLink
              v-for="app in siblings"
              :key="app.slug"
              :to="`/health/${app.slug}/`"
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
