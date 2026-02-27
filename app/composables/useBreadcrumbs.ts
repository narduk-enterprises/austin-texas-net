/**
 * useBreadcrumbs — Derives breadcrumb items from the current route.
 *
 * Resolves category titles from useSiteData() and provides items
 * compatible with Nuxt UI's UBreadcrumb component.
 */
export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

export function useBreadcrumbs() {
  const route = useRoute()
  const { getCategoryBySlug } = useSiteData()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = ((runtimeConfig.public.appUrl as string) || 'https://austin-texas.net').replace(
    /\/$/,
    '',
  )

  const items = computed<BreadcrumbItem[]>(() => {
    const segments = route.path.replace(/\/$/, '').split('/').filter(Boolean)
    if (segments.length === 0) return []

    const result: BreadcrumbItem[] = [{ label: 'Home', to: '/', icon: 'i-lucide-house' }]
    let path = ''

    for (const segment of segments) {
      path += `/${segment}`
      const category = getCategoryBySlug(segment)
      const label =
        category?.title ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      result.push({ label, to: `${path}/` })
    }

    // Last item is current page — no link
    if (result.length > 1) {
      const last = result[result.length - 1]
      if (last) delete last.to
    }

    return result
  })

  // JSON-LD structured data
  const jsonLdItems = computed(() =>
    items.value.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.label,
      item: item.to ? `${siteUrl}${item.to}` : undefined,
    })),
  )

  return { items, jsonLdItems }
}
