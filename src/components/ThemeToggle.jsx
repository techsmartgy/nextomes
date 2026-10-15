import { useState } from 'react'

export default function ThemeToggle() {
  // index.html sets data-theme before React loads (light by default)
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')

  const toggle = () => {
    const t = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', t)
    setTheme(t)
    try { localStorage.setItem('nx-theme', t) } catch { /* storage unavailable */ }
  }

  return (
    <button className="theme" type="button" onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <svg className="moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
      <svg className="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
    </button>
  )
}
