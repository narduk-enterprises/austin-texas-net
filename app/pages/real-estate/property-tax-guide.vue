<!-- eslint-disable atx/no-native-form, atx/no-native-input -- Tax calculator with range slider -->
<!-- eslint-disable atx/no-native-table -- Tax rates reference table -->
<script setup lang="ts">
/**
 * /real-estate/property-tax-guide/ — Austin Property Tax Guide
 * Static editorial page with rates, exemptions, protest tips, and calculator.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('real-estate')!
const siblings = category.subApps.filter(
  (a) => a.slug !== 'property-tax-guide' && a.status === 'live',
)
const crossLinks = categories.value.filter((c) => c.slug !== 'real-estate').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Property Tax Guide — Rates, Exemptions & Protest Tips',
  description:
    'Complete guide to Austin property taxes. Current rates, homestead exemptions, protest tips, and an interactive calculator.',
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('real-estate'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Property Tax Guide',
    description:
      'Comprehensive guide to property taxes in Austin, TX with current rates, exemptions, and a tax calculator.',
  }),
])

// Calculator state
const homeValue = ref(450000)
const hasHomestead = ref(true)
const isOver65 = ref(false)

// FY2025 approximate rates (per $100)
const TOTAL_RATE = 1.975 // Combined approximate rate

const taxableValue = computed(() => {
  let v = homeValue.value
  if (hasHomestead.value) v = Math.max(0, v - 100000)
  if (isOver65.value) v = Math.max(0, v - 10000)
  return v
})

const estimatedTax = computed(() => (taxableValue.value / 100) * TOTAL_RATE)
const monthlyTax = computed(() => estimatedTax.value / 12)

function fmt(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />

      <div class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-12 rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-receipt" class="size-6 text-primary" />
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
            Property Tax Guide
          </h1>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Current rates, available exemptions, protest strategies, and a calculator to estimate your
          bill.
        </p>
      </div>

      <!-- Calculator -->
      <section class="mb-10 animate-fade-up-delay-1">
        <h2 class="text-lg font-bold font-display mb-4">Tax Calculator</h2>
        <div
          class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm dark:shadow-md"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-semibold mb-2">Home Value</label>
              <UInput v-model.number="homeValue" type="number" :min="0" :step="10000" size="lg" />
              <input
                v-model.number="homeValue"
                type="range"
                :min="100000"
                :max="2000000"
                :step="10000"
                class="w-full mt-2 accent-primary"
              />
              <div class="flex justify-between text-xs text-muted mt-1">
                <span>$100K</span>
                <span class="font-bold text-default">{{ fmt(homeValue) }}</span>
                <span>$2M</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Exemptions</label>
              <div class="space-y-3">
                <UCheckbox v-model="hasHomestead" label="Homestead ($100K school)" />
                <UCheckbox v-model="isOver65" label="Over 65 / Disabled ($10K)" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-3"
            >
              <span class="text-xl font-extrabold font-display">{{ fmt(estimatedTax) }}</span>
              <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted"
                >Annual</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-3"
            >
              <span class="text-xl font-extrabold font-display">{{ fmt(monthlyTax) }}</span>
              <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted"
                >Monthly</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-3"
            >
              <span class="text-xl font-extrabold font-display">{{ TOTAL_RATE.toFixed(2) }}%</span>
              <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted"
                >Rate</span
              >
            </div>
          </div>
        </div>
      </section>

      <!-- Rates Table -->
      <section class="mb-10 animate-fade-up-delay-2">
        <h2 class="text-lg font-bold font-display mb-4">Current Tax Rates (FY2025)</h2>
        <div class="overflow-x-auto rounded-xl border border-default">
          <table class="w-full text-sm">
            <thead class="bg-elevated text-muted">
              <tr>
                <th class="px-4 py-3 text-left font-semibold">Taxing Entity</th>
                <th class="px-4 py-3 text-right font-semibold">Rate (per $100)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr class="hover:bg-elevated/50">
                <td class="px-4 py-2.5">City of Austin</td>
                <td class="px-4 py-2.5 text-right font-display">$0.4446</td>
              </tr>
              <tr class="hover:bg-elevated/50">
                <td class="px-4 py-2.5">Travis County</td>
                <td class="px-4 py-2.5 text-right font-display">$0.3107</td>
              </tr>
              <tr class="hover:bg-elevated/50">
                <td class="px-4 py-2.5">Austin ISD</td>
                <td class="px-4 py-2.5 text-right font-display">$0.9966</td>
              </tr>
              <tr class="hover:bg-elevated/50">
                <td class="px-4 py-2.5">Central Health</td>
                <td class="px-4 py-2.5 text-right font-display">$0.0981</td>
              </tr>
              <tr class="hover:bg-elevated/50">
                <td class="px-4 py-2.5">Emergency Services</td>
                <td class="px-4 py-2.5 text-right font-display">$0.1000</td>
              </tr>
              <tr class="bg-elevated font-bold">
                <td class="px-4 py-2.5">Total (approx)</td>
                <td class="px-4 py-2.5 text-right font-display">~$1.975</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted mt-2">
          Rates are approximate. Your actual rate depends on your specific taxing districts.
        </p>
      </section>

      <!-- Exemptions -->
      <section class="mb-10">
        <h2 class="text-lg font-bold font-display mb-4">Exemptions</h2>
        <div class="space-y-4">
          <div class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm">
            <h3 class="font-bold mb-2">🏠 Homestead Exemption</h3>
            <p class="text-sm text-muted">
              Primary residence owners get <strong class="text-default">$100K</strong> off school
              district taxable value. File with TCAD by April 30th.
            </p>
          </div>
          <div class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm">
            <h3 class="font-bold mb-2">👴 Over 65 / Disabled</h3>
            <p class="text-sm text-muted">
              Additional <strong class="text-default">$10K</strong> school exemption plus a tax
              ceiling — school taxes never increase.
            </p>
          </div>
          <div class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm">
            <h3 class="font-bold mb-2">🎖️ Disabled Veteran</h3>
            <p class="text-sm text-muted">
              100% disabled veterans receive a
              <strong class="text-default">full property tax exemption</strong>.
            </p>
          </div>
        </div>
      </section>

      <!-- Protest Tips -->
      <section class="mb-10">
        <h2 class="text-lg font-bold font-display mb-4">How to Protest</h2>
        <div class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm">
          <ol class="list-decimal list-inside space-y-2 text-sm text-muted">
            <li>
              <strong class="text-default">File by May 15th</strong> online at TCAD.org or by mail.
            </li>
            <li>
              <strong class="text-default">Gather comparable sales</strong> — similar homes that
              sold for less.
            </li>
            <li>
              <strong class="text-default">Document property issues</strong> — photos of damage or
              outdated features.
            </li>
            <li>
              <strong class="text-default">Attend your hearing</strong> with organized evidence.
            </li>
            <li>
              <strong class="text-default">Consider binding arbitration</strong> if unsatisfied with
              the ruling.
            </li>
          </ol>
          <p class="text-xs text-muted mt-3">
            Tip: Average successful protest reduces assessed value by 5-15%.
          </p>
        </div>
      </section>

      <!-- More / Explore -->
      <section v-if="siblings.length" class="mb-8">
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
      <section class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30"
          >
            <UIcon :name="c.icon" class="size-4" :class="c.color" /><span
              class="text-sm font-medium"
              >{{ c.title }}</span
            >
          </NuxtLink>
        </div>
      </section>
    </UContainer>
  </div>
</template>
