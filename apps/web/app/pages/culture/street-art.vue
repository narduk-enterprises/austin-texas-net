<script setup lang="ts">
import { murals, neighborhoods, allTags } from '~/data/murals'

useSeo({
  title: 'Austin Street Art & Murals Map — Find Graffiti & Public Art',
  description: 'Explore Austin\'s best street art, murals, and graffiti on an interactive guide. Discover muralists, photo spots, and hidden gems across the city.',
})

useWebPageSchema({ name: 'Austin Street Art & Murals Map' })

const search = ref('')
const selectedNeighborhood = ref('')
const selectedTag = ref('')

const filteredMurals = computed(() => {
  return murals.filter(m => {
    const matchesSearch = !search.value || m.name.toLowerCase().includes(search.value.toLowerCase()) || m.artist.toLowerCase().includes(search.value.toLowerCase())
    const matchesNeighborhood = !selectedNeighborhood.value || m.neighborhood === selectedNeighborhood.value
    const matchesTag = !selectedTag.value || m.tags.includes(selectedTag.value)
    return matchesSearch && matchesNeighborhood && matchesTag
  })
})

const stats = computed(() => ({
  total: murals.length,
  neighborhoods: neighborhoods.length,
  iconic: murals.filter(m => m.tags.includes('iconic')).length,
  photoSpots: murals.filter(m => m.tags.includes('photo-spot')).length,
}))
</script>

<template>
  <div>
    <SubAppTopbar title="Street Art" />
    <UContainer class="py-8 md:py-12">
      <div class="space-y-8 sm:space-y-12">
        <!-- Hero -->
    <section class="text-center py-8 sm:py-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
        <UIcon name="i-lucide-palette" class="size-3.5" />
        Austin's Outdoor Gallery
      </div>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight">
        Austin Street Art & Murals
      </h1>
      <p class="mt-3 text-muted text-sm sm:text-base max-w-2xl mx-auto">
        Discover {{ stats.total }} stunning murals, graffiti walls, and public art installations across
        {{ stats.neighborhoods }} Austin neighborhoods.
      </p>

      <!-- Stats -->
      <div class="flex flex-wrap justify-center gap-6 mt-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-primary animate-count-in">{{ stats.total }}</div>
          <div class="text-xs text-dimmed">Murals</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary animate-count-in" style="animation-delay: 0.1s">{{ stats.neighborhoods }}</div>
          <div class="text-xs text-dimmed">Neighborhoods</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary animate-count-in" style="animation-delay: 0.2s">{{ stats.iconic }}</div>
          <div class="text-xs text-dimmed">Iconic Spots</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary animate-count-in" style="animation-delay: 0.3s">{{ stats.photoSpots }}</div>
          <div class="text-xs text-dimmed">Photo Spots</div>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="glass-card p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search murals or artists..."
          size="lg"
          class="flex-1"
        />
        <USelect
          v-model="selectedNeighborhood"
          :items="[{ label: 'All Neighborhoods', value: '' }, ...neighborhoods.map(n => ({ label: n, value: n }))]"
          size="lg"
          class="w-full sm:w-48"
        />
        <USelect
          v-model="selectedTag"
          :items="[{ label: 'All Tags', value: '' }, ...allTags.map(t => ({ label: t, value: t }))]"
          size="lg"
          class="w-full sm:w-40"
        />
      </div>
    </section>

    <!-- Results -->
    <section>
      <h2 class="text-xl font-semibold font-display mb-4">
        {{ filteredMurals.length }} {{ filteredMurals.length === 1 ? 'Mural' : 'Murals' }} Found
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          v-for="mural in filteredMurals"
          :key="mural.id"
          class="glass-card p-5 hover:border-primary/30 transition-colors duration-200"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-semibold font-display leading-tight">{{ mural.name }}</h3>
            <span class="text-xs text-dimmed shrink-0 ml-2">{{ mural.year }}</span>
          </div>
          <p class="text-sm text-muted mb-3">{{ mural.description }}</p>
          <div class="space-y-1.5 text-xs text-dimmed">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-paintbrush" class="size-3.5 text-primary" />
              {{ mural.artist }}
            </div>
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-map-pin" class="size-3.5 text-primary" />
              {{ mural.address }} · {{ mural.neighborhood }}
            </div>
          </div>
          <div class="flex flex-wrap gap-1.5 mt-3">
            <span
              v-for="tag in mural.tags"
              :key="tag"
              class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- SEO Content -->
    <section class="glass-card p-6 sm:p-8 space-y-4">
      <h2 class="text-xl font-semibold font-display">About Austin Street Art</h2>
      <p class="text-sm text-muted leading-relaxed">
        Austin, Texas is home to one of the most vibrant street art scenes in the United States. From the iconic
        "Greetings from Austin" postcard mural to intimate love notes spray-painted on coffee shop walls, the city's
        outdoor art culture reflects its creative, eccentric soul. Every neighborhood — from the galleries of East
        Austin to the boutiques of South Congress — has its own murals waiting to be discovered.
      </p>
      <p class="text-sm text-muted leading-relaxed">
        Whether you're hunting for the perfect Instagram backdrop or exploring the stories behind the art,
        Austin's murals are free, open to the public, and always evolving. New works appear regularly as
        local and international artists add their mark to the city's ever-changing canvas.
      </p>
    </section>
      </div>
    </UContainer>
  </div>
</template>
