import { getAuthUser } from './auth'
import type { H3Event } from 'h3'

/**
 * Require the current user to be an authenticated admin.
 * Throws 401 if not authenticated, 403 if not admin.
 */
export async function requireAdmin(event: H3Event) {
  const user = await getAuthUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }
  if (!user.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }
  return user
}
