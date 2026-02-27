<!-- eslint-disable atx/no-fetch-in-component -- SSR admin page data fetching -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UBadgeComponent = resolveComponent('UBadge')

interface PipelineRun {
  id: number
  categorySlug: string
  topicKey: string | null
  status: string
  spotsGenerated: number | null
  tokensUsed: number | null
  startedAt: string
  completedAt: string | null
}
definePageMeta({
  title: 'Content Pipeline',
  middleware: 'auth',
})

const { isAdmin } = useAuth()

// ─── Category options from useSiteData ──────────────────────
const { categories } = useSiteData()
const categoryOptions = computed(() =>
  categories.value.map((c) => ({ label: c.title, value: c.slug })),
)

const DEFAULT_BODY_PROMPT = `You are a content writer for Austin-Texas.net, an illustrated city guide to Austin, TX.
Write engaging, opinionated prose about Austin's local scene. Be specific — name real places,
real dishes, real neighborhoods. Sound like a local who genuinely loves the city, not a tourist guide.
Use a warm, confident tone. Avoid generic superlatives. Under 400 words total for the body.`

const DEFAULT_FAQ_PROMPT = `You are a local Austin expert writing FAQ answers for austin-texas.net.
Each answer should be 2-3 sentences, factual, helpful, and specific to Austin.
Mention real places, real prices, real seasons. Avoid filler.`

// ─── Data fetching ──────────────────────────────────────────
const { data: topicsData, refresh: refreshTopics } = await useFetch(
  '/api/admin/content-pipeline/topics',
)
const { data: runsData, refresh: refreshRuns } = await useFetch('/api/admin/content-pipeline/runs')

const refreshTopicAndRuns = async () => {
  await refreshTopics()
  await refreshRuns()
}

const topics = computed(() => topicsData.value?.topics ?? [])
const runs = computed(() => runsData.value?.runs ?? [])

// ─── Topic editing ──────────────────────────────────────────
const editingTopic = ref<Record<string, unknown> | null>(null)
const showEditModal = ref(false)

function onCategoryChange(slug: string) {
  if (!editingTopic.value) return
  const cat = categories.value.find((c) => c.slug === slug)
  editingTopic.value.categorySlug = slug
  editingTopic.value.categoryLabel = cat?.title ?? slug
}

function openNewTopic() {
  editingTopic.value = {
    categorySlug: 'food',
    categoryLabel: 'Food',
    topicKey: '',
    topicLabel: '',
    contentType: 'spots',
    spotFile: '',
    maxSpots: 10,
    description: '',
    status: 'live',
    standaloneUrl: '',
    searchQueries: [
      'best ___ austin texas 2025',
      'top rated ___ austin tx',
      'new ___ austin texas',
    ],
    bodySystemPrompt: DEFAULT_BODY_PROMPT,
    faqSystemPrompt: DEFAULT_FAQ_PROMPT,
    enabled: true,
  }
  showEditModal.value = true
}

function openEditTopic(topic: Record<string, unknown>) {
  editingTopic.value = {
    ...topic,
    searchQueries: Array.isArray(topic.searchQueries)
      ? [...(topic.searchQueries as string[])]
      : JSON.parse(String(topic.searchQueries || '[]')),
  }
  showEditModal.value = true
}

function addSearchQuery() {
  if (editingTopic.value && Array.isArray(editingTopic.value.searchQueries)) {
    ;(editingTopic.value.searchQueries as string[]).push('')
  }
}

function removeSearchQuery(index: number) {
  if (editingTopic.value && Array.isArray(editingTopic.value.searchQueries)) {
    ;(editingTopic.value.searchQueries as string[]).splice(index, 1)
  }
}

// ─── Save / Delete / Run ────────────────────────────────────
const saving = ref(false)
const deleting = ref(false)
const seeding = ref(false)
const runningTopicId = ref<number | null>(null)
const showOutputModal = ref(false)
const runOutput = ref<{
  spots: Array<Record<string, unknown>>
  tokensUsed: number
  spotsGenerated: number
} | null>(null)
const runError = ref<string | null>(null)

async function saveTopic() {
  if (!editingTopic.value) return
  saving.value = true
  try {
    await $fetch('/api/admin/content-pipeline/topics', {
      method: 'POST',
      body: editingTopic.value,
    })
    showEditModal.value = false
    editingTopic.value = null
    await refreshTopics()
  } catch (err) {
    console.error('Save failed:', err)
  } finally {
    saving.value = false
  }
}

async function deleteTopic(id: number) {
  deleting.value = true
  try {
    await $fetch('/api/admin/content-pipeline/topics', {
      method: 'DELETE',
      body: { id },
    })
    await refreshTopics()
  } catch (err) {
    console.error('Delete failed:', err)
  } finally {
    deleting.value = false
  }
}

async function seedDefaults() {
  seeding.value = true
  try {
    await $fetch('/api/admin/content-pipeline/seed', { method: 'POST' })
    await refreshTopics()
  } catch (err) {
    console.error('Seed failed:', err)
  } finally {
    seeding.value = false
  }
}

async function runTopic(id: number) {
  runningTopicId.value = id
  runError.value = null
  runOutput.value = null
  try {
    const data = await $fetch<{
      spots: Array<Record<string, unknown>>
      tokensUsed: number
      spotsGenerated: number
    }>('/api/admin/content-pipeline/run', {
      method: 'POST',
      body: { topicId: id },
    })
    runOutput.value = data
    showOutputModal.value = true
    await refreshRuns()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    runError.value = msg
    showOutputModal.value = true
  } finally {
    runningTopicId.value = null
  }
}

// ─── Helpers ────────────────────────────────────────────────
function statusColor(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'running':
      return 'warning'
    case 'failed':
      return 'error'
    default:
      return 'neutral'
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Run history table columns ──────────────────────────────
const runColumns: TableColumn<PipelineRun>[] = [
  {
    accessorKey: 'categorySlug',
    header: 'Category',
    meta: { class: { td: 'capitalize font-medium' } },
  },
  {
    accessorKey: 'topicKey',
    header: 'Topic',
    cell: ({ row }) => row.getValue('topicKey') || 'All',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(UBadgeComponent, {
        color: statusColor(row.getValue('status') as string),
        variant: 'subtle',
        size: 'xs',
        label: row.getValue('status') as string,
      }),
  },
  {
    accessorKey: 'spotsGenerated',
    header: 'Spots',
    cell: ({ row }) => row.getValue('spotsGenerated') || '—',
  },
  {
    accessorKey: 'tokensUsed',
    header: 'Tokens',
    meta: { class: { td: 'text-dimmed' } },
    cell: ({ row }) => {
      const val = row.getValue('tokensUsed') as number | null
      return val ? val.toLocaleString() : '—'
    },
  },
  {
    accessorKey: 'startedAt',
    header: 'Started',
    meta: { class: { td: 'text-dimmed' } },
    cell: ({ row }) => timeAgo(row.getValue('startedAt') as string),
  },
]

// Group topics by category
const categorizedTopics = computed(() => {
  const groups: Record<string, Array<Record<string, unknown>>> = {}
  for (const topic of topics.value) {
    const cat = String(topic.categorySlug)
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(topic as unknown as Record<string, unknown>)
  }
  return groups
})
</script>

<template>
  <div class="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <UIcon name="i-lucide-sparkles" class="size-6 text-primary" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Content Pipeline</h1>
          <p class="text-sm text-dimmed">AI-powered content curation & research</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="outline"
          to="/admin/"
          icon="i-lucide-arrow-left"
          size="sm"
        >
          Dashboard
        </UButton>
      </div>
    </div>

    <!-- Actions Bar -->
    <div v-if="isAdmin" class="flex items-center gap-3 flex-wrap">
      <UButton icon="i-lucide-plus" color="primary" size="sm" @click="openNewTopic">
        Add Topic
      </UButton>
      <UButton
        icon="i-lucide-database"
        color="neutral"
        variant="outline"
        size="sm"
        :loading="seeding"
        @click="seedDefaults"
      >
        Seed Defaults
      </UButton>
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="refreshTopicAndRuns"
      >
        Refresh
      </UButton>
      <div class="ml-auto text-xs text-dimmed">
        Run locally:
        <code class="px-1.5 py-0.5 rounded bg-elevated font-mono">pnpm run content:refresh</code>
      </div>
    </div>

    <!-- Topics by Category -->
    <section v-for="(catTopics, catSlug) in categorizedTopics" :key="catSlug">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-folder" class="size-5 text-primary" />
        <h2 class="text-lg font-semibold capitalize">{{ catSlug }}</h2>
        <UBadge color="neutral" variant="subtle" size="xs" :label="`${catTopics.length} topics`" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="topic in catTopics"
          :key="String(topic.id)"
          class="group relative rounded-2xl border border-default bg-elevated transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
          :class="topic.enabled ? 'opacity-100' : 'opacity-60'"
        >
          <!-- Accent Strip -->
          <div
            class="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
            :class="topic.accentColor ? `bg-${topic.accentColor}-500` : 'bg-muted'"
          />

          <div class="p-5">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-start gap-3">
                <div
                  class="size-10 rounded-xl flex items-center justify-center shrink-0 border border-default"
                  :class="
                    topic.accentColor
                      ? `bg-${topic.accentColor}-500/10 text-${topic.accentColor}-600 dark:text-${topic.accentColor}-400`
                      : 'bg-muted/10 text-muted'
                  "
                >
                  <UIcon :name="(topic.icon as string) || 'i-lucide-folder'" class="size-5" />
                </div>
                <div>
                  <h3 class="font-bold leading-tight">{{ topic.topicLabel }}</h3>
                  <p class="text-[10px] font-mono text-dimmed uppercase tracking-wider mt-0.5">
                    /{{ topic.categorySlug }}/{{ topic.topicKey }}
                  </p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <UBadge
                  :color="topic.enabled ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                  class="px-1.5"
                >
                  {{ topic.enabled ? 'Active' : 'Disabled' }}
                </UBadge>
                <div class="flex items-center gap-1">
                  <UBadge
                    v-if="topic.status === 'coming-soon'"
                    color="warning"
                    variant="subtle"
                    size="xs"
                    class="px-1"
                    >Soon</UBadge
                  >
                  <UBadge
                    color="neutral"
                    variant="outline"
                    size="xs"
                    class="px-1 font-mono uppercase text-[9px]"
                  >
                    {{ topic.contentType }}
                  </UBadge>
                </div>
              </div>
            </div>

            <!-- Description -->
            <p v-if="topic.description" class="text-xs text-muted line-clamp-2 mb-4 h-8">
              {{ topic.description }}
            </p>
            <div v-else class="mb-4 h-8 flex items-center">
              <span class="text-[10px] italic text-dimmed">No description provided</span>
            </div>

            <!-- Meta info -->
            <div class="grid grid-cols-2 gap-2 mb-5">
              <div
                class="flex items-center gap-2 bg-default rounded-lg p-1.5 border border-default"
              >
                <UIcon name="i-lucide-file-code" class="size-3.5 text-dimmed" />
                <span class="text-[10px] truncate text-muted font-mono">{{
                  topic.spotFile || 'None'
                }}</span>
              </div>
              <div
                class="flex items-center gap-2 bg-default rounded-lg p-1.5 border border-default"
              >
                <UIcon name="i-lucide-map-pin" class="size-3.5 text-dimmed" />
                <span class="text-[10px] text-muted font-bold">{{ topic.maxSpots }} spots</span>
              </div>
            </div>

            <!-- Search queries preview -->
            <div class="mb-5">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(q, qi) in (topic.searchQueries as string[]).slice(0, 2)"
                  :key="qi"
                  class="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10 text-[9px] text-primary-600 dark:text-primary-400 font-medium truncate max-w-[120px]"
                >
                  {{ q }}
                </span>
                <span
                  v-if="(topic.searchQueries as string[]).length > 2"
                  class="text-[9px] text-dimmed ml-1 self-center"
                >
                  +{{ (topic.searchQueries as string[]).length - 2 }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 mt-auto pt-4 border-t border-default/50">
              <UTooltip text="Preview / Run Pipeline">
                <UButton
                  size="xs"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-play"
                  :loading="runningTopicId === Number(topic.id)"
                  :disabled="runningTopicId !== null && runningTopicId !== Number(topic.id)"
                  @click="runTopic(Number(topic.id))"
                >
                  Run
                </UButton>
              </UTooltip>
              <UButton
                size="xs"
                color="neutral"
                variant="outline"
                icon="i-lucide-pencil"
                class="flex-1"
                @click="openEditTopic(topic)"
              >
                Edit
              </UButton>
              <div class="ml-auto flex items-center gap-1">
                <UButton
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  :loading="deleting"
                  @click="deleteTopic(Number(topic.id))"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Empty state -->
    <div
      v-if="topics.length === 0"
      class="text-center py-16 rounded-2xl border border-dashed border-default"
    >
      <UIcon name="i-lucide-sparkles" class="size-12 text-dimmed mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">No topics configured</h3>
      <p class="text-sm text-dimmed mb-4">
        Click "Seed Defaults" to load the food category topics, or add them manually.
      </p>
      <UButton icon="i-lucide-database" color="primary" @click="seedDefaults">
        Seed Default Topics
      </UButton>
    </div>

    <!-- Run History -->
    <section>
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-history" class="size-5 text-primary" />
        <h2 class="text-lg font-semibold">Run History</h2>
        <UBadge color="neutral" variant="subtle" size="xs" :label="`${runs.length} runs`" />
      </div>

      <UCard v-if="runs.length > 0">
        <UTable :data="runs" :columns="runColumns" />
      </UCard>

      <div v-else class="text-center py-8 rounded-2xl border border-dashed border-default">
        <p class="text-sm text-dimmed">No runs yet. Use the CLI to trigger your first run:</p>
        <code class="mt-2 inline-block px-3 py-1.5 rounded-lg bg-elevated text-xs font-mono">
          pnpm run content:refresh -- --category food
        </code>
      </div>
    </section>

    <!-- Edit/Create Modal -->
    <UModal v-model:open="showEditModal" :ui="{ content: 'max-w-2xl' }">
      <template #content>
        <div class="p-6 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-6">
            {{ editingTopic?.id ? 'Edit Topic' : 'New Topic' }}
          </h3>

          <div v-if="editingTopic" class="flex flex-col gap-8">
            <!-- Section 1: Topic Identity -->
            <section>
              <h4
                class="text-sm font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2"
              >
                <UIcon name="i-lucide-fingerprint" class="size-4" />
                Topic Identity
              </h4>
              <div class="grid grid-cols-1 gap-5">
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="Category" required>
                    <USelect
                      :model-value="editingTopic.categorySlug as string"
                      :items="categoryOptions"
                      class="w-full"
                      @update:model-value="onCategoryChange"
                    />
                  </UFormField>
                  <UFormField label="Topic Key" description="Slug (e.g. 'bbq')" required>
                    <UInput
                      v-model="editingTopic.topicKey as string"
                      placeholder="bbq"
                      class="w-full"
                    />
                  </UFormField>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="Topic Label" description="Display name" required>
                    <UInput
                      v-model="editingTopic.topicLabel as string"
                      placeholder="BBQ Joints"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField label="Content Type" required>
                    <USelect
                      v-model="editingTopic.contentType as string"
                      :items="['spots', 'guide', 'data-page', 'utility']"
                      class="w-full"
                      @update:model-value="
                        (val: string) => {
                          if (val === 'utility') {
                            editingTopic!.spotFile = null
                          }
                        }
                      "
                    />
                  </UFormField>
                </div>
                <UFormField label="Description" description="Short teaser for the category hub">
                  <UTextarea
                    v-model="editingTopic.description as string"
                    placeholder="Find the best breakfast tacos in Austin..."
                    :rows="2"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </section>

            <USeparator />

            <!-- Section 2: Appearance & Metadata -->
            <section>
              <h4
                class="text-sm font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2"
              >
                <UIcon name="i-lucide-palette" class="size-4" />
                Appearance & Metadata
              </h4>
              <div class="grid grid-cols-1 gap-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <!-- Icon with Preview -->
                  <UFormField label="Icon" description="Iconify name (e.g. i-lucide-beef)">
                    <div class="flex gap-3 items-center">
                      <UInput
                        v-model="editingTopic.icon as string"
                        placeholder="i-lucide-beef"
                        class="flex-1"
                      />
                      <div
                        class="size-10 rounded-xl bg-elevated border border-default flex items-center justify-center shrink-0"
                      >
                        <UIcon
                          :name="(editingTopic.icon as string) || 'i-lucide-help-circle'"
                          class="size-5"
                        />
                      </div>
                    </div>
                  </UFormField>

                  <!-- Accent Color with Preview -->
                  <UFormField label="Accent Color" description="Tailwind color (e.g. amber, red)">
                    <div class="flex gap-3 items-center">
                      <UInput
                        v-model="editingTopic.accentColor as string"
                        placeholder="amber"
                        class="flex-1"
                      />
                      <div
                        class="size-10 rounded-xl border border-default shrink-0"
                        :class="
                          editingTopic.accentColor
                            ? `bg-${editingTopic.accentColor}-500`
                            : 'bg-muted'
                        "
                      />
                    </div>
                  </UFormField>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <!-- Pin Color with Preview -->
                  <UFormField label="Pin Color" description="Hex for map pins (e.g. #dc2626)">
                    <div class="flex gap-3 items-center">
                      <UInput
                        v-model="editingTopic.pinColor as string"
                        placeholder="#dc2626"
                        class="flex-1"
                      />
                      <div
                        class="size-10 rounded-xl border border-default shrink-0"
                        :style="
                          editingTopic.pinColor
                            ? { backgroundColor: String(editingTopic.pinColor) }
                            : {}
                        "
                        :class="!editingTopic.pinColor ? 'bg-muted' : ''"
                      />
                    </div>
                  </UFormField>

                  <!-- Status -->
                  <UFormField label="Status" description="Site visibility">
                    <USelect
                      v-model="editingTopic.status as string"
                      :items="['live', 'coming-soon']"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <!-- Standalone URL -->
                <UFormField
                  label="Standalone URL"
                  description="Link to external port (e.g. legacy app)"
                >
                  <UInput
                    v-model="editingTopic.standaloneUrl as string"
                    placeholder="https://tacos.austin-texas.net"
                    icon="i-lucide-external-link"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </section>

            <template v-if="editingTopic.contentType !== 'utility'">
              <USeparator />

              <!-- Section 3: Content Delivery / AI Pipeline -->
              <section>
                <div class="flex items-center justify-between mb-4">
                  <h4
                    class="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2"
                  >
                    <UIcon name="i-lucide-zap" class="size-4 text-primary" />
                    AI Pipeline & Config
                  </h4>
                  <UBadge color="primary" variant="subtle" size="xs">AI Enabled</UBadge>
                </div>

                <div class="grid grid-cols-1 gap-5">
                  <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Spot File" description="Static fallback name">
                      <UInput
                        v-model="editingTopic.spotFile as string"
                        placeholder="bbqSpots.ts"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Max Spots" description="Points to generate">
                      <UInput
                        v-model.number="editingTopic.maxSpots as number"
                        type="number"
                        :min="1"
                        :max="50"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <!-- Search Queries -->
                  <UFormField label="Search Queries" description="Used by AI to research the topic">
                    <div class="flex flex-col gap-2">
                      <div
                        v-for="(_, qi) in editingTopic.searchQueries as string[]"
                        :key="qi"
                        class="flex gap-2"
                      >
                        <UInput
                          v-model="(editingTopic.searchQueries as string[])[qi]"
                          class="flex-1"
                          placeholder="best bbq austin texas 2026"
                        />
                        <UButton
                          color="error"
                          variant="ghost"
                          size="xs"
                          icon="i-lucide-x"
                          @click="removeSearchQuery(qi)"
                        />
                      </div>
                      <UButton
                        color="neutral"
                        variant="outline"
                        size="xs"
                        icon="i-lucide-plus"
                        class="w-fit"
                        @click="addSearchQuery"
                      >
                        Add Query
                      </UButton>
                    </div>
                  </UFormField>

                  <!-- Prompts -->
                  <div class="grid grid-cols-1 gap-4">
                    <UFormField label="Body System Prompt">
                      <UTextarea
                        v-model="editingTopic.bodySystemPrompt as string"
                        :rows="6"
                        class="w-full font-mono text-xs"
                        placeholder="You are a content writer for Austin-Texas.net..."
                      />
                    </UFormField>

                    <UFormField label="FAQ System Prompt">
                      <UTextarea
                        v-model="editingTopic.faqSystemPrompt as string"
                        :rows="4"
                        class="w-full font-mono text-xs"
                        placeholder="You are a local Austin expert..."
                      />
                    </UFormField>
                  </div>
                </div>
              </section>
            </template>

            <USeparator />

            <!-- Section 4: Settings & Visibility -->
            <section class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <USwitch v-model="editingTopic.enabled as boolean" />
                <div>
                  <p class="text-sm font-medium">
                    {{ editingTopic.enabled ? 'Active Topic' : 'Topic Disabled' }}
                  </p>
                  <p class="text-xs text-dimmed">
                    Controls if this route exists in the final build
                  </p>
                </div>
              </div>
            </section>

            <!-- Actions -->
            <div class="flex items-center gap-3 pt-6 border-t border-default">
              <UButton color="primary" size="lg" :loading="saving" @click="saveTopic">
                {{ editingTopic.id ? 'Update Topic' : 'Create Topic' }}
              </UButton>
              <UButton color="neutral" variant="outline" size="lg" @click="showEditModal = false">
                Cancel
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Run Output Preview Modal -->
    <UModal v-model:open="showOutputModal" :ui="{ content: 'max-w-3xl' }">
      <template #content>
        <div class="p-6 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">
            <template v-if="runError">Run Failed</template>
            <template v-else>Run Output</template>
          </h3>

          <!-- Error state -->
          <div
            v-if="runError"
            class="rounded-xl bg-error/10 border border-error/20 p-4 text-sm text-error"
          >
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-alert-circle" class="size-5" />
              <span class="font-semibold">Error</span>
            </div>
            <p>{{ runError }}</p>
          </div>

          <!-- Success state — Page Preview -->
          <template v-if="runOutput">
            <div class="flex items-center gap-3 mb-5">
              <UBadge
                color="success"
                variant="subtle"
                size="xs"
                :label="`${runOutput.spotsGenerated} spots generated`"
              />
              <UBadge
                color="neutral"
                variant="subtle"
                size="xs"
                :label="`${runOutput.tokensUsed?.toLocaleString()} tokens used`"
              />
            </div>

            <!-- Mock page preview -->
            <div class="rounded-2xl border border-default bg-default overflow-hidden">
              <!-- Page header -->
              <div class="px-5 pt-5 pb-4 border-b border-default bg-elevated">
                <p class="text-xs text-dimmed mb-1">Page Preview</p>
                <h4 class="text-lg font-bold tracking-tight font-display">
                  Top {{ runOutput.spotsGenerated }} Spots
                </h4>
                <p class="text-sm text-muted mt-1">Tap any pin on the map to see the details.</p>
              </div>

              <!-- Rankings list -->
              <div class="px-5 py-4">
                <p class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
                  The Rankings
                </p>
                <div class="flex flex-col gap-2.5">
                  <!-- eslint-disable-next-line atx/no-native-button -- preview card -->
                  <button
                    v-for="(spot, si) in runOutput.spots"
                    :key="si"
                    class="flex items-center gap-3 w-full p-3.5 rounded-xl border border-default bg-default transition-all hover:border-primary/30 hover:shadow-sm text-left"
                  >
                    <!-- Rank badge -->
                    <div class="relative shrink-0">
                      <div
                        class="flex items-center justify-center size-9 rounded-full"
                        :class="
                          (spot.rank as number) <= 3 ? 'preview-rank-top' : 'bg-elevated text-muted'
                        "
                      >
                        <UIcon name="i-lucide-map-pin" class="size-4" />
                      </div>
                      <span
                        class="preview-rank-number"
                        :class="
                          (spot.rank as number) <= 3
                            ? 'preview-rank-number--top'
                            : 'preview-rank-number--default'
                        "
                      >
                        {{ spot.rank || si + 1 }}
                      </span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-sm font-bold truncate">{{ spot.name }}</span>
                        <UBadge
                          v-if="spot.priceRange"
                          :label="String(spot.priceRange)"
                          color="success"
                          variant="subtle"
                          size="xs"
                        />
                      </div>
                      <p class="text-xs text-muted truncate">
                        <!-- eslint-disable-next-line atx/no-raw-tailwind-colors -->
                        <span class="font-medium text-amber-600 dark:text-amber-400">{{
                          spot.knownFor
                        }}</span>
                        <span class="mx-1.5 text-dimmed">·</span>
                        {{ spot.neighborhood }}
                      </p>
                    </div>

                    <!-- Rating -->
                    <div
                      v-if="spot.rating"
                      class="flex items-center gap-1 text-xs font-bold text-muted shrink-0"
                    >
                      <!-- eslint-disable-next-line atx/no-raw-tailwind-colors -->
                      <UIcon name="i-lucide-star" class="size-3.5 text-amber-400" />
                      {{ spot.rating }}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Spot detail cards (expandable) -->
            <UCollapsible class="mt-4">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-lucide-code"
                label="View raw spot data"
                block
              />
              <template #content>
                <div class="mt-3 flex flex-col gap-2">
                  <div
                    v-for="(spot, si) in runOutput.spots"
                    :key="si"
                    class="rounded-lg border border-default p-3 text-xs"
                  >
                    <p class="font-semibold">{{ spot.rank }}. {{ spot.name }}</p>
                    <p class="text-dimmed">{{ spot.address }} · {{ spot.neighborhood }}</p>
                    <p class="mt-1">{{ spot.description }}</p>
                    <p class="text-primary mt-0.5">Known for: {{ spot.knownFor }}</p>
                    <p class="text-dimmed mt-0.5">
                      {{ spot.lat }}, {{ spot.lng }} · {{ spot.priceRange }} · ★ {{ spot.rating }}
                    </p>
                  </div>
                </div>
              </template>
            </UCollapsible>
          </template>

          <div class="flex items-center gap-3 pt-4 mt-4 border-t border-default">
            <UButton color="neutral" variant="outline" @click="showOutputModal = false">
              Close
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<!-- eslint-disable atx/no-style-block-layout -->
<style scoped>
.preview-rank-top {
  background: linear-gradient(145deg, #d97706, #7c2d12);
  color: white;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
}

.preview-rank-number {
  position: absolute;
  bottom: -2px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.preview-rank-number--top {
  background: white;
  color: #92400e;
}

.preview-rank-number--default {
  background: white;
  color: var(--ui-text-muted);
}

:is(.dark) .preview-rank-number--top {
  background: #1c1c1e;
  color: #fbbf24;
}

:is(.dark) .preview-rank-number--default {
  background: #1c1c1e;
}
</style>
