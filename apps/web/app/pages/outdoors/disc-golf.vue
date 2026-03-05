<script setup lang="ts">
import { courses, difficulties } from '~/data/disc-golf-courses'

useSeo({
  title: 'Austin Disc Golf Courses — Course Finder & Reviews',
  description: 'Find every disc golf course in Austin TX. Hole layouts, difficulty ratings, reviews, parking tips, and directions for all skill levels.',
})

useWebPageSchema({ name: 'Austin Disc Golf Courses' }),
  defineWebSite({ name: 'Austin Disc Golf Courses' })

const selectedDifficulty = ref('all')
const filteredCourses = computed(() => courses.filter(c => selectedDifficulty.value === 'all' || c.difficulty === selectedDifficulty.value).sort((a, b) => b.rating - a.rating))

const diffColor = (d: string) => {
  if (d === 'beginner') return 'bg-elevated/10 text-primary'
  if (d === 'intermediate') return 'bg-elevated/10 text-primary'
  if (d === 'advanced') return 'bg-elevated/10 text-primary'
  return 'bg-elevated/10 text-primary'
}
const difficultyFilterItems = computed(() => [
  { label: 'All Difficulties', value: 'all' },
  ...difficulties.map(d => ({ label: d.charAt(0).toUpperCase() + d.slice(1), value: d })),
])
const totalHoles = computed(() => courses.reduce((sum, c) => sum + c.holes, 0))
</script>

<template>
  <div>
    <SubAppTopbar title="Disc Golf Courses" />
    <UContainer class="py-8 md:py-12">
      <div class="space-y-8 sm:space-y-12">
        <section class="text-center py-8 sm:py-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
        <UIcon name="i-lucide-disc" class="size-3.5" />
        Throw Down
      </div>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight">Austin Disc Golf Courses</h1>
      <p class="mt-3 text-muted text-sm sm:text-base max-w-2xl mx-auto">
        {{ courses.length }} disc golf courses with {{ totalHoles }} total holes across the Austin area. All skill levels from beginner to championship.
      </p>
    </section>

    <section class="glass-card p-4 sm:p-6">
      <USelect
        v-model="selectedDifficulty"
        :items="difficultyFilterItems"
        size="lg"
      />
    </section>

    <section>
      <h2 class="text-xl font-semibold font-display mb-4">{{ filteredCourses.length }} Courses</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article v-for="course in filteredCourses" :key="course.id" class="glass-card p-5 hover:border-primary/30 transition-colors duration-200">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-base font-semibold font-display">{{ course.name }}</h3>
            <div class="flex items-center gap-1.5 shrink-0 ml-2">
              <UIcon name="i-lucide-star" class="size-3.5 text-primary" />
              <span class="text-sm font-medium">{{ course.rating }}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mb-3">
            <span :class="['px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wider', diffColor(course.difficulty)]">{{ course.difficulty }}</span>
            <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">{{ course.holes }} holes</span>
            <span class="text-xs text-dimmed">{{ course.fee }}</span>
          </div>
          <p class="text-sm text-muted mb-3">{{ course.description }}</p>
          <div class="text-xs text-dimmed flex items-center gap-1.5 mb-2"><UIcon name="i-lucide-map-pin" class="size-3.5 text-primary" />{{ course.address }}</div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="f in course.features" :key="f" class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">{{ f }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="glass-card p-6 sm:p-8 space-y-4">
      <h2 class="text-xl font-semibold font-display">Disc Golf in Austin</h2>
      <p class="text-sm text-muted leading-relaxed">Austin is one of the fastest-growing disc golf communities in Texas. With courses ranging from beginner-friendly 9-hole layouts to championship-level 27-hole facilities, there's something for every skill level. Most courses are free to play and open year-round thanks to Austin's mild winters.</p>
      <p class="text-sm text-muted leading-relaxed">The Austin disc golf community is welcoming and active, with weekly leagues, casual doubles rounds, and PDGA-sanctioned tournaments throughout the year. If you're new to the sport, Zilker Park and Bartholomew Park are great places to start with shorter holes and friendly players who can show you the ropes.</p>
    </section>
      </div>
    </UContainer>
  </div>
</template>
