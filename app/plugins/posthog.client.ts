/**
 * PostHog analytics plugin — client-side only.
 * Captures page views automatically and exposes window.posthog for custom events.
 */
export default defineNuxtPlugin({
  name: 'posthog',
  enforce: 'post',
  async setup() {
    const runtimeConfig = useRuntimeConfig()
    const posthogKey = runtimeConfig.public.posthogPublicKey as string | undefined

    // Only load in production with a valid key
    if (!posthogKey || import.meta.server) return

    const posthog = await import('posthog-js').then((m) => m.default)

    posthog.init(posthogKey, {
      api_host: 'https://us.i.posthog.com',
      capture_pageview: false, // We capture manually for SPA navigation
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      autocapture: false,
      disable_session_recording: true, // Disable until explicitly enabled in PostHog UI
      disable_surveys: true,
    })

    // Tag every event with the app name so we can filter in the shared PostHog project
    posthog.register({ app: 'austin-texas-net' })

    // Capture initial pageview since Nuxt router.afterEach does not fire on SSR hydration
    nextTick(() => {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
      })
    })

    // Capture page views on subsequent route changes
    const router = useRouter()
    router.afterEach((to) => {
      nextTick(() => {
        posthog.capture('$pageview', {
          $current_url: window.location.origin + to.fullPath,
        })
      })
    })
  },
})
