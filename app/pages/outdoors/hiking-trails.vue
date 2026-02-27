<script setup lang="ts">
/**
 * /outdoors/hiking-trails/ — Best Hiking Trails in Austin
 *
 * Comprehensive guide to hiking trails in the Austin area — Greenbelt,
 * Turkey Creek, Walnut Creek, and Hill Country trails with difficulty
 * ratings, distances, and conditions.
 *
 * Search Radar keyword: "best hiking trails austin tx" (12,100 monthly volume)
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('outdoors')!
const siblings = category.subApps.filter((a) => a.slug !== 'hiking-trails')
const crossLinks = categories.value.filter((c) => c.slug !== 'outdoors').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Best Hiking Trails in Austin, Texas — Trail Guide & Maps',
  description:
    'Complete guide to the best hiking trails in Austin, TX — Barton Creek Greenbelt, Turkey Creek, Walnut Creek, and more with difficulty ratings, trail distances, and conditions.',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('outdoors'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Best Hiking Trails in Austin, Texas — Trail Guide & Maps',
    description:
      'Comprehensive guide to hiking trails in the Austin area — distances, difficulty ratings, parking info, swimming holes, and seasonal conditions.',
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best hiking trail in Austin?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "The Barton Creek Greenbelt is widely considered Austin's best trail system with 13+ miles of trails, swimming holes, and rock scrambles. For a shorter option, the River Place Nature Trail offers stunning Hill Country views.",
        },
      },
      {
        '@type': 'Question',
        name: 'Are there easy hikes in Austin for beginners?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — the Ann & Roy Butler Trail (10 mi, flat, paved) around Lady Bird Lake is perfect for beginners. Turkey Creek Trail (2.8 mi, mostly flat) and the Shoal Creek Trail (3.5 mi, paved) are also beginner-friendly.',
        },
      },
    ],
  },
])

// ── Trail data ──────────────────────────────────────────────
interface Trail {
  name: string
  distance: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  type: string
  highlights: string[]
  parking: string
  tip: string
}

const trails: Trail[] = [
  {
    name: 'Barton Creek Greenbelt',
    distance: '13.2 miles (total system)',
    difficulty: 'Moderate',
    type: 'Out & Back / Point-to-Point',
    highlights: [
      'Sculpture Falls — natural limestone swimming hole',
      'Twin Falls — popular swimming with rope swings',
      'Gus Fruh — shady canyon with creek access',
      'Rock scrambling through limestone canyon walls',
    ],
    parking: 'Multiple trailheads: Zilker, Gus Fruh, Scottish Woods, Hill of Life',
    tip: 'The Hill of Life entrance (MoPac trailhead) is the least crowded. Check creek water levels before going — trails flood after heavy rain.',
  },
  {
    name: 'Turkey Creek Trail',
    distance: '2.8 miles one-way',
    difficulty: 'Easy',
    type: 'Out & Back',
    highlights: [
      'Shaded creek-side walking through oaks and junipers',
      'Creek crossings with stepping stones',
      'Connects to Emma Long Metropolitan Park',
      'Great for trail running',
    ],
    parking: 'Free lot at 1600 N Commons Ford Rd — arrives early on weekends',
    tip: "The trail is linear — turn around whenever you're ready. Best in spring when the creek is flowing and wildflowers are blooming.",
  },
  {
    name: 'Walnut Creek Metropolitan Park',
    distance: '4+ miles of trails',
    difficulty: 'Moderate',
    type: 'Loop System',
    highlights: [
      '15+ miles of mountain biking trails (shared use)',
      'Well-marked directional trails for hikers and bikers',
      "Dense tree canopy — one of Austin's shadiest parks",
      "North Austin's best trail system",
    ],
    parking: 'Free parking at 12138 N Lamar Blvd — large lot',
    tip: 'Watch for mountain bikers — stay right and yield. The southern loop is more hiker-friendly with fewer bike conflicts.',
  },
  {
    name: 'River Place Nature Trail',
    distance: '4.2 miles out & back',
    difficulty: 'Hard',
    type: 'Out & Back',
    highlights: [
      'Dramatic Hill Country canyon views',
      'Steep switchbacks with 575ft elevation change',
      'Waterfall at the turnaround point (seasonal)',
      "One of Austin's most scenic and challenging hikes",
    ],
    parking: 'Limited roadside parking at 4800 River Place Blvd — $FREE but fills by 9am weekends',
    tip: "Go early. The trail is fully exposed and brutal in summer. Bring plenty of water — there's no shade on the upper sections.",
  },
  {
    name: 'Mount Bonnell',
    distance: '0.5 miles (stairs + overlook)',
    difficulty: 'Easy',
    type: 'Out & Back (stairs)',
    highlights: [
      '102 limestone steps to a panoramic Lake Austin overlook',
      "One of Austin's most iconic photo spots",
      'Stunning sunset views over the Hill Country',
      'Quick hike — perfect for visitors with limited time',
    ],
    parking: 'Small lot at 3800 Mt Bonnell Rd — fills fast, especially at sunset',
    tip: 'Visit at golden hour for the best photos. The overlook faces west — perfect for sunset. Weekday mornings are much less crowded.',
  },
  {
    name: 'McKinney Falls State Park',
    distance: '3.1 miles (Onion Creek Trail)',
    difficulty: 'Easy',
    type: 'Loop',
    highlights: [
      'Two stunning waterfalls — Upper and Lower McKinney Falls',
      'Swimming in natural pools below the falls',
      'Remains of an 1850s homestead on the trail',
      'Only 15 minutes from downtown Austin',
    ],
    parking: '$6/person entrance fee — Texas State Parks Pass covers it',
    tip: 'After heavy rain, the falls are spectacular but the swimming holes can be dangerous. Check flow rates on the LCRA site.',
  },
  {
    name: 'Wild Basin Wilderness Preserve',
    distance: '2.5 miles (loop system)',
    difficulty: 'Moderate',
    type: 'Loop',
    highlights: [
      'Quiet, protected nature preserve in West Austin',
      'Seasonal waterfall on Bee Creek',
      'Educational trail with native plant identification',
      'One of the best Golden-cheeked Warbler habitats',
    ],
    parking: '$3 suggested donation — small lot at 805 N Capital of TX Hwy',
    tip: 'Visit March–May for wildflowers and the endangered Golden-cheeked Warbler nesting season. The preserve is dog-free to protect wildlife.',
  },
  {
    name: 'Shoal Creek Trail',
    distance: '3.5 miles one-way',
    difficulty: 'Easy',
    type: 'Point-to-Point (paved)',
    highlights: [
      'Fully paved urban trail from downtown to 38th Street',
      "Passes through Pease Park — one of Austin's oldest parks",
      'Creek-side walking with shade trees',
      'Great for strollers, bikes, and wheelchair access',
    ],
    parking: 'Multiple access points — Lamar at 3rd St, Pease Park, 24th & Lamar',
    tip: 'Start at the southern end downtown and walk north to Pease Park for the most scenic section. The trail connects to the Lance Armstrong Bikeway.',
  },
]

const difficultyColors: Record<string, 'success' | 'warning' | 'error'> = {
  Easy: 'success',
  Moderate: 'warning',
  Hard: 'error',
}

function getDifficultyColor(difficulty: string): 'success' | 'warning' | 'error' {
  return difficultyColors[difficulty] ?? 'success'
}

// ── Seasonal Conditions ─────────────────────────────────────
const seasonalConditions = [
  {
    season: 'Spring (Mar–May)',
    icon: 'i-lucide-flower-2',
    conditions:
      'Best hiking season — wildflowers, moderate temps (65-85°F), and flowing creeks. Bluebonnets peak in April.',
    rating: '★★★★★',
  },
  {
    season: 'Summer (Jun–Aug)',
    icon: 'i-lucide-sun',
    conditions:
      'Hike before 10am or after 6pm only. Temps regularly exceed 100°F. Bring 2+ liters of water. Greenbelt swimming holes are the reward.',
    rating: '★★☆☆☆',
  },
  {
    season: 'Fall (Sep–Nov)',
    icon: 'i-lucide-leaf',
    conditions:
      'Excellent hiking — temps cool to 70-85°F. October and November are dry and gorgeous. Crowds thin after summer.',
    rating: '★★★★☆',
  },
  {
    season: 'Winter (Dec–Feb)',
    icon: 'i-lucide-snowflake',
    conditions:
      'Mild winters (40-65°F). Great for longer hikes. Occasional ice on trails after rare freezes. Cedar pollen peak in January.',
    rating: '★★★☆☆',
  },
]

// ── FAQ items ───────────────────────────────────────────────
const faqItems = [
  {
    label: 'What is the best hiking trail in Austin?',
    content:
      "The Barton Creek Greenbelt is Austin's crown jewel — 13+ miles of trails through a limestone canyon with swimming holes, waterfalls, and rock scrambles. For a more challenging hike with better views, River Place Nature Trail offers dramatic Hill Country canyon scenery with 575 feet of elevation gain.",
  },
  {
    label: 'Are the Austin hiking trails dog-friendly?',
    content:
      'Most Austin trails allow dogs on leash. Barton Creek Greenbelt, Turkey Creek, and Walnut Creek are all dog-friendly. Wild Basin Wilderness Preserve does NOT allow dogs. McKinney Falls requires dogs on a 6-foot leash. Always bring water for your dog — summer heat is dangerous for pets.',
  },
  {
    label: 'When is the best time to hike in Austin?',
    content:
      'Spring (March–May) is the best season — wildflowers, flowing creeks, and comfortable temperatures. Fall (October–November) is also excellent. In summer, hike only before 10am or after 6pm — temps regularly exceed 100°F. Winter is mild but cedar pollen can be brutal in January.',
  },
  {
    label: 'Are there easy hikes in Austin for beginners?',
    content:
      'Yes — the Ann & Roy Butler Trail (10 miles, flat, paved) around Lady Bird Lake is perfect for beginners. Turkey Creek Trail is mostly flat with easy creek-side walking. Shoal Creek Trail is fully paved and urban. Mount Bonnell is just 102 steps with incredible views.',
  },
  {
    label: 'Can you swim at the Barton Creek Greenbelt?',
    content:
      'Yes — Sculpture Falls, Twin Falls, and Gus Fruh are the most popular swimming spots. However, swimming depends on creek levels — in dry summers the pools can be stagnant or empty. Check the LCRA flow data before heading out. After heavy rains, avoid the creek due to flash flood danger.',
  },
  {
    label: 'Is there an entrance fee for hiking in Austin?',
    content:
      'Most Austin city trails and parks are free, including Barton Creek Greenbelt, Turkey Creek, and Walnut Creek. McKinney Falls State Park charges $6/person (covered by a Texas State Parks Pass). Wild Basin has a $3 suggested donation.',
  },
]

// ── Trail safety tips ───────────────────────────────────────
const safetyTips = [
  {
    icon: 'i-lucide-droplets',
    tip: 'Bring more water than you think',
    detail: 'Minimum 1 liter per hour in summer. There are no water fountains on most trails.',
  },
  {
    icon: 'i-lucide-sun',
    tip: 'Summer: hike early or late only',
    detail:
      'Austin summer heat (100°F+) is dangerous. Hike before 10am or after 6pm. No exceptions.',
  },
  {
    icon: 'i-lucide-zap',
    tip: 'Watch for flash floods',
    detail:
      'Austin creeks can flash flood in minutes after heavy rain upstream. Never cross flooded areas.',
  },
  {
    icon: 'i-lucide-bug',
    tip: 'Tick and snake awareness',
    detail:
      'Stay on marked trails. Check for ticks after every hike. Watch where you step — copperheads and rattlesnakes are present but rare.',
  },
]
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <!-- Breadcrumbs -->
      <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />

      <!-- ══════ Header ══════ -->
      <div class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="flex items-center justify-center size-12 rounded-2xl"
            :class="category.bgColor"
          >
            <UIcon :name="category.icon" class="size-6" :class="category.color" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Best Hiking Trails in Austin
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Austin's trail system ranges from easy paved paths along Lady Bird Lake to rugged Hill
          Country canyon hikes. Here's your complete guide — distances, difficulty, parking, and
          insider tips for every major trail.
        </p>
      </div>

      <!-- ══════ Trail Cards ══════ -->
      <section class="space-y-4 mb-10">
        <div
          v-for="(trail, idx) in trails"
          :key="trail.name"
          class="rounded-2xl border border-default bg-default p-6 sm:p-8"
          :class="`animate-fade-up-delay-${Math.min(idx + 1, 3)}`"
        >
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <h2 class="text-lg font-bold">{{ trail.name }}</h2>
            <UBadge
              :label="trail.difficulty"
              :color="getDifficultyColor(trail.difficulty)"
              variant="subtle"
              size="xs"
            />
          </div>

          <div class="flex flex-wrap gap-4 text-xs text-muted mb-4">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-ruler" class="size-3.5" />
              {{ trail.distance }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-route" class="size-3.5" />
              {{ trail.type }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-car" class="size-3.5" />
              {{ trail.parking }}
            </span>
          </div>

          <ul class="space-y-1.5 mb-4">
            <li
              v-for="highlight in trail.highlights"
              :key="highlight"
              class="flex items-start gap-2 text-sm"
            >
              <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5" :class="category.color" />
              <span class="text-muted">{{ highlight }}</span>
            </li>
          </ul>

          <div class="flex items-start gap-2 p-3 rounded-xl bg-elevated text-xs">
            <UIcon
              name="i-lucide-lightbulb"
              class="size-4 shrink-0 mt-0.5"
              :class="category.color"
            />
            <span class="text-muted"
              ><strong class="text-default">Insider tip:</strong> {{ trail.tip }}</span
            >
          </div>
        </div>
      </section>

      <!-- ══════ Seasonal Conditions ══════ -->
      <section class="mb-10 animate-fade-up-delay-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Seasonal Trail Conditions
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="s in seasonalConditions"
            :key="s.season"
            class="p-5 rounded-2xl border border-default bg-default"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <UIcon :name="s.icon" class="size-5" :class="category.color" />
                <h3 class="text-sm font-bold">{{ s.season }}</h3>
              </div>
              <span class="text-sm">{{ s.rating }}</span>
            </div>
            <p class="text-xs text-muted leading-relaxed">{{ s.conditions }}</p>
          </div>
        </div>
      </section>

      <!-- ══════ Safety Tips ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">Trail Safety</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="tip in safetyTips"
            :key="tip.tip"
            class="flex items-start gap-3 p-4 rounded-xl border border-default bg-default"
          >
            <UIcon :name="tip.icon" class="size-5 shrink-0 mt-0.5" :class="category.color" />
            <div>
              <p class="text-sm font-semibold mb-0.5">{{ tip.tip }}</p>
              <p class="text-xs text-muted leading-relaxed">{{ tip.detail }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ FAQ ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Frequently Asked Questions
        </h2>
        <UAccordion :items="faqItems" multiple />
      </section>

      <!-- ══════ More in Outdoors ══════ -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in Outdoors
        </h2>
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
      <section class="mb-6">
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
    </UContainer>
  </div>
</template>
