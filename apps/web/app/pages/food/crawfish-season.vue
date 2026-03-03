<script setup lang="ts">
/**
 * food/crawfish-season.vue — Crawfish Season mini app.
 *
 * Celebrates crawfish season in Austin with:
 *   1. Where to buy live crawfish by the sack (map + cards)
 *   2. Best restaurants for crawfish
 *   3. Classic Cajun crawfish boil recipe
 *   4. Pro tips & FAQ
 */
import {
  crawfishMarkets,
  crawfishRestaurants,
  boilRecipe,
  crawfishFaqs,
  crawfishTips,
} from '~/data/crawfish'
import type { CrawfishSpot } from '~/data/crawfish'

const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Crawfish Season in Austin TX — Where to Buy, Eat & Boil',
  description:
    'Your complete guide to crawfish season in Austin, Texas. Best places to buy live crawfish by the sack, top crawfish restaurants, and a classic Cajun crawfish boil recipe.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Crawfish Season Austin Guide',
    description:
      'Complete guide to crawfish season in Austin — markets, restaurants, and a Cajun boil recipe.',
  }),
  {
    '@type': 'Recipe',
    'name': boilRecipe.title,
    'description': 'A classic Cajun crawfish boil recipe with a Texas twist. Feeds 8–10 people.',
    'recipeYield': boilRecipe.servings,
    'prepTime': 'PT30M',
    'cookTime': 'PT30M',
    'totalTime': 'PT60M',
    'recipeIngredient': boilRecipe.ingredients.map((i) => `${i.amount} ${i.item}`),
    'recipeInstructions': boilRecipe.steps.map((s) => ({
      '@type': 'HowToStep',
      'text': s.instruction,
    })),
    'recipeCuisine': 'Cajun',
    'recipeCategory': 'Main Course',
    'keywords': ['crawfish boil', 'cajun', 'austin texas', 'seafood'],
  },
])

// ── Map state ────────────────────────────────────────────────────────
type MapMode = 'markets' | 'restaurants'
const mapMode = ref<MapMode>('markets')

const mapItems = computed<CrawfishSpot[]>(() =>
  mapMode.value === 'markets' ? crawfishMarkets : crawfishRestaurants,
)

const selectedId = ref<string | null>(null)

function createPinElement(
  item: CrawfishSpot,
  isSelected: boolean,
): { element: HTMLElement; cleanup?: () => void } {
  // eslint-disable-next-line nuxt-guardrails/no-ssr-dom-access
  const wrapper = document.createElement('div')
  wrapper.className = `mapkit-pin${isSelected ? ' is-selected' : ''}`
  wrapper.innerHTML = `
    <div class="mapkit-pin-bubble">
      <div class="mapkit-pin-circle">
        <svg class="mapkit-pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${mapMode.value === 'markets' ? '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>' : '<path d="M3 11l19-9-9 19-2-8-8-2z"/>'}
        </svg>
      </div>
    </div>
    <span class="mapkit-pin-name">${item.name}</span>
  `
  return { element: wrapper }
}

// ── FAQ toggle ───────────────────────────────────────────────────────
const openFaq = ref<number | null>(null)
const toggleFaq = (id: number) => {
  openFaq.value = openFaq.value === id ? null : id
}

// ── Active section (for internal navigation) ─────────────────────────
const activeSection = ref<string>('buy')
const sections = [
  { id: 'buy', label: 'Buy a Sack', icon: 'i-lucide-shopping-bag' },
  { id: 'eat', label: 'Restaurants', icon: 'i-lucide-utensils' },
  { id: 'recipe', label: 'Boil Recipe', icon: 'i-lucide-flame' },
  { id: 'tips', label: 'Pro Tips', icon: 'i-lucide-lightbulb' },
]

function scrollToSection(id: string) {
  activeSection.value = id
  // eslint-disable-next-line nuxt-guardrails/no-ssr-dom-access
  const el = document.getElementById(`section-${id}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleSpotClick(spotId: string, type: MapMode) {
  selectedId.value = selectedId.value === spotId ? null : spotId
  mapMode.value = type
}

function handleMapModeToggle(type: MapMode) {
  mapMode.value = type
  selectedId.value = null
}

function openDirections(spot: CrawfishSpot) {
  const url = `https://maps.apple.com/?daddr=${spot.lat},${spot.lng}&dirflg=d`
  // eslint-disable-next-line nuxt-guardrails/no-ssr-dom-access
  window.open(url, '_blank')
}
</script>

<template>
  <div>
    <SubAppTopbar title="Crawfish Season" />

    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />

      <div class="space-y-10 sm:space-y-14">
        <!-- ═══ HERO ═══ -->
        <section class="relative overflow-hidden rounded-2xl">
          <div class="relative">
            <img
              src="/images/crawfish-boil-hero.png"
              alt="A traditional Cajun crawfish boil spread with bright red crawfish, corn, potatoes, and cold beer"
              class="w-full h-48 sm:h-64 md:h-80 object-cover rounded-2xl"
              loading="eager"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl" />
            <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/90 text-white text-xs font-semibold mb-3 backdrop-blur-sm">
                🦞 It's Crawfish Season
              </div>
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white drop-shadow-lg">
                Crawfish Season in Austin
              </h1>
              <p class="mt-2 text-white/90 text-sm sm:text-base max-w-2xl drop-shadow">
                Where to buy 'em, where to eat 'em, and how to boil 'em right. Your complete guide to mudbug season in the 512.
              </p>
            </div>
          </div>
        </section>

        <!-- ═══ SECTION NAV ═══ -->
        <div class="flex flex-wrap gap-2 justify-center">
          <UButton
            v-for="section in sections"
            :key="section.id"
            :variant="activeSection === section.id ? 'solid' : 'ghost'"
            :color="activeSection === section.id ? 'primary' : 'neutral'"
            class="rounded-full !font-semibold transition-all duration-200"
            :class="activeSection === section.id ? 'shadow-lg shadow-primary/25' : 'glass-card hover:bg-elevated'"
            :icon="section.icon"
            @click="scrollToSection(section.id)"
          >
            {{ section.label }}
          </UButton>
        </div>

        <!-- ═══ BUY A SACK ═══ -->
        <section id="section-buy" class="scroll-mt-20 space-y-6">
          <div class="text-center">
            <h2 class="text-2xl sm:text-3xl font-bold font-display">
              Where to Buy Live Crawfish
            </h2>
            <p class="mt-2 text-muted text-sm sm:text-base max-w-xl mx-auto">
              The best spots in Austin to pick up a sack of live crawfish for your backyard boil.
            </p>
          </div>

          <!-- Map mode toggle -->
          <div class="flex justify-center gap-2">
            <UButton
              :variant="mapMode === 'markets' ? 'solid' : 'outline'"
              :color="mapMode === 'markets' ? 'primary' : 'neutral'"
              size="sm"
              icon="i-lucide-shopping-bag"
              @click="handleMapModeToggle('markets')"
            >
              Markets
            </UButton>
            <UButton
              :variant="mapMode === 'restaurants' ? 'solid' : 'outline'"
              :color="mapMode === 'restaurants' ? 'primary' : 'neutral'"
              size="sm"
              icon="i-lucide-utensils"
              @click="handleMapModeToggle('restaurants')"
            >
              Restaurants
            </UButton>
          </div>

          <!-- Map -->
          <ClientOnly>
            <div class="rounded-2xl overflow-hidden border border-default elevation-2">
              <AppMapKit
                v-model:selected-id="selectedId"
                :items="mapItems"
                :create-pin-element="createPinElement"
                :fallback-center="{ lat: 30.32, lng: -97.74 }"
                :bounding-padding="0.15"
                clustering-identifier="crawfish"
              />
            </div>
          </ClientOnly>

          <!-- Market cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="spot in crawfishMarkets"
              :key="spot.id"
              class="glass-card p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              :class="selectedId === spot.id ? 'ring-2 ring-primary border-primary/50' : ''"
              @click="handleSpotClick(spot.id, 'markets')"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-display text-lg font-bold leading-tight">{{ spot.name }}</h3>
                <span
                  v-if="spot.priceRange"
                  class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0"
                >
                  {{ spot.priceRange }}
                </span>
              </div>
              <p class="text-sm text-primary font-medium mb-2">{{ spot.neighborhood }}</p>
              <p v-if="spot.notes" class="text-xs text-muted mb-3 line-clamp-3">{{ spot.notes }}</p>
              <div class="flex items-center gap-2 text-xs text-dimmed mb-1">
                <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
                <span class="truncate">{{ spot.address }}</span>
              </div>
              <div v-if="spot.phone" class="flex items-center gap-2 text-xs text-dimmed">
                <UIcon name="i-lucide-phone" class="size-3.5 shrink-0" />
                <span>{{ spot.phone }}</span>
              </div>
              <div class="mt-3 flex gap-2">
                <UButton
                  size="xs"
                  icon="i-lucide-navigation"
                  class="flex-1"
                  @click.stop="openDirections(spot)"
                >
                  Directions
                </UButton>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ RESTAURANTS ═══ -->
        <section id="section-eat" class="scroll-mt-20 space-y-6">
          <div class="text-center">
            <h2 class="text-2xl sm:text-3xl font-bold font-display">
              Best Crawfish Restaurants
            </h2>
            <p class="mt-2 text-muted text-sm sm:text-base max-w-xl mx-auto">
              Skip the boil and let someone else do the work. These spots serve the best crawfish in Austin.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="spot in crawfishRestaurants"
              :key="spot.id"
              class="glass-card p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              :class="selectedId === spot.id ? 'ring-2 ring-primary border-primary/50' : ''"
              @click="handleSpotClick(spot.id, 'restaurants')"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-display text-lg font-bold leading-tight">{{ spot.name }}</h3>
                <span
                  v-if="spot.priceRange"
                  class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0"
                >
                  {{ spot.priceRange }}
                </span>
              </div>
              <p v-if="spot.specialty" class="text-sm text-primary font-medium mb-1">
                {{ spot.specialty }}
              </p>
              <p class="text-xs text-primary font-medium mb-2">{{ spot.neighborhood }}</p>
              <p v-if="spot.notes" class="text-xs text-muted mb-3 line-clamp-3">{{ spot.notes }}</p>
              <div class="flex items-center gap-2 text-xs text-dimmed mb-1">
                <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
                <span class="truncate">{{ spot.address }}</span>
              </div>
              <div v-if="spot.phone" class="flex items-center gap-2 text-xs text-dimmed">
                <UIcon name="i-lucide-phone" class="size-3.5 shrink-0" />
                <span>{{ spot.phone }}</span>
              </div>
              <div class="mt-3 flex gap-2">
                <UButton
                  size="xs"
                  icon="i-lucide-navigation"
                  class="flex-1"
                  @click.stop="openDirections(spot)"
                >
                  Directions
                </UButton>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ RECIPE ═══ -->
        <section id="section-recipe" class="scroll-mt-20 space-y-6">
          <div class="text-center">
            <h2 class="text-2xl sm:text-3xl font-bold font-display">
              🦞 {{ boilRecipe.title }}
            </h2>
            <p class="mt-2 text-muted text-sm sm:text-base max-w-xl mx-auto">
              Everything you need to throw a proper crawfish boil in your backyard. Feeds {{ boilRecipe.servings }}.
            </p>
          </div>

          <!-- Recipe stats -->
          <div class="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div class="glass-card p-4 text-center">
              <div class="text-xs text-dimmed mb-1">Prep</div>
              <div class="text-lg font-bold font-display text-primary">{{ boilRecipe.prepTime }}</div>
            </div>
            <div class="glass-card p-4 text-center">
              <div class="text-xs text-dimmed mb-1">Cook</div>
              <div class="text-lg font-bold font-display text-primary">{{ boilRecipe.cookTime }}</div>
            </div>
            <div class="glass-card p-4 text-center">
              <div class="text-xs text-dimmed mb-1">Total</div>
              <div class="text-lg font-bold font-display text-primary">{{ boilRecipe.totalTime }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Equipment -->
            <div class="glass-card p-6">
              <h3 class="text-lg font-semibold font-display mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-wrench" class="size-5 text-primary" />
                Equipment
              </h3>
              <ul class="space-y-2">
                <li v-for="(item, i) in boilRecipe.equipment" :key="i" class="flex items-start gap-2 text-sm">
                  <UIcon name="i-lucide-check" class="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Ingredients -->
            <div class="glass-card p-6">
              <h3 class="text-lg font-semibold font-display mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-shopping-cart" class="size-5 text-primary" />
                Ingredients
              </h3>
              <ul class="space-y-2">
                <li v-for="ing in boilRecipe.ingredients" :key="ing.item" class="flex items-start gap-2 text-sm">
                  <UIcon name="i-lucide-check" class="size-4 text-primary shrink-0 mt-0.5" />
                  <span><span class="font-semibold">{{ ing.amount }}</span> — {{ ing.item }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Steps -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold font-display flex items-center gap-2">
              <UIcon name="i-lucide-list-ordered" class="size-5 text-primary" />
              Instructions
            </h3>
            <div class="space-y-3">
              <div v-for="step in boilRecipe.steps" :key="step.id" class="glass-card p-5 flex gap-4">
                <div
                  class="flex-none flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white font-bold font-display text-sm shrink-0"
                >
                  {{ step.id }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm leading-relaxed">{{ step.instruction }}</p>
                  <p v-if="step.tip" class="mt-2 text-xs text-primary bg-primary/10 rounded-lg px-3 py-2 flex items-start gap-1.5">
                    <UIcon name="i-lucide-lightbulb" class="size-3.5 shrink-0 mt-0.5" />
                    <span>{{ step.tip }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ PRO TIPS ═══ -->
        <section id="section-tips" class="scroll-mt-20 space-y-6">
          <div class="text-center">
            <h2 class="text-2xl sm:text-3xl font-bold font-display">Pro Tips</h2>
            <p class="mt-2 text-muted text-sm sm:text-base max-w-xl mx-auto">
              Wisdom from Austin's crawfish veterans. Follow these and you'll boil like a Cajun.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="tip in crawfishTips" :key="tip.id" class="glass-card p-5 hover:scale-[1.02] transition-transform duration-300">
              <UIcon :name="tip.icon" class="size-7 text-primary mb-3" />
              <h3 class="text-sm font-semibold font-display mb-1">{{ tip.title }}</h3>
              <p class="text-xs text-muted leading-relaxed">{{ tip.description }}</p>
            </div>
          </div>
        </section>

        <!-- ═══ FAQ ═══ -->
        <section class="space-y-6">
          <h2 class="text-2xl sm:text-3xl font-bold font-display text-center">
            Frequently Asked Questions
          </h2>
          <div class="space-y-2 max-w-2xl mx-auto">
            <div v-for="faq in crawfishFaqs" :key="faq.id" class="glass-card overflow-hidden">
              <UButton
                variant="ghost"
                color="neutral"
                class="w-full flex items-center justify-between p-4 text-left rounded-none hover:bg-elevated"
                @click="toggleFaq(faq.id)"
              >
                <span class="text-sm font-semibold font-display pr-4">{{ faq.question }}</span>
                <UIcon
                  :name="openFaq === faq.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="size-4 text-dimmed shrink-0"
                />
              </UButton>
              <div v-if="openFaq === faq.id" class="px-4 pb-4">
                <p class="text-sm text-muted leading-relaxed">{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ ABOUT ═══ -->
        <section class="glass-card p-6 sm:p-8 space-y-4">
          <h2 class="text-xl font-semibold font-display">About Crawfish Season in Austin</h2>
          <p class="text-sm text-muted leading-relaxed">
            Crawfish season in Austin has become one of the city's most anticipated culinary events. While Texas doesn't have the deep-rooted crawfish traditions of Louisiana, Austin's food scene has more than made up for it. Every spring, backyards across the city fire up their propane burners, Cajun seasoning fills the air, and neighbors gather around newspaper-covered tables for the communal ritual of the crawfish boil.
          </p>
          <p class="text-sm text-muted leading-relaxed">
            Austin's crawfish culture blends classic Cajun traditions with the city's signature melting-pot flavor. You'll find Vietnamese-Cajun garlic butter crawfish at spots like LA Crawfish, traditional Southern boils at Shoal Creek Saloon, and everything in between. The city's Asian supermarkets — 99 Ranch, H Mart, and MT Supermarket — have become go-to sources for affordable live crawfish by the sack, often beating traditional seafood markets on price.
          </p>
          <p class="text-sm text-muted leading-relaxed">
            Peak season runs from March through May, when crawfish are at their largest and most plentiful. Early season (January–February) crawfish tend to be smaller and pricier. By June, the season winds down. Whether you're a seasoned boiler or trying your first mudbug, Austin offers everything from grab-and-go sacks to full-service Cajun restaurants. Just remember: suck the heads, pinch the tails, and always keep the beer cold.
          </p>
        </section>
      </div>
    </UContainer>
  </div>
</template>
