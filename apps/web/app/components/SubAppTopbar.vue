<script setup lang="ts">
/**
 * SubAppTopbar — Compact topbar for all sub-app pages.
 *
 * Shows: site brand → separator → page title → breadcrumbs (second row)
 * Right side: color mode toggle.
 */

const props = defineProps<{
  title: string
  /** When a spot is selected, its name appears as the final breadcrumb */
  spotName?: string
}>()

const { items: baseBreadcrumbs } = useBreadcrumbs()

// Append spot name as final breadcrumb when selected
const breadcrumbs = computed(() => {
  if (!props.spotName) return baseBreadcrumbs.value
  const route = useRoute()
  const items = baseBreadcrumbs.value.map((item) => ({ ...item }))
  // Make the last base item a link again (it was un-linked as "current page")
  const lastItem = items.at(-1)
  if (lastItem) {
    lastItem.to = route.path.replace(/\/$/, '') + '/'
  }
  // Add spot as the final (un-linked) breadcrumb
  items.push({ label: props.spotName })
  return items
})
</script>

<template>
  <!-- eslint-disable-next-line narduk/no-native-layout -- semantic landmark -->
  <header
    class="flex items-start justify-between px-4 py-2.5 border-b border-default bg-default shrink-0 z-20"
  >
    <div class="flex flex-col gap-0.5 min-w-0">
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/"
          aria-label="Home"
          class="font-display font-extrabold text-sm text-default no-underline whitespace-nowrap hover:text-premium-accent transition-colors duration-400"
        >
          Austin-Texas.net
        </NuxtLink>
        <span class="text-dimmed text-sm">/</span>
        <span
          class="text-[0.8125rem] font-semibold text-muted whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {{ spotName || title }}
        </span>
      </div>
      <UBreadcrumb
        v-if="breadcrumbs.length > 0"
        :items="breadcrumbs"
        class="text-xs"
        aria-label="Page breadcrumb"
      />
    </div>
    <div class="flex items-center gap-3 pt-0.5">
      <UColorModeButton size="xs" />
    </div>
  </header>
</template>
