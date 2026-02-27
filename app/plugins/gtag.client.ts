/**
 * Google Analytics 4 (gtag.js) — client-only plugin.
 * Deferred: loads after first user interaction or 3s idle timeout
 * to avoid blocking initial render (saves ~90KB from critical path).
 */

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}
export default defineNuxtPlugin({
  name: 'gtag',
  parallel: true,
  setup() {
    const config = useRuntimeConfig()
    const id = config.public.gaMeasurementId as string

    if (!id || typeof window === 'undefined') return

    let loaded = false

    function loadGA() {
      if (loaded) return
      loaded = true

      // Remove interaction listeners
      ;['click', 'scroll', 'keydown', 'touchstart'].forEach((evt) =>
        document.removeEventListener(evt, loadGA, { capture: true }),
      )

      // Load gtag.js
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
      document.head.appendChild(script)

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || []
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', id, { send_page_view: false })

      // Capture the current page view immediately on load
      gtag('event', 'page_view', {
        page_path: window.location.pathname,
        page_location: window.location.href,
      })
    }

    // Trigger on first interaction
    ;['click', 'scroll', 'keydown', 'touchstart'].forEach((evt) =>
      document.addEventListener(evt, loadGA, { capture: true, once: true, passive: true }),
    )

    // Or after 3s idle fallback
    setTimeout(loadGA, 3000)

    // SPA pageview tracking (queues if GA not yet loaded)
    const router = useRouter()
    router.afterEach((to) => {
      nextTick(() => {
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push([
          'event',
          'page_view',
          {
            page_path: to.fullPath,
            page_location: window.location.origin + to.fullPath,
          },
        ])
      })
    })
  },
})
