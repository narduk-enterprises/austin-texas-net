import { z } from 'zod'
import { createUser, createSession, getUserByEmail, signJwt, setAuthCookie, toPublicUser } from '../../utils/auth'
import { enforceRateLimit } from '../../utils/rateLimit'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  // Rate limit: 5 signup attempts per minute per IP
  await enforceRateLimit(event, 'auth-signup', 5, 60_000)

  const body = await readBody(event)
  const parsed = signupSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error?.issues[0]?.message || 'Invalid input' })
  }

  const { email, password, name } = parsed.data

  // Check for existing user
  const existing = await getUserByEmail(email)
  if (existing) {
    throw createError({ statusCode: 409, message: 'An account with this email already exists' })
  }

  const user = await createUser(email, password, name)
  await createSession(user.id)

  // Sign JWT and set cookie
  const jwt = await signJwt(user)
  setAuthCookie(event, jwt)

  return { user: toPublicUser(user) }
})
