import { getAuthUser, getUserById, toPublicUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const jwtUser = await getAuthUser(event)

  if (!jwtUser) {
    return { user: null }
  }

  // Fetch fresh user data from D1
  const user = await getUserById(jwtUser.sub)

  if (!user) {
    return { user: null }
  }

  return { user: toPublicUser(user) }
})
