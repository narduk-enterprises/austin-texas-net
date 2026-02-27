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
  <div>
    <slot />
  </div>
</template>
