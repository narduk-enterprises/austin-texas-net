<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
definePageMeta({ title: 'Radar', middleware: 'auth' })

const { ensureLoaded } = useAuth()
await ensureLoaded()

// ─── Stats ────────────────────────────────────────────────────
const { data: stats, refresh: refreshStats } = await useFetch('/api/radar/stats')

// ─── Keywords table ───────────────────────────────────────────
const search = ref('')
const bucket = ref<string | undefined>(undefined)
const sort = ref('strategic_score')
const page = ref(1)
const limit = 50

const queryParams = computed(() => ({
  search: search.value || undefined,
  bucket: bucket.value || undefined,
  sort: sort.value,
  order: 'desc',
  limit,
  offset: (page.value - 1) * limit,
}))

const {
  data: keywords,
  refresh: refreshKeywords,
  status: keywordsStatus,
} = await useFetch('/api/radar/keywords', {
  query: queryParams,
  watch: [queryParams],
})

const bucketOptions = [
  { label: 'All Buckets', value: undefined },
  { label: 'Food', value: 'food' },
  { label: 'Outdoors', value: 'outdoors' },
  { label: 'Places', value: 'places' },
  { label: 'Events', value: 'events' },
  { label: 'Neighborhoods', value: 'neighborhoods' },
  { label: 'Housing', value: 'housing' },
  { label: 'Weather', value: 'weather' },
]

const sortOptions = [
  { label: 'Strategic Score', value: 'strategic_score' },
  { label: 'Opportunity', value: 'opportunity_score' },
  { label: 'Difficulty', value: 'difficulty' },
  { label: 'Volume', value: 'monthly_volume' },
  { label: 'Composite', value: 'composite_score' },
]

// ─── Content queue ────────────────────────────────────────────
const { data: queue } = await useFetch('/api/radar/queue', { query: { limit: 10 } })

// ─── Actions ──────────────────────────────────────────────────
const ingesting = ref(false)
const ingestResult = ref<{ seeded: number; expanded: number } | null>(null)

async function runIngest() {
  ingesting.value = true
  ingestResult.value = null
  try {
    const result = await $fetch('/api/radar/ingest', { method: 'POST' })
    ingestResult.value = result
    await Promise.all([refreshStats(), refreshKeywords()])
  } finally {
    ingesting.value = false
  }
}

const generatingBrief = ref<number | null>(null)
interface BriefResult {
  keyword: string
  suggestedTitle: string
  metaDescription: string
  outline: string
  internalLinks: string[]
  coverage: { app: string; domain: string; url: string | null } | null
  subtypes: string[]
  difficulty: number
  strategicScore: number
  monthlyVolume: number
}

const briefResult = ref<BriefResult | null>(null)

async function generateBrief(keywordId: number) {
  generatingBrief.value = keywordId
  briefResult.value = null
  try {
    briefResult.value = await $fetch('/api/radar/brief', {
      method: 'POST',
      body: { keywordId },
    })
  } finally {
    generatingBrief.value = null
  }
}

function badgeColor(intent: string): 'warning' | 'info' | 'success' | 'secondary' | 'neutral' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'secondary' | 'neutral'> = {
    commercial: 'warning',
    informational: 'info',
    local: 'success',
    navigational: 'secondary',
  }
  return map[intent] || 'neutral'
}

function diffColor(diff: number): 'success' | 'warning' | 'error' {
  if (diff < 30) return 'success'
  if (diff < 60) return 'warning'
  return 'error'
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto py-8 px-4 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-radar" class="size-7 text-primary" />
        <h1 class="text-2xl font-bold">Search Radar</h1>
      </div>
      <div class="flex gap-2">
        <UButton icon="i-lucide-refresh-cw" :loading="ingesting" color="primary" @click="runIngest">
          Run Ingestion
        </UButton>
        <UButton variant="outline" color="neutral" to="/admin" icon="i-lucide-arrow-left">
          Admin
        </UButton>
      </div>
    </div>

    <!-- Ingest result banner -->
    <UCard v-if="ingestResult" class="border-success/25">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-check-circle" class="size-5 text-success" />
        <span
          >Ingestion complete: <strong>{{ ingestResult.seeded }}</strong> seeds,
          <strong>{{ ingestResult.expanded }}</strong> expanded keywords</span
        >
      </div>
    </UCard>

    <!-- KPI Cards -->
    <div v-if="stats" class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      <UCard>
        <div class="flex flex-col items-center gap-1">
          <span class="text-[2rem] font-extrabold leading-none tabular-nums">{{
            stats.kpi.total
          }}</span>
          <span class="text-xs font-medium text-dimmed uppercase tracking-wider"
            >Total Keywords</span
          >
        </div>
      </UCard>
      <UCard>
        <div class="flex flex-col items-center gap-1">
          <span class="text-[2rem] font-extrabold leading-none tabular-nums text-error">{{
            stats.kpi.gaps
          }}</span>
          <span class="text-xs font-medium text-dimmed uppercase tracking-wider">Content Gaps</span>
        </div>
      </UCard>
      <UCard>
        <div class="flex flex-col items-center gap-1">
          <span class="text-[2rem] font-extrabold leading-none tabular-nums text-success"
            >{{ stats.kpi.coveragePct }}%</span
          >
          <span class="text-xs font-medium text-dimmed uppercase tracking-wider">Coverage</span>
        </div>
      </UCard>
      <UCard>
        <div class="flex flex-col items-center gap-1">
          <span class="text-[2rem] font-extrabold leading-none tabular-nums text-warning">{{
            stats.kpi.avgDifficulty
          }}</span>
          <span class="text-xs font-medium text-dimmed uppercase tracking-wider"
            >Avg Difficulty</span
          >
        </div>
      </UCard>
    </div>

    <!-- Bucket + Intent breakdown -->
    <div v-if="stats" class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      <UCard>
        <template #header>
          <span class="font-semibold text-sm">By Bucket</span>
        </template>
        <div class="flex flex-wrap gap-2">
          <UBadge v-for="b in stats.buckets" :key="b.bucket" variant="subtle" color="primary">
            {{ b.bucket }}: {{ b.count }} (avg {{ Math.round(b.avgScore) }})
          </UBadge>
        </div>
      </UCard>
      <UCard>
        <template #header>
          <span class="font-semibold text-sm">By Intent</span>
        </template>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="i in stats.intents"
            :key="i.intent ?? 'unknown'"
            variant="subtle"
            :color="badgeColor(i.intent ?? 'informational')"
          >
            {{ i.intent }}: {{ i.count }}
          </UBadge>
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="flex gap-3 flex-wrap">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search keywords..."
          class="flex-1"
        />
        <USelect v-model="bucket" :items="bucketOptions" value-key="value" placeholder="Bucket" />
        <USelect v-model="sort" :items="sortOptions" value-key="value" placeholder="Sort by" />
      </div>
    </UCard>

    <!-- Keywords Table -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-semibold">Keywords ({{ keywords?.total ?? 0 }})</span>
          <div v-if="keywords && keywords.total > limit" class="flex gap-2">
            <UButton
              size="xs"
              variant="outline"
              color="neutral"
              :disabled="page <= 1"
              icon="i-lucide-chevron-left"
              @click="page--"
            />
            <span class="text-sm self-center"
              >{{ page }} / {{ Math.ceil(keywords.total / limit) }}</span
            >
            <UButton
              size="xs"
              variant="outline"
              color="neutral"
              :disabled="page >= Math.ceil(keywords.total / limit)"
              icon="i-lucide-chevron-right"
              @click="page++"
            />
          </div>
        </div>
      </template>

      <div class="overflow-x-auto">
        <!-- eslint-disable-next-line atx/no-native-table -->
        <table v-if="keywords?.data?.length" class="radar-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Bucket</th>
              <th>Vol</th>
              <th>Diff</th>
              <th>Score</th>
              <th>Intent</th>
              <th>App</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="kw in keywords.data" :key="kw.id">
              <td class="font-medium">{{ kw.keyword }}</td>
              <td>
                <UBadge variant="subtle" color="neutral" size="xs">{{ kw.bucket }}</UBadge>
              </td>
              <td class="tabular-nums">{{ kw.monthlyVolume?.toLocaleString() }}</td>
              <td>
                <UBadge variant="subtle" :color="diffColor(kw.difficulty ?? 50)" size="xs">
                  {{ kw.difficulty }}
                </UBadge>
              </td>
              <td class="tabular-nums font-semibold">{{ kw.strategicScore }}</td>
              <td>
                <UBadge
                  variant="subtle"
                  :color="badgeColor(kw.intent ?? 'informational')"
                  size="xs"
                  >{{ kw.intent }}</UBadge
                >
              </td>
              <td>
                <UBadge v-if="kw.matchedApp" variant="subtle" color="success" size="xs">{{
                  kw.matchedApp
                }}</UBadge>
                <span v-else class="text-dimmed text-xs">—</span>
              </td>
              <td>
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-file-text"
                  :loading="generatingBrief === kw.id"
                  @click="generateBrief(kw.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else-if="keywordsStatus === 'pending'" class="text-center py-8 text-dimmed">
          Loading keywords...
        </div>
        <div v-else class="text-center py-8 text-dimmed">
          No keywords found. Run ingestion to populate.
        </div>
      </div>
    </UCard>

    <!-- Brief result -->
    <UCard v-if="briefResult">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-semibold">Content Brief: {{ briefResult.keyword }}</span>
          <UButton size="xs" variant="ghost" icon="i-lucide-x" @click="briefResult = null" />
        </div>
      </template>
      <div class="flex flex-col gap-4 text-sm">
        <div class="brief-meta">
          <p><strong>Title:</strong> {{ briefResult.suggestedTitle }}</p>
          <p><strong>Meta:</strong> {{ briefResult.metaDescription }}</p>
          <p>
            <strong>Score:</strong> {{ briefResult.strategicScore }} · <strong>Diff:</strong>
            {{ briefResult.difficulty }} · <strong>Vol:</strong> {{ briefResult.monthlyVolume }}
          </p>
        </div>
        <div v-if="briefResult.internalLinks?.length" class="brief-links">
          <strong>Internal Links:</strong>
          <div class="flex flex-wrap gap-1 mt-1">
            <UBadge
              v-for="link in briefResult.internalLinks"
              :key="link"
              variant="subtle"
              color="primary"
              size="xs"
            >
              {{ link }}
            </UBadge>
          </div>
        </div>
        <pre
          class="bg-default border border-default rounded-lg p-4 text-[0.8rem] whitespace-pre-wrap overflow-x-auto"
          >{{ briefResult.outline }}</pre
        >
      </div>
    </UCard>

    <!-- Content Queue -->
    <UCard v-if="queue?.data?.length">
      <template #header>
        <span class="font-semibold">Content Queue (Top {{ queue.data.length }})</span>
      </template>
      <div class="flex flex-col">
        <div
          v-for="(kw, i) in queue.data"
          :key="kw.id"
          class="flex items-center gap-3 py-2 border-b border-default last:border-b-0"
        >
          <span class="text-xs font-bold text-dimmed min-w-6 text-center">{{ i + 1 }}</span>
          <span class="flex-1 font-medium">{{ kw.keyword }}</span>
          <UBadge variant="subtle" color="neutral" size="xs">{{ kw.bucket }}</UBadge>
          <span class="tabular-nums font-semibold">{{ kw.strategicScore }}</span>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-file-text"
            :loading="generatingBrief === kw.id"
            @click="generateBrief(kw.id)"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<style>
.radar-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.radar-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ui-text-dimmed);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--ui-border);
}
.radar-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--ui-border);
  white-space: nowrap;
}
.radar-table tr:hover td {
  background: var(--ui-bg-elevated);
}
</style>
