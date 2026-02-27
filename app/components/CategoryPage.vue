<script setup lang="ts">
/**
 * CategoryPage — reusable SEO authority hub for each category.
 * Renders title, long-form overview, sub-app cards, FAQ, and cross-links.
 * Content (overview + FAQs) comes from Nuxt Content markdown files.
 */
import type { Category, SubApp } from '~/composables/useSiteData'
import type { CategoriesCollectionItem } from '@nuxt/content'

const props = defineProps<{
  category: Category
  content?: CategoriesCollectionItem
}>()

const { items: breadcrumbs } = useBreadcrumbs()
const faqItems = computed(() => props.content?.faqItems ?? [])

const { categories } = useSiteData()
const crossLinks = computed(() =>
  categories.value.filter((c) => c.slug !== props.category.slug).slice(0, 4),
)

// FAQPage JSON-LD for Google rich results
if (props.content?.faqItems?.length) {
  useSchemaOrg([
    {
      '@type': 'FAQPage' as const,
      mainEntity: props.content.faqItems.map((item) => ({
        '@type': 'Question' as const,
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer' as const,
          text: item.answer,
        },
      })),
    },
  ])
}

function getStatusLabel(status: SubApp['status']): string {
  return status === 'live' ? 'Live' : 'Coming Soon'
}

/**
 * Canonical link rule (item 3):
 * - "live" → internal path on this site
 * - "coming-soon" with standaloneUrl → standalone subdomain (external)
 * - "coming-soon" without standaloneUrl → no link (disabled card)
 */
function getAppHref(app: SubApp): string | undefined {
  if (app.status === 'live') return `/${props.category.slug}/${app.slug}/`
  return app.standaloneUrl || undefined
}

function isExternal(app: SubApp): boolean {
  return app.status !== 'live' && !!app.standaloneUrl
}

function isDisabled(app: SubApp): boolean {
  return app.status === 'coming-soon' && !app.standaloneUrl
}

const NuxtLinkComponent = resolveComponent('NuxtLink')

// Click tracking
function trackAppClick(appTitle: string, destination: string) {
  const ph = import.meta.client
    ? (
        window as Window & {
          posthog?: { capture: (event: string, properties: Record<string, string>) => void }
        }
      ).posthog
    : undefined
  if (ph) {
    ph.capture('subapp_card_click', {
      category: props.category.slug,
      app: appTitle,
      destination,
    })
  }
}
</script>

<template>
  <UContainer>
    <div>
      <!-- Hero -->
      <section class="pt-8 pb-6">
        <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
        <div class="text-center">
          <div
            class="size-16 rounded-[18px] inline-flex items-center justify-center bg-current mb-4 *:text-white"
            :class="category.color"
          >
            <UIcon :name="category.icon" class="size-8" />
          </div>
          <h1
            class="font-display text-[clamp(1.5rem,4vw,2rem)] font-extrabold tracking-[-0.02em] mb-2"
          >
            {{ category.title }} in Austin
          </h1>
          <p class="text-[0.95rem] text-muted max-w-[480px] mx-auto leading-[1.6]">
            {{ category.tagline }}
          </p>
        </div>
      </section>

      <!-- Overview (SEO content) rendered from Nuxt Content markdown -->
      <section
        v-if="content"
        class="bg-elevated border border-default rounded-2xl px-4 py-5 sm:px-6 sm:py-7 mb-6"
      >
        <div class="prose-content text-[0.88rem] leading-[1.8] text-muted">
          <ContentRenderer :value="content" />
        </div>
      </section>

      <!-- Sub-app cards (item 5: standardized layout) -->
      <section class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-muted mb-3.5">
          Explore {{ category.title }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          <component
            :is="isDisabled(app) ? 'div' : isExternal(app) ? 'a' : NuxtLinkComponent"
            v-for="app in category.subApps"
            :key="app.slug"
            :to="!isDisabled(app) && !isExternal(app) ? getAppHref(app) : undefined"
            :href="isExternal(app) ? app.standaloneUrl : undefined"
            :target="isExternal(app) ? '_blank' : undefined"
            :rel="isExternal(app) ? 'noopener' : undefined"
            class="bg-elevated border border-default rounded-[14px] p-5 no-underline text-inherit transition-all duration-200 ease-out group"
            :class="
              isDisabled(app)
                ? 'opacity-60 cursor-default'
                : 'hover:border-accented hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
            "
            @click="
              !isDisabled(app) &&
              trackAppClick(app.title, getAppHref(app) || app.standaloneUrl || '')
            "
          >
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-[0.95rem] font-bold">{{ app.title }}</h3>
              <span
                class="text-[0.6rem] font-semibold py-0.5 px-2 rounded-full uppercase tracking-[0.04em]"
                :class="
                  app.status === 'live' ? 'bg-success/12 text-success' : 'bg-accented text-muted'
                "
              >
                {{ getStatusLabel(app.status) }}
              </span>
            </div>
            <p class="text-[0.8rem] text-muted leading-normal mb-3">{{ app.description }}</p>
            <span
              v-if="app.status === 'live'"
              class="text-xs font-semibold text-primary inline-flex items-center"
            >
              Open
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3 ml-1 group-hover:translate-x-0.5 transition-transform"
              />
            </span>
            <span
              v-else-if="app.standaloneUrl"
              class="text-xs font-semibold text-muted inline-flex items-center"
            >
              Visit app
              <UIcon name="i-lucide-external-link" class="size-3 ml-1" />
            </span>
          </component>
        </div>
      </section>

      <!-- FAQ -->
      <section v-if="faqItems.length > 0" class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-muted mb-3.5">
          Frequently Asked Questions
        </h2>
        <UAccordion
          type="multiple"
          :items="faqItems.map((item) => ({ label: item.question, content: item.answer }))"
        />
      </section>

      <!-- Cross-links -->
      <section class="mb-2">
        <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-muted mb-3.5">
          More from Austin
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 px-4 py-3.5 bg-elevated border border-default rounded-xl no-underline text-inherit transition-colors duration-200 hover:border-accented"
          >
            <UIcon :name="c.icon" class="size-5" :class="c.color" />
            <span class="text-[0.8rem] font-semibold flex-1">{{ c.title }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-3 text-dimmed" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </UContainer>
</template>

<style scoped>
.prose-content :deep(h2) {
  font-size: 1.05rem;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 10px;
  color: var(--color-text);
}
.prose-content :deep(h3) {
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 8px;
  color: var(--color-text);
}
.prose-content :deep(p) {
  margin-bottom: 14px;
}
.prose-content :deep(strong) {
  color: var(--color-text);
}
.prose-content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
