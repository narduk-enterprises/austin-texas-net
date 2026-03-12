<!-- eslint-disable narduk/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /health/cedar-pollen/ — Live Cedar Pollen Tracker
 *
 * Custom sub-app page overriding the [category]/[slug].vue catch-all.
 * Features live pollen counts, severity ring, trend chart,
 * 5-day forecast, allergen breakdown, and health tips.
 */

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('health')!
const siblings = category.subApps.filter((a) => a.slug !== 'cedar-pollen')
const crossLinks = categories.value.filter((c) => c.slug !== 'health').slice(0, 4)

useSeo({
  title: 'Austin Cedar Pollen Count — Live Tracker & Forecast',
  description:
    'Live cedar pollen counts for Austin, TX. Track mountain cedar levels, view 5-day forecasts, historical trends, and get health tips during cedar fever season.',
})

useWebPageSchema({
  name: 'Austin Cedar Pollen Count — Live Tracker & Forecast',
  description:
    'Real-time cedar pollen tracker for Austin, Texas. Mountain cedar grains/m³, severity levels, 5-day forecast, and seasonal trends.',
})

useSchemaOrg([
  {
    '@type': 'Dataset',
    name: 'Austin Cedar Pollen Data',
    description: 'Real-time and historical cedar pollen counts for Austin, Texas. Includes mountain cedar grains/m³ and severity levels.',
    creator: {
      '@type': 'Organization',
      name: 'Georgetown Allergy Center / KXAN'
    }
  }
])

// ─── Data fetching ─────────────────────────────────────
const { data: currentData } = await useFetch('/api/pollen/current')

const historyDays = ref(30)
const {
  data: historyData,
  status: historyStatus,
  refresh: refreshHistory,
} = await useFetch('/api/pollen/history', {
  query: { days: historyDays },
  watch: false,
})

async function onPeriodChange(days: number) {
  historyDays.value = days
  await refreshHistory()
}

// ─── Computed ──────────────────────────────────────────
const pollenData = computed(() =>
  currentData.value && 'trend' in currentData.value ? currentData.value : null,
)
const current = computed(() => pollenData.value?.current ?? null)
const trend = computed(() => pollenData.value?.trend ?? 'stable')
const season = computed(
  () => pollenData.value?.season ?? { peakCount: 0, avgCount: 0, highDays: 0 },
)
const allergens = computed(() => pollenData.value?.allergens ?? null)
const forecast = computed(() => pollenData.value?.forecast ?? [])

const chartData = computed(() => {
  const readings = historyData.value?.readings
  if (!readings || readings.length === 0) return []
  return readings.map((r: { date: string; count: number; level?: string; peak?: number }) => ({
    date: r.date,
    count: r.count,
    level: r.level,
    peak: r.peak,
  }))
})

const severityInfo = computed(() => {
  if (!current.value) return { level: 'Low' as const, color: '#22C55E' } // eslint-disable-line narduk/no-inline-hex -- fallback Low severity colour before data loads
  return severityFromCount(current.value.count)
})

const trendIcon = computed(() => {
  if (trend.value === 'rising') return 'i-lucide-trending-up'
  if (trend.value === 'falling') return 'i-lucide-trending-down'
  return 'i-lucide-minus'
})

const trendColor = computed(() => {
  if (trend.value === 'rising') return 'error'
  if (trend.value === 'falling') return 'success'
  return 'neutral'
})

const trendLabel = computed(() => {
  if (trend.value === 'rising') return 'Rising'
  if (trend.value === 'falling') return 'Falling'
  return 'Stable'
})

// Allergen bar widths
const allergenBars = computed(() => {
  if (!allergens.value) return []
  const a = allergens.value
  const max = Math.max(a.cedar, a.elm || 0, a.mold || 0, 1)
  return [
    /* eslint-disable narduk/no-inline-hex -- allergen bar chart colors */
    { label: 'Cedar', value: a.cedar, pct: (a.cedar / max) * 100, color: '#EF4444' },
    { label: 'Elm', value: a.elm || 0, pct: ((a.elm || 0) / max) * 100, color: '#F97316' },
    { label: 'Mold', value: a.mold || 0, pct: ((a.mold || 0) / max) * 100, color: '#8B5CF6' },
    /* eslint-enable narduk/no-inline-hex */
  ]
})

// Health tips based on severity
const healthTips = computed(() => {
  const level = severityInfo.value.level
  const base = [
    { icon: 'i-lucide-pill', text: 'Take allergy medication proactively before symptoms start.' },
    { icon: 'i-lucide-wind', text: 'Keep car windows up and use recirculated air mode.' },
    { icon: 'i-lucide-shower-head', text: 'Shower and change clothes after being outside.' },
  ]
  if (level === 'High' || level === 'Very High' || level === 'Severe') {
    return [
      { icon: 'i-lucide-house', text: 'Limit outdoor activities, especially in the morning.' },
      ...base,
      {
        icon: 'i-lucide-air-vent',
        text: 'Run HEPA air purifiers indoors and keep windows sealed.',
      },
    ]
  }
  return base
})

const cedarDominancePct = computed(() => {
  if (!allergens.value || allergens.value.cedar <= 0) return 0
  const a = allergens.value
  return Math.round((a.cedar / (a.cedar + (a.elm || 0) + (a.mold || 0))) * 100)
})
</script>

<template>
  <div>
    <SubAppTopbar title="Cedar Pollen Tracker" />
    <UContainer class="py-8 md:py-12">
      <!-- Header -->
      <div class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="flex items-center justify-center size-12 rounded-2xl"
            :class="category.bgColor"
          >
            <UIcon :name="category.icon" class="size-6" :class="category.color" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Cedar Pollen Tracker
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          {{
            current?.description ||
            'Live cedar pollen counts for Austin, TX. Track mountain cedar levels, view forecasts, and get health tips.'
          }}
        </p>
      </div>

      <!-- ══════ Current Level Banner + Chart ══════ -->
      <section class="mb-10 animate-fade-up-delay-1">
        <!-- Compact current-level banner -->
        <div class="cedar-banner mb-4">
          <div class="cedar-banner-ring">
            <PollenSeverityRing v-if="current" :count="current.count" :size="80" label="Cedar" />
            <div v-else class="flex items-center justify-center size-20">
              <UIcon name="i-lucide-loader" class="size-6 text-muted animate-spin" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold">Current Level</span>
              <UBadge
                :color="trendColor"
                variant="subtle"
                size="xs"
                :icon="trendIcon"
                :label="trendLabel"
              />
            </div>
            <p v-if="current" class="text-xs text-dimmed mt-1">
              Updated {{ current.date }} ·
              {{
                current.source === 'kxan-live' ? 'KXAN / Georgetown Allergy Center' : current.source
              }}
            </p>
          </div>
        </div>

        <!-- Chart -->
        <PollenChart
          :data="chartData"
          :loading="historyStatus === 'pending'"
          @period-change="onPeriodChange"
        />
      </section>

      <!-- ══════ Stat Cards ══════ -->
      <section class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 animate-fade-up-delay-2">
        <PollenStatCard
          label="Season Peak"
          :value="season.peakCount"
          suffix="gr/m³"
          :color="severityFromCount(season.peakCount).color"
        />
        <PollenStatCard
          label="7-Day Average"
          :value="season.avgCount"
          suffix="gr/m³"
          :color="severityFromCount(season.avgCount).color"
        />
        <PollenStatCard label="High Days" :value="season.highDays" suffix="days" />
        <PollenStatCard
          v-if="allergens"
          label="Cedar Dominance"
          :value="cedarDominancePct"
          suffix="%"
          color="#EF4444"
        />
      </section>

      <!-- ══════ 5-Day Forecast ══════ -->
      <section v-if="forecast.length > 0" class="mb-10 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          5-Day Cedar Forecast
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <PollenForecastCard
            v-for="day in forecast"
            :key="day.date"
            :day-name="
              new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
            "
            :date="day.date"
            :level="day.cedar?.category || 'None'"
            :count="day.cedar?.approxCount ?? 0"
            :tree-upi="day.tree?.upi ?? 0"
            :tree-category="day.tree?.category ?? 'None'"
            :active-species="day.activeSpecies || []"
            :in-season="day.inSeason ?? false"
          />
        </div>
      </section>

      <!-- ══════ Allergen Breakdown ══════ -->
      <section v-if="allergens" class="cedar-breakdown mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Allergen Breakdown
        </h2>
        <div class="space-y-4">
          <div v-for="bar in allergenBars" :key="bar.label" class="flex items-center gap-3">
            <span class="text-sm font-medium w-16 shrink-0">{{ bar.label }}</span>
            <div class="flex-1 bg-muted rounded-full h-3 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :style="{ width: `${Math.max(bar.pct, 2)}%`, backgroundColor: bar.color }"
              />
            </div>
            <span class="text-sm font-bold tabular-nums w-20 text-right">
              {{ bar.value.toLocaleString() }}
              <span class="text-dimmed text-xs font-normal">gr/m³</span>
            </span>
          </div>
        </div>
      </section>

      <!-- ══════ Health Tips ══════ -->
      <section class="cedar-tips mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">Health Tips</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(tip, i) in healthTips"
            :key="i"
            class="flex items-start gap-3 p-4 rounded-xl border border-default bg-default"
          >
            <UIcon
              :name="tip.icon"
              class="size-5 shrink-0 mt-0.5"
              :style="{ color: severityInfo.color }"
            />
            <p class="text-sm text-muted leading-relaxed">{{ tip.text }}</p>
          </div>
        </div>
      </section>

      <!-- ══════ About Cedar Fever ══════ -->
      <section class="cedar-about mb-10">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">
            About Cedar Fever in Austin
          </h2>
          <div class="text-sm text-muted leading-relaxed space-y-3">
            <p>
              <strong class="text-default">Cedar fever season</strong> in Austin runs from
              <strong class="text-default">December through February</strong>, when mountain cedar
              (Ashe juniper) trees release massive amounts of pollen into the air. Austin sits
              directly downwind of the Texas Hill Country — home to one of the densest
              concentrations of Ashe juniper in the world.
            </p>
            <p>
              <strong class="text-default">Cold fronts</strong> are the primary trigger for heavy
              pollen releases. When a front passes through Central Texas, male cedar trees burst
              open and release clouds of pollen that can travel hundreds of miles on north winds.
              Counts regularly exceed <strong class="text-default">5,000 grains/m³</strong> during
              peak events.
            </p>
            <p>
              This tracker aggregates data from local monitoring stations across the Austin metro
              area — the same data used by allergists and weather services. Updated daily, so you
              can check before heading outdoors.
            </p>
          </div>

          <!-- Severity scale -->
          <div class="mt-6 pt-5 border-t border-default">
            <h3 class="text-xs font-bold uppercase tracking-widest text-dimmed mb-3">
              Severity Scale
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div
                v-for="s in SEVERITY_SCALE"
                :key="s.level"
                class="flex items-center gap-2 p-2 rounded-lg"
              >
                <div class="size-3 rounded-full shrink-0" :style="{ backgroundColor: s.color }" />
                <div>
                  <span class="text-xs font-bold">{{ s.level }}</span>
                  <span class="text-[0.65rem] text-dimmed ml-1">{{ s.range }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ More in Health ══════ -->
      <section v-if="siblings.length" class="mb-8">
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
      <section class="mb-6">
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

<style scoped>
/* ── Compact current-level banner ──────────────────── */
.cedar-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}

:is(.dark) .cedar-banner {
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.cedar-banner-ring {
  flex-shrink: 0;
}
</style>
