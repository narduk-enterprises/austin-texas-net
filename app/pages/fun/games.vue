<script setup lang="ts">
usePageSeo({
  title: 'Games Portal',
  description: 'ATX Games is the launchpad for playable browser games from ATX Apps.',
})

const { items: breadcrumbs } = useBreadcrumbs()

interface GameCard {
  slug: string
  name: string
  route: string
  status: 'live' | 'coming-soon'
  description: string
  genre: string
  icon: string
  eta?: string
}

const liveGames: GameCard[] = [
  {
    slug: 'lone-star-run',
    name: 'Lone Star Run',
    route: '/games/lone-star-run',
    status: 'live',
    description: 'Collect every star before the drone patrol catches you. Fast movement, dash timing, and clean routes win runs.',
    genre: 'Arcade survival',
    icon: 'i-lucide-zap',
  },
]

const upcomingGames: GameCard[] = [
  {
    slug: 'rhythm-trails',
    name: 'Rhythm Trails',
    route: '#',
    status: 'coming-soon',
    description: 'Timing-based route builder inspired by Austin live music sets. Build combos by syncing movement to beat drops.',
    genre: 'Rhythm tactics',
    icon: 'i-lucide-music-3',
    eta: 'Q2 2026',
  },
  {
    slug: 'food-truck-frenzy',
    name: 'Food Truck Frenzy',
    route: '#',
    status: 'coming-soon',
    description: 'Top-down lunch rush strategy. Route orders, avoid gridlock, and keep your queue moving through downtown blocks.',
    genre: 'Strategy sim',
    icon: 'i-lucide-truck',
    eta: 'Q3 2026',
  },
]
</script>

<template>
  <div>
    <SubAppTopbar title="Games Portal" />
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
      <div class="grid min-h-[calc(100dvh-8.5rem)] grid-rows-[auto,1fr,auto] gap-3 sm:gap-4">
        <section class="glass-card px-4 py-3.5 sm:px-5">
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        <div class="space-y-1">
          <p class="font-display text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">games.atx-apps.com</p>
          <h1 class="font-display text-xl leading-tight font-black text-default sm:text-2xl">
            Playable games, front and center.
          </h1>
        </div>
        <UButton to="/api/health" color="neutral" variant="outline" size="sm" icon="i-lucide-heart-pulse">
          Health
        </UButton>
      </div>
    </section>

    <section class="grid min-h-0 place-items-center">
      <article
        v-for="game in liveGames"
        :key="game.slug"
        class="glass-card flex w-full max-w-3xl flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary sm:size-11">
              <UIcon :name="game.icon" class="size-5" />
            </div>
            <div>
              <p class="font-display text-xl font-bold leading-tight text-default sm:text-2xl">{{ game.name }}</p>
              <p class="text-xs text-dimmed">{{ game.genre }}</p>
            </div>
          </div>
          <UBadge color="success" variant="soft">Live</UBadge>
        </div>

        <p class="max-w-2xl text-sm leading-6 text-muted">
          {{ game.description }}
        </p>

        <div class="grid gap-2 sm:grid-cols-2">
          <UButton :to="game.route" size="lg" icon="i-lucide-play" block>
            Launch {{ game.name }}
          </UButton>
          <UButton :to="game.route" color="neutral" variant="outline" size="lg" icon="i-lucide-gamepad-2" block>
            View Game Page
          </UButton>
        </div>
      </article>
    </section>

    <section class="glass-card px-4 py-3 sm:px-5">
      <div class="mb-2.5 flex items-center justify-between gap-2">
        <p class="font-display text-sm font-bold text-default">Coming Soon</p>
        <UBadge color="warning" variant="soft">{{ upcomingGames.length }} Planned</UBadge>
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <article
          v-for="game in upcomingGames"
          :key="game.slug"
          class="rounded-xl border border-default bg-muted/35 px-3 py-2.5"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <UIcon :name="game.icon" class="size-4 text-muted" />
              <p class="font-display text-sm font-semibold text-default">{{ game.name }}</p>
            </div>
            <UBadge color="warning" variant="soft" size="sm">{{ game.eta }}</UBadge>
          </div>
          <p class="mt-1 text-xs leading-5 text-muted">{{ game.genre }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
