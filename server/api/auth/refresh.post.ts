import { getAuthUser, getUserById, signJwt, setAuthCookie, toPublicUser } from '../../utils/auth'

/**
 * Refresh the JWT cookie with the latest user data from D1.
 *
 * Ensures the JWT reflects the latest user state
 * (e.g., updated isAdmin flag) before using protected features.
 */
export default defineEventHandler(async (event) => {
  const jwtUser = await getAuthUser(event)
  if (!jwtUser) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  // Fetch fresh user data from D1
  const user = await getUserById(jwtUser.sub)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // Re-sign JWT with latest user data and set cookie
  const jwt = await signJwt(user)
  setAuthCookie(event, jwt)

  return { user: toPublicUser(user) }
})
