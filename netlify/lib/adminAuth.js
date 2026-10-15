import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'

// Shared by the Netlify admin functions and the Vite dev middleware.
// Credentials and the signing secret come from ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SESSION_SECRET.

const SESSION_TTL_MS = 8 * 60 * 60 * 1000

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function isConfigured(env) {
  return Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD && env.ADMIN_SESSION_SECRET)
}

export function checkCredentials(env, username, password) {
  // Evaluate both so a wrong username takes as long as a wrong password.
  const userOk = safeEqual(username || '', env.ADMIN_USERNAME)
  const passOk = safeEqual(password || '', env.ADMIN_PASSWORD)
  return userOk && passOk
}

export function createToken(env) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload, env.ADMIN_SESSION_SECRET)}`
}

export function verifyToken(env, token) {
  const [payload, signature] = String(token || '').split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload, env.ADMIN_SESSION_SECRET))) return false

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

export function bearerToken(authHeader) {
  const match = /^Bearer (.+)$/.exec(authHeader || '')
  return match ? match[1] : ''
}

// Framework-agnostic handlers returning { statusCode, body }.
export function handleLogin(env, body) {
  if (!isConfigured(env)) return { statusCode: 500, body: { success: false, message: 'Admin login is not configured.' } }

  let creds
  try {
    creds = JSON.parse(body || '{}')
  } catch {
    return { statusCode: 400, body: { success: false, message: 'Invalid JSON body.' } }
  }

  if (!checkCredentials(env, creds.username, creds.password)) {
    return { statusCode: 401, body: { success: false, message: 'Invalid user ID or password.' } }
  }
  return { statusCode: 200, body: { success: true, token: createToken(env) } }
}

export function handleSession(env, authHeader) {
  if (!isConfigured(env) || !verifyToken(env, bearerToken(authHeader))) {
    return { statusCode: 401, body: { success: false, message: 'Not signed in.' } }
  }
  return { statusCode: 200, body: { success: true } }
}
