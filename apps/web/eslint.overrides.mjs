/**
 * App-specific ESLint rule overrides for austin-texas.net
 *
 * Disables guardrail rules this app isn't ready for yet.
 * Remove overrides as features are implemented.
 */
export default [
  // ── SEO guardrails — pages don't have useSeo/schema yet ──
  {
    files: ['app/pages/**/*.vue'],
    rules: {
      'nuxt-guardrails/require-use-seo-on-pages': 'off',
      'nuxt-guardrails/require-schema-on-pages': 'off',
    },
  },

  // ── Admin pages use $fetch intentionally in event handlers ──
  {
    files: ['app/pages/admin/**/*.vue'],
    rules: {
      'nuxt-guardrails/no-raw-fetch': 'off',
      'nuxt-guardrails/require-csrf-header-on-mutations': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ── Admin composables use $fetch for mutations (not SSR data-fetching) ──
  {
    files: ['app/composables/useAdminData.ts', 'app/composables/useAuth.ts'],
    rules: {
      'nuxt-guardrails/no-raw-fetch': 'off',
      'nuxt-guardrails/require-csrf-header-on-mutations': 'off',
    },
  },

  // ── Template complexity — many pages use inline expressions (address later) ──
  {
    files: ['app/pages/**/*.vue', 'app/components/**/*.vue'],
    rules: {
      'vue-official/no-template-complex-expressions': 'off',
    },
  },

  // ── Utility composables without "use" prefix are intentional ──
  {
    files: ['app/composables/useSeverity.ts', 'app/composables/useAustinSunset.ts'],
    rules: {
      'vue-official/require-use-prefix-for-composables': 'off',
    },
  },

  // ── MapKit JS has no TypeScript declarations ──
  {
    files: [
      'app/components/AppMapKit.vue',
      'app/components/BatViewingSpotsMap.client.vue',
      'app/components/map/**/*.vue',
      'app/composables/useMapKit.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'nuxt-guardrails/no-raw-fetch': 'off',
      'nuxt-guardrails/no-ssr-dom-access': 'off',
      'vue-official/no-composable-conditional-hooks': 'off',
    },
  },

  // ── Login page uses $fetch for auth flows (user-triggered) ──
  {
    files: ['app/pages/login.vue'],
    rules: {
      'nuxt-guardrails/no-raw-fetch': 'off',
      'nuxt-guardrails/require-csrf-header-on-mutations': 'off',
      'nuxt-guardrails/prefer-use-seo-over-bare-meta': 'off',
    },
  },

  // ── Pages that use useHead() for custom JSON-LD schema (not covered by usePageSeo) ──
  {
    files: [
      'app/pages/events/bat-fest.vue',
      'app/pages/outdoors/bluebonnets.vue',
    ],
    rules: {
      'nuxt-guardrails/prefer-use-seo-over-bare-meta': 'off',
    },
  },

  // ── Server API files — Apple Maps/external API responses use dynamic shapes ──
  {
    files: [
      'server/api/admin/**/*.ts',
      'server/api/map-spots/**/*.ts',
      'server/api/neighborhoods/**/*.ts',
      'server/api/indexnow/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
