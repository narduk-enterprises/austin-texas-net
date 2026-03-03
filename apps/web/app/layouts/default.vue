<script setup lang="ts">
/**
 * Default layout — injects breadcrumb JSON-LD for SEO.
 * Visual breadcrumbs are rendered by each page component
 * (CategoryPage, MapContentPage) for contextual placement.
 */
const { jsonLdItems } = useBreadcrumbs()

useSchemaOrg([
  {
    '@type': 'BreadcrumbList',
    itemListElement: jsonLdItems,
  },
])
</script>

<template>
  <div class="min-h-screen bg-default">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-14">
      <slot />
    </div>
  </div>
</template>
