import type { LiveStatus } from '~/types/live'

/**
 * useLiveData — generic factory for client-side live data fetching.
 *
 * Wraps `useFetch` with `server: false` and `lazy: true`, and provides
 * a standardized { value, updatedAt, status } return shape.
 *
 * @param url - API endpoint to fetch from
 * @param transform - Maps the raw API response to the desired data shape
 */
export function useLiveData<TApi extends { updatedAt: string }, TData>(
  url: string,
  transform: (raw: TApi) => TData,
) {
  const {
    data,
    status: fetchStatus,
    refresh,
  } = useFetch<TApi>(url, {
    server: false,
    lazy: true,
  })

  const value = computed<TData | null>(() => {
    const raw = data.value as TApi | null
    if (!raw) return null
    return transform(raw)
  })

  const updatedAt = computed(() => (data.value as TApi | null)?.updatedAt ?? null)

  const status = computed<LiveStatus>(() => {
    if (fetchStatus.value === 'pending') return 'pending'
    if (fetchStatus.value === 'error') return 'error'
    if (fetchStatus.value === 'success') return 'success'
    return 'idle'
  })

  return { value, updatedAt, status, refresh }
}
