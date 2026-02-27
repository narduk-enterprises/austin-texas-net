import {
  getUserByAppleSub,
  getUserByEmail,
  createUserFromApple,
  signJwt,
  setAuthCookie,
  createSession,
  toPublicUser,
} from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rateLimit'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import { z } from 'zod'

const bodySchema = z.object({
  id_token: z.string().min(1, 'Missing id_token from Apple'),
  user: z.any().optional(),
})

/**
 * Apple Sign In — client-side flow handler.
 *
 * The client sends the Apple `id_token` (JWT) after Apple's JS SDK flow.
 * We verify the id_token against Apple's JWKS, extract user info,
 * and either find or create the user.
 */
export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, 'auth-apple', 10, 60_000)

  const body = bodySchema.parse(await readBody(event))
  const { id_token, user: appleUser } = body

  // Verify Apple id_token via JWKS
  const JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))

  let payload: { sub?: string; email?: string; [key: string]: unknown }
  try {
    const config = useRuntimeConfig()
    const result = await jwtVerify(id_token, JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: config.appleClientId,
    })
    payload = result.payload as typeof payload
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid Apple id_token' })
  }

  const appleSub = payload.sub ?? ''
  const email = payload.email ?? ''
  // Apple only sends user name on first sign-in
  const name = appleUser?.name
    ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim()
    : undefined

  if (!appleSub) {
    throw createError({ statusCode: 400, message: 'Invalid Apple response: missing sub' })
  }

  // Find existing user by Apple sub, or by email, or create new
  let user = await getUserByAppleSub(appleSub)

  if (!user && email) {
    user = await getUserByEmail(email)
  }

  if (!user) {
    if (!email) {
      throw createError({ statusCode: 400, message: 'Email is required for account creation' })
    }
    user = await createUserFromApple(appleSub, email, name)
  }

  // Create session and JWT
  await createSession(user.id)
  const jwt = await signJwt(user)
  setAuthCookie(event, jwt)

  return { user: toPublicUser(user) }
})
