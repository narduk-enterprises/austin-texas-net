<!-- eslint-disable atx/no-raw-tailwind-colors, atx/prefer-ulink -- freeze severity indicator colors + external resource links -->
<script setup lang="ts">
/**
 * /weather/freeze-prep/ — Austin Freeze Preparation Guide
 *
 * Comprehensive survival guide for Austin winter freezes — pipe protection,
 * plant safety, emergency resources, and lessons from Winter Storm Uri.
 * Complements /weather/freeze-alerts/ (live NWS warnings).
 */

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('weather')!
const siblings = category.subApps.filter((a) => a.slug !== 'freeze-prep')
const crossLinks = categories.value.filter((c) => c.slug !== 'weather').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

useSeo({
  title: 'Austin Freeze Prep Guide — Winter Storm Survival Checklist',
  description:
    'Complete freeze preparation guide for Austin, Texas. Pipe protection, plant safety, emergency supplies, power outage survival, and lessons from Winter Storm Uri.',
  ogImage: {
    category: category.title,
      },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Freeze Prep Guide — Winter Storm Survival Checklist',
    description:
      'Comprehensive freeze preparation guide for Austin, Texas — pipe protection, plant safety, emergency resources, and winter storm survival.',
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How cold does it get in Austin, Texas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Austin averages 15–25 freezing nights per year, mostly between December and February. Most are brief overnight freezes that thaw by mid-morning. However, hard freeze events (below 28°F for 4+ hours) occur 2–5 times annually.',
        },
      },
      {
        '@type': 'Question',
        name: 'At what temperature should I drip my faucets in Austin?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Austin Water recommends dripping faucets when temperatures drop below 28°F. Drip both hot and cold water lines at a slow, steady drip — not a stream. Focus on faucets served by pipes running through exterior walls, attics, or garages.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happened during Winter Storm Uri in Austin?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Winter Storm Uri hit Austin February 13–19, 2021, bringing record lows of -2°F and sustained sub-freezing temperatures for over 120 hours. The ERCOT grid collapsed, leaving millions without power for days. Austin experienced massive pipe bursts, boil-water notices lasting weeks, and over $18 billion in statewide damage. It was Texas's costliest natural disaster.",
        },
      },
      {
        '@type': 'Question',
        name: 'Where are warming centers in Austin during a freeze?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The City of Austin activates warming centers at recreation centers, libraries, and community centers during severe cold events. Locations are announced via Austin 3-1-1, the ATXFloods app, and the City of Austin emergency page. The Austin Convention Center has served as the primary large-scale shelter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I leave my heat on when I leave during a freeze?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Keep your thermostat set to at least 55°F even when away. This prevents interior pipes from freezing. If you lose power, open cabinet doors under sinks and let all faucets drip to keep water moving through the pipes.',
        },
      },
    ],
  },
])

// ── Before the Freeze (prep) ───────────────────────────────
const prepSections = [
  {
    title: 'Pipes & Plumbing',
    icon: 'i-lucide-droplets',
    color: 'text-primary',
    items: [
      'Insulate exposed pipes in attics, garages, and along exterior walls with foam sleeves.',
      'Locate your main water shut-off valve — know how to turn it off in an emergency.',
      'Disconnect and drain all outdoor garden hoses.',
      'Cover outdoor faucets (hose bibs) with insulated faucet covers ($3–5 at hardware stores).',
      'If you have a sprinkler system, run the winterize/blow-out cycle.',
    ],
  },
  {
    title: 'Plants & Landscaping',
    icon: 'i-lucide-leaf',
    color: 'text-primary',
    items: [
      'Cover tender plants with frost cloth or old bedsheets — not plastic (traps moisture).',
      'Move potted tropicals (citrus, plumeria, bougainvillea) into the garage or indoors.',
      'Water deeply 24–48 hours before the freeze — moist soil holds heat better than dry.',
      'Mulch heavily around base of sensitive plants (4–6 inches).',
      'Do NOT prune freeze-damaged plants until spring — dead foliage insulates the crown.',
    ],
  },
  {
    title: 'Pets & Animals',
    icon: 'i-lucide-paw-print',
    color: 'text-primary',
    items: [
      'Bring ALL pets indoors when temps drop below 32°F — no exceptions.',
      'Outdoor water bowls freeze quickly; check and refresh with warm water every few hours.',
      'Wipe paws after walks — ice melt chemicals are toxic to pets.',
      'Provide extra bedding in garages for feral cat shelters (cardboard box + straw, not blankets).',
    ],
  },
  {
    title: 'Emergency Supplies',
    icon: 'i-lucide-package',
    color: 'text-primary',
    items: [
      'Stock 3+ days of water (1 gallon per person per day).',
      'Fill your car with gas before the freeze — stations lose power during outages.',
      'Charge all devices, battery packs, and portable chargers to 100%.',
      'Have flashlights, batteries, and a battery-powered radio ready.',
      "Stock non-perishable food that doesn't require cooking (canned goods, peanut butter, crackers).",
      'Keep a manual can opener — electric ones are useless during power outages.',
      'Refill any prescriptions before the storm hits.',
    ],
  },
  {
    title: 'Home & Power',
    icon: 'i-lucide-home',
    color: 'text-primary',
    items: [
      'Set thermostat to at least 68°F before the freeze — your home is a thermal battery.',
      'Seal drafts around windows and doors with towels, weatherstripping, or plastic film.',
      'Know where your breaker panel is and how to reset tripped breakers.',
      'If you have a fireplace, stock firewood and ensure the flue is open and functional.',
      'NEVER run generators, grills, or camp stoves indoors — carbon monoxide kills silently.',
    ],
  },
  {
    title: 'Vehicle Prep',
    icon: 'i-lucide-car',
    color: 'text-primary',
    items: [
      'Check antifreeze levels and tire pressure (drops ~1 PSI per 10°F).',
      'Keep an emergency kit in the car: blanket, water, snacks, phone charger, flashlight.',
      'Austin bridges and overpasses freeze first — avoid elevated roadways when icy.',
      'If you must drive on ice, go extremely slow — Austin drivers are not accustomed to winter conditions.',
    ],
  },
]

// ── During the Freeze ──────────────────────────────────────
const duringTips = [
  {
    icon: 'i-lucide-thermometer',
    tip: "Keep thermostat steady — don't lower it at night.",
    detail:
      'Resist the urge to save energy by lowering heat. Consistent warmth prevents pipe freezes. Keep all interior doors open so heat circulates evenly.',
  },
  {
    icon: 'i-lucide-droplets',
    tip: 'Drip both hot and cold faucets when temps hit 28°F.',
    detail:
      'A slow, steady drip — not a stream — keeps water moving in pipes. Focus on faucets along exterior walls. Open cabinet doors under sinks to let warm air reach pipes.',
  },
  {
    icon: 'i-lucide-plug-zap',
    tip: 'If power goes out: conserve heat immediately.',
    detail:
      'Close off unused rooms. Hang blankets over windows. Gather everyone into one room. Use body heat, sleeping bags, and layered clothing. Open faucets to a drip if pipes might freeze.',
  },
  {
    icon: 'i-lucide-flame',
    tip: 'Never use open flames for indoor heating.',
    detail:
      'Gas ovens, charcoal grills, propane heaters, and generators produce carbon monoxide. More Texans die from CO poisoning during freezes than from the cold itself. If you must use a fireplace, keep the flue open.',
  },
  {
    icon: 'i-lucide-car',
    tip: 'Stay off the roads unless absolutely necessary.',
    detail:
      'Austin has zero salt trucks and minimal sand supplies. Black ice is invisible on bridges and overpasses. If you must drive, keep a charged phone and emergency supplies in the car.',
  },
  {
    icon: 'i-lucide-phone',
    tip: 'Check on elderly neighbors and vulnerable people.',
    detail:
      'Elderly residents, people without cars, and those in older homes without insulation are most at risk. A quick text or knock could save a life.',
  },
]

// ── After the Freeze ───────────────────────────────────────
const afterSteps = [
  {
    icon: 'i-lucide-search',
    title: 'Inspect for pipe damage',
    detail:
      'Walk your property and check for wet spots, dripping sounds, or unusually low water pressure. Check under sinks, in the attic, and around the water heater. If you find a burst pipe, shut off the main water valve immediately.',
  },
  {
    icon: 'i-lucide-thermometer-snowflake',
    title: 'Thaw pipes slowly',
    detail:
      "If a pipe is frozen but hasn't burst, thaw it gradually with a hair dryer or warm towels. Never use an open flame. Start from the faucet end and work toward the frozen section. Keep the faucet open so melting water can flow out.",
  },
  {
    icon: 'i-lucide-leaf',
    title: 'Wait before pruning plants',
    detail:
      'Freeze-damaged plants often look dead but recover from the roots. Wait until mid-March to assess damage. Cut back dead growth only when you see new growth emerging at the base. Native plants like Mexican Honeysuckle and Esperanza almost always come back.',
  },
  {
    icon: 'i-lucide-file-text',
    title: 'Document damage for insurance',
    detail:
      "Photograph all damage before making repairs. Contact your homeowner's insurance — most policies cover burst pipe damage. Keep receipts for emergency repairs. File claims as soon as possible.",
  },
  {
    icon: 'i-lucide-wrench',
    title: 'Schedule a plumber early',
    detail:
      'After major freezes, plumbers are booked for weeks. Call immediately if you suspect any damage. Many Austin plumbers offer free freeze-damage inspections.',
  },
]

// ── Emergency Resources ────────────────────────────────────
const emergencyResources = [
  {
    name: 'Austin 3-1-1',
    description: 'Non-emergency city services, road conditions, and warming center locations.',
    url: 'https://www.austintexas.gov/department/311',
    phone: '3-1-1',
    icon: 'i-lucide-phone',
  },
  {
    name: 'Austin Energy Outage Map',
    description: 'Real-time power outage tracking and estimated restoration times.',
    url: 'https://outagemap.austinenergy.com/',
    icon: 'i-lucide-zap',
  },
  {
    name: 'Austin Water',
    description: 'Boil-water notices, water main breaks, and conservation alerts.',
    url: 'https://www.austintexas.gov/department/austin-water',
    phone: '512-972-1000',
    icon: 'i-lucide-droplets',
  },
  {
    name: 'City of Austin Emergency',
    description: 'Official emergency information, shelter locations, and road closures.',
    url: 'https://www.austintexas.gov/department/homeland-security-and-emergency-management',
    icon: 'i-lucide-shield',
  },
  {
    name: 'TxDOT Road Conditions',
    description: 'Statewide highway conditions, bridge closures, and travel advisories.',
    url: 'https://drivetexas.org/',
    icon: 'i-lucide-map',
  },
  {
    name: 'ERCOT Grid Status',
    description: 'Texas power grid supply/demand dashboard and conservation appeals.',
    url: 'https://www.ercot.com/',
    icon: 'i-lucide-activity',
  },
]

// ── FAQ ────────────────────────────────────────────────────
const faqItems = [
  {
    label: 'How cold does it get in Austin, Texas?',
    content:
      'Austin averages 15–25 freezing nights per year, mostly between December and February. Most are brief overnight freezes that thaw by mid-morning. Hard freeze events (below 28°F for 4+ hours) occur 2–5 times annually and pose the greatest risk to pipes and plants.',
  },
  {
    label: 'At what temperature should I drip my faucets?',
    content:
      'Austin Water recommends dripping faucets when temperatures drop below 28°F. Drip both hot and cold water lines at a slow, steady drip — not a stream. Focus on faucets served by pipes running through exterior walls, attics, or garages.',
  },
  {
    label: 'What happened during Winter Storm Uri?',
    content:
      "Winter Storm Uri hit Austin February 13–19, 2021, bringing record lows of -2°F and sustained sub-freezing temperatures for 120+ hours. The ERCOT grid collapsed, leaving millions without power for days. Austin experienced massive pipe bursts, boil-water notices lasting weeks, and over $18 billion in statewide damage. It was Texas's costliest natural disaster.",
  },
  {
    label: 'Where are warming centers during a freeze?',
    content:
      'The City of Austin activates warming centers at recreation centers, libraries, and community centers during severe cold. Locations are announced via Austin 3-1-1, the ATXFloods app, and the City of Austin emergency page. The Austin Convention Center has served as the primary large-scale shelter.',
  },
  {
    label: 'Should I leave my heat on when I leave?',
    content:
      'Yes. Keep your thermostat at 55°F or higher even when away. This prevents interior pipes from freezing. If you lose power, open cabinet doors under sinks and let all faucets drip to keep water moving through pipes.',
  },
  {
    label: 'Can my Austin plants survive a freeze?',
    content:
      "Most established native and adapted plants survive Austin freezes. Mexican Honeysuckle, Esperanza, lantana, and Pride of Barbados die back to the ground but return from roots in spring. Tropical plants (plumeria, bougainvillea, citrus) need to be covered or brought indoors. Wait until mid-March before pruning — dead foliage insulates the plant's crown.",
  },
]

// ── History facts ──────────────────────────────────────────
const freezeHistory = [
  {
    year: 'Feb 2021',
    event: 'Winter Storm Uri',
    detail:
      'Record low of -2°F. 120+ hours below freezing. 4.5 million Texans lost power. City-wide boil-water notice for 8 days.',
  },
  {
    year: 'Feb 2023',
    event: 'Ice Storm',
    detail:
      'Heavy freezing rain coated Central Texas. 150,000+ lost power in Travis County. Schools closed for a week.',
  },
  {
    year: 'Dec 2022',
    event: 'Winter Storm Elliott',
    detail:
      'Christmas Eve arctic blast dropped temps to 12°F. Wind chill near -5°F. Brief but intense — most power stayed on due to ERCOT grid improvements.',
  },
  {
    year: 'Jan 2018',
    event: 'Hard Freeze',
    detail:
      'Lows of 22°F for two consecutive nights. Significant plant damage across Central Texas. Widespread pipe bursts in older homes.',
  },
  {
    year: 'Feb 2011',
    event: 'Super Bowl Freeze',
    detail:
      'Rolling blackouts during Super Bowl XLV week. Lows of 17°F. First major sign of ERCOT grid vulnerability.',
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
            <UIcon name="i-lucide-snowflake" class="size-6" :class="category.color" />
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
            Freeze Prep Guide
          </h1>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-3xl leading-relaxed">
          Austin may be warm most of the year, but
          <strong class="text-default">arctic cold fronts</strong> — locally called
          <em>"blue northers"</em> — can drop temperatures 30–40°F in hours. After Winter Storm Uri
          showed what a prolonged freeze can do, every Austin household should be prepared. Here's
          your complete checklist.
        </p>
      </div>

      <!-- ══════ Before the Freeze ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5 animate-fade-up">
          Before the Freeze
        </h2>
        <div class="space-y-6">
          <div
            v-for="(section, idx) in prepSections"
            :key="section.title"
            class="rounded-2xl border border-default bg-default p-6 sm:p-8"
            :class="`animate-fade-up-delay-${Math.min(idx + 1, 3)}`"
          >
            <div class="flex items-center gap-3 mb-4">
              <UIcon :name="section.icon" class="size-5" :class="section.color" />
              <h3 class="text-lg font-bold">{{ section.title }}</h3>
            </div>
            <ul class="space-y-2.5">
              <li
                v-for="(item, i) in section.items"
                :key="i"
                class="flex items-start gap-2.5 text-sm"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-4 shrink-0 mt-0.5"
                  :class="category.color"
                />
                <span class="text-muted">{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ══════ During the Freeze ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          During the Freeze
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(tip, i) in duringTips"
            :key="i"
            class="rounded-xl border border-default bg-default p-5"
          >
            <div class="flex items-start gap-3">
              <UIcon :name="tip.icon" class="size-5 shrink-0 mt-0.5" :class="category.color" />
              <div>
                <p class="text-sm font-semibold mb-1.5">{{ tip.tip }}</p>
                <p class="text-xs text-muted leading-relaxed">{{ tip.detail }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ After the Freeze ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          After the Freeze
        </h2>
        <div class="space-y-3">
          <div
            v-for="(step, i) in afterSteps"
            :key="i"
            class="flex items-start gap-4 rounded-xl border border-default bg-default p-5"
          >
            <div
              class="flex items-center justify-center size-9 rounded-xl shrink-0"
              :class="category.bgColor"
            >
              <UIcon :name="step.icon" class="size-4.5" :class="category.color" />
            </div>
            <div>
              <h3 class="text-sm font-bold mb-1">{{ step.title }}</h3>
              <p class="text-xs text-muted leading-relaxed">{{ step.detail }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ Emergency Resources ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Emergency Resources
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ULink
            v-for="resource in emergencyResources"
            :key="resource.name"
            :href="resource.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-start gap-3 rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <UIcon
              :name="resource.icon"
              class="size-5 shrink-0 mt-0.5 group-hover:text-primary transition-colors"
              :class="category.color"
            />
            <div class="min-w-0">
              <h3 class="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors">
                {{ resource.name }}
                <UIcon
                  name="i-lucide-external-link"
                  class="inline size-3 ml-1 text-dimmed group-hover:text-primary"
                />
              </h3>
              <p class="text-xs text-muted leading-relaxed">{{ resource.description }}</p>
              <p v-if="resource.phone" class="text-xs text-dimmed mt-1">📞 {{ resource.phone }}</p>
            </div>
          </ULink>
        </div>
      </section>

      <!-- ══════ Freeze History ══════ -->
      <section class="mb-10">
        <div class="rounded-2xl border border-default bg-default p-6 sm:p-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-5">
            Austin Freeze History
          </h2>
          <div class="space-y-4">
            <div
              v-for="event in freezeHistory"
              :key="event.year"
              class="flex items-start gap-4 pb-4 border-b border-default last:border-0 last:pb-0"
            >
              <span
                class="text-xs font-bold uppercase tracking-wide whitespace-nowrap pt-0.5 shrink-0 w-20"
                :class="category.color"
              >
                {{ event.year }}
              </span>
              <div>
                <h3 class="text-sm font-semibold mb-1">{{ event.event }}</h3>
                <p class="text-xs text-muted leading-relaxed">{{ event.detail }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════ FAQ ══════ -->
      <section class="mb-10">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Frequently Asked Questions
        </h2>
        <UAccordion :items="faqItems" />
      </section>

      <!-- ══════ More in Weather ══════ -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Weather</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/weather/${app.slug}/`"
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
