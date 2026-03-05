<script setup lang="ts">
/**
 * [category]/[slug].vue — Coming Soon catch-all page.
 * Matches routes like /food/breakfast-tacos/ and renders a branded
 * "coming soon" page when the sub-app is registered but not yet built.
 * Falls through to a 404 if neither category nor sub-app exist.
 */

definePageMeta({ layout: 'fullscreen' })

const route = useRoute()
const { getCategoryBySlug, categories } = useSiteData()

const categorySlug = computed(() => route.params.category as string)
const slugArray = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s : [s]
})
const slug = computed(() => slugArray.value[0] || '')
const spotSlug = computed(() => slugArray.value[1] || '')

const category = computed(() => getCategoryBySlug(categorySlug.value))
const subApp = computed(() => category.value?.subApps.find((a) => a.slug === slug.value))

// 404 if category or sub-app not found — fatal: true ensures Nuxt shows the error page
if (!category.value || !subApp.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const isSpots = computed(
  () =>
    subApp.value?.contentType === 'spots' ||
    ['bbq', 'breakfast-tacos', 'coffee', 'food-trucks', 'happy-hours', 'restaurants'].includes(
      subApp.value?.contentType || '',
    ),
)

const displayName = computed(
  () =>
    subApp.value?.title ??
    slug.value.replaceAll('-', ' ').replaceAll(/\b\w/g, (l: string) => l.toUpperCase()),
)

const accentColor = computed(
  () => subApp.value?.accentColor || category.value?.color.split('-')[1] || 'primary',
)
const categoryIcon = computed(
  () => subApp.value?.icon || category.value?.icon || 'i-lucide-map-pin',
)

const config = computed(() => ({
  title: subApp.value?.title ?? '',
  description: subApp.value?.description ?? '',
  introText: subApp.value?.description ?? '',
  parentCategory: categorySlug.value,
  parentLabel: `← ${category.value?.title}`,
  parentPath: `/${categorySlug.value}/`,
  mapCenter: { lat: 30.2672, lng: -97.7431 },
  accentColor: accentColor.value,
  pinColor: subApp.value?.pinColor,
  categoryIcon: categoryIcon.value,
  apiEndpoint: `/api/map-spots?category=${slug.value}`,
}))

useSeo({
  title: subApp.value?.status === 'live' ? displayName.value : `${displayName.value} — Coming Soon`,
  description:
    subApp.value?.description ?? `${displayName.value} is coming soon to Austin-Texas.net.`,
  ogImage: {
    category: category.value.title,
  },
})

useWebPageSchema({
  name:
    subApp.value?.status === 'live' ? displayName.value : `${displayName.value} — Coming Soon`,
  description:
    subApp.value?.description ?? `${displayName.value} is coming soon to Austin-Texas.net.`,
})

// Sibling sub-apps in the same category
const siblings = computed(() => category.value?.subApps.filter((a) => a.slug !== slug.value) ?? [])

// Cross-link categories
const crossLinks = computed(() =>
  categories.value.filter((c) => c.slug !== categorySlug.value).slice(0, 4),
)

// Fetch spots if it's a spots page
const { fetchCategorySpots } = useMapSpots()
const { data: apiData } = await useAsyncData(
  `spots-${slug.value}`,
  () => fetchCategorySpots(slug.value),
  {
    immediate: isSpots.value && subApp.value.status === 'live',
  },
)

const spots = computed(() => {
  const apiSpots = apiData.value?.spots
  if (apiSpots && apiSpots.length > 0) {
    return apiSpots.map((s, i) => ({
      id: s.id,
      rank: s.rank ?? i + 1,
      name: s.name,
      slug: s.id,
      neighborhood: s.neighborhood || '',
      knownFor: s.knownFor || s.category || '',
      category: s.category || subApp.value?.title || 'Spot',
      description: s.description || '',
      priceRange: s.priceRange || '$$',
      rating: s.rating ?? 0,
      lat: s.lat,
      lng: s.lng,
      address: s.address || '',
      url: s.url,
      photoUrl: s.photoUrl,
      photoAttribution: s.photoAttribution,
      area: s.area,
    }))
  }
  return []
})
</script>

<template>
  <div v-if="subApp">
    <!-- Dynamic Spots Page -->
    <template v-if="isSpots && subApp.status === 'live'">
      <MapContentPage :config="config" :spots="spots">
        <template #related>
          <!-- More in parent Category -->
          <section v-if="siblings.length" class="mb-4">
            <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-2">
              More in {{ category?.title }}
            </h2>
            <div class="space-y-1.5">
              <NuxtLink
                v-for="app in siblings"
                :key="app.slug"
                :to="`/${categorySlug}/${app.slug}/`"
                class="group flex items-center justify-between rounded-lg border border-default bg-default px-3 py-2 transition-all duration-200 hover:border-primary/30"
              >
                <div class="min-w-0">
                  <h3 class="text-xs font-semibold">{{ app.title }}</h3>
                  <p class="text-[11px] text-muted truncate">{{ app.description }}</p>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 ml-2">
                  <UBadge
                    :color="app.status === 'live' ? 'success' : 'neutral'"
                    variant="subtle"
                    size="xs"
                    :label="app.status === 'live' ? 'Live' : 'Soon'"
                  />
                  <UIcon
                    name="i-lucide-chevron-right"
                    class="size-3.5 text-dimmed group-hover:text-primary transition-colors"
                  />
                </div>
              </NuxtLink>
            </div>
          </section>

          <!-- Explore More Categories -->
          <section class="mb-4">
            <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-2">
              Explore More
            </h2>
            <div class="grid grid-cols-2 gap-1.5">
              <NuxtLink
                v-for="c in crossLinks"
                :key="c.slug"
                :to="`/${c.slug}/`"
                class="flex items-center gap-2 rounded-lg border border-default bg-default px-3 py-2 transition-all duration-200 hover:border-primary/30"
              >
                <UIcon :name="c.icon" class="size-3.5" :class="c.color" />
                <span class="text-xs font-medium">{{ c.title }}</span>
              </NuxtLink>
            </div>
          </section>
        </template>
      </MapContentPage>
    </template>

    <!-- Coming Soon hero (fallback) -->
    <template v-else>
      <SubAppTopbar :title="displayName" />
      <section class="text-center py-12 sm:py-20">
        <!-- Icon -->
        <div
          class="inline-flex items-center justify-center size-20 rounded-3xl mb-6 animate-fade-up"
          style="
            background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
          "
        >
          <UIcon :name="categoryIcon" class="size-10 text-white" />
        </div>

        <!-- Title -->
        <h1
          class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display mb-4 animate-fade-up-delay-1"
        >
          {{ displayName }}
        </h1>

        <!-- Badge -->
        <div class="flex justify-center mb-5 animate-fade-up-delay-1">
          <UBadge
            color="warning"
            variant="subtle"
            size="md"
            label="Coming Soon"
            icon="i-lucide-clock"
          />
        </div>

        <!-- Description -->
        <p
          class="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed animate-fade-up-delay-2"
        >
          {{ subApp?.description }}
        </p>

        <!-- CTA row -->
        <div class="flex flex-wrap items-center justify-center gap-3 mt-8 animate-fade-up-delay-3">
          <UButton
            v-if="subApp?.standaloneUrl"
            :to="subApp.standaloneUrl"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            size="lg"
            label="Preview on ATX Apps"
            icon="i-lucide-external-link"
          />
          <UButton
            :to="`/${categorySlug}/`"
            variant="outline"
            color="neutral"
            size="lg"
            label="Browse all in this category"
            icon="i-lucide-arrow-left"
          />
        </div>
      </section>

      <!-- What to expect -->
      <section
        class="rounded-2xl border border-default bg-default p-6 sm:p-8 mb-8 animate-fade-up-delay-3"
      >
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">What to Expect</h2>
        <div class="text-sm text-muted leading-relaxed space-y-3">
          <p>
            We're building <strong class="text-default">{{ displayName }}</strong> as part of
            <NuxtLink :to="`/${categorySlug}/`" class="text-primary hover:underline">{{
              category?.title
            }}</NuxtLink>
            on Austin-Texas.net — a set of free, fast, locally-focused tools powered by live data.
          </p>
          <p>
            When this page goes live, you'll get real-time information, mobile-friendly design, and
            zero ads — just useful Austin data. We build each tool with public APIs, local sensors,
            and community-sourced information.
          </p>
        </div>
      </section>

      <!-- Sibling sub-apps -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in {{ category?.title }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/${categorySlug}/${app.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div>
              <h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3>
              <p class="text-xs text-muted line-clamp-1">{{ app.description }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-3">
              <UBadge
                :color="app.status === 'live' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
                :label="app.status === 'live' ? 'Live' : 'Coming Soon'"
              />
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4 text-dimmed group-hover:text-primary transition-colors"
              />
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Cross-links -->
      <section class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30"
          >
            <UIcon :name="c.icon" class="size-4" :class="c.color" />
            <span class="text-sm font-medium">{{ c.title }}</span>
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>
