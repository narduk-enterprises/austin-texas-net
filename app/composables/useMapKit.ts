/**
 * useMapKit — lazy-load Apple MapKit JS and initialize with a JWT token.
 *
 * Usage:
 *   const { mapkitReady, mapkitLib } = useMapKit()
 *   watch(mapkitReady, (ready) => { if (ready) { ... } })
 *
 * SSR-safe: returns immediately with ready = false on the server.
 * Token is read from runtimeConfig.public.mapkitToken (injected via Doppler).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const mapkit: any

const MAPKIT_SRC = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js'

/** Shared singleton so multiple components don't double-load */
let initPromise: Promise<typeof mapkit> | null = null

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${MAPKIT_SRC}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = MAPKIT_SRC
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load MapKit JS'))
    document.head.appendChild(script)
  })
}

export function useMapKit() {
  const ready = ref(false)
  const error = ref<string | null>(null)
  const runtimeConfig = useRuntimeConfig()
  const token = runtimeConfig.public.mapkitToken as string

  if (import.meta.server) {
    return { mapkitReady: readonly(ready), mapkitError: readonly(error) }
  }

  if (!token) {
    error.value = 'No MapKit JS token configured. Set MAPKIT_TOKEN in your environment.'
    return { mapkitReady: readonly(ready), mapkitError: readonly(error) }
  }

  if (!initPromise) {
    initPromise = loadScript().then(() => {
      mapkit.init({
        authorizationCallback: (done: (token: string) => void) => done(token),
      })
      return mapkit
    })
  }

  initPromise
    .then(() => {
      ready.value = true
      document.documentElement.dataset.mapkitLoaded = 'true'
    })
    .catch((err) => {
      error.value = err instanceof Error ? err.message : 'MapKit JS init failed'
    })

  return { mapkitReady: readonly(ready), mapkitError: readonly(error) }
}
