<script setup lang="ts">
import type { SeasonStatus } from '~/composables/useBatBridgeData'

interface CountdownState {
  headline: string
  detail: string
  targetTimeLabel: string
  countdown: {
    totalMilliseconds: number
    hours: string
    minutes: string
    seconds: string
  }
}

const props = defineProps<{
  countdownState: CountdownState
  todayDateLabel: string
  todaySunsetLabel: string
  todayEmergenceLabel: string
  recommendedArrivalLabel: string
  seasonStatus: SeasonStatus
}>()

const seasonBadgeColor = computed(() => {
  return props.seasonStatus.tone === 'success' ? 'success' : 'warning'
})
</script>

<template>
  <section class="glass-card relative overflow-hidden p-5 sm:p-8">
    <div aria-hidden="true" class="pointer-events-none absolute -left-16 top-4 size-56 rounded-full bg-primary/15 blur-3xl" />
    <div aria-hidden="true" class="pointer-events-none absolute -right-12 -top-10 size-52 rounded-full bg-primary/10 blur-3xl" />

    <div class="relative grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
      <div class="space-y-4">
        <p class="text-xs uppercase tracking-[0.2em] text-dimmed">Congress Avenue Bridge</p>
        <h1 class="text-3xl font-extrabold text-primary sm:text-4xl lg:text-5xl">
          Bat Bridge Sunset
        </h1>
        <p class="text-sm leading-relaxed text-muted sm:text-base">
          {{ todayDateLabel }} in Austin. Plan your arrival around sunset for the best chance to catch the emergence stream.
        </p>

        <div class="inline-flex items-center gap-2 rounded-full border border-default bg-muted px-3 py-2">
          <UIcon name="i-lucide-bat" class="size-4 text-primary" />
          <span class="text-xs uppercase tracking-[0.16em] text-dimmed">Season Status</span>
          <UBadge :color="seasonBadgeColor" variant="soft" size="md">
            {{ seasonStatus.label }}
          </UBadge>
        </div>

        <p class="text-sm text-dimmed">
          {{ seasonStatus.context }}
        </p>
      </div>

      <div class="rounded-2xl border border-default bg-muted/80 p-4 sm:p-5">
        <p class="text-xs uppercase tracking-[0.2em] text-dimmed">{{ countdownState.headline }}</p>

        <div class="mt-3 grid grid-cols-3 gap-2">
          <div class="rounded-xl border border-default bg-elevated p-3 text-center">
            <span class="block text-[1.85rem] leading-none font-extrabold tracking-[0.04em] text-primary [font-variant-numeric:tabular-nums] sm:text-[2.05rem]">
              {{ countdownState.countdown.hours }}
            </span>
            <span class="mt-1.5 block text-[0.68rem] uppercase tracking-[0.12em] text-dimmed">Hours</span>
          </div>
          <div class="rounded-xl border border-default bg-elevated p-3 text-center">
            <span class="block text-[1.85rem] leading-none font-extrabold tracking-[0.04em] text-primary [font-variant-numeric:tabular-nums] sm:text-[2.05rem]">
              {{ countdownState.countdown.minutes }}
            </span>
            <span class="mt-1.5 block text-[0.68rem] uppercase tracking-[0.12em] text-dimmed">Minutes</span>
          </div>
          <div class="rounded-xl border border-default bg-elevated p-3 text-center">
            <span class="block text-[1.85rem] leading-none font-extrabold tracking-[0.04em] text-primary [font-variant-numeric:tabular-nums] sm:text-[2.05rem]">
              {{ countdownState.countdown.seconds }}
            </span>
            <span class="mt-1.5 block text-[0.68rem] uppercase tracking-[0.12em] text-dimmed">Seconds</span>
          </div>
        </div>

        <p class="mt-4 text-sm text-muted">
          Tonight's target: <span class="font-semibold text-primary">{{ countdownState.targetTimeLabel }}</span>
        </p>
        <p class="mt-2 text-sm text-dimmed">
          {{ countdownState.detail }}
        </p>
      </div>
    </div>

    <div class="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-default bg-muted p-3.5">
        <p class="text-[0.72rem] uppercase tracking-[0.1em] text-dimmed">Sunset</p>
        <p class="mt-1 text-[1.1rem] font-bold text-primary">{{ todaySunsetLabel }}</p>
      </div>
      <div class="rounded-xl border border-default bg-muted p-3.5">
        <p class="text-[0.72rem] uppercase tracking-[0.1em] text-dimmed">Emergence Estimate</p>
        <p class="mt-1 text-[1.1rem] font-bold text-primary">{{ todayEmergenceLabel }}</p>
      </div>
      <div class="rounded-xl border border-default bg-muted p-3.5">
        <p class="text-[0.72rem] uppercase tracking-[0.1em] text-dimmed">Best Arrival</p>
        <p class="mt-1 text-[1.1rem] font-bold text-primary">{{ recommendedArrivalLabel }}</p>
      </div>
    </div>
  </section>
</template>
