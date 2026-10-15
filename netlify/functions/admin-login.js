import process from 'node:process'
import { handleLogin } from '../lib/adminAuth.js'

export const handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, message: 'Method not allowed.' }) }
  }

  const { statusCode, body } = handleLogin(process.env, event.body)
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}
