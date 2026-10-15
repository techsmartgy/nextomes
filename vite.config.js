i
mport { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleLogin, handleSession } from './netlify/lib/adminAuth.js'
import { handleRequests } from './netlify/lib/requests.js'

// Serves the admin API locally with the same handlers as netlify/functions/*,
// so `npm run dev` works without `netlify dev`.
function adminDevMiddleware(env) {
  function send(res, { statusCode, body }) {
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = statusCode
    res.end(JSON.stringify(body))
  }

  return {
    name: 'admin-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/admin-login', (req, res) => {
        if (req.method !== 'POST') {
          send(res, { statusCode: 405, body: { success: false, message: 'Method not allowed.' } })
          return
        }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => send(res, handleLogin(env, body)))
      })

      server.middlewares.use('/admin-session', (req, res) => {
        send(res, handleSession(env, req.headers.authorization))
      })

      server.middlewares.use('/admin-requests', (req, res) => {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          const url = new URL(req.url, 'http://localhost')
          send(res, await handleRequests(env, {
            method: req.method,
            authHeader: req.headers.authorization,
            range: url.searchParams.get('range'),
            body,
          }))
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), adminDevMiddleware(env)],
    // Expose PLACE_API (Google Maps key, restricted by HTTP referrer) to the client
    envPrefix: ['VITE_', 'PLACE_'],
    // Fixed port: 5173 is taken by the sessions frontend, and the Places key only allows listed origins
    server: { port: 5174, strictPort: true },
  }
})
