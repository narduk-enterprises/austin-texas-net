import {
  getUserByAppleSub,
  getUserByEmail,
  createUserFromApple,
  signJwt,
  setAuthCookie,
  createSession,
} from '../../utils/auth'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { z } from 'zod'

const bodySchema = z.object({
  id_token: z.string().min(1, 'Missing id_token from Apple'),
  state: z.string().optional(),
  user: z.any().optional(),
})

/**
 * Apple Sign In server-side callback — receives form_post from Apple.
 *
 * Apple posts: id_token, code, state, and optionally user (JSON) on first sign-in.
 * We verify the id_token via Apple's JWKS, find/create the user, set the JWT cookie,
 * and redirect to the original `state` URL.
 */
export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))
  const { id_token, state, user: appleUserRaw } = body

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

  // Parse user info (only sent on first sign-in)
  let appleUser: { name?: { firstName?: string; lastName?: string } } | null = null
  if (appleUserRaw) {
    try {
      appleUser = typeof appleUserRaw === 'string' ? JSON.parse(appleUserRaw) : appleUserRaw
    } catch {
      /* Apple may send malformed user JSON on repeat sign-ins */
    }
  }
  const name = appleUser?.name
    ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim()
    : undefined

  if (!appleSub) {
    throw createError({ statusCode: 400, message: 'Invalid Apple response: missing sub' })
  }

  // Find or create user
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

  // Create session and set JWT cookie
  await createSession(user.id)
  const jwt = await signJwt(user)
  setAuthCookie(event, jwt)

  // Redirect to the original page or home
  const redirectTo = state && state !== '/' ? state : '/'
  return sendRedirect(event, redirectTo, 302)
})
