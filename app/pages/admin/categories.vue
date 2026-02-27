<!-- eslint-disable @typescript-eslint/no-explicit-any -- TanStack table APIs use untyped column helpers -->
<!-- eslint-disable atx/no-raw-tailwind-colors -- Admin-only UI warning indicators -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
/**
 * admin/categories.vue -> Unified Site Manager
 * Hierarchy: Category -> Topic (Sub-App) -> Entry (Spot)
 */
import type { AdminCategory, AdminTopic, AdminRun } from '~/composables/useAdminData'
import type { MapSpot } from '~/types/mapSpot'

const UButton = resolveComponent('UButton')

definePageMeta({
  title: 'Site Manager',
  middleware: 'auth',
})

const { isAdmin } = useAuth()
const {
  categories,
  allTopics,
  runs,
  refreshCategories,
  refreshTopics,
  refreshRuns,
  fetchSpots: apiFetchSpots,
  saveCategory: apiSaveCategory,
  saveTopic: apiSaveTopic,
  saveSpot: apiSaveSpot,
  runPipeline: apiRunPipeline,
  approveRun: apiApproveRun,
  generateDescription: apiGenerateDescription,
  aiMagicSpots: apiAiMagicSpots,
  smartSync: apiSmartSync,
} = useAdminData()

// --- State Management (URL Sync) ---
const route = useRoute()
const router = useRouter()

type ViewLevel = 'categories' | 'topics' | 'entries'
const viewLevel = computed(() => (route.query.level as ViewLevel) || 'categories')

const selectedCategory = computed(() => {
  const slug = route.query.cat as string
  if (!slug) return null
  return categories.value.find((c) => c.slug === slug) || null
})

const selectedTopic = computed(() => {
  const key = route.query.topic as string
  if (!key) return null
  return allTopics.value.find((t) => t.topicKey === key) || null
})

// Filtered topics for selected category
const categoryTopics = computed(() => {
  if (!selectedCategory.value) return []
  return allTopics.value.filter((t) => t.categorySlug === selectedCategory.value!.slug)
})

// Spots for selected topic
const spots = ref<MapSpot[]>([])
const loadingSpots = ref(false)

async function fetchSpots(topicKey: string) {
  loadingSpots.value = true
  try {
    const res = await apiFetchSpots(topicKey)
    spots.value = res.spots
  } catch (err) {
    console.error('Failed to fetch spots:', err)
  } finally {
    loadingSpots.value = false
  }
}

// --- Navigation (URL based) ---
function navigateToTopics(cat: AdminCategory) {
  router.push({ query: { level: 'topics', cat: cat.slug } })
}

function navigateToEntries(topic: AdminTopic) {
  router.push({
    query: {
      ...route.query,
      level: 'entries',
      topic: topic.topicKey,
    },
  })
}

function backToCategories() {
  router.push({ query: {} })
}

function backToTopics() {
  const { topic: _, ...query } = route.query
  router.push({ query: { ...query, level: 'topics' } })
}

// Watch for topic changes to fetch spots
watch(
  () => selectedTopic.value?.topicKey,
  (newKey) => {
    if (newKey && viewLevel.value === 'entries') {
      fetchSpots(newKey)
    }
  },
  { immediate: true },
)

// --- Table State (Sort/Filter) ---
const sorting = ref([{ id: 'rank', desc: false }])
const globalFilter = ref('')
const grouping = ref<string[]>([])
const neighborhoodFilter = ref<string | undefined>(undefined)
const areaFilter = ref<string | undefined>(undefined)

const isGroupingEnabled = computed({
  get: () => grouping.value.includes('neighborhood'),
  set: (val: boolean) => {
    grouping.value = val ? ['neighborhood'] : []
  },
})

const isAreaGroupingEnabled = computed({
  get: () => grouping.value.includes('area'),
  set: (val: boolean) => {
    grouping.value = val ? ['area'] : []
  },
})

const uniqueNeighborhoods = computed(() => {
  const hoods = new Set(spots.value.map((s) => s.neighborhood).filter((n): n is string => !!n))
  return Array.from(hoods).sort()
})

const uniqueAreas = computed(() => {
  const areas = new Set(spots.value.map((s) => s.area).filter((a): a is string => !!a))
  return Array.from(areas).sort()
})

const columnFilters = computed(() => {
  const filters = []
  if (neighborhoodFilter.value) {
    filters.push({ id: 'neighborhood', value: neighborhoodFilter.value })
  }
  if (areaFilter.value) {
    filters.push({ id: 'area', value: areaFilter.value })
  }
  return filters
})

const filteredSpots = computed(() => {
  let result = [...spots.value]

  if (neighborhoodFilter.value) {
    result = result.filter((s) => s.neighborhood === neighborhoodFilter.value)
  }
  if (areaFilter.value) {
    result = result.filter((s) => s.area === areaFilter.value)
  }
  if (globalFilter.value) {
    const search = globalFilter.value.toLowerCase()
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.neighborhood?.toLowerCase().includes(search) ||
        s.area?.toLowerCase().includes(search) ||
        s.address?.toLowerCase().includes(search),
    )
  }

  return result
})

const hasActiveFilters = computed(() => {
  return globalFilter.value || neighborhoodFilter.value || areaFilter.value
})

function clearFilters() {
  globalFilter.value = ''
  neighborhoodFilter.value = undefined
  areaFilter.value = undefined
}

// --- AI Magic ---
const runningAiMagic = ref(false)
const showAiMagicModal = ref(false)
const aiMagicLogs = ref<
  { timestamp: string; message: string; type?: 'info' | 'success' | 'error' }[]
>([])
const aiMagicProgress = ref(0)
const aiUpdatedIds = ref<Set<string>>(new Set())

function addAiLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  aiMagicLogs.value.push({
    timestamp: new Date().toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    message,
    type,
  })
}

async function runAiMagic() {
  if (!selectedTopic.value || !selectedCategory.value || filteredSpots.value.length === 0) return

  runningAiMagic.value = true
  showAiMagicModal.value = true
  aiMagicLogs.value = []
  aiMagicProgress.value = 0

  const targetSpots = [...filteredSpots.value]
  const total = targetSpots.length
  const batchSize = 20

  addAiLog(
    `Starting AI Magic for ${total} filtered entries in "${selectedTopic.value.topicLabel}"...`,
  )

  try {
    // Stage 1: Global Ranking Pass (Only if more than 1 entry)
    if (total > 1) {
      addAiLog('Performing Stage 1: Global Ranking Pass...')
      // We send just IDs, Names, and current Ranks to establish a city-wide hierarchy
      const miniSpots = targetSpots.map((s) => ({
        id: s.id,
        name: s.name,
        rank: s.rank,
        neighborhoodRank: s.neighborhoodRank,
      }))
      const { spots: rankedSpots } = await apiAiMagicSpots(
        miniSpots as any,
        selectedTopic.value.topicLabel,
        selectedCategory.value.title,
      )

      // Merge rankings back
      spots.value = spots.value.map((s: MapSpot) => {
        const ranked = (rankedSpots as any[]).find((m) => m.id === s.id)
        if (ranked) {
          return { ...s, rank: ranked.rank, neighborhoodRank: ranked.neighborhoodRank }
        }
        return s
      })
      addAiLog('Global Ranking Pass complete. Starting Enrichment...', 'success')
    }

    // Stage 2: Batched Enrichment
    for (let i = 0; i < total; i += batchSize) {
      const batch = targetSpots.slice(i, i + batchSize)
      const end = Math.min(i + batchSize, total)

      addAiLog(`Enriching batch ${Math.floor(i / batchSize) + 1}: Entries ${i + 1} to ${end}...`)

      const { spots: magicSpots } = await apiAiMagicSpots(
        batch,
        selectedTopic.value.topicLabel,
        selectedCategory.value.title,
      )

      addAiLog(`Successfully enriched ${magicSpots.length} entries.`, 'success')

      // Merge results back into our local spots
      spots.value = spots.value.map((s: MapSpot) => {
        const magic = (magicSpots as any[]).find((m) => m.id === s.id)
        if (magic) {
          aiUpdatedIds.value.add(s.id)
          return { ...s, ...magic }
        }
        return s
      })

      aiMagicProgress.value = Math.round((end / total) * 100)
    }

    addAiLog('All magic complete!', 'success')

    setTimeout(() => {
      aiUpdatedIds.value.clear()
    }, 5000)
  } catch (err: any) {
    console.error('AI Magic failed:', err)
    addAiLog(`Error: ${err.message || 'Unknown error occurred'}`, 'error')
  } finally {
    runningAiMagic.value = false
  }
}

const runningSingleId = ref<string | null>(null)
async function runAiMagicSingle(spot: MapSpot) {
  if (!selectedTopic.value || !selectedCategory.value) return
  runningSingleId.value = spot.id
  try {
    const { spots: magicSpots } = await apiAiMagicSpots(
      [spot],
      selectedTopic.value.topicLabel,
      selectedCategory.value.title,
    )
    const magic = magicSpots[0]
    if (magic) {
      spots.value = spots.value.map((s: MapSpot) => (s.id === spot.id ? { ...s, ...magic } : s))

      // Update modal state if editing this specific spot
      if (editingSpot.value && editingSpot.value.id === spot.id) {
        editingSpot.value = { ...editingSpot.value, ...magic }
      }

      aiUpdatedIds.value.add(spot.id)
      setTimeout(() => aiUpdatedIds.value.delete(spot.id), 3000)
    }
  } catch (err) {
    console.error('Single AI Magic failed:', err)
  } finally {
    runningSingleId.value = null
  }
}

const savingAllSpots = ref(false)
async function saveAllSpots() {
  savingAllSpots.value = true
  try {
    const promises = spots.value.map((s) => apiSaveSpot(s))
    await Promise.all(promises)
    if (selectedTopic.value) fetchSpots(selectedTopic.value.topicKey)
    refreshRuns()
  } catch (err) {
    console.error('Failed to save all spots:', err)
  } finally {
    savingAllSpots.value = false
  }
}

const runningSmartSync = ref(false)
async function handleSmartSync() {
  runningSmartSync.value = true
  try {
    const res = await apiSmartSync()
    if (res.success && selectedTopic.value) {
      await fetchSpots(selectedTopic.value.topicKey)
      // Visual feedback: show a toast or alert would be good,
      // but for now we'll just rely on the new data appearing.
    }
  } catch (err) {
    console.error('Smart Sync failed:', err)
  } finally {
    runningSmartSync.value = false
  }
}

// --- Modals: Category ---
const showCategoryModal = ref(false)
const editingCategory = ref<Partial<AdminCategory> | null>(null)
const savingCategory = ref(false)

function openEditCategory(cat?: AdminCategory) {
  editingCategory.value = cat
    ? { ...cat }
    : {
        slug: '',
        title: '',
        tagline: '',
        icon: 'i-lucide-folder',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        seoTitle: '',
        seoDescription: '',
      }
  showCategoryModal.value = true
}

async function saveCategory() {
  if (!editingCategory.value) return
  savingCategory.value = true
  try {
    await apiSaveCategory(editingCategory.value)
    showCategoryModal.value = false
    await refreshCategories()
    refreshNuxtData('site-data')
  } catch (err) {
    console.error('Save failed:', err)
  } finally {
    savingCategory.value = false
  }
}

// --- Modals: Topic ---
const showTopicModal = ref(false)
const editingTopic = ref<Partial<AdminTopic> | null>(null)
const savingTopic = ref(false)
const generatingDescription = ref(false)

const isNewTopic = computed(() => !editingTopic.value?.id)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function onTopicLabelInput(val: string) {
  if (!editingTopic.value) return
  editingTopic.value.topicLabel = val
  // Auto-generate key only for new topics
  if (isNewTopic.value) {
    editingTopic.value.topicKey = slugify(val)
  }
}

function openEditTopic(topic?: AdminTopic) {
  editingTopic.value = topic
    ? { ...topic }
    : {
        categorySlug: selectedCategory.value?.slug || '',
        categoryLabel: selectedCategory.value?.title || '',
        topicKey: '',
        topicLabel: '',
        contentType: 'spots',
        spotFile: '',
        maxSpots: 10,
        searchQueries: [],
        enabled: true,
        status: 'live',
        icon: 'i-lucide-folder',
        accentColor: 'primary',
      }
  showTopicModal.value = true
}

async function saveTopic() {
  if (!editingTopic.value) return
  savingTopic.value = true
  try {
    await apiSaveTopic(editingTopic.value)
    showTopicModal.value = false
    await refreshTopics()
    refreshNuxtData('site-data')
  } catch (err) {
    console.error('Save failed:', err)
  } finally {
    savingTopic.value = false
  }
}

async function handleGenerateDescription() {
  if (!editingTopic.value?.topicLabel || !editingTopic.value?.categoryLabel) return
  generatingDescription.value = true
  try {
    const { description } = await apiGenerateDescription(
      editingTopic.value.topicLabel,
      editingTopic.value.categoryLabel,
    )
    editingTopic.value.description = description
  } catch (err) {
    console.error('Failed to generate description:', err)
  } finally {
    generatingDescription.value = false
  }
}

// --- Modals: Spot ---
const showSpotModal = ref(false)
const editingSpot = ref<Partial<MapSpot> | null>(null)
const savingSpot = ref(false)

function openEditSpot(spot: MapSpot) {
  editingSpot.value = { ...spot }
  showSpotModal.value = true
}

async function saveSpot() {
  if (!editingSpot.value) return
  savingSpot.value = true
  try {
    await apiSaveSpot(editingSpot.value)
    showSpotModal.value = false
    if (selectedTopic.value) fetchSpots(selectedTopic.value.topicKey)
  } catch (err) {
    console.error('Save failed:', err)
  } finally {
    savingSpot.value = false
  }
}

// --- Pipeline Actions ---
const runningTopicId = ref<number | null>(null)
async function runTopic(topicId: number) {
  runningTopicId.value = topicId
  try {
    await apiRunPipeline(topicId)
    refreshRuns()
  } catch (err) {
    console.error('Run failed:', err)
  } finally {
    runningTopicId.value = null
  }
}

// --- Approval Queue ---
const topicHasPendingRun = (topicKey: string) => {
  return runs.value.some((r) => r.topicKey === topicKey && r.status === 'completed')
}

const showReviewModal = ref(false)
const reviewingRun = ref<(AdminRun & { parsedSpots?: MapSpot[] }) | null>(null)
const selectedSpotsToApprove = ref<string[]>([])
const approving = ref(false)

function openReview(run: AdminRun) {
  const parsedSpots = JSON.parse(run.outputPreview || '[]') as MapSpot[]
  reviewingRun.value = { ...run, parsedSpots }
  selectedSpotsToApprove.value = parsedSpots.map((s: MapSpot) => s.id)
  showReviewModal.value = true
}

async function approveRun() {
  if (!reviewingRun.value) return
  approving.value = true
  try {
    await apiApproveRun(reviewingRun.value.id, selectedSpotsToApprove.value)
    showReviewModal.value = false
    if (selectedTopic.value && selectedTopic.value.topicKey === reviewingRun.value.topicKey) {
      fetchSpots(selectedTopic.value.topicKey)
    }
    await refreshRuns()
  } catch (err) {
    console.error('Approval failed:', err)
  } finally {
    approving.value = false
  }
}

const catColumns = [
  { accessorKey: 'title', header: 'Category' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'topics', header: 'Topics' },
  { accessorKey: 'actions', header: '' },
]

const spotColumns = [
  {
    accessorKey: 'rank',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Rank',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    class: 'w-[70px]',
  },
  {
    accessorKey: 'neighborhoodRank',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Hood',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    class: 'w-[70px]',
  },
  {
    accessorKey: 'name',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Name',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
    class: 'w-[250px]',
  },
  {
    accessorKey: 'neighborhood',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Neighborhood',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
  },
  {
    accessorKey: 'area',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Area',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
  },
  {
    accessorKey: 'status',
    header: ({ column }: any) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'md',
        class: 'text-sm font-bold',
        label: 'Status',
        icon: column.getIsSorted()
          ? column.getIsSorted() === 'asc'
            ? 'i-lucide-arrow-up'
            : 'i-lucide-arrow-down'
          : 'i-lucide-arrow-up-down',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }),
  },
  { accessorKey: 'actions', header: '', class: 'w-[100px]' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8">
    <!-- Breadcrumbs / Navigation -->
    <div class="flex items-center gap-4 text-base">
      <UButton
        size="sm"
        variant="ghost"
        color="neutral"
        icon="i-lucide-home"
        @click="backToCategories"
      >
        All Categories
      </UButton>

      <template v-if="selectedCategory">
        <UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed" />
        <UButton
          size="sm"
          variant="ghost"
          color="neutral"
          :icon="selectedCategory.icon"
          @click="backToTopics"
        >
          {{ selectedCategory.title }}
        </UButton>
      </template>

      <template v-if="selectedTopic">
        <UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed" />
        <span class="flex items-center gap-2 font-semibold px-2 text-lg">
          <UIcon :name="selectedTopic.icon || 'i-lucide-folder'" class="size-5" />
          {{ selectedTopic.topicLabel }}
        </span>
      </template>

      <div class="ml-auto">
        <UButton color="neutral" variant="outline" size="sm" to="/admin/" icon="i-lucide-arrow-left"
          >Dashboard</UButton
        >
      </div>
    </div>

    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <UIcon
            v-if="viewLevel === 'categories'"
            name="i-lucide-layers"
            class="size-8 text-primary"
          />
          <UIcon
            v-else-if="viewLevel === 'topics'"
            :name="selectedCategory?.icon || 'i-lucide-folder'"
            class="size-8 text-primary"
          />
          <UIcon
            v-else
            :name="selectedTopic?.icon || 'i-lucide-map-pin'"
            class="size-8 text-primary"
          />
        </div>
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{
              viewLevel === 'categories'
                ? 'Site Categories'
                : viewLevel === 'topics'
                  ? `${selectedCategory?.title} Topics`
                  : `${selectedTopic?.topicLabel} Entries`
            }}
          </h1>
          <p class="text-base text-dimmed">
            {{
              viewLevel === 'categories'
                ? 'High-level site hierarchy'
                : viewLevel === 'topics'
                  ? `Sub-apps within ${selectedCategory?.title}`
                  : `Manage individual spots for ${selectedTopic?.topicLabel}`
            }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          v-if="isAdmin && viewLevel === 'categories'"
          color="primary"
          size="lg"
          icon="i-lucide-plus"
          @click="openEditCategory()"
        >
          New Category
        </UButton>
        <UButton
          v-if="isAdmin && viewLevel === 'topics'"
          color="primary"
          size="lg"
          icon="i-lucide-plus"
          @click="openEditTopic()"
        >
          New Topic
        </UButton>
      </div>
    </div>

    <!-- --- Categories View --- -->
    <UCard v-if="viewLevel === 'categories'">
      <UTable :data="categories" :columns="catColumns">
        <template #title-cell="{ row }">
          <div class="flex items-center gap-3">
            <div :class="['p-2 rounded-lg', (row.original as any).bgColor]">
              <UIcon
                :name="(row.original as any).icon"
                :class="['size-5', (row.original as any).color]"
              />
            </div>
            <span class="font-semibold">{{ (row.original as any).title }}</span>
          </div>
        </template>
        <template #topics-cell="{ row }">
          <UBadge variant="soft" color="neutral" size="sm">
            {{ allTopics.filter((t) => t.categorySlug === (row.original as any).slug).length }}
            Topics
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-3">
            <UButton
              size="sm"
              color="primary"
              variant="soft"
              icon="i-lucide-search"
              @click="navigateToTopics(row.original)"
              >Explorer</UButton
            >
            <UButton
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              @click="openEditCategory(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- --- Topics View --- -->
    <div
      v-else-if="viewLevel === 'topics'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="topic in categoryTopics"
        :key="topic.id"
        class="group relative rounded-2xl border border-default bg-elevated transition-all hover:border-primary/40 p-5"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start gap-3">
            <div
              class="size-12 rounded-xl flex items-center justify-center border border-default"
              :class="
                topic.accentColor
                  ? `bg-${topic.accentColor}-500/10 text-${topic.accentColor}-600`
                  : 'bg-muted/10 text-muted'
              "
            >
              <UIcon :name="topic.icon || 'i-lucide-folder'" class="size-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold leading-tight">{{ topic.topicLabel }}</h3>
              <p class="text-xs font-mono text-dimmed uppercase mt-0.5">/{{ topic.topicKey }}</p>
            </div>
          </div>
        </div>

        <p class="text-sm text-muted mb-6 line-clamp-2 h-10">
          {{ topic.description || 'No description' }}
        </p>

        <div class="flex items-center gap-3 pt-4 border-t border-default/50">
          <UButton
            size="sm"
            color="primary"
            variant="soft"
            icon="i-lucide-list"
            class="flex-1"
            @click="navigateToEntries(topic)"
          >
            Manage Entries
          </UButton>
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-pencil"
            @click="openEditTopic(topic)"
          />
          <div class="relative">
            <UButton
              size="sm"
              color="primary"
              variant="soft"
              icon="i-lucide-play"
              :loading="runningTopicId === Number(topic.id)"
              @click="runTopic(Number(topic.id))"
            />
            <div
              v-if="topicHasPendingRun(topic.topicKey)"
              class="absolute -top-1 -right-1 size-4 rounded-full bg-primary border-2 border-elevated animate-pulse cursor-pointer"
              title="Pending AI Review"
              @click="
                () => {
                  const run = runs.find(
                    (r) => r.topicKey === topic.topicKey && r.status === 'completed',
                  )
                  if (run) openReview(run)
                }
              "
            />
          </div>
        </div>
      </div>
    </div>

    <!-- --- Entries View --- -->
    <UCard v-else-if="viewLevel === 'entries'">
      <div v-if="loadingSpots" class="py-12 flex flex-col items-center gap-4">
        <UIcon name="i-lucide-loader-2" class="size-8 text-primary animate-spin" />
        <p class="text-sm text-dimmed">Loading entries...</p>
      </div>

      <!-- Standard Spots Table -->
      <template v-else-if="selectedTopic?.contentType === 'spots'">
        <div class="px-4 py-3 flex items-center gap-3 border-b border-default">
          <UInput
            v-model="globalFilter"
            icon="i-lucide-search"
            placeholder="Filter entries..."
            size="md"
            class="max-w-[200px]"
          />
          <USelectMenu
            v-model="neighborhoodFilter"
            :items="uniqueNeighborhoods"
            placeholder="Neighborhoods"
            size="md"
            class="w-40"
            clearable
          />
          <USelectMenu
            v-model="areaFilter"
            :items="uniqueAreas"
            placeholder="Areas"
            size="md"
            class="w-40"
            clearable
          />
          <UButton
            v-if="hasActiveFilters"
            color="neutral"
            variant="subtle"
            size="md"
            icon="i-lucide-filter-x"
            @click="clearFilters"
          />

          <UButton
            v-if="spots.length > 0"
            color="primary"
            variant="soft"
            size="md"
            icon="i-lucide-sparkles"
            label="Magic"
            :loading="runningAiMagic"
            @click="runAiMagic"
          />

          <UButton
            v-if="viewLevel === 'entries'"
            color="neutral"
            variant="ghost"
            size="md"
            icon="i-lucide-refresh-cw"
            label="Sync"
            :loading="runningSmartSync"
            @click="handleSmartSync"
          />

          <UButton
            v-if="spots.length > 0"
            color="success"
            variant="solid"
            size="md"
            icon="i-lucide-save"
            label="Save"
            :loading="savingAllSpots"
            @click="saveAllSpots"
          />

          <UCheckbox v-model="isGroupingEnabled" label="Hoods" size="md" />
          <UCheckbox v-model="isAreaGroupingEnabled" label="Areas" size="md" />
          <div class="text-sm font-medium text-dimmed ml-auto hidden xl:block">
            {{ spots.length }} total
          </div>
        </div>
        <UTable
          v-model:sorting="sorting"
          v-model:grouping="grouping"
          :data="filteredSpots"
          :columns="spotColumns"
          :global-filter="globalFilter"
          :column-filters="columnFilters"
          :meta="{
            class: {
              tr: (row: any) =>
                aiUpdatedIds.has(row.original.id)
                  ? 'bg-primary/5 transition-colors duration-1000'
                  : '',
            },
          }"
        >
          <template #rank-cell="{ row }">
            <div class="w-[70px] text-center font-mono text-sm">
              {{ (row.original as any).rank || '—' }}
            </div>
          </template>
          <template #neighborhoodRank-cell="{ row }">
            <div class="w-[70px] text-center font-mono text-sm text-primary font-bold">
              {{ (row.original as any).neighborhoodRank || '—' }}
            </div>
          </template>
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3 overflow-hidden max-w-[250px]">
              <UTooltip v-if="!(row.original as any).area" text="Missing Area assignment">
                <UIcon name="i-lucide-alert-circle" class="size-4 text-warning shrink-0" />
              </UTooltip>
              <div class="truncate min-w-0">
                <div class="text-base font-bold truncate">{{ (row.original as any).name }}</div>
                <div class="text-xs text-dimmed truncate">{{ (row.original as any).address }}</div>
              </div>
            </div>
          </template>
          <template #neighborhood-cell="{ row }">
            <span class="text-sm">{{ (row.original as any).neighborhood || '—' }}</span>
          </template>
          <template #area-cell="{ row }">
            <UBadge v-if="(row.original as any).area" variant="subtle" color="neutral" size="sm">
              {{ (row.original as any).area }}
            </UBadge>
            <span v-else class="text-dimmed">—</span>
          </template>
          <template #status-cell="{ row }">
            <UBadge
              :color="
                (row.original as any).status === 'approved'
                  ? 'success'
                  : (row.original as any).status === 'pending'
                    ? 'warning'
                    : 'neutral'
              "
              variant="soft"
              size="sm"
              class="capitalize"
            >
              {{ (row.original as any).status || 'approved' }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-3 px-2">
              <UButton
                size="md"
                color="neutral"
                variant="ghost"
                icon="i-lucide-pencil"
                @click="openEditSpot(row.original)"
              />
              <UButton size="md" color="error" variant="ghost" icon="i-lucide-trash-2" />
            </div>
          </template>
        </UTable>
      </template>

      <!-- Specialized / Coming Soon for other types -->
      <div v-else class="py-20 flex flex-col items-center text-center px-4">
        <div class="size-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
          <UIcon
            :name="
              selectedTopic?.contentType === 'guide'
                ? 'i-lucide-book-open'
                : selectedTopic?.contentType === 'areas'
                  ? 'i-lucide-map'
                  : 'i-lucide-database'
            "
            class="size-8 text-primary/50"
          />
        </div>
        <h3 class="text-lg font-bold mb-2 uppercase tracking-tight">
          {{ selectedTopic?.contentType }} Management
        </h3>
        <p class="text-sm text-dimmed max-w-sm">
          {{
            selectedTopic?.contentType === 'guide'
              ? 'This topic is managed as a curated guide. Specialized sequence tools are coming soon.'
              : selectedTopic?.contentType === 'areas'
                ? 'This topic uses polygon-based area data. Management for neighborhoods and boundaries is coming soon.'
                : 'This topic uses a specialized data structure. Direct editing in the manager is coming soon.'
          }}
        </p>
        <div class="mt-8 flex gap-3">
          <UButton
            v-if="selectedTopic?.standaloneUrl"
            color="neutral"
            variant="outline"
            icon="i-lucide-external-link"
            :to="selectedTopic.standaloneUrl"
            target="_blank"
          >
            Open External App
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Modals (Simplified for brevity, to be fully expanded) -->
    <UModal v-model:open="showCategoryModal">
      <template #content>
        <div v-if="editingCategory" class="p-8 max-w-2xl w-full">
          <h3 class="text-2xl font-bold mb-8">Edit Category</h3>
          <div class="grid grid-cols-2 gap-6">
            <UFormField label="Title" class="col-span-2 sm:col-span-1"
              ><UInput v-model="editingCategory.title" size="lg" class="w-full"
            /></UFormField>
            <UFormField label="Slug" class="col-span-2 sm:col-span-1"
              ><UInput v-model="editingCategory.slug" size="lg" class="w-full"
            /></UFormField>
            <UFormField label="Tagline" class="col-span-2"
              ><UInput v-model="editingCategory.tagline" size="lg" class="w-full"
            /></UFormField>
            <UFormField label="Icon" class="col-span-1"
              ><UInput
                v-model="editingCategory.icon"
                size="lg"
                placeholder="i-lucide-..."
                class="w-full"
            /></UFormField>
            <UFormField label="Color Class" class="col-span-1"
              ><UInput
                v-model="editingCategory.color"
                size="lg"
                placeholder="text-orange"
                class="w-full"
            /></UFormField>
            <UFormField label="SEO Title" class="col-span-2"
              ><UInput v-model="editingCategory.seoTitle" size="lg" class="w-full"
            /></UFormField>
            <UFormField label="SEO Description" class="col-span-2"
              ><UTextarea
                v-model="editingCategory.seoDescription"
                size="lg"
                :rows="4"
                class="w-full"
            /></UFormField>
            <div class="flex justify-end gap-3 mt-8 col-span-2">
              <UButton
                color="neutral"
                variant="outline"
                size="lg"
                @click="showCategoryModal = false"
                >Cancel</UButton
              >
              <UButton color="primary" size="lg" :loading="savingCategory" @click="saveCategory"
                >Save Category</UButton
              >
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- --- Modals --- -->

    <UModal v-model:open="showTopicModal">
      <template #content>
        <div v-if="editingTopic" class="p-8 flex flex-col gap-8 max-w-2xl w-full">
          <h3 class="text-2xl font-bold">
            {{ isNewTopic ? 'New Topic' : `Edit Topic: ${editingTopic.topicLabel}` }}
          </h3>
          <div class="grid grid-cols-2 gap-6">
            <UFormField label="Label" required class="col-span-2 sm:col-span-1">
              <UInput
                :model-value="editingTopic.topicLabel"
                size="lg"
                class="w-full"
                placeholder="BBQ Joints"
                @update:model-value="onTopicLabelInput"
              />
            </UFormField>
            <UFormField label="Key (slug)" required class="col-span-2 sm:col-span-1">
              <UInput
                v-model="editingTopic.topicKey!"
                size="lg"
                class="w-full font-mono"
                placeholder="bbq"
              />
            </UFormField>
            <UFormField label="Content Type" class="col-span-2 sm:col-span-1">
              <USelect
                v-model="editingTopic.contentType!"
                :items="['spots', 'guide', 'data-page', 'utility']"
                size="lg"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Icon" class="col-span-2 sm:col-span-1">
              <div class="flex gap-3 items-center">
                <UInput
                  v-model="editingTopic.icon!"
                  size="lg"
                  class="flex-1"
                  placeholder="i-lucide-folder"
                />
                <div
                  class="size-10 rounded-xl bg-elevated border border-default flex items-center justify-center shrink-0"
                >
                  <UIcon :name="editingTopic.icon || 'i-lucide-help-circle'" class="size-5" />
                </div>
              </div>
            </UFormField>
            <UFormField label="Description" class="col-span-2">
              <template #label>
                <div class="flex items-center justify-between w-full">
                  <span class="text-sm font-semibold">Description</span>
                  <UButton
                    size="sm"
                    variant="ghost"
                    icon="i-lucide-sparkles"
                    :loading="generatingDescription"
                    @click="handleGenerateDescription"
                  >
                    AI Generate
                  </UButton>
                </div>
              </template>
              <UTextarea v-model="editingTopic.description!" size="lg" :rows="8" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-3 mt-8 col-span-2">
              <UButton color="neutral" variant="outline" size="lg" @click="showTopicModal = false"
                >Cancel</UButton
              >
              <UButton color="primary" size="lg" :loading="savingTopic" @click="saveTopic"
                >Save Topic</UButton
              >
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showSpotModal">
      <template #content>
        <div v-if="editingSpot" class="p-8 flex flex-col gap-8 max-w-3xl w-full">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold">Edit Entry: {{ editingSpot.name }}</h3>
            <UButton
              size="md"
              color="primary"
              variant="soft"
              icon="i-lucide-sparkles"
              label="AI Magic"
              :loading="runningSingleId === editingSpot.id"
              @click="runAiMagicSingle(editingSpot as MapSpot)"
            />
          </div>
          <div class="flex flex-col gap-8">
            <div class="grid grid-cols-4 gap-6">
              <UFormField label="City Rank" class="col-span-4 sm:col-span-1">
                <UInput v-model.number="editingSpot.rank!" size="lg" type="number" class="w-full" />
              </UFormField>
              <UFormField label="Hood Rank" class="col-span-4 sm:col-span-1">
                <UInput
                  v-model.number="editingSpot.neighborhoodRank!"
                  size="lg"
                  type="number"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Status" class="col-span-4 sm:col-span-2">
                <USelect
                  v-model="editingSpot.status!"
                  size="lg"
                  :items="['approved', 'pending', 'archived']"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Name" class="col-span-4">
                <UInput v-model="editingSpot.name!" size="lg" class="w-full font-bold" />
              </UFormField>
              <UFormField label="Known For" class="col-span-4">
                <UInput
                  v-model="editingSpot.knownFor!"
                  size="lg"
                  placeholder="e.g. Best Brisket in Texas"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Neighborhood" class="col-span-4 sm:col-span-2">
                <UInput v-model="editingSpot.neighborhood!" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Area" class="col-span-4 sm:col-span-2">
                <UInput v-model="editingSpot.area!" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Editorial Description" class="col-span-4">
                <UTextarea v-model="editingSpot.description!" size="lg" :rows="8" class="w-full" />
              </UFormField>
            </div>
            <div class="flex justify-end gap-3 mt-8">
              <UButton color="neutral" variant="outline" size="lg" @click="showSpotModal = false"
                >Cancel</UButton
              >
              <UButton color="primary" size="lg" :loading="savingSpot" @click="saveSpot"
                >Save Changes</UButton
              >
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Review Modal -->
    <UModal v-model:open="showReviewModal">
      <template #content>
        <div class="p-8 max-w-3xl w-full">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <UIcon name="i-lucide-sparkles" class="size-6 text-primary" />
              </div>
              <div>
                <h3 class="text-2xl font-bold">Review Pipeline Output</h3>
                <p class="text-base text-dimmed">
                  {{ reviewingRun?.topicKey }} • {{ reviewingRun?.spotsGenerated }} entries staged
                </p>
              </div>
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              size="lg"
              icon="i-lucide-x"
              @click="showReviewModal = false"
            />
          </div>

          <div class="max-h-[50vh] overflow-y-auto mb-8 border border-default rounded-xl">
            <UTable
              :data="reviewingRun?.parsedSpots || []"
              :columns="[
                { accessorKey: 'id', header: '' },
                { accessorKey: 'rank', header: 'City' },
                { accessorKey: 'neighborhoodRank', header: 'Hood' },
                { accessorKey: 'name', header: 'Name' },
                { accessorKey: 'neighborhood', header: 'Neighborhood' },
                { accessorKey: 'area', header: 'Area' },
              ]"
            >
              <template #id-cell="{ row }">
                <UCheckbox
                  size="md"
                  :model-value="selectedSpotsToApprove.includes((row.original as MapSpot).id)"
                  @update:model-value="
                    (val) => {
                      if (val) selectedSpotsToApprove.push((row.original as MapSpot).id)
                      else
                        selectedSpotsToApprove = selectedSpotsToApprove.filter(
                          (id) => id !== (row.original as MapSpot).id,
                        )
                    }
                  "
                />
              </template>
              <template #name-cell="{ row }">
                <div class="text-sm font-semibold">{{ (row.original as MapSpot).name }}</div>
              </template>
            </UTable>
          </div>

          <p class="text-xs text-muted mb-8 bg-default p-4 rounded-lg border border-default italic">
            Tip: These entries will be committed to the live database. You can refine descriptions
            and rankings in the Entry Editor after approval.
          </p>

          <div class="flex justify-end gap-3 font-semibold">
            <UButton color="neutral" variant="outline" size="lg" @click="showReviewModal = false"
              >Discard All</UButton
            >
            <UButton
              color="warning"
              size="lg"
              icon="i-lucide-check-circle"
              :loading="approving"
              @click="approveRun"
            >
              Commit {{ selectedSpotsToApprove.length }} Entries
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
    <!-- AI Magic Progress Modal -->
    <UModal v-model:open="showAiMagicModal">
      <template #content>
        <div class="p-6 flex flex-col gap-6 w-full max-w-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UIcon name="i-lucide-sparkles" class="size-5 text-primary" />
              </div>
              <div>
                <h3 class="text-lg font-bold">AI Enrichment Magic</h3>
                <p class="text-xs text-dimmed">Processing {{ spots.length }} total entries</p>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-xs font-medium">
              <span>{{
                runningAiMagic
                  ? 'Enriching content...'
                  : aiMagicProgress === 100
                    ? 'Process Complete'
                    : 'Process Stopped'
              }}</span>
              <span>{{ aiMagicProgress }}%</span>
            </div>
            <UProgress :model-value="aiMagicProgress" color="primary" />
          </div>

          <div
            class="bg-muted/30 rounded-lg p-4 font-mono text-[11px] h-64 overflow-y-auto flex flex-col gap-1 border border-default"
          >
            <div
              v-for="(log, idx) in aiMagicLogs"
              :key="idx"
              :class="[
                'flex gap-3',
                log.type === 'success'
                  ? 'text-success'
                  : log.type === 'error'
                    ? 'text-error'
                    : 'text-muted',
              ]"
            >
              <span class="opacity-50 shrink-0">{{ log.timestamp }}</span>
              <span>{{ log.message }}</span>
            </div>
            <div v-if="runningAiMagic" class="flex gap-3 text-primary animate-pulse">
              <span class="opacity-50 shrink-0">--:--:--</span>
              <span>Working...</span>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <UButton
              :color="runningAiMagic ? 'neutral' : 'primary'"
              :variant="runningAiMagic ? 'ghost' : 'solid'"
              @click="showAiMagicModal = false"
            >
              {{ runningAiMagic ? 'Run in Background' : 'Close' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
