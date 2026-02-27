import { SignJWT, jwtVerify } from 'jose'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { useDatabase, users, sessions } from './database'
import type { User } from '../database/schema'

// ─── Constants ──────────────────────────────────────────────
const SESSION_DURATION_DAYS = 30
const COOKIE_NAME = 'atx_session'
const PBKDF2_ITERATIONS = 100_000

// ─── Password Hashing (Web Crypto PBKDF2) ───────────────────
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const hashHex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false

  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )
  const computedHex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return computedHex === hashHex
}

// ─── User Operations ────────────────────────────────────────
export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const db = useDatabase()
  const passwordHash = await hashPassword(password)
  const [user] = await db
    .insert(users)
    .values({ email: email.toLowerCase().trim(), passwordHash, name: name || null })
    .returning()
  return user!
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = useDatabase()
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  })
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = useDatabase()
  return db.query.users.findFirst({
    where: eq(users.id, id),
  })
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user || !user.passwordHash) return null
  const valid = await verifyPassword(user.passwordHash, password)
  return valid ? user : null
}

export async function getUserByAppleSub(appleSub: string): Promise<User | undefined> {
  const db = useDatabase()
  return db.query.users.findFirst({
    where: eq(users.appleSub, appleSub),
  })
}

export async function createUserFromApple(
  appleSub: string,
  email: string,
  name?: string,
): Promise<User> {
  const db = useDatabase()
  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      appleSub,
      name: name || null,
    })
    .returning()
  return user!
}

// ─── Session / JWT ──────────────────────────────────────────
function getJwtSecret(): Uint8Array {
  const config = useRuntimeConfig()
  return new TextEncoder().encode(config.jwtSecret)
}

export interface JwtPayload {
  sub: string // user ID
  email: string
  name: string | null
  isAdmin: boolean
}

export async function signJwt(user: User): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .setIssuer('austin-texas-net')
    .sign(getJwtSecret())
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: 'austin-texas-net',
    })
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: (payload.name as string | null) ?? null,
      isAdmin: (payload.isAdmin as boolean) ?? false,
    }
  } catch {
    return null
  }
}

// ─── Session Persistence (for revocation) ───────────────────
export async function createSession(userId: string): Promise<string> {
  const db = useDatabase()
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_DAYS * 24 * 60 * 60
  const [session] = await db.insert(sessions).values({ userId, expiresAt }).returning()
  return session!.id
}

// ─── Cookie Helpers ─────────────────────────────────────────
export function setAuthCookie(event: H3Event, jwt: string) {
  const config = useRuntimeConfig()
  const isProd = process.env.NODE_ENV === 'production' && config.public.appUrl.startsWith('https')

  setCookie(event, COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, {
    path: '/',
  })
}

export function getAuthCookie(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME)
}

export async function getAuthUser(event: H3Event): Promise<JwtPayload | null> {
  const token = getAuthCookie(event)
  if (!token) return null
  return verifyJwt(token)
}

// ─── Public user shape (safe to expose) ─────────────────────
export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
  }
}
