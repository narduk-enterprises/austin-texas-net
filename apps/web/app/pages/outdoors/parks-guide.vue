<script setup lang="ts">

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('outdoors')!
const siblings = category.subApps.filter((a) => a.slug !== 'parks-guide')
const crossLinks = categories.value.filter((c) => c.slug !== 'outdoors').slice(0, 4)

useSeo({
  title: 'Austin Parks Guide — Zilker, Pease & Metropolitan Parks',
  description: 'Explore the best parks in Austin. From the immense Zilker Metropolitan Park to neighborhood green spaces and nature preserves.',
  ogImage: {
    category: category.title,
      },
})

useWebPageSchema({
    name: 'Austin Parks Guide',
    description: 'Comprehensive guide to Austin\'s municipal parks, trails, and greenbelts.',
  })
</script>

<template>
  <div>
    <SubAppTopbar title="Austin Parks Guide" />
    <UContainer class="py-8 md:py-12">
      <div class="space-y-8 sm:space-y-12">
        <!-- Hero Section -->
        <section class="text-center py-8 sm:py-12 animate-fade-up">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated/10 text-primary text-xs font-medium mb-4">
            <UIcon name="i-lucide-tree-pine" class="size-3.5" />
            300+ Parks
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display mb-4">
            Austin City Parks
          </h1>
          <p class="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Austin boasts over 300 parks, 15 metropolitan parks, and 200 miles of trails. Discover the "City within a Park."
          </p>
        </section>

        <!-- Top Parks -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up-delay-1">
          <div class="glass-card p-6 border-default border-t-primary">
            <h3 class="text-xl font-display font-semibold mb-2">Zilker Metropolitan Park</h3>
            <p class="text-sm text-dimmed mb-4">The Crown Jewel of Austin</p>
            <p class="text-sm text-muted mb-4 line-clamp-3">
              Spread across 351 acres, Zilker Park is the heart of Austin's outdoor life. Home to Barton Springs Pool, the Umlauf Sculpture Garden, the Zilker Botanical Garden, and host to massive events like ACL Festival and the Trail of Lights.
            </p>
            <div class="flex gap-2">
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Paddleboarding</span>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Swimming</span>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Picnic Areas</span>
            </div>
          </div>
          
          <div class="glass-card p-6 border-default border-t-primary">
            <h3 class="text-xl font-display font-semibold mb-2">Pease District Park</h3>
            <p class="text-sm text-dimmed mb-4">Recently Revitalized</p>
            <p class="text-sm text-muted mb-4 line-clamp-3">
              Located near central Austin and the university, Pease Park follows Shoal Creek and recently received a multi-million dollar renovation. Features include the massive "Kingsbury Commons," an incredible treehouse observation deck, and interactive water features.
            </p>
            <div class="flex gap-2">
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Playground</span>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Splash Pad</span>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Trails</span>
            </div>
          </div>
          
          <div class="glass-card p-6 border-default border-t-primary">
            <h3 class="text-xl font-display font-semibold mb-2">Mount Bonnell</h3>
            <p class="text-sm text-dimmed mb-4">Covert Park</p>
            <p class="text-sm text-muted mb-4 line-clamp-3">
              Offering arguably the best sunset views in the city, Mount Bonnell stands 781 feet above sea level. Climb the 106 limestone stairs to reach the summit where you can gaze over Lake Austin, the 360 Bridge, and the downtown skyline.
            </p>
            <div class="flex gap-2">
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Scenic Views</span>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Stairs</span>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Sunset Spot</span>
            </div>
          </div>

          <div class="glass-card p-6 border-default border-t-primary">
            <h3 class="text-xl font-display font-semibold mb-2">Roy G. Guerrero Park</h3>
            <p class="text-sm text-dimmed mb-4">East Austin Oasis</p>
            <p class="text-sm text-muted mb-4 line-clamp-3">
              A massive 400-acre park located in East Austin along the Colorado River. It features a secret beach, an extensive disc golf course, softball complexes, and miles of shaded trails away from the downtown crowds.
            </p>
            <div class="flex gap-2">
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Secret Beach</span>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Disc Golf</span>
              <span class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">Sports Fields</span>
            </div>
          </div>
        </section>

        <!-- Park Rules -->
        <section class="glass-card p-6 sm:p-8 animate-fade-up-delay-2">
          <h2 class="text-xl font-semibold font-display mb-4">General Park Rules</h2>
          <ul class="text-sm text-muted space-y-3">
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check-circle" class="size-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Leave No Trace:</strong> Ensure you pack out all trash and recycling. Many parks have limited receptacle capacity on busy weekends.</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-alert-circle" class="size-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Dog Policies:</strong> While Austin is very dog-friendly, most parks require dogs to be leashed outside of designated off-leash zones (like Red Bud Isle and portions of Zilker).</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-x-circle" class="size-4 text-primary shrink-0 mt-0.5" />
              <span><strong>No Glass/Styrofoam:</strong> Glass containers and styrofoam coolers are strictly prohibited in all Austin city parks and waterways for safety and environmental reasons.</span>
            </li>
          </ul>
        </section>

        <!-- ══════ More in Outdoors ══════ -->
        <section v-if="siblings.length" class="mb-8 animate-fade-up-delay-2">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Outdoors</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <NuxtLink
              v-for="app in siblings"
              :key="app.slug"
              :to="`/outdoors/${app.slug}/`"
              class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
            >
              <div>
                <h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3>
                <p class="text-xs text-muted line-clamp-1">{{ app.description }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0 ml-3">
                <UBadge
                  :color="app.status === 'live' ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                  :label="app.status === 'live' ? 'Live' : 'Coming Soon'"
                />
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4 text-dimmed group-hover:text-primary transition-colors"
                />
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- ══════ Explore More ══════ -->
        <section class="mb-6 animate-fade-up-delay-2">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <NuxtLink
              v-for="c in crossLinks"
              :key="c.slug"
              :to="`/${c.slug}/`"
              class="flex items-center gap-2.5 rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30"
            >
              <UIcon :name="c.icon" class="size-4" :class="c.color" />
              <span class="text-sm font-medium">{{ c.title }}</span>
            </NuxtLink>
          </div>
        </section>

      </div>
    </UContainer>
  </div>
</template>
