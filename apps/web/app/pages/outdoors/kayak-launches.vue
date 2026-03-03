<script setup lang="ts">
import { launchSites, waterBodies } from '~/data/kayak-launches'

const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Kayak Launch Sites — Paddleboard, Canoe & Kayak Guide',
  description: 'Find the best kayak, canoe, and paddleboard launch sites in Austin TX. Water conditions, parking info, difficulty ratings, and local tips.',
})

useSchemaOrg([
  defineWebPage({ name: 'Austin Kayak Launch Sites' }),
  defineWebSite({ name: 'Austin Kayak Launch Sites' }),
])

const selectedWaterBody = ref('')
const selectedDifficulty = ref('')

const filteredSites = computed(() => {
  return launchSites.filter(s => {
    const matchesWater = !selectedWaterBody.value || s.waterBody === selectedWaterBody.value
    const matchesDiff = !selectedDifficulty.value || s.difficulty === selectedDifficulty.value
    return matchesWater && matchesDiff
  })
})

const difficultyColor = (d: string) => {
  if (d === 'beginner') return 'text-primary'
  if (d === 'intermediate') return 'text-primary'
  return 'text-primary'
}
</script>

<template>
  <div>
    <SubAppTopbar title="Kayak Launches" />
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
      <div class="space-y-8 sm:space-y-12">
        <section class="text-center py-8 sm:py-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
        <UIcon name="i-lucide-waves" class="size-3.5" />
        Paddle Austin
      </div>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight">
        Austin Kayak Launch Sites
      </h1>
      <p class="mt-3 text-muted text-sm sm:text-base max-w-2xl mx-auto">
        Find the perfect put-in for your next paddle. {{ launchSites.length }} launch sites across
        Lady Bird Lake, Lake Travis, Lake Austin, and Barton Creek.
      </p>
    </section>

    <section class="glass-card p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <USelect
          v-model="selectedWaterBody"
          :items="[{ label: 'All Water Bodies', value: '' }, ...waterBodies.map(w => ({ label: w, value: w }))]"
          size="lg"
          class="flex-1"
        />
        <USelect
          v-model="selectedDifficulty"
          :items="[{ label: 'All Levels', value: '' }, { label: 'Beginner', value: 'beginner' }, { label: 'Intermediate', value: 'intermediate' }, { label: 'Advanced', value: 'advanced' }]"
          size="lg"
          class="flex-1"
        />
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold font-display mb-4">{{ filteredSites.length }} Launch Sites</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article v-for="site in filteredSites" :key="site.id" class="glass-card p-5 hover:border-primary/30 transition-colors duration-200">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-base font-semibold font-display">{{ site.name }}</h3>
            <span :class="['text-xs font-medium uppercase tracking-wider', difficultyColor(site.difficulty)]">{{ site.difficulty }}</span>
          </div>
          <p class="text-sm text-muted mb-3">{{ site.description }}</p>
          <div class="space-y-1.5 text-xs text-dimmed mb-3">
            <div class="flex items-center gap-1.5"><UIcon name="i-lucide-map-pin" class="size-3.5 text-primary" />{{ site.address }} · {{ site.waterBody }}</div>
            <div class="flex items-center gap-1.5"><UIcon name="i-lucide-car" class="size-3.5 text-primary" />{{ site.parking }}</div>
          </div>
          <div class="glass-card p-3 bg-primary/5">
            <div class="flex items-start gap-1.5 text-xs"><UIcon name="i-lucide-lightbulb" class="size-3.5 text-primary shrink-0 mt-0.5" /><span class="text-muted">{{ site.tips }}</span></div>
          </div>
          <div class="flex flex-wrap gap-1.5 mt-3">
            <span v-for="a in site.amenities" :key="a" class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">{{ a }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="glass-card p-6 sm:p-8 space-y-4">
      <h2 class="text-xl font-semibold font-display">Kayaking in Austin</h2>
      <p class="text-sm text-muted leading-relaxed">Austin is a paddler's paradise with year-round access to calm lakes, scenic creeks, and the iconic Lady Bird Lake. Whether you're a first-time kayaker looking for a peaceful morning paddle or an experienced paddler seeking open-water adventures on Lake Travis, Austin has a launch site for you.</p>
      <p class="text-sm text-muted leading-relaxed">Lady Bird Lake is the most popular destination, offering flat water, stunning skyline views, and easy access from multiple public launch points. For more adventure, head to Lake Travis or Lake Austin for open-water paddling with limestone cliffs and crystal-clear water.</p>
    </section>
      </div>
    </UContainer>
  </div>
</template>
