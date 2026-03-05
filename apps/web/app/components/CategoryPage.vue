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

function getComponentType(app: SubApp) {
  if (isDisabled(app)) return 'div'
  if (isExternal(app)) return 'a'
  return NuxtLinkComponent
}

function handleAppClick(app: SubApp) {
  if (!isDisabled(app)) {
    trackAppClick(app.title, getAppHref(app) || app.standaloneUrl || '')
  }
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
      <section class="pt-10 pb-8">
        <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-8" />
        <div class="text-center">
          <div
            class="size-20 rounded-2xl inline-flex items-center justify-center bg-current mb-5 *:text-white elevation-2"
            :class="category.color"
          >
            <UIcon :name="category.icon" class="size-9" />
          </div>
          <h1
            class="font-display text-[clamp(1.75rem,4.5vw,2.5rem)] font-extrabold tracking-[-0.025em] mb-3 text-default"
          >
            {{ category.title }} in Austin
          </h1>
          <p class="text-base text-muted max-w-[520px] mx-auto leading-[1.7]">
            {{ category.tagline }}
          </p>
        </div>
      </section>

      <!-- Overview (SEO content) rendered from Nuxt Content markdown -->
      <section
        v-if="content"
        class="bg-elevated border border-default rounded-2xl px-5 py-6 sm:px-8 sm:py-8 mb-8 elevation-1"
      >
        <div class="prose-content text-[0.88rem] leading-[1.8] text-muted">
          <ContentRenderer :value="content" />
        </div>
      </section>

      <!-- Sub-app cards (item 5: standardized layout) -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          Explore {{ category.title }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(292px,1fr))] gap-4">
          <component
            :is="getComponentType(app)"
            v-for="app in category.subApps"
            :key="app.slug"
            :to="!isDisabled(app) && !isExternal(app) ? getAppHref(app) : undefined"
            :href="isExternal(app) ? app.standaloneUrl : undefined"
            :target="isExternal(app) ? '_blank' : undefined"
            :rel="isExternal(app) ? 'noopener' : undefined"
            class="premium-card bg-elevated border border-default rounded-2xl p-6 no-underline text-inherit group"
            :class="
              isDisabled(app)
                ? 'opacity-60 cursor-default'
                : 'cursor-pointer hover:border-premium-accent hover:-translate-y-0.5'
            "
            @click="handleAppClick(app)"
          >
            <div class="flex justify-between items-center mb-2.5">
              <h3 class="text-base font-bold font-display">{{ app.title }}</h3>
              <span
                class="text-[0.6rem] font-semibold py-0.5 px-2.5 rounded-full uppercase tracking-[0.04em]"
                :class="
                  app.status === 'live' ? 'bg-success/12 text-success' : 'bg-elevated text-muted'
                "
              >
                {{ getStatusLabel(app.status) }}
              </span>
            </div>
            <p class="text-[0.8125rem] text-muted leading-relaxed mb-4">{{ app.description }}</p>
            <span
              v-if="app.status === 'live'"
              class="text-xs font-semibold text-premium-accent inline-flex items-center transition-transform duration-400"
            >
              Open
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3.5 ml-1 group-hover:translate-x-1 transition-transform duration-400"
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
            class="flex items-center gap-3 px-5 py-4 bg-elevated border border-default rounded-2xl no-underline text-inherit cursor-pointer elevation-1 transition-all duration-400 hover:border-premium-accent hover:elevation-2"
          >
            <UIcon :name="c.icon" class="size-5" :class="c.color" />
            <span class="text-[0.8125rem] font-semibold flex-1">{{ c.title }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-3.5 text-dimmed" />
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
