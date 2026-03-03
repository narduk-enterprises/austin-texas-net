<!-- eslint-disable atx/no-style-block-layout -- core layout shell requires precise CSS for viewport sizing -->
<script setup lang="ts">
/**
 * SubAppShell — Two-column layout shell for map-based sub-app pages.
 *
 * Structure:
 *   ┌─────────────────────────────────────────────┐
 *   │  SubAppTopbar (brand / title / breadcrumbs)  │
 *   ├──────────────┬──────────────────────────────┤
 *   │  #panel      │  #content                    │
 *   │  (data, nav) │  (map, chart, visual)        │
 *   │  scrollable  │  fills remaining space       │
 *   └──────────────┴──────────────────────────────┘
 *
 * Mobile: stacked — #content on top (55dvh), #panel below, scrollable.
 * Desktop (≥1024px): side-by-side — #panel left (400px), #content right.
 *
 * Data is on the LEFT per user preference.
 */

defineProps<{
  title: string
  /** When true, shrinks the map to ~25% on mobile so the detail panel has more room */
  detailActive?: boolean
  /** When a spot is selected, pass its name for breadcrumb + topbar display */
  spotName?: string
}>()
</script>

<template>
  <div class="flex flex-col h-dvh overflow-hidden">
    <SubAppTopbar :title="title" :spot-name="spotName" />

    <div
      class="subapp-layout flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden lg:flex-row lg:overflow-hidden"
      :class="{ 'detail-active': detailActive }"
    >
      <!-- Left panel: data, controls, detail views -->
      <aside
        class="flex flex-col order-2 p-5 pb-4 overflow-y-auto scroll-smooth lg:order-none lg:w-[400px] lg:min-w-[360px] lg:max-w-[420px] lg:border-r lg:border-default lg:p-6"
      >
        <slot name="panel" />
      </aside>

      <!-- Right: map, chart, or primary visual -->
      <div
        class="subapp-content relative order-1 shrink-0 lg:order-none lg:flex-1 lg:h-auto lg:min-h-0 lg:min-w-0"
      >
        <slot name="content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile: map takes 55dvh, shrinks to 25dvh when detail active */
.subapp-content {
  height: 55dvh;
  min-height: 280px;
  transition: height 0.3s ease;
}

.detail-active .subapp-content {
  height: 25dvh;
  min-height: 140px;
}

@media (min-width: 1024px) {
  .subapp-content,
  .detail-active .subapp-content {
    height: auto;
    min-height: 0;
  }
}

/* Override AppMapKit height constraints for fullscreen mode */
.subapp-content :deep(.mapkit-wrapper) {
  height: 100%;
  max-height: none;
  min-height: 100%;
  border-bottom: none;
}

.subapp-content :deep(.mapkit-canvas) {
  height: 100%;
}
</style>
