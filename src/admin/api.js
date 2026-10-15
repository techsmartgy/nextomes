// Admin API client. In dev the Vite middleware serves these paths (see vite.config.js);
// on Netlify they're rewritten to the functions (see netlify.toml).
const BASE = ''
const TOKEN_KEY = 'nxAdminToken'

export class AuthError extends Error {}

export function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function clearToken() {
  try { sessionStorage.removeItem(TOKEN_KEY) } catch { /* storage unavailable */ }
}

async function readJson(res) {
  const data = await res.json().catch(() => null)
  if (data === null) throw new Error(`Unexpected response from the server (${res.status}). If you're running locally, restart the dev server.`)
  return data
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await readJson(res)
  if (!res.ok || !data.token) throw new Error(data.message || `Sign-in failed (${res.status})`)
  try { sessionStorage.setItem(TOKEN_KEY, data.token) } catch { /* session lasts until reload */ }
}

export async function verifySession() {
  const token = getToken()
  if (!token) return false
  const res = await fetch(`${BASE}/admin-session`, { headers: { Authorization: `Bearer ${token}` } })
  return res.ok
}

export async function fetchRequests(range) {
  const res = await fetch(`${BASE}/admin-requests?range=${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await readJson(res)
  if (res.status === 401) throw new AuthError(data.message)
  if (!res.ok) throw new Error(data.message || `Could not load requests (${res.status})`)
  return data
}

// changes: { status?: 'open' | 'closed', archived?: boolean }
export async function updateRequest(id, changes) {
  const res = await fetch(`${BASE}/admin-requests`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ id, ...changes }),
  })
  const data = await readJson(res)
  if (res.status === 401) throw new AuthError(data.message)
  if (!res.ok) throw new Error(data.message || `Could not update the request (${res.status})`)
  return data.request
}
