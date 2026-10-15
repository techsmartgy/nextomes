import { useState } from 'react'
import { Link } from './shared.jsx'

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
)
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
)
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
)
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
)

// To add a page: add it here and to PAGES in Admin.jsx
const NAV = [
  { to: '/admin', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/admin/requests', label: 'Requests', Icon: InboxIcon },
]

function Sidebar({ path, onLogout, onNavigate }) {
  return (
    <>
      <div className="adm-brand"><span className="adm-mark"><b>Nex</b><span>Omes</span></span><small>Admin</small></div>
      <nav className="adm-nav">
        {NAV.map(({ to, label, Icon }) => (
          <Link key={to} to={to} onClick={onNavigate} className={path === to ? 'active' : undefined} aria-current={path === to ? 'page' : undefined}>
            <Icon />{label}
          </Link>
        ))}
      </nav>
      <button className="adm-signout" type="button" onClick={onLogout}><LogoutIcon />Sign out</button>
    </>
  )
}

export default function Layout({ path, onLogout, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="adm">
      <aside className="adm-side"><Sidebar path={path} onLogout={onLogout} /></aside>
      <header className="adm-topbar">
        <button type="button" className="adm-menu" aria-label="Open menu" onClick={() => setOpen(true)}><MenuIcon /></button>
        <span className="adm-mark"><b>Nex</b><span>Omes</span></span>
      </header>
      {open && (
        <div className="adm-drawer" onClick={() => setOpen(false)}>
          <aside className="adm-side" onClick={e => e.stopPropagation()}><Sidebar path={path} onLogout={onLogout} onNavigate={() => setOpen(false)} /></aside>
        </div>
      )}
      <main className="adm-main">{children}</main>
    </div>
  )
}
