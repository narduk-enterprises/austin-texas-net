<script setup lang="ts">
/**
 * [category]/index.vue — Single dynamic category hub.
 * Structural data from useSiteData(). Content from Nuxt Content markdown.
 * Unknown slugs → 404.
 */

const route = useRoute()
const { getCategoryBySlug } = useSiteData()

const slug = computed(() => route.params.category as string)
const category = computed(() => getCategoryBySlug(slug.value))

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found', fatal: true })
}

useSeo({
  ...category.value.seo,
  ogImage: {
    category: category.value.title,
  },
})

useWebPageSchema({
  name: category.value.seo.title,
  description: category.value.seo.description,
})

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
