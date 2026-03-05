<script setup lang="ts">
import { hauntedPlaces, placeTypes } from '~/data/haunted-locations'

useSeo({
  title: 'Haunted Austin — Ghost Tours, Haunted Places & Spooky History',
  description: 'Explore Austin\'s most haunted locations. Ghost stories, paranormal history, guided tour info, and spine-chilling tales from the Texas capital.',
})

useWebPageSchema({ name: 'Haunted Austin Guide' }),
  defineWebSite({ name: 'Haunted Austin Guide' })

const selectedType = ref('all')
const filteredPlaces = computed(() => {
  return hauntedPlaces
    .filter(p => selectedType.value === 'all' || p.type === selectedType.value)
    .sort((a, b) => b.scareFactor - a.scareFactor)
})

const typeFilterItems = computed(() => [
  { label: 'All Types', value: 'all' },
  ...placeTypes.map(t => ({ label: t.charAt(0).toUpperCase() + t.slice(1), value: t })),
])

const skullIcons = (n: number) => Array.from({ length: 5 }, (_, i) => i < n)
</script>

<template>
  <div>
    <SubAppTopbar title="Haunted Austin" />
    <UContainer class="py-8 md:py-12">
      <div class="space-y-8 sm:space-y-12">
        <section class="text-center py-8 sm:py-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated/10 text-muted text-xs font-medium mb-4">
        <UIcon name="i-lucide-ghost" class="size-3.5" />
        Enter If You Dare
      </div>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight">Haunted Austin</h1>
      <p class="mt-3 text-muted text-sm sm:text-base max-w-2xl mx-auto">
        {{ hauntedPlaces.length }} haunted locations with ghost stories dating back to the 1800s. From cursed hotels to restless cemeteries.
      </p>
    </section>

    <section class="glass-card p-4 sm:p-6">
      <USelect
        v-model="selectedType"
        :items="typeFilterItems"
        size="lg"
      />
    </section>

    <section>
      <h2 class="text-xl font-semibold font-display mb-4">{{ filteredPlaces.length }} Haunted Locations</h2>
      <div class="space-y-4">
        <article v-for="place in filteredPlaces" :key="place.id" class="glass-card p-5 hover:border-default/30 transition-colors duration-200">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-base font-semibold font-display">{{ place.name }}</h3>
            <div class="flex items-center gap-0.5 shrink-0 ml-2">
              <span v-for="(filled, i) in skullIcons(place.scareFactor)" :key="i" class="text-xs">
                {{ filled ? '💀' : '⚪' }}
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-elevated/10 text-muted uppercase tracking-wider">{{ place.type }}</span>
            <span class="text-xs text-dimmed">Est. {{ place.yearEstablished }}</span>
            <span v-if="place.tourAvailable" class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Tour Available</span>
          </div>
          <p class="text-sm text-muted mb-3">{{ place.story }}</p>
          <div class="flex items-center gap-1.5 text-xs text-dimmed mb-2">
            <UIcon name="i-lucide-ghost" class="size-3.5 text-muted" />
            Ghost: <strong class="text-default">{{ place.ghostName }}</strong>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-dimmed">
            <UIcon name="i-lucide-map-pin" class="size-3.5 text-primary" />{{ place.address }} · {{ place.neighborhood }}
          </div>
        </article>
      </div>
    </section>

    <section class="glass-card p-6 sm:p-8 space-y-4">
      <h2 class="text-xl font-semibold font-display">Austin's Paranormal History</h2>
      <p class="text-sm text-muted leading-relaxed">Austin has been called one of the most haunted cities in Texas, and with good reason. The city's roots stretch back to the 1830s, and centuries of history have left an impressive collection of ghost stories. From the opulent Driskill Hotel — where cattle baron Jesse Driskill still walks the halls — to the ancient Treaty Oak, Austin's paranormal legacy is woven into the fabric of the city.</p>
      <p class="text-sm text-muted leading-relaxed">Several ghost tour companies operate nightly walking tours through downtown Austin, covering the most haunted locations on 6th Street, Congress Avenue, and the Capitol grounds. Whether you're a true believer or a skeptic looking for a fun evening out, Austin's haunted history makes for unforgettable storytelling.</p>
    </section>
      </div>
    </UContainer>
  </div>
</template>
