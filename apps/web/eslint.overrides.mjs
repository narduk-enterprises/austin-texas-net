/**
 * App-level ESLint overrides for austin-texas.net.
 *
 * These are MINIMAL, justified exceptions — not ignore rules.
 * Each block documents WHY the override exists.
 *
 * ⚠️  Rule customizations live HERE, not in the shared plugin source.
 *     The template sync CI overwrites packages/eslint-config/ regularly.
 */
export default [
  // ─── Template expression complexity tuning ───────────────
  // The shared default is maxCallArgs:1. This app's templates use
  // 2-arg utility calls (formatStatValue, emit) that are safe.
  {
    files: ['app/**/*.vue'],
    rules: {
      'vue-official/no-template-complex-expressions': ['warn', {
        maxCallArgs: 2,
        allowedFunctions: [
          'formatPrice', 'formatChange', 'formatPercent', 'formatDate',
          'formatCurrency', 'formatNumber', 'formatStatValue',
          'toLocaleString', 'toString', 'toFixed',
          '$emit', 'emit',
        ],
      }],
    },
  },

  // ─── SEO composable naming ───────────────────────────────
  // This app uses usePageSeo() (from the layer) instead of useSeo().
  // The shared rule only recognizes useSeo(). Turn it off for all
  // pages — the app's usePageSeo does the same job.
  {
    files: ['app/pages/**/*.vue'],
    rules: {
      'nuxt-guardrails/require-use-seo-on-pages': 'off',
    },
  },

  // ─── Schema.org composable naming ────────────────────────
  // This app uses useSchemaOrg() from @unhead/schema-org.
  // The shared rule only recognizes useWebPageSchema, etc.
  // Turn off and rely on the app's own useSchemaOrg pattern.
  {
    files: ['app/pages/**/*.vue'],
    rules: {
      'nuxt-guardrails/require-schema-on-pages': 'off',
    },
  },

  // ─── Admin pages: no public SEO needed ───────────────────
  // Admin pages are behind auth and should not have public SEO.
  {
    files: ['app/pages/admin/**/*.vue'],
    rules: {
      'vue-official/no-template-complex-expressions': 'off',
    },
  },

  // ─── Admin composables: event-handler $fetch ─────────────
  // useAdminData.ts and useAuth.ts use $fetch for user-triggered
  // mutations (button clicks), not SSR data-fetching.
  {
    files: [
      'app/composables/useAdminData.ts',
      'app/composables/useAuth.ts',
    ],
    rules: {
      'nuxt-guardrails/no-raw-fetch': 'off',
    },
  },

  // ─── Admin page $fetch in event handlers ─────────────────
  {
    files: [
      'app/pages/admin/apple-maps.vue',
      'app/pages/admin/content-pipeline.vue',
      'app/pages/admin/grid-crawler.vue',
      'app/pages/admin/gsc.vue',
      'app/pages/admin/neighborhoods.vue',
      'app/pages/admin/radar.vue',
      'app/pages/admin/posthog.vue',
    ],
    rules: {
      'nuxt-guardrails/no-raw-fetch': 'off',
    },
  },

  // ─── MapKit JS: no TypeScript declarations ───────────────
  // Apple's MapKit JS SDK has zero TypeScript type declarations.
  {
    files: [
      'app/components/AppMapKit.vue',
      'app/components/BatViewingSpotsMap.client.vue',
      'app/composables/useMapKit.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'nuxt-guardrails/no-raw-fetch': 'off',
      'nuxt-guardrails/no-ssr-dom-access': 'off',
      'vue-official/no-composable-conditional-hooks': 'off',
    },
  },

  // ─── Admin pages: external API response typing ───────────
  {
    files: [
      'app/pages/admin/apple-maps.vue',
      'app/pages/admin/grid-crawler.vue',
      'server/api/admin/apple-maps-test.post.ts',
      'server/api/map-spots/ingest.post.ts',
      'server/api/neighborhoods/ingest.post.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ─── JSON-LD / robots: legitimate useHead/useSeoMeta ─────
  // These pages use useHead() for structured data (JSON-LD)
  // or useSeoMeta() for robots directives — features that
  // usePageSeo() doesn't support.
  {
    files: [
      'app/pages/events/bat-fest.vue',
      'app/pages/outdoors/bluebonnets.vue',
      'app/pages/login.vue',
    ],
    rules: {
      'nuxt-guardrails/prefer-use-seo-over-bare-meta': 'off',
    },
  },
]
