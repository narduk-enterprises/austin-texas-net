<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()

const statusMessages: Record<number, { heading: string; icon: string }> = {
  404: { heading: 'Page not found', icon: 'i-lucide-search-x' },
  403: { heading: 'Access denied', icon: 'i-lucide-shield-x' },
  500: { heading: 'Server error', icon: 'i-lucide-server-crash' },
}

const info = computed(() => statusMessages[props.error.statusCode] ?? { heading: 'Something went wrong', icon: 'i-lucide-alert-triangle' })

usePageSeo({
  title: `${props.error.statusCode} — ${info.value.heading}`,
  description: props.error.message || info.value.heading,
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="size-16 rounded-2xl bg-primary/12 flex items-center justify-center text-primary mx-auto mb-6">
        <UIcon :name="info.icon" class="size-8" />
      </div>
      <h1 class="font-display text-4xl font-bold mb-2">{{ error.statusCode }}</h1>
      <p class="text-muted text-lg font-medium mb-1">{{ info.heading }}</p>
      <p class="text-dimmed text-sm mb-8">{{ error.message }}</p>
      <UButton size="lg" @click="handleError">
        Back to Home
      </UButton>
    </div>
  </div>
</template>
