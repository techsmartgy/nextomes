import process from 'node:process'
import { handleSession } from '../lib/adminAuth.js'

export const handler = async function (event) {
  const { statusCode, body } = handleSession(process.env, event.headers.authorization)
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}
