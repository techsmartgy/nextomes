import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthError, deleteRequest, fetchRequests, updateRequest } from './api.js'

// Shared by the Dashboard and Requests pages

export const RANGES = [['7', 'Last 7 days'], ['28', 'Last 28 days'], ['90', 'Last 90 days'], ['all', 'All time']]
export const DAY_MS = 24 * 60 * 60 * 1000
const INK = '#8B7355'

const dayKey = d => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}` }
export const formatDay = (d, opts = { month: 'short', day: 'numeric' }) => new Date(d).toLocaleDateString('en-US', opts)
export const formatDateTime = d => new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

function niceMax(v) {
  if (v <= 4) return 4
  const step = 10 ** Math.floor(Math.log10(v))
  return Math.ceil(v / step) * step
}

export function topValue(values) {
  const counts = new Map()
  values.forEach(v => v && counts.set(v, (counts.get(v) || 0) + 1))
  let best = null
  counts.forEach((n, v) => { if (!best || n > best[1]) best = [v, n] })
  return best
}

// One entry per day from the start of the range (or the first request) to today
export function dailyCounts(requests, range) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const oldest = requests.length ? new Date(requests[requests.length - 1].created_at) : today
  const days = range === 'all'
    ? Math.max(7, Math.round((today - new Date(oldest.toDateString())) / DAY_MS) + 1)
    : Number(range)
  const counts = new Map()
  requests.forEach(r => { const k = dayKey(r.created_at); counts.set(k, (counts.get(k) || 0) + 1) })
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getTime() - (days - 1 - i) * DAY_MS)
    return { date, count: counts.get(dayKey(date)) || 0 }
  })
}

// `text` tiles show a word value (e.g. "Vacant") at a smaller size than the numeric tiles
export function StatTile({ label, value, sub, text }) {
  return (
    <div className={`adm-card adm-tile${text ? ' adm-tile-text' : ''}`}>
      <p className="adm-tile-label">{label}</p>
      <p className="adm-tile-value">{value}</p>
      {sub && <p className="adm-tile-sub">{sub}</p>}
    </div>
  )
}

export function changeText(current, previous, range) {
  if (previous === null) return 'Since the first request'
  const label = RANGES.find(([k]) => k === range)[1].replace('Last', 'previous')
  if (!previous) return current ? `None in the ${label}` : `No data for the ${label}`
  const pct = Math.round(((current - previous) / previous) * 100)
  return `${pct >= 0 ? '+' : ''}${pct}% vs the ${label}`
}

export function RequestsChart({ daily }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(wrapRef.current)
    return () => observer.disconnect()
  }, [])

  const compact = width < 500
  const height = compact ? 170 : 220
  const pad = { top: 12, right: 8, bottom: 28, left: compact ? 26 : 36 }
  const plotW = Math.max(0, width - pad.left - pad.right)
  const plotH = height - pad.top - pad.bottom
  const max = niceMax(Math.max(...daily.map(d => d.count), 0))
  const x = i => pad.left + (daily.length > 1 ? (i / (daily.length - 1)) * plotW : plotW / 2)
  const y = v => pad.top + plotH - (v / max) * plotH
  const line = daily.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.count)}`).join('')
  const area = `${line}L${x(daily.length - 1)},${y(0)}L${x(0)},${y(0)}Z`
  const ticks = (compact ? [0, 2, 4] : [0, 1, 2, 3, 4]).map(n => (max / 4) * n)
  const xLabels = [...new Set([0, Math.floor((daily.length - 1) / 2), daily.length - 1])]

  const onPointer = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = (e.clientX - rect.left - pad.left) / (plotW || 1)
    setHover(Math.min(daily.length - 1, Math.max(0, Math.round(rel * (daily.length - 1)))))
  }
  const onKey = e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const start = hover ?? daily.length - 1
    setHover(Math.min(daily.length - 1, Math.max(0, start + (e.key === 'ArrowRight' ? 1 : -1))))
  }
  const point = hover !== null ? daily[hover] : null

  return (
    <div ref={wrapRef} className="adm-chart">
      {width > 0 && (
        <svg width={width} height={height} role="img" tabIndex={0}
          aria-label="Requests per day. Use the arrow keys to read each day."
          onPointerMove={onPointer} onPointerLeave={() => setHover(null)} onKeyDown={onKey} onBlur={() => setHover(null)}>
          {ticks.map(t => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} className="adm-grid" />
              <text x={pad.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="adm-axis">{Number.isInteger(t) ? t : t.toFixed(1)}</text>
            </g>
          ))}
          {xLabels.map(i => (
            <text key={i} x={x(i)} y={height - 8} className="adm-axis"
              textAnchor={i === 0 ? 'start' : i === daily.length - 1 ? 'end' : 'middle'}>{formatDay(daily[i].date)}</text>
          ))}
          <path d={area} fill={INK} fillOpacity={0.1} />
          <path d={line} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {point && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + plotH} stroke="#A8A29E" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(point.count)} r={5} fill={INK} stroke="#fff" strokeWidth={2} />
            </>
          )}
        </svg>
      )}
      {point && (
        <div className="adm-tip" style={{ left: Math.min(Math.max(x(hover) - 70, 0), width - 140) }}>
          <span>{formatDay(point.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <b>{point.count} request{point.count === 1 ? '' : 's'}</b>
        </div>
      )}
    </div>
  )
}

// [[value, count], …] sorted by count, most common first
export function countValues(values) {
  const counts = new Map()
  values.forEach(v => v && counts.set(v, (counts.get(v) || 0) + 1))
  return [...counts].sort((a, b) => b[1] - a[1])
}

// Client-side navigation between admin pages (see Admin.jsx)
export function navigate(to) {
  if (to === location.pathname + location.search) return
  history.pushState(null, '', to)
  dispatchEvent(new PopStateEvent('popstate'))
}

export function Link({ to, onClick, ...props }) {
  return (
    <a href={to} {...props} onClick={e => {
      onClick?.(e)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      navigate(to)
    }} />
  )
}

export function PageHead({ title, range, onRange }) {
  return (
    <div className="adm-head">
      <h1>{title}</h1>
      <select className="adm-select" value={range} onChange={e => onRange(e.target.value)} aria-label="Date range">
        {RANGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
    </div>
  )
}

export function Skeleton({ tiles = true }) {
  return (
    <div aria-busy="true" aria-label="Loading requests">
      {tiles && <div className="adm-tiles">{[0, 1, 2, 3].map(i => <div key={i} className="adm-card adm-skel" style={{ height: 118 }} />)}</div>}
      <div className="adm-card adm-skel" style={{ height: 300, marginTop: tiles ? 20 : 0 }} />
    </div>
  )
}

// Loads requests for a range and applies status/archive changes optimistically
export function useRequests(range, onAuthError) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(() => new Set())

  useEffect(() => {
    let live = true
    setData(null)
    setError('')
    fetchRequests(range)
      .then(d => live && setData(d))
      .catch(e => { if (!live) return; if (e instanceof AuthError) onAuthError(); else setError(e.message) })
    return () => { live = false }
  }, [range, onAuthError])

  const patch = useCallback((id, fields) => setData(d => ({ ...d, requests: d.requests.map(r => (r.id === id ? { ...r, ...fields } : r)) })), [])
  const markBusy = (id, on) => setBusy(s => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n })

  // Apply the change immediately, roll back if the server refuses
  const change = (r, changes) => {
    const now = new Date().toISOString()
    const local = {}
    if ('status' in changes) Object.assign(local, { status: changes.status, closed_at: changes.status === 'closed' ? now : null })
    if ('archived' in changes) local.archived_at = changes.archived ? now : null
    const before = Object.fromEntries(Object.keys(local).map(k => [k, r[k]]))
    patch(r.id, local)
    markBusy(r.id, true)
    setError('')
    updateRequest(r.id, changes)
      .then(saved => patch(r.id, saved))
      .catch(e => {
        patch(r.id, before)
        if (e instanceof AuthError) onAuthError()
        else setError(e.message)
      })
      .finally(() => markBusy(r.id, false))
  }

  // Waits for the server before removing the row, since a delete can't be rolled back
  const remove = r => {
    markBusy(r.id, true)
    setError('')
    return deleteRequest(r.id)
      .then(() => { setData(d => ({ ...d, requests: d.requests.filter(x => x.id !== r.id) })); return true })
      .catch(e => {
        if (e instanceof AuthError) onAuthError()
        else setError(e.message)
        return false
      })
      .finally(() => markBusy(r.id, false))
  }

  const requests = useMemo(() => data?.requests ?? [], [data])
  return { data, requests, error, busy, change, remove }
}
