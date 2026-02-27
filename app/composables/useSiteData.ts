/**
 * useSiteData — centralized site hierarchy for austin-texas.net
 * Single source of truth: homepage card grid, category landing pages, SEO metadata.
 *
 * Category overview content and FAQs live in Nuxt Content markdown files
 * under content/categories/{slug}.md — queried via queryCollection('categories').
 */

export interface SubApp {
  slug: string
  title: string
  description: string
  status: 'live' | 'coming-soon'
  contentType?: string
  accentColor?: string
  pinColor?: string
  icon?: string
  /** If live, the standalone ATX App URL (for linking while not yet ported) */
  standaloneUrl?: string
}

export interface Category {
  slug: string
  title: string
  tagline: string
  icon: string
  color: string
  bgColor: string
  subApps: SubApp[]
  seo: { title: string; description: string }
}

export function useSiteData() {
  const { data: siteData } = useNuxtData<{ categories: Category[] }>('site-data')

  const categories = computed(() => siteData.value?.categories ?? [])

  function getCategoryBySlug(slug: string): Category | undefined {
    return categories.value.find((c) => c.slug === slug)
  }

  async function fetchSiteData(): Promise<{ categories: Category[] }> {
    return await $fetch('/api/site-data')
  }

  return { categories, getCategoryBySlug, fetchSiteData }
}
