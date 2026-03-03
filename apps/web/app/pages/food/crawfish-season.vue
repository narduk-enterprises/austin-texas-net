<!-- eslint-disable atx/no-raw-tailwind-colors -->
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
      <div class="space-y-10 sm:space-y-14">
        <!-- ═══ HERO ═══ -->
        <section class="relative overflow-hidden rounded-3xl border-4 border-primary/20 shadow-xl shadow-primary/5 group">
          <div class="relative">
            <img
              src="/images/crawfish_hero_vibrant_1772521588676.png"
              alt="A traditional Cajun crawfish boil spread with bright red crawfish, corn, potatoes, and cold beer"
              class="w-full h-56 sm:h-72 md:h-[28rem] object-cover"
              loading="eager"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div class="absolute inset-0 bg-[#fef3c7] mix-blend-overlay"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12 flex items-end justify-between">
              <div class="max-w-3xl z-10 transition-transform duration-500 group-hover:translate-x-2">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/95 text-white text-xs font-bold font-display uppercase tracking-wider mb-4 border border-primary/60/50 shadow-lg shadow-primary/30 backdrop-blur-md">
                  🦞 It's Crawfish Season
                </div>
                <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black font-display tracking-tight text-white drop-shadow-2xl">
                  Crawfish Season <span class="text-white drop-shadow-md">in Austin</span>
                </h1>
                <p class="mt-4 text-white/95 text-base sm:text-lg lg:text-xl drop-shadow-md font-medium max-w-2xl leading-relaxed">
                  Where to buy 'em, where to eat 'em, and how to boil 'em right. Your complete guide to mudbug season in the 512.
                </p>
              </div>
              <div class="hidden md:block w-32 lg:w-48 xl:w-56 z-10 transform translate-y-6 hover:scale-110 hover:-rotate-3 transition-all duration-500">
                <img src="/images/crawfish_mascot_happy_2_1772521712147.png" alt="Happy Crawfish Mascot" class="w-full h-auto drop-shadow-2xl brightness-105 filter contrast-105">
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ SECTION NAV ═══ -->
        <div class="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <UButton
            v-for="section in sections"
            :key="section.id"
            :variant="activeSection === section.id ? 'solid' : 'ghost'"
            :color="activeSection === section.id ? 'primary' : 'neutral'"
            class="rounded-full !font-bold font-display tracking-wide transition-all duration-300 px-5 py-2"
            :class="activeSection === section.id ? 'shadow-lg shadow-primary/30 scale-105 ring-2 ring-primary/50 ring-offset-2 ring-offset-background bg-primary hover:bg-primary text-white' : 'bg-white border-2 border-[#450a0a] shadow-[4px_4px_0_0_rgba(69,10,10,1)] hover:bg-[#fef3c7] :bg-primary/20 hover:scale-105 border border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all hover:text-primary :text-primary'"
            :icon="section.icon"
            @click="scrollToSection(section.id)"
          >
            {{ section.label }}
          </UButton>
        </div>

        <!-- ═══ BUY A SACK ═══ -->
        <section id="section-buy" class="scroll-mt-24 space-y-8">
          <div class="text-center">
            <div class="flex justify-center mb-6">
              <img src="/images/crawfish_market_icon_1772521599751.png" alt="Crawfish Sack" class="w-32 h-32 object-contain drop-shadow-xl hover:scale-110 transition-transform duration-300">
            </div>
            <h2 class="text-3xl sm:text-4xl font-black font-display text-[#450a0a]">
              Where to Buy Live Crawfish
            </h2>
            <p class="mt-3 text-[#450a0a]/80 text-sm sm:text-base max-w-xl mx-auto font-medium">
              The best spots in Austin to pick up a sack of live crawfish for your backyard boil.
            </p>
          </div>

          <!-- Map mode toggle -->
          <div class="flex justify-center gap-3">
            <UButton
              :variant="mapMode === 'markets' ? 'solid' : 'outline'"
              :color="mapMode === 'markets' ? 'primary' : 'neutral'"
              size="md"
              class="rounded-full font-bold shadow-sm transition-transform hover:scale-105"
              :class="mapMode === 'markets' ? 'bg-primary hover:bg-primary text-white' : 'text-primary '"
              icon="i-lucide-shopping-bag"
              @click="handleMapModeToggle('markets')"
            >
              Markets
            </UButton>
            <UButton
              :variant="mapMode === 'restaurants' ? 'solid' : 'outline'"
              :color="mapMode === 'restaurants' ? 'primary' : 'neutral'"
              size="md"
              class="rounded-full font-bold shadow-sm transition-transform hover:scale-105"
              :class="mapMode === 'restaurants' ? 'bg-primary hover:bg-primary text-white' : 'text-primary '"
              icon="i-lucide-utensils"
              @click="handleMapModeToggle('restaurants')"
            >
              Restaurants
            </UButton>
          </div>

          <!-- Map -->
          <ClientOnly>
            <div class="rounded-3xl overflow-hidden border border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all elevation-2 shadow-lg shadow-black/5 ring-4 ring-primary/10 ">
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
                  class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#fef3c7] text-primary shrink-0"
                >
                  {{ spot.priceRange }}
                </span>
              </div>
              <p class="text-sm text-primary font-medium mb-2">{{ spot.neighborhood }}</p>
              <p v-if="spot.notes" class="text-xs text-[#450a0a]/80 mb-3 line-clamp-3">{{ spot.notes }}</p>
              <div class="flex items-center gap-2 text-xs text-[#991b1b]/70 mb-1">
                <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
                <span class="truncate">{{ spot.address }}</span>
              </div>
              <div v-if="spot.phone" class="flex items-center gap-2 text-xs text-[#991b1b]/70">
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
        <section id="section-eat" class="scroll-mt-24 space-y-8">
          <div class="text-center">
            <div class="flex justify-center mb-6">
              <img src="/images/crawfish_restaurant_icon_1772521611530.png" alt="Restaurant Table" class="w-32 h-32 object-contain drop-shadow-xl hover:scale-110 transition-transform duration-300 rounded-3xl">
            </div>
            <h2 class="text-3xl sm:text-4xl font-black font-display text-[#450a0a]">
              Best Crawfish Restaurants
            </h2>
            <p class="mt-3 text-[#450a0a]/80 text-sm sm:text-base max-w-xl mx-auto font-medium">
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
                  class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#fef3c7] text-primary shrink-0"
                >
                  {{ spot.priceRange }}
                </span>
              </div>
              <p v-if="spot.specialty" class="text-sm text-primary font-medium mb-1">
                {{ spot.specialty }}
              </p>
              <p class="text-xs text-primary font-medium mb-2">{{ spot.neighborhood }}</p>
              <p v-if="spot.notes" class="text-xs text-[#450a0a]/80 mb-3 line-clamp-3">{{ spot.notes }}</p>
              <div class="flex items-center gap-2 text-xs text-[#991b1b]/70 mb-1">
                <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
                <span class="truncate">{{ spot.address }}</span>
              </div>
              <div v-if="spot.phone" class="flex items-center gap-2 text-xs text-[#991b1b]/70">
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
        <section id="section-recipe" class="scroll-mt-24 space-y-10 bg-[#fef3c7]/50  p-6 sm:p-10 rounded-[2.5rem] border border-primary/20 ">
          <div class="text-center pt-4">
            <div class="inline-flex items-center justify-center p-4 rounded-full bg-[#fef3c7]  text-primary  mb-6 shadow-sm">
               <UIcon name="i-lucide-flame" class="size-8" />
            </div>
            <h2 class="text-3xl sm:text-5xl font-black font-display text-primary  drop-shadow-sm">
              {{ boilRecipe.title }}
            </h2>
            <p class="mt-4 text-[#450a0a]/80 text-base sm:text-lg max-w-xl mx-auto font-medium">
              Everything you need to throw a proper crawfish boil in your backyard. Feeds <span class="text-primary  font-bold bg-[#fef3c7]  px-2 py-0.5 rounded-lg">{{ boilRecipe.servings }}</span>.
            </p>
          </div>

          <!-- Recipe stats -->
          <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all text-center hover:border-primary/40 transition-colors group">
              <div class="text-xs text-[#991b1b]/70 mb-1 uppercase tracking-wider font-bold">Prep Time</div>
              <div class="text-xl sm:text-2xl font-black font-display text-primary  group-hover:scale-105 transition-transform">{{ boilRecipe.prepTime }}</div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all text-center hover:border-primary/40 transition-colors group">
              <div class="text-xs text-[#991b1b]/70 mb-1 uppercase tracking-wider font-bold">Cook Time</div>
              <div class="text-xl sm:text-2xl font-black font-display text-primary  group-hover:scale-105 transition-transform">{{ boilRecipe.cookTime }}</div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all text-center hover:border-primary/40 transition-colors group">
              <div class="text-xs text-[#991b1b]/70 mb-1 uppercase tracking-wider font-bold">Total Time</div>
              <div class="text-xl sm:text-2xl font-black font-display text-primary  group-hover:scale-105 transition-transform">{{ boilRecipe.totalTime }}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 relative mt-12">
            <!-- Equipment -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 class="text-2xl font-black font-display mb-6 flex flex-col sm:flex-row items-center gap-3 text-primary  w-full pb-4 border-b border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all">
                <UIcon name="i-lucide-wrench" class="size-7" />
                Equipment Needed
              </h3>
              <ul class="space-y-4 w-full">
                <li v-for="(item, i) in boilRecipe.equipment" :key="i" class="flex items-start justify-center sm:justify-start gap-4">
                  <div class="mt-1 w-6 h-6 rounded-full bg-[#fef3c7]  flex items-center justify-center shrink-0">
                    <UIcon name="i-lucide-check" class="size-3.5 text-primary  font-bold" />
                  </div>
                  <span class="text-sm sm:text-base font-medium text-[#450a0a] py-0.5">{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Ingredients -->
            <div class="bg-primary  text-white p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col">
              <div class="absolute -right-4 -bottom-4 w-64 opacity-60 transform rotate-12 transition-transform duration-700 hover:rotate-6">
                 <img src="/images/crawfish_corn_potato_1772521681540.png" alt="Decorative ingredients" class="w-full h-auto brightness-110 contrast-125 rounded-2xl mix-blend-luminosity">
              </div>
              <h3 class="text-2xl font-black font-display mb-6 flex items-center gap-3 text-white w-full pb-4 border-b border-white/20 relative z-10">
                <UIcon name="i-lucide-shopping-cart" class="size-7" />
                Ingredients
              </h3>
              <ul class="space-y-3 relative z-10 flex-grow">
                <li v-for="ing in boilRecipe.ingredients" :key="ing.item" class="flex items-center justify-between gap-4 text-sm sm:text-base group py-0.5 border-b border-white/10 last:border-0 hover:bg-white/5 rounded px-2 -mx-2 transition-colors">
                  <span class="font-medium opacity-95 group-hover:opacity-100">{{ ing.item }}</span>
                  <span class="font-black bg-white/20 text-white px-2.5 py-1 rounded-md text-sm shrink-0 shadow-sm">{{ ing.amount }}</span>
                </li>
              </ul>
              
              <div class="mt-8 p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/30 relative z-10 flex gap-5 items-center shadow-inner">
                 <img src="/images/crawfish_seasoning_bag_1772521637005.png" alt="Ingredients" class="w-20 h-20 object-contain hidden sm:block drop-shadow-lg scale-110 rounded-lg">
                 <p class="text-sm font-medium leading-relaxed opacity-100"><span class="font-black uppercase tracking-wider text-primary/40 drop-shadow-sm">Cajun Secret:</span> Don't skimp on the seasoning. The more garlic and lemon, the better the boil.</p>
              </div>
            </div>
          </div>

          <!-- Steps -->
          <div class="mt-16 pt-8 border-t border-primary/30/50 ">
            <h3 class="text-3xl font-black font-display mb-12 text-center flex items-center justify-center gap-3 text-[#450a0a]">
              <UIcon name="i-lucide-list-ordered" class="size-8 text-primary " />
              Step-by-Step Guide
            </h3>
            <div class="max-w-4xl mx-auto">
              <UTimeline :items="boilRecipe.steps.map(s => ({ title: `Step ${s.id}`, description: s.instruction, icon: 'i-lucide-check-circle', tip: s.tip, id: s.id }))" class="pl-4 md:pl-0">
                <template #wrapper="{ item }">
                  <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border-4 border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all hover:border-primary/40 transition-all duration-300 mb-8 overflow-hidden relative group">
                    <div class="absolute -right-4 -top-8 text-9xl font-black font-display text-primary/5  opacity-50 z-0 pointer-events-none transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                      {{ item.id }}
                    </div>
                    <div class="relative z-10">
                      <p class="text-base leading-relaxed text-[#450a0a]/80">{{ item.description }}</p>
                      <div v-if="item.tip" class="mt-6 bg-[#fef3c7]  rounded-2xl p-5 flex gap-4 border border-primary/30/50  overflow-hidden relative">
                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"></div>
                        <div class="shrink-0 mt-0.5">
                          <UIcon name="i-lucide-lightbulb" class="size-6 text-primary" />
                        </div>
                        <p class="text-sm font-semibold text-primary  leading-relaxed">{{ item.tip }}</p>
                      </div>
                      
                      <!-- AI Graphics for specific steps -->
                      <div v-if="item.id === 1" class="mt-8 flex justify-center">
                        <img src="/images/crawfish_boil_tub_1772521760084.png" alt="Washing Crawfish" class="w-full max-w-[320px] rounded-2xl h-auto object-cover border-4 border-primary/20 drop-shadow-xl hover:scale-105 transition-transform duration-500">
                      </div>
                      <div v-if="item.id === 8" class="mt-8 flex justify-center">
                        <img src="/images/crawfish_pot_boiling_1772521624797.png" alt="Boiling Pot" class="w-full max-w-[320px] rounded-2xl h-auto object-cover border-4 border-primary/20 drop-shadow-xl hover:scale-105 transition-transform duration-500 hover:-rotate-2">
                      </div>
                      <div v-if="item.id === 12" class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <img src="/images/crawfish_newspaper_table_1772521737132.png" alt="Feast" class="w-full rounded-2xl h-auto object-cover shadow-lg border-4 border-primary/20 hover:scale-105 transition-transform duration-500">
                        <img src="/images/crawfish_cold_beer_1772521694686.png" alt="Cold Beer" class="w-full rounded-2xl h-auto object-cover shadow-lg border-4 border-primary/20 hover:scale-105 transition-transform duration-500">
                      </div>
                    </div>
                  </div>
                </template>
              </UTimeline>
            </div>
          </div>
        </section>

        <!-- ═══ PRO TIPS ═══ -->
        <section id="section-tips" class="scroll-mt-24 space-y-10">
          <div class="text-center">
            <h2 class="text-3xl sm:text-4xl font-black font-display text-[#450a0a]">Pro Tips</h2>
            <p class="mt-3 text-[#450a0a]/80 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Wisdom from Austin's crawfish veterans. Follow these and you'll boil like a Cajun.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="tip in crawfishTips" :key="tip.id" class="bg-white p-8 rounded-3xl border border-[#450a0a] border-4 shadow-[8px_8px_0_0_rgba(69,10,10,1)] hover:shadow-[12px_12px_0_0_rgba(69,10,10,1)] hover:-translate-y-1 transition-all hover:border-primary/40 :border-primary shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
              <div class="absolute -right-4 -top-4 w-24 h-24 bg-[#fef3c7]  rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              
              <div class="relative z-10">
                <div class="w-16 h-16 rounded-2xl bg-[#fef3c7]  border border-primary/30  flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                  <UIcon :name="tip.icon" class="size-8 text-primary " />
                </div>
                <h3 class="text-xl font-bold font-display mb-3 text-[#450a0a] group-hover:text-primary :text-primary transition-colors">{{ tip.title }}</h3>
                <p class="text-sm sm:text-base text-[#450a0a]/80 leading-relaxed font-medium">{{ tip.description }}</p>
              </div>
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
                color="amber"
                class="w-full flex items-center justify-between p-4 text-left rounded-none hover:bg-elevated"
                @click="toggleFaq(faq.id)"
              >
                <span class="text-sm font-semibold font-display pr-4">{{ faq.question }}</span>
                <UIcon
                  :name="openFaq === faq.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="size-4 text-[#991b1b]/70 shrink-0"
                />
              </UButton>
              <div v-if="openFaq === faq.id" class="px-4 pb-4">
                <p class="text-sm text-[#450a0a]/80 leading-relaxed">{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ ABOUT ═══ -->
        <section class="glass-card p-6 sm:p-8 space-y-4">
          <h2 class="text-xl font-semibold font-display">About Crawfish Season in Austin</h2>
          <p class="text-sm text-[#450a0a]/80 leading-relaxed">
            Crawfish season in Austin has become one of the city's most anticipated culinary events. While Texas doesn't have the deep-rooted crawfish traditions of Louisiana, Austin's food scene has more than made up for it. Every spring, backyards across the city fire up their propane burners, Cajun seasoning fills the air, and neighbors gather around newspaper-covered tables for the communal ritual of the crawfish boil.
          </p>
          <p class="text-sm text-[#450a0a]/80 leading-relaxed">
            Austin's crawfish culture blends classic Cajun traditions with the city's signature melting-pot flavor. You'll find Vietnamese-Cajun garlic butter crawfish at spots like LA Crawfish, traditional Southern boils at Shoal Creek Saloon, and everything in between. The city's Asian supermarkets — 99 Ranch, H Mart, and MT Supermarket — have become go-to sources for affordable live crawfish by the sack, often beating traditional seafood markets on price.
          </p>
          <p class="text-sm text-[#450a0a]/80 leading-relaxed">
            Peak season runs from March through May, when crawfish are at their largest and most plentiful. Early season (January–February) crawfish tend to be smaller and pricier. By June, the season winds down. Whether you're a seasoned boiler or trying your first mudbug, Austin offers everything from grab-and-go sacks to full-service Cajun restaurants. Just remember: suck the heads, pinch the tails, and always keep the beer cold.
          </p>
        </section>
      </div>
    </UContainer>
  </div>
</template>
