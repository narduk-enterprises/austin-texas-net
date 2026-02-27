import type { MapSpot } from '~/types/mapSpot'

export interface AdminTopic {
  id: number
  categorySlug: string
  categoryLabel: string
  topicKey: string
  topicLabel: string
  contentType: 'spots' | 'guide' | 'areas' | 'custom'
  spotFile: string | null
  maxSpots: number
  searchQueries: string[] | string
  bodySystemPrompt: string
  faqSystemPrompt: string
  enabled: boolean
  status: 'live' | 'coming-soon'
  icon: string | null
  accentColor: string | null
  pinColor: string | null
  standaloneUrl: string | null
  description: string | null
  updatedAt: string
}

export interface AdminCategory {
  slug: string
  title: string
  tagline: string
  icon: string
  color: string
  bgColor: string
  seoTitle: string
  seoDescription: string
}

export interface AdminRun {
  id: number
  categorySlug: string
  topicKey: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  spotsGenerated: number | null
  tokensUsed: number | null
  startedAt: string
  completedAt: string | null
  outputPreview?: string
}

export function useAdminData() {
  const { data: categoriesData, refresh: refreshCategories } = useFetch<{
    categories: AdminCategory[]
  }>('/api/admin/site-categories')
  const { data: topicsData, refresh: refreshTopics } = useFetch<{ topics: AdminTopic[] }>(
    '/api/admin/content-pipeline/topics',
  )
  const { data: runsData, refresh: refreshRuns } = useFetch<{ runs: AdminRun[] }>(
    '/api/admin/content-pipeline/runs',
  )

  const categories = computed(() => categoriesData.value?.categories ?? [])
  const allTopics = computed(() => topicsData.value?.topics ?? [])
  const runs = computed(() => runsData.value?.runs ?? [])

  const fetchSpots = async (topicKey: string) => {
    return await $fetch<{ spots: MapSpot[] }>(`/api/admin/map-spots?contentType=${topicKey}`)
  }

  const saveCategory = async (category: Partial<AdminCategory>) => {
    return await $fetch('/api/admin/site-categories', {
      method: 'POST',
      body: category,
    })
  }

  const saveTopic = async (topic: Partial<AdminTopic>) => {
    return await $fetch('/api/admin/content-pipeline/topics', {
      method: 'POST',
      body: topic,
    })
  }

  const deleteTopic = async (id: number) => {
    return await $fetch('/api/admin/content-pipeline/topics', {
      method: 'DELETE',
      body: { id },
    })
  }

  const saveSpot = async (spot: Partial<MapSpot>) => {
    return await $fetch('/api/admin/map-spots', {
      method: 'POST',
      body: spot,
    })
  }

  const runPipeline = async (topicId: number) => {
    return await $fetch('/api/admin/content-pipeline/run', {
      method: 'POST',
      body: { topicId },
    })
  }

  const approveRun = async (runId: number, selectedSpotIds: string[]) => {
    return await $fetch('/api/admin/content-pipeline/approve', {
      method: 'POST',
      body: { runId, selectedSpotIds },
    })
  }

  const seedDefaults = async () => {
    return await $fetch('/api/admin/content-pipeline/seed', { method: 'POST' })
  }

  const generateDescription = async (topicLabel: string, categoryLabel: string) => {
    return await $fetch<{ description: string }>(
      '/api/admin/content-pipeline/generate-description',
      {
        method: 'POST',
        body: { topicLabel, categoryLabel },
      },
    )
  }

  const aiMagicSpots = async (spots: MapSpot[], topicLabel: string, categoryLabel: string) => {
    return await $fetch<{ spots: MapSpot[] }>('/api/admin/map-spots/ai-magic', {
      method: 'POST',
      body: { spots, topicLabel, categoryLabel },
    })
  }

  const smartSync = async () => {
    return await $fetch<{ success: boolean; updatedCount: number }>(
      '/api/admin/map-spots/smart-sync',
      {
        method: 'POST',
      },
    )
  }

  return {
    categories,
    refreshCategories,
    allTopics,
    refreshTopics,
    runs,
    refreshRuns,
    fetchSpots,
    saveCategory,
    saveTopic,
    deleteTopic,
    saveSpot,
    runPipeline,
    approveRun,
    seedDefaults,
    generateDescription,
    aiMagicSpots,
    smartSync,
  }
}
