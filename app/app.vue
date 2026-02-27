<script setup lang="ts">
import type { FooterColumn } from '@nuxt/ui'

const route = useRoute()
const { loggedIn, isAdmin } = useAuth()

const siteName = useRuntimeConfig().public.appName || 'Austin Texas'

useSeoMeta({
  titleTemplate: `%s — ${siteName}`,
  ogSiteName: siteName,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

// Fetch site-wide hierarchy once at the root
const { fetchSiteData, categories } = useSiteData()
await useAsyncData('site-data', () => fetchSiteData())

const footerLinks = [
  { label: 'About', to: '/about/' },
  { label: 'Contact', to: '/contact/' },
  { label: 'Privacy', to: '/privacy/' },
]

const adminLinks = [{ label: 'Dashboard', to: '/admin/radar' }]

// Hide footer on fullscreen layout pages (e.g. bluebonnet map)
const isFullscreen = computed(() => route.meta.layout === 'fullscreen')

// Build footer columns from categories for internal linking SEO
const footerColumns = computed<FooterColumn[]>(() => {
  return categories.value
    .filter((cat) => cat.slug !== 'more')
    .map((cat) => ({
      label: cat.title,
      children: [
        { label: `All ${cat.title}`, to: `/${cat.slug}/` },
        ...cat.subApps
          .filter((app) => app.status === 'live')
          .slice(0, 5)
          .map((app) => ({
            label: app.title,
            to: `/${cat.slug}/${app.slug}/`,
          })),
      ],
    }))
})
</script>

<template>
  <UApp>
    <!-- Main — unconstrained so pages control their own layout -->
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <!-- Footer — hidden on fullscreen layout pages -->
    <UFooter v-if="!isFullscreen">
      <template #top>
        <UContainer>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9 gap-x-6 gap-y-10">
            <div v-for="col in footerColumns" :key="col.label">
              <h3 class="text-sm font-semibold text-primary dark:text-white mb-4">{{ col.label }}</h3>
              <ul class="space-y-3">
                <li v-for="link in col.children" :key="String(link.to)">
                  <NuxtLink :to="link.to" class="text-sm text-primary dark:text-muted hover:text-primary dark:hover:text-white whitespace-normal break-words">
                    {{ link.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </UContainer>
      </template>

      <template #left>
        <span class="text-xs text-muted"
          >&copy; {{ new Date().getFullYear() }} Austin-Texas.net</span
        >
      </template>

      <div class="flex items-center gap-x-3">
        <UNavigationMenu :items="footerLinks" variant="link" />
        <ClientOnly>
          <UNavigationMenu v-if="loggedIn && isAdmin" :items="adminLinks" variant="link" />
        </ClientOnly>
      </div>

      <template #right>
        <UColorModeButton />
      </template>
    </UFooter>
  </UApp>
</template>
