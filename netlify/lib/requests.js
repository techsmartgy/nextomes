import { createClient } from '@supabase/supabase-js'
import { bearerToken, isConfigured, verifyToken } from './adminAuth.js'

// Admin requests API, shared by netlify/functions/admin-requests.js and the Vite dev
// middleware. Uses the Supabase secret key, so it must only ever run server-side.

const RANGES = { 7: 7, 28: 28, 90: 90, all: null }
const DAY_MS = 24 * 60 * 60 * 1000

class NoRealtime {
  constructor() {
    throw new Error('Realtime is not used by the admin requests API.')
  }
}

function supabaseAdmin(env) {
  return createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Without a transport, supabase-js looks up a native WebSocket when the client is
    // created, which throws on older Node runtimes. Realtime is never used here.
    realtime: { transport: NoRealtime },
  })
}

// PATCH body { id, status?: 'open' | 'closed', archived?: boolean } → { request }
async function updateRequest(db, body) {
  let input
  try {
    input = JSON.parse(body || '{}')
  } catch {
    return { statusCode: 400, body: { success: false, message: 'Invalid JSON body.' } }
  }
  const { id, status, archived } = input
  const badStatus = status !== undefined && !['open', 'closed'].includes(status)
  const badArchived = archived !== undefined && typeof archived !== 'boolean'
  if (typeof id !== 'string' || badStatus || badArchived || (status === undefined && archived === undefined)) {
    return { statusCode: 400, body: { success: false, message: 'Expected { id, status?: "open" | "closed", archived?: boolean }.' } }
  }
  const now = new Date().toISOString()
  const changes = {}
  if (status !== undefined) Object.assign(changes, { status, closed_at: status === 'closed' ? now : null })
  if (archived !== undefined) changes.archived_at = archived ? now : null
  const { data, error } = await db.from('assessment_requests')
    .update(changes)
    .eq('id', id).select().maybeSingle()
  if (error) return { statusCode: 500, body: { success: false, message: error.message } }
  if (!data) return { statusCode: 404, body: { success: false, message: 'Request not found.' } }
  return { statusCode: 200, body: { success: true, request: data } }
}

// DELETE body { id } → permanently removes the request
async function deleteRequest(db, body) {
  let id
  try {
    ({ id } = JSON.parse(body || '{}'))
  } catch {
    return { statusCode: 400, body: { success: false, message: 'Invalid JSON body.' } }
  }
  if (typeof id !== 'string') return { statusCode: 400, body: { success: false, message: 'Expected { id }.' } }
  const { data, error } = await db.from('assessment_requests').delete().eq('id', id).select('id').maybeSingle()
  if (error) return { statusCode: 500, body: { success: false, message: error.message } }
  if (!data) return { statusCode: 404, body: { success: false, message: 'Request not found.' } }
  return { statusCode: 200, body: { success: true } }
}

// GET → { requests, previousCount } for the range ('7' | '28' | '90' | 'all'); PATCH → updateRequest; DELETE → deleteRequest
export async function handleRequests(env, { method = 'GET', authHeader, range, body }) {
  if (!isConfigured(env) || !verifyToken(env, bearerToken(authHeader))) {
    return { statusCode: 401, body: { success: false, message: 'Not signed in.' } }
  }
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    return { statusCode: 500, body: { success: false, message: 'Supabase is not configured. Set SUPABASE_SECRET_KEY.' } }
  }

  const db = supabaseAdmin(env)
  if (method === 'PATCH') return updateRequest(db, body)
  if (method === 'DELETE') return deleteRequest(db, body)
  if (method !== 'GET') return { statusCode: 405, body: { success: false, message: 'Method not allowed.' } }

  const key = range in RANGES ? range : '28'
  const days = RANGES[key]

  let query = db.from('assessment_requests').select('*').order('created_at', { ascending: false }).limit(5000)
  let previousCount = null
  if (days) {
    const since = new Date(Date.now() - days * DAY_MS)
    const before = new Date(since.getTime() - days * DAY_MS)
    query = query.gte('created_at', since.toISOString())
    const prev = await db.from('assessment_requests').select('id', { count: 'exact', head: true })
      .gte('created_at', before.toISOString()).lt('created_at', since.toISOString())
    if (prev.error) return { statusCode: 500, body: { success: false, message: prev.error.message } }
    previousCount = prev.count
  }

  const { data, error } = await query
  if (error) return { statusCode: 500, body: { success: false, message: error.message } }
  return { statusCode: 200, body: { success: true, range: key, requests: data, previousCount } }
}
