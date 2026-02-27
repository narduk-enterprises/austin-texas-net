<script setup lang="ts">
/**
 * food/index.vue — Category hub for Food.
 * Mirrors [category]/index.vue but with a hardcoded slug so Nuxt's
 * static-route priority doesn't skip the dynamic catch-all.
 */
import { getCategoryHexColor } from '~/utils/categoryHexColors'
const slug = 'food'
const { getCategoryBySlug } = useSiteData()
const category = computed(() => getCategoryBySlug(slug))

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found', fatal: true })
}

usePageSeo({
  ...category.value.seo,
  ogImageComponent: 'OgImageCategory',
  ogImageProps: {
    category: category.value.title,
    categoryColor: getCategoryHexColor(slug),
  },
})

useSchemaOrg([
  defineWebPage({
    name: category.value.seo.title,
    description: category.value.seo.description,
  }),
])

const { data: content } = await useAsyncData(`category-content-${slug}`, () =>
  queryCollection('categories').where('slug', '=', slug).first(),
)
</script>

<template>
  <CategoryPage v-if="category" :category="category" :content="content ?? undefined" />
</template>
