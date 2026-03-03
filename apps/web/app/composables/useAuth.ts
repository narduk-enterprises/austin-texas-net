/**
 * Auth composable for Austin-Texas.net.
 *
 * Provides reactive `user`, `loggedIn`, and helper methods (`login`, `signup`,
 * `logout`, `refresh`). State is shared across the app via `useState`.
 *
 * Key: During SSR, $fetch to same-origin API routes must forward the
 * browser's cookies via `useRequestHeaders()`, otherwise the server-side
 * fetch won't have the auth cookie and the user will appear unauthenticated.
 */

interface AuthUser {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const initialized = useState<boolean>('auth-initialized', () => false)

  const loggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => !!user.value?.isAdmin)

  /**
   * Fetch the current user from /api/auth/me.
   * Forwards cookies during SSR so the server-side request
   * has access to the auth cookie.
   */
  async function refresh() {
    try {
      // Forward browser cookies during SSR
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const res = await $fetch<{ user: AuthUser | null }>('/api/auth/me', { headers })
      user.value = res.user ?? null
    } catch {
      user.value = null
    }
    initialized.value = true
  }

  /**
   * Ensure auth state is loaded at least once.
   * Safe to call multiple times — only fetches on first call.
   */
  async function ensureLoaded() {
    if (!initialized.value) {
      await refresh()
    }
  }

  async function login(email: string, password: string) {
    const res = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = res.user
    initialized.value = true
    return res.user
  }

  async function signup(email: string, password: string, name?: string) {
    const res = await $fetch<{ user: AuthUser }>('/api/auth/signup', {
      method: 'POST',
      body: { email, password, name },
    })
    user.value = res.user
    initialized.value = true
    return res.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST', body: {} })
    user.value = null
  }

  return {
    user: readonly(user) as Readonly<Ref<AuthUser | null>>,
    loggedIn,
    isAdmin,
    login,
    signup,
    logout,
    refresh,
    ensureLoaded,
  }
}
