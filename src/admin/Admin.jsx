import { useCallback, useEffect, useState } from 'react'
import './admin.css'
import { clearToken, login, verifySession } from './api.js'
import Dashboard from './Dashboard.jsx'
import Layout from './Layout.jsx'
import Requests from './Requests.jsx'

// Admin pages by path; anything else under /admin shows the dashboard
const PAGES = { '/admin/requests': Requests }

function usePath() {
  const [path, setPath] = useState(location.pathname.replace(/\/+$/, '') || '/')
  useEffect(() => {
    const onPop = () => setPath(location.pathname.replace(/\/+$/, '') || '/')
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])
  return path
}

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username.trim(), password)
      onSuccess()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <span className="adm-mark"><b>Nex</b><span>Omes</span></span>
        <h1>Admin sign in</h1>
        <label>User ID<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required autoFocus /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}

export default function Admin() {
  const [status, setStatus] = useState('checking') // checking | in | out
  const path = usePath()
  const Page = PAGES[path] || Dashboard

  useEffect(() => {
    document.title = 'Admin | NexOmes'
    verifySession().then(ok => setStatus(ok ? 'in' : 'out'), () => setStatus('out'))
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setStatus('out')
  }, [])

  if (status === 'checking') return <div className="adm-login"><div className="adm-spinner" aria-label="Loading" /></div>
  if (status === 'out') return <LoginForm onSuccess={() => setStatus('in')} />
  return (
    <Layout path={PAGES[path] ? path : '/admin'} onLogout={logout}>
      <Page key={path} onAuthError={logout} />
    </Layout>
  )
}
