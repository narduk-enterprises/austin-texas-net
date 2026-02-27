<script setup lang="ts">
/**
 * [category]/index.vue — Single dynamic category hub.
 * Structural data from useSiteData(). Content from Nuxt Content markdown.
 * Unknown slugs → 404.
 */
import { getCategoryHexColor } from '~/utils/categoryHexColors'
const route = useRoute()
const { getCategoryBySlug } = useSiteData()

const slug = computed(() => route.params.category as string)
const category = computed(() => getCategoryBySlug(slug.value))

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found', fatal: true })
}

usePageSeo({
  ...category.value.seo,
  ogImageComponent: 'OgImageCategory',
  ogImageProps: {
    category: category.value.title,
    categoryColor: getCategoryHexColor(slug.value),
  },
})

useSchemaOrg([
  defineWebPage({
    name: category.value.seo.title,
    description: category.value.seo.description,
  }),
])

// Load overview content + FAQs from Nuxt Content
const { data: content } = await useAsyncData(
  `category-content-${slug.value}`,
  () => queryCollection('categories').where('slug', '=', slug.value).first(),
)
</script>

<template>
  <CategoryPage
    v-if="category"
    :category="category"
    :content="content ?? undefined"
  />
</template>
