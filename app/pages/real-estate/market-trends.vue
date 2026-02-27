<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<!-- eslint-disable atx/no-native-table -- Custom data table with precise column layout -->
<script setup lang="ts">
/**
 * /real-estate/market-trends/ — Austin Housing Market Trends
 *
 * Chart-based page showing Austin MSA market statistics from Redfin.
 * Displays median price, homes sold, inventory, and days on market
 * as interactive time-series charts.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('real-estate')!
const siblings = category.subApps.filter((a) => a.slug !== 'market-trends' && a.status === 'live')
const crossLinks = categories.value.filter((c) => c.slug !== 'real-estate').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Housing Market Trends — Prices, Inventory & Sales Data',
  description:
    'Track Austin real estate market trends with monthly data on median home prices, homes sold, inventory, and days on market from Redfin.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('real-estate'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Housing Market Trends',
    description: 'Monthly housing market statistics for the Austin-Round Rock metro area.',
  }),
])

interface MarketStat {
  region: string
  regionType: string
  period: string
  medianSalePrice: number | null
  homesSold: number | null
  newListings: number | null
  inventory: number | null
  daysOnMarket: number | null
  saleToListRatio: number | null
}

const { data: apiData } = await useFetch<{ stats: MarketStat[] }>('/api/real-estate/market-trends')

const stats = computed(() => {
  const raw = apiData.value?.stats || []
  // Sort chronologically for charts
  return [...raw].sort((a, b) => a.period.localeCompare(b.period))
})

const latestStat = computed(() => {
  const sorted = [...(apiData.value?.stats || [])].sort((a, b) => b.period.localeCompare(a.period))
  return sorted[0] ?? null
})

// Chart metric selector
const activeChart = ref<'price' | 'sold' | 'inventory' | 'dom'>('price')

const chartOptions = [
  { label: 'Median Price', value: 'price' as const, icon: 'i-lucide-dollar-sign' },
  { label: 'Homes Sold', value: 'sold' as const, icon: 'i-lucide-bar-chart-3' },
  { label: 'Inventory', value: 'inventory' as const, icon: 'i-lucide-boxes' },
  { label: 'Days on Market', value: 'dom' as const, icon: 'i-lucide-clock' },
]

const chartData = computed(() => {
  return stats.value.map((s) => {
    let value: number | null
    switch (activeChart.value) {
      case 'price':
        value = s.medianSalePrice
        break
      case 'sold':
        value = s.homesSold
        break
      case 'inventory':
        value = s.inventory
        break
      case 'dom':
        value = s.daysOnMarket
        break
    }
    return { timestamp: s.period, value: value ?? 0 }
  })
})

const chartUnit = computed(() => {
  switch (activeChart.value) {
    case 'price':
      return '$'
    case 'sold':
      return 'homes'
    case 'inventory':
      return 'homes'
    case 'dom':
      return 'days'
    default:
      return ''
  }
})

function formatStatValue(value: number | null, type: string): string {
  if (value == null) return '—'
  switch (type) {
    case 'price':
      return `$${(value / 1000).toFixed(0)}K`
    case 'ratio':
      return `${(value * 100).toFixed(1)}%`
    default:
      return value.toLocaleString()
  }
}
</script>

<template>
  <div>
    <SubAppTopbar title="Market Trends" />
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
      <!-- Header -->
      <div class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-12 rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-trending-up" class="size-6 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Market Trends
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Monthly Austin housing market data tracking median prices, sales volume, inventory, and
          market pace.
        </p>
      </div>

      <!-- Key Stats Cards -->
      <div
        v-if="latestStat"
        class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-up-delay-1"
      >
        <div
          class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-3"
        >
          <span class="text-xl font-extrabold font-display">
            {{ formatStatValue(latestStat.medianSalePrice, 'price') }}
          </span>
          <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
            >Median Price</span
          >
        </div>
        <div
          class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-3"
        >
          <span class="text-xl font-extrabold font-display">
            {{ formatStatValue(latestStat.homesSold, 'count') }}
          </span>
          <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
            >Homes Sold</span
          >
        </div>
        <div
          class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-3"
        >
          <span class="text-xl font-extrabold font-display">
            {{ formatStatValue(latestStat.inventory, 'count') }}
          </span>
          <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
            >Inventory</span
          >
        </div>
        <div
          class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-3"
        >
          <span class="text-xl font-extrabold font-display">
            {{ formatStatValue(latestStat.daysOnMarket, 'count') }}
          </span>
          <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
            >Days on Market</span
          >
        </div>
      </div>

      <!-- Chart Selector -->
      <div class="mb-6 animate-fade-up-delay-1">
        <div class="flex gap-2 flex-wrap mb-4">
          <UButton
            v-for="opt in chartOptions"
            :key="opt.value"
            :variant="activeChart === opt.value ? 'solid' : 'ghost'"
            :color="activeChart === opt.value ? 'primary' : 'neutral'"
            :icon="opt.icon"
            size="sm"
            @click="activeChart = opt.value"
          >
            {{ opt.label }}
          </UButton>
        </div>

        <!-- Chart -->
        <div class="rounded-2xl border border-default bg-default p-4 shadow-sm dark:shadow-md">
          <ClientOnly>
            <LiveDataChart
              :data="chartData"
              :title="chartOptions.find((o) => o.value === activeChart)?.label || ''"
              :unit="chartUnit"
              accent-color="#3b82f6"
              embedded
            />
          </ClientOnly>
        </div>
      </div>

      <!-- Monthly Data Table -->
      <section class="mb-10 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">Monthly Data</h2>
        <div class="overflow-x-auto rounded-xl border border-default">
          <table class="w-full text-sm">
            <thead class="bg-elevated text-muted">
              <tr>
                <th class="px-4 py-3 text-left font-semibold">Period</th>
                <th class="px-4 py-3 text-right font-semibold">Median Price</th>
                <th class="px-4 py-3 text-right font-semibold">Sold</th>
                <th class="px-4 py-3 text-right font-semibold hidden sm:table-cell">Listings</th>
                <th class="px-4 py-3 text-right font-semibold hidden sm:table-cell">Inventory</th>
                <th class="px-4 py-3 text-right font-semibold">DOM</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="s in stats.slice().reverse()" :key="s.period" class="hover:bg-elevated/50">
                <td class="px-4 py-2.5 font-medium">{{ s.period }}</td>
                <td class="px-4 py-2.5 text-right font-display font-bold">
                  {{ formatStatValue(s.medianSalePrice, 'price') }}
                </td>
                <td class="px-4 py-2.5 text-right">{{ formatStatValue(s.homesSold, 'count') }}</td>
                <td class="px-4 py-2.5 text-right hidden sm:table-cell">
                  {{ formatStatValue(s.newListings, 'count') }}
                </td>
                <td class="px-4 py-2.5 text-right hidden sm:table-cell">
                  {{ formatStatValue(s.inventory, 'count') }}
                </td>
                <td class="px-4 py-2.5 text-right">
                  {{ formatStatValue(s.daysOnMarket, 'count') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <UBadge color="info" variant="subtle" size="sm" label="Redfin Data Center" class="mt-3" />
      </section>

      <!-- More in Real Estate -->
      <section v-if="siblings.length" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in Real Estate
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/real-estate/${app.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div>
              <h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3>
              <p class="text-xs text-muted line-clamp-1">{{ app.description }}</p>
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-dimmed group-hover:text-primary transition-colors"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- Explore More -->
      <section class="mb-6 animate-fade-up-delay-3">
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
    </UContainer>
  </div>
</template>
