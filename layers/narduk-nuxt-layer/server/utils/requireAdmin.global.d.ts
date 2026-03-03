import type { H3Event } from 'h3'

declare global {
  function requireAdmin(event: H3Event): Promise<{ id: string; email: string; isAdmin: boolean }>
}

export {}
