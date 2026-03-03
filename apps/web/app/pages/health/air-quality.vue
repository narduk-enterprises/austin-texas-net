<script setup lang="ts">
import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('health')!
const siblings = category.subApps.filter((a) => a.slug !== 'air-quality')
const crossLinks = categories.value.filter((c) => c.slug !== 'health').slice(0, 4)

const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Air Quality Index (AQI) — Current Conditions',
  description: 'Check real-time air quality in Austin TX. Monitor ozone, PM2.5, and PM10 levels to plan your outdoor activities safely.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('health'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Air Quality Monitor',
    description: 'Current Air Quality Index (AQI) and pollutant levels for Austin, Texas.',
  }),
])
</script>

<template>
  <div>
    <SubAppTopbar title="Air Quality" />
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
      
      <div class="space-y-8 sm:space-y-12">
        <!-- Hero Section -->
        <section class="text-center py-8 sm:py-12 animate-fade-up">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated/10 text-primary text-xs font-medium mb-4">
            <UIcon name="i-lucide-wind" class="size-3.5" />
            AQI Monitor
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display mb-4">
            Austin Air Quality
          </h1>
          <p class="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Monitor the current Air Quality Index (AQI), Ozone, and Particulate Matter (PM2.5) levels in the Austin Metro Area.
          </p>
        </section>

        <!-- Current AQI Mockup -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up-delay-1">
          <div class="glass-card p-8 flex flex-col items-center justify-center text-center border-default border-t-green-500">
            <h3 class="text-sm font-semibold uppercase tracking-widest text-muted mb-6">Current Index</h3>
            
            <div class="size-40 rounded-full border-[12px] border-default/20 flex flex-col items-center justify-center relative mb-6">
              <div class="absolute inset-0 rounded-full border-[12px] border-transparent border-t-green-500 border-r-green-500 transform -rotate-45"></div>
              <span class="text-5xl font-black font-display text-primary">42</span>
              <span class="text-xs font-bold text-muted uppercase tracking-widest mt-1">AQI</span>
            </div>
            
            <h4 class="text-2xl font-bold font-display text-default mb-2">Good</h4>
            <p class="text-sm text-dimmed max-w-sm">Air quality is considered satisfactory, and air pollution poses little or no risk.</p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="glass-card p-6 flex flex-col justify-center">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-cloud-fog" class="size-4 text-primary" />
                <h4 class="text-sm font-semibold">PM2.5</h4>
              </div>
              <p class="text-3xl font-bold mb-1">10<span class="text-sm text-muted font-normal"> µg/m³</span></p>
              <div class="w-full bg-muted rounded-full h-1.5 mt-2">
                <div class="bg-elevated h-full rounded-full w-[20%]"></div>
              </div>
            </div>
            
            <div class="glass-card p-6 flex flex-col justify-center">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-cloud" class="size-4 text-primary" />
                <h4 class="text-sm font-semibold">PM10</h4>
              </div>
              <p class="text-3xl font-bold mb-1">14<span class="text-sm text-muted font-normal"> µg/m³</span></p>
              <div class="w-full bg-muted rounded-full h-1.5 mt-2">
                <div class="bg-elevated h-full rounded-full w-[15%]"></div>
              </div>
            </div>
            
            <div class="glass-card p-6 flex flex-col justify-center sm:col-span-2">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-sun" class="size-4 text-primary" />
                <h4 class="text-sm font-semibold">Ozone (O3)</h4>
              </div>
              <p class="text-3xl font-bold mb-1">38<span class="text-sm text-muted font-normal"> ppb</span></p>
              <div class="w-full bg-muted rounded-full h-1.5 mt-2">
                <div class="bg-elevated h-full rounded-full w-[45%]"></div>
              </div>
              <p class="text-xs text-dimmed mt-2">Ozone levels typically peak during hot, sunny summer afternoons in Austin.</p>
            </div>
          </div>
        </section>

        <!-- AQI Scale -->
        <section class="glass-card p-6 sm:p-8 animate-fade-up-delay-2">
          <h2 class="text-xl font-semibold font-display mb-6">Understanding the AQI Scale</h2>
          <div class="space-y-3">
            <div class="flex items-center gap-4 p-3 rounded-lg bg-elevated/5">
              <div class="w-16 text-center font-bold text-sm bg-elevated text-white rounded py-1">0-50</div>
              <div>
                <strong class="text-sm">Good</strong>
                <p class="text-xs text-muted">Air quality is satisfactory.</p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-3 rounded-lg bg-elevated/5">
              <div class="w-16 text-center font-bold text-sm bg-elevated text-white rounded py-1">51-100</div>
              <div>
                <strong class="text-sm">Moderate</strong>
                <p class="text-xs text-muted">Acceptable, but there may be risk for exquisitely sensitive people.</p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-3 rounded-lg bg-elevated/5">
              <div class="w-16 text-center font-bold text-sm bg-elevated text-white rounded py-1">101-150</div>
              <div>
                <strong class="text-sm">Unhealthy (Sensitive Groups)</strong>
                <p class="text-xs text-muted">People with lung disease, older adults, and children are at greater risk.</p>
              </div>
            </div>
            <div class="flex items-center gap-4 p-3 rounded-lg bg-elevated/5">
              <div class="w-16 text-center font-bold text-sm bg-elevated text-white rounded py-1">151-200</div>
              <div>
                <strong class="text-sm">Unhealthy</strong>
                <p class="text-xs text-muted">Everyone may begin to experience health effects.</p>
              </div>
            </div>
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
