<script setup lang="ts">
/**
 * Fullscreen layout — used for immersive map pages.
 * Omits the footer so pages can use the full viewport height.
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
