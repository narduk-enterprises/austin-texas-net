/**
 * App-level ESLint overrides for austin-texas.net.
 *
 * These are MINIMAL, justified exceptions — not ignore rules.
 * Each block documents WHY the override exists.
 */
export default [
  // ─── Admin pages: no public SEO needed ───────────────────
  // Admin pages are behind auth and should not have public SEO
  // or schema.org markup. The guardrail rules are for public pages.
  {
    files: ['app/pages/admin/**/*.vue'],
    rules: {
      'nuxt-guardrails/require-use-seo-on-pages': 'off',
      'nuxt-guardrails/require-schema-on-pages': 'off',
      'vue-official/no-template-complex-expressions': 'off',
    },
  },

  // ─── Admin composables: event-handler $fetch ─────────────
  // useAdminData.ts and useAuth.ts use $fetch for user-triggered
  // mutations (button clicks), not SSR data-fetching.
  // The no-raw-fetch rule targets SSR hydration issues, which
  // don't apply to event handlers.
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
  // Admin pages use $fetch in click handlers for one-off API calls.
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
  // These files necessarily use `any` for MapKit API objects.
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
  // Server API routes that call Apple Maps / external APIs
  // receive dynamic JSON responses. Typing as Record<string, unknown>
  // is the fix, but some complex response parsing still needs `any`.
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

  // ─── Pages without Schema.org ─────────────────────────────
  // Login page is noindex/nofollow — no Schema.org needed.
  // bat-fest uses custom JSON-LD via useHead, not useSchemaOrg.
  {
    files: [
      'app/pages/login.vue',
      'app/pages/events/bat-fest.vue',
    ],
    rules: {
      'nuxt-guardrails/require-schema-on-pages': 'off',
    },
  },
]
