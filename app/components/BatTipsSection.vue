<script setup lang="ts">
import { batFacts, batTips } from '~/data/bat-facts'
</script>

<template>
  <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <div class="glass-card p-5 sm:p-6">
      <div class="mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-lightbulb" class="size-5 text-primary" />
        <h2 class="text-xl font-semibold text-primary">Tips For Tonight</h2>
      </div>

      <div class="space-y-3">
        <article v-for="tip in batTips" :key="tip.id" class="rounded-xl border border-default bg-muted p-4">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-primary">{{ tip.title }}</h3>
          <p class="mt-1 text-sm leading-relaxed text-dimmed">{{ tip.detail }}</p>
        </article>
      </div>
    </div>

    <div class="glass-card p-5 sm:p-6">
      <div class="mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-sparkles" class="size-5 text-primary" />
        <h2 class="text-xl font-semibold text-primary">Bat Facts</h2>
      </div>

      <dl class="space-y-3">
        <div v-for="fact in batFacts" :key="fact.id" class="rounded-xl border border-default bg-muted p-4">
          <dt class="text-xs uppercase tracking-wide text-dimmed">{{ fact.label }}</dt>
          <dd class="mt-1 text-sm font-medium leading-relaxed text-muted">{{ fact.value }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
