<script setup lang="ts">
import { bingoInfo, faqs, tips } from '~/data/chicken-shit-bingo-locations'

const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Chicken Shit Bingo at Little Longhorn Saloon — Austin TX Guide',
  description: 'Everything about Chicken Shit Bingo at the Little Longhorn Saloon in Austin. Schedule, rules, how to play, what to expect, and tips for first-timers.',
})

useSchemaOrg([
  defineWebPage({ name: 'Chicken Shit Bingo Austin Guide' }),
  defineWebSite({ name: 'Chicken Shit Bingo Tracker' }),
])

const openFaq = ref<number | null>(null)
const toggleFaq = (id: number) => {
  openFaq.value = openFaq.value === id ? null : id
}
</script>

<template>
  <div>
    <SubAppTopbar title="Chicken Shit Bingo" />
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
      <div class="space-y-8 sm:space-y-12">
        <section class="text-center py-8 sm:py-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated/10 text-primary text-xs font-medium mb-4">
        <UIcon name="i-lucide-egg" class="size-3.5" />
        Only in Austin
      </div>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight">Chicken Shit Bingo</h1>
      <p class="mt-3 text-muted text-sm sm:text-base max-w-2xl mx-auto">
        The most Austin thing you can possibly do. A live chicken, a bingo board, and whoever's number gets pooped on wins.
      </p>
    </section>

    <!-- Main Info Card -->
    <section class="glass-card p-6 sm:p-8 border-default/20">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h2 class="text-lg font-semibold font-display mb-3">{{ bingoInfo.venue }}</h2>
          <p class="text-sm text-muted mb-4">{{ bingoInfo.description }}</p>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-dimmed">
              <UIcon name="i-lucide-map-pin" class="size-4 text-primary" />
              {{ bingoInfo.address }} · {{ bingoInfo.neighborhood }}
            </div>
            <div class="flex items-center gap-2 text-dimmed">
              <UIcon name="i-lucide-calendar" class="size-4 text-primary" />
              {{ bingoInfo.schedule }}
            </div>
            <div class="flex items-center gap-2 text-dimmed">
              <UIcon name="i-lucide-clock" class="size-4 text-primary" />
              {{ bingoInfo.startTime }} – {{ bingoInfo.endTime }}
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <div class="glass-card p-4 text-center">
            <div class="text-xs text-dimmed mb-1">Cover Charge</div>
            <div class="text-2xl font-bold text-primary font-display">{{ bingoInfo.coverCharge }}</div>
          </div>
          <div class="glass-card p-4 text-center">
            <div class="text-xs text-dimmed mb-1">Bingo Card</div>
            <div class="text-2xl font-bold text-primary font-display">{{ bingoInfo.bingoCardPrice }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tips -->
    <section>
      <h2 class="text-xl font-semibold font-display mb-4">First-Timer Tips</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="tip in tips" :key="tip.id" class="glass-card p-5">
          <UIcon :name="tip.icon" class="size-6 text-primary mb-3" />
          <h3 class="text-sm font-semibold font-display mb-1">{{ tip.title }}</h3>
          <p class="text-xs text-muted">{{ tip.description }}</p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section>
      <h2 class="text-xl font-semibold font-display mb-4">Frequently Asked Questions</h2>
      <div class="space-y-2">
        <div v-for="faq in faqs" :key="faq.id" class="glass-card overflow-hidden">
          <UButton
            variant="ghost"
            color="neutral"
            class="w-full flex items-center justify-between p-4 text-left rounded-none hover:bg-elevated"
            @click="toggleFaq(faq.id)"
          >
            <span class="text-sm font-semibold font-display pr-4">{{ faq.question }}</span>
            <UIcon :name="openFaq === faq.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4 text-dimmed shrink-0" />
          </UButton>
          <div v-if="openFaq === faq.id" class="px-4 pb-4">
            <p class="text-sm text-muted">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="glass-card p-6 sm:p-8 space-y-4">
      <h2 class="text-xl font-semibold font-display">About Chicken Shit Bingo</h2>
      <p class="text-sm text-muted leading-relaxed">Chicken Shit Bingo at the Little Longhorn Saloon is one of Austin's most beloved and bizarre traditions. Every Sunday since the early 2000s, this unassuming honky-tonk on Burnet Road has hosted the event where a live chicken struts around a numbered bingo board and — well, nature takes its course. Wherever the chicken does its business, that number wins.</p>
      <p class="text-sm text-muted leading-relaxed">It sounds ridiculous because it is. But that's exactly why it's become one of the most "Austin" experiences you can have. The Little Longhorn Saloon is a real honky-tonk — no frills, cheap beer, and genuine country music. Dale Watson, one of Austin's most celebrated country musicians, frequently performs here. The combination of live music, cold Lone Star tallboys, and a pooping chicken on a bingo board creates an experience you simply cannot find anywhere else in the world.</p>
    </section>
      </div>
    </UContainer>
  </div>
</template>
