<script setup lang="ts">
import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('events')!
const siblings = category.subApps.filter((a) => a.slug !== 'acl-fest')
const crossLinks = categories.value.filter((c) => c.slug !== 'events').slice(0, 4)

usePageSeo({
  title: 'Austin City Limits (ACL) Music Festival Guide',
  description: 'Your guide to the ACL Music Festival held annually in Zilker Park. Find lineup info, dates, survival tips, and transportation options.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('events'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin City Limits (ACL) Music Festival Guide',
    description: 'Comprehensive guide to the Austin City Limits Music Festival in Zilker Park.',
  }),
  {
    '@type': 'Event',
    name: 'ACL Fest 2026 — Weekend 1',
    startDate: '2026-10-02',
    endDate: '2026-10-04',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Zilker Metropolitan Park',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '2100 Barton Springs Rd',
        addressLocality: 'Austin',
        addressRegion: 'TX',
        postalCode: '78704',
        addressCountry: 'US',
      },
    },
    description:
      'Austin City Limits Music Festival Weekend 1 — over 100 acts across 9 stages in Zilker Park.',
    organizer: {
      '@type': 'Organization',
      name: 'C3 Presents',
      url: 'https://www.aclfestival.com',
    },
  },
  {
    '@type': 'Event',
    name: 'ACL Fest 2026 — Weekend 2',
    startDate: '2026-10-09',
    endDate: '2026-10-11',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Zilker Metropolitan Park',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '2100 Barton Springs Rd',
        addressLocality: 'Austin',
        addressRegion: 'TX',
        postalCode: '78704',
        addressCountry: 'US',
      },
    },
    description:
      'Austin City Limits Music Festival Weekend 2 — the second weekend of ACL Fest in Zilker Park.',
    organizer: {
      '@type': 'Organization',
      name: 'C3 Presents',
      url: 'https://www.aclfestival.com',
    },
  },
])
</script>

<template>
  <div>
    <SubAppTopbar title="ACL Fest Guide" />
    <UContainer class="py-8 md:py-12">
      <div class="space-y-8 sm:space-y-12">
        <!-- Hero Section -->
        <section class="text-center py-8 sm:py-12 animate-fade-up">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <UIcon name="i-lucide-music" class="size-3.5" />
            Two Weekends in October
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display mb-4">
            Austin City Limits Festival
          </h1>
          <p class="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Every October, Zilker Park transforms into a massive music venue hosting over 100 acts across 9 stages. 
            From local legends to global superstars, it's two weekends of pure Austin energy.
          </p>
        </section>

        <!-- Dates & Location -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up-delay-1">
          <div class="glass-card p-6 flex items-start gap-4">
            <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <UIcon name="i-lucide-calendar" class="size-5" />
            </div>
            <div>
              <h3 class="font-semibold mb-1">When Is It?</h3>
              <p class="text-sm text-dimmed mb-2">Always early-to-mid October.</p>
              <ul class="text-sm text-muted space-y-1 list-disc list-inside">
                <li>Weekend 1: Oct 2-4, 2026 (Est.)</li>
                <li>Weekend 2: Oct 9-11, 2026 (Est.)</li>
              </ul>
            </div>
          </div>
          <div class="glass-card p-6 flex items-start gap-4">
            <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <UIcon name="i-lucide-map-pin" class="size-5" />
            </div>
            <div>
              <h3 class="font-semibold mb-1">Where Is It?</h3>
              <p class="text-sm text-dimmed">Zilker Metropolitan Park, Austin, TX</p>
              <p class="text-sm text-muted mt-2">
                No parking is allowed at Zilker Park during the festival. Use the free shuttle from Republic Square Park downtown, ride a bike, or take rideshare.
              </p>
            </div>
          </div>
        </section>

        <!-- Survival Tips -->
        <section class="glass-card p-6 sm:p-8 animate-fade-up-delay-2">
          <h2 class="text-xl font-semibold font-display mb-6">ACL Festival Survival Tips</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex gap-3">
                <UIcon name="i-lucide-droplets" class="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 class="text-sm font-semibold">Stay Hydrated</h4>
                  <p class="text-sm text-muted">Texas Octobers can still hit 90°F. Bring an empty reusable water bottle and use the free hydration stations.</p>
                </div>
              </div>
              <div class="flex gap-3">
                <UIcon name="i-lucide-sun" class="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 class="text-sm font-semibold">Sun Protection</h4>
                  <p class="text-sm text-muted">Sunscreen, hats, and sunglasses are mandatory. Shade is limited near the main stages.</p>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex gap-3">
                <UIcon name="i-lucide-briefcase" class="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 class="text-sm font-semibold">Clear Bag Policy</h4>
                  <p class="text-sm text-muted">All bags must be clear plastic, vinyl, or PVC. Small clutch purses are allowed but must be searched.</p>
                </div>
              </div>
              <div class="flex gap-3">
                <UIcon name="i-lucide-footprints" class="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 class="text-sm font-semibold">Comfortable Shoes</h4>
                  <p class="text-sm text-muted">You will walk miles every day between stages. Do not wear untested or unsupportive shoes.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ══════ More in Events ══════ -->
        <section v-if="siblings.length" class="mb-8 animate-fade-up-delay-2">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Events</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <NuxtLink
              v-for="app in siblings"
              :key="app.slug"
              :to="`/events/${app.slug}/`"
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

        <!-- Cross Links -->
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
