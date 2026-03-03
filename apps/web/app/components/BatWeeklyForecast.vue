<script setup lang="ts">
import type { ForecastDay } from '~/composables/useBatBridgeData'

defineProps<{
  forecast: ForecastDay[]
}>()

function visibilityBadgeColor(visibility: ForecastDay['visibility']) {
  if (visibility === 'Excellent') return 'success'
  if (visibility === 'Good') return 'warning'
  return 'error'
}
</script>

<template>
  <section class="glass-card p-5 sm:p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-primary">7-Day Emergence Outlook</h2>
        <p class="mt-1 text-sm text-dimmed">
          Sunset and emergence times are astronomical calculations for Austin. Visibility is a modeled cloud estimate.
        </p>
      </div>
      <div class="inline-flex items-center gap-2 rounded-full border border-default bg-muted px-3 py-1.5 text-xs uppercase tracking-wide text-dimmed">
        <UIcon name="i-lucide-cloud" class="size-4" />
        Estimated conditions
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="day in forecast"
        :key="day.id"
        class="rounded-xl border border-default p-4"
        :class="day.isToday ? 'bg-elevated ring-1 ring-primary/30' : 'bg-muted'"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-primary">{{ day.weekday }}</p>
            <p class="text-xs text-dimmed">{{ day.shortDate }}</p>
          </div>

          <UBadge v-if="day.isToday" color="primary" variant="soft" size="sm">
            Today
          </UBadge>
        </div>

        <dl class="mt-4 space-y-2 text-sm text-muted">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-dimmed">Sunset</dt>
            <dd class="font-semibold">{{ day.sunsetLabel }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-dimmed">Emergence</dt>
            <dd class="font-semibold">{{ day.emergenceLabel }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-dimmed">Arrive by</dt>
            <dd class="font-semibold">{{ day.arrivalLabel }}</dd>
          </div>
        </dl>

        <div class="mt-3 flex items-center gap-2">
          <UBadge :color="day.tone" variant="soft" size="sm">{{ day.condition }}</UBadge>
          <UBadge :color="visibilityBadgeColor(day.visibility)" variant="outline" size="sm">
            Visibility: {{ day.visibility }}
          </UBadge>
        </div>

        <p class="mt-2 text-xs text-dimmed">Cloud cover estimate: {{ day.cloudCoverPercent }}%</p>
      </article>
    </div>
  </section>
</template>
