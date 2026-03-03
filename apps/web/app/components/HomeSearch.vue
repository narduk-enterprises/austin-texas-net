<script setup lang="ts">
import { computed, ref } from 'vue'

const { categories } = useSiteData()
const query = ref('')

const isFocused = ref(false)

const allSearchableItems = computed(() => {
  const items: {
    type: 'category' | 'app'
    title: string
    description: string
    url: string
    icon?: string
    color?: string
    bgColor?: string
    categorySlug?: string
  }[] = []

  for (const cat of categories.value) {
    // Add category itself
    items.push({
      type: 'category',
      title: cat.title,
      description: cat.tagline,
      url: `/${cat.slug}/`,
      icon: cat.icon,
      color: cat.color,
      bgColor: cat.bgColor,
    })

    // Add live apps
    for (const app of cat.subApps.filter(a => a.status === 'live')) {
      items.push({
        type: 'app',
        title: app.title,
        description: app.description,
        url: `/${cat.slug}/${app.slug}/`,
        icon: app.icon || cat.icon,
        color: app.accentColor ? `text-${app.accentColor}` : cat.color,
        bgColor: app.accentColor ? `bg-${app.accentColor}/10` : cat.bgColor,
        categorySlug: cat.slug,
      })
    }
  }

  return items
})

const filteredItems = computed(() => {
  if (!query.value.trim()) return []

  const search = query.value.toLowerCase().trim()

  return allSearchableItems.value.filter(item => {
    return (
      item.title.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    )
  }).slice(0, 5) // limit to top 5 results
})

const showResults = computed(() => isFocused.value && query.value.trim().length > 0)

const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}
</script>

<template>
  <div class="relative w-full max-w-xl mx-auto mt-6 z-20">
    <UInput
      v-model="query"
      icon="i-lucide-search"
      size="xl"
      placeholder="Search for events, parks, food, weather..."
      class="w-full shadow-lg"
      :ui="{
        base: 'bg-elevated/90 backdrop-blur-md rounded-2xl border-default/50 transition-all duration-300 px-5 py-4',
      }"
      @focus="isFocused = true"
      @blur="handleBlur"
    >
      <template #trailing>
         <UButton
          v-if="query"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          class="-mr-1 text-dimmed hover:text-default"
          @click="query = ''"
        />
        <div v-else class="hidden sm:flex items-center gap-1.5 opacity-50">
          <UKbd>⌘</UKbd>
          <UKbd>K</UKbd>
        </div>
      </template>
    </UInput>

    <!-- Results Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="showResults"
        class="absolute top-full left-0 right-0 mt-3 p-2 bg-elevated/95 backdrop-blur-xl border border-default/50 rounded-2xl shadow-xl overflow-hidden"
      >
        <div v-if="filteredItems.length === 0" class="p-6 text-center text-dimmed">
          No results found for "{{ query }}".
        </div>
        
        <div v-else class="flex flex-col gap-1">
          <NuxtLink
            v-for="item in filteredItems"
            :key="item.url"
            :to="item.url"
            class="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/80 transition-colors"
          >
            <div
              class="flex items-center justify-center size-10 rounded-xl shrink-0 transition-transform group-hover:scale-110"
              :class="item.bgColor"
            >
              <UIcon :name="item.icon" class="size-5" :class="item.color" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-default truncate">
                  {{ item.title }}
                </span>
                <UBadge
                  v-if="item.type === 'category'"
                  size="sm"
                  variant="soft"
                  color="neutral"
                  class="ml-auto flex-shrink-0"
                >
                  Category
                </UBadge>
              </div>
              <p class="text-sm text-dimmed truncate mt-0.5">
                {{ item.description }}
              </p>
            </div>

            <UIcon
              name="i-lucide-arrow-right"
              class="size-5 text-dimmed group-hover:text-default transition-colors shrink-0"
            />
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
