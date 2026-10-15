import process from 'node:process'
import { handleRequests } from '../lib/requests.js'

export const handler = async function (event) {
  const { statusCode, body } = await handleRequests(process.env, {
    method: event.httpMethod,
    authHeader: event.headers.authorization,
    range: event.queryStringParameters?.range,
    body: event.body,
  })
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}
