<script setup lang="ts">
import { events, foodVendors, parkingTips, eventTypes } from '~/data/rodeo-events'

useSeo({
  title: 'Rodeo Austin 2026 — Schedule, Concerts, Tickets & Food Guide',
  description: 'Your complete guide to Rodeo Austin 2026. Concert lineup, rodeo schedule, ticket prices, food vendors, parking, and insider tips.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Rodeo Austin 2026 — Schedule, Concerts, Tickets & Food Guide',
    description:
      'Your complete guide to Rodeo Austin 2026. Concert lineup, rodeo schedule, ticket prices, food vendors, parking, and insider tips.',
  }),
  {
    '@type': 'Event',
    name: 'Rodeo Austin 2026',
    startDate: '2026-03-14',
    endDate: '2026-03-22',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Travis County Expo Center',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '7311 Decker Ln',
        addressLocality: 'Austin',
        addressRegion: 'TX',
        postalCode: '78724',
        addressCountry: 'US',
      },
    },
    description:
      'Rodeo Austin — rodeo competitions, live concerts, carnival rides, livestock shows, and over 250,000 visitors across 9 days.',
    organizer: {
      '@type': 'Organization',
      name: 'Rodeo Austin',
      url: 'https://www.rodeoaustin.com',
    },
  },
])

const selectedType = ref('')
const filteredEvents = computed(() => events.filter(e => !selectedType.value || e.type === selectedType.value))

const typeColor = (t: string) => {
  if (t === 'concert') return 'bg-elevated/10 text-muted'
  if (t === 'rodeo') return 'bg-elevated/10 text-muted'
  if (t === 'livestock') return 'bg-elevated/10 text-muted'
  if (t === 'carnival') return 'bg-elevated/10 text-muted'
  return 'bg-elevated/10 text-muted'
}

const typeEmoji = (t: string) => {
  if (t === 'concert') return '🎵'
  if (t === 'rodeo') return '🤠'
  if (t === 'livestock') return '🐄'
  if (t === 'carnival') return '🎡'
  return '🍖'
}

const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
</script>

<template>
  <div>
    <SubAppTopbar title="Rodeo Austin" />
    <UContainer class="py-8 md:py-12">
      <div class="space-y-8 sm:space-y-12">
        <section class="text-center py-8 sm:py-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated/10 text-muted text-xs font-medium mb-4">
        <UIcon name="i-lucide-star" class="size-3.5" />
        March 14–22, 2026
      </div>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight">Rodeo Austin 2026</h1>
      <p class="mt-3 text-muted text-sm sm:text-base max-w-2xl mx-auto">
        Your complete guide to Rodeo Austin. {{ events.length }} events, {{ foodVendors.length }} food vendors, concerts, livestock shows, and carnival rides.
      </p>
    </section>

    <!-- Event Filter -->
    <section class="glass-card p-4 sm:p-6">
      <div class="flex flex-wrap gap-2">
        <UButton :color="!selectedType ? 'primary' : 'neutral'" variant="subtle" size="sm" @click="selectedType = ''">All Events</UButton>
        <UButton v-for="t in eventTypes" :key="t" :color="selectedType === t ? 'primary' : 'neutral'" variant="subtle" size="sm" @click="selectedType = t">
          {{ typeEmoji(t) }} {{ t.charAt(0).toUpperCase() + t.slice(1) }}
        </UButton>
      </div>
    </section>

    <!-- Schedule -->
    <section>
      <h2 class="text-xl font-semibold font-display mb-4">Schedule — {{ filteredEvents.length }} Events</h2>
      <div class="space-y-3">
        <article v-for="event in filteredEvents" :key="event.id" class="glass-card p-5 hover:border-primary/30 transition-colors duration-200">
          <div class="flex items-start gap-4">
            <div class="text-center shrink-0 w-16">
              <div class="text-2xl">{{ typeEmoji(event.type) }}</div>
              <div class="text-xs text-dimmed mt-1">{{ formatDate(event.date) }}</div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-base font-semibold font-display">{{ event.title }}</h3>
                <span :class="['px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wider', typeColor(event.type)]">{{ event.type }}</span>
              </div>
              <p class="text-sm text-muted mb-2">{{ event.description }}</p>
              <div class="flex flex-wrap gap-x-4 text-xs text-dimmed">
                <span class="flex items-center gap-1"><UIcon name="i-lucide-clock" class="size-3.5 text-primary" />{{ event.time }}</span>
                <span class="flex items-center gap-1"><UIcon name="i-lucide-map-pin" class="size-3.5 text-primary" />{{ event.venue }}</span>
                <span class="flex items-center gap-1"><UIcon name="i-lucide-ticket" class="size-3.5 text-primary" />{{ event.ticketPrice }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Food Vendors -->
    <section>
      <h2 class="text-xl font-semibold font-display mb-4">🍖 Must-Try Food Vendors</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="vendor in foodVendors" :key="vendor.id" class="glass-card p-4">
          <h3 class="text-sm font-semibold font-display mb-1">{{ vendor.name }}</h3>
          <div class="text-xs text-dimmed mb-2">{{ vendor.specialty }} · {{ vendor.priceRange }}</div>
          <div class="text-xs text-muted"><strong class="text-primary">Must try:</strong> {{ vendor.mustTry }}</div>
        </div>
      </div>
    </section>

    <!-- Parking Tips -->
    <section class="glass-card p-6 sm:p-8">
      <h2 class="text-xl font-semibold font-display mb-4">🚗 Parking & Getting There</h2>
      <ul class="space-y-2">
        <li v-for="tip in parkingTips" :key="tip" class="flex items-start gap-2 text-sm text-muted">
          <UIcon name="i-lucide-check-circle" class="size-4 text-primary shrink-0 mt-0.5" />
          {{ tip }}
        </li>
      </ul>
    </section>

    <section class="glass-card p-6 sm:p-8 space-y-4">
      <h2 class="text-xl font-semibold font-display">About Rodeo Austin</h2>
      <p class="text-sm text-muted leading-relaxed">Rodeo Austin is the city's premier western heritage event, bringing together rodeo competitions, live music, carnival rides, livestock shows, and some of the best food in Texas. Held annually at the Travis County Expo Center, the event draws over 250,000 visitors across its multi-day run.</p>
      <p class="text-sm text-muted leading-relaxed">Beyond the entertainment, Rodeo Austin raises over $1 million annually for youth education through its scholarship program. It's one of Austin's most beloved traditions — a celebration of Texas culture that brings together families, ranchers, cowboys, and country music fans from across the state.</p>
    </section>
      </div>
    </UContainer>
  </div>
</template>
