import { useEffect, useState } from 'react'
import { PageHead, Skeleton, formatDateTime, formatDay, useRequests } from './shared.jsx'

// Close an open request, or reopen a closed one
function StatusButton({ r, busy, onToggle, size }) {
  const closed = r.status === 'closed'
  return (
    <button type="button" className={`adm-status-btn${closed ? ' reopen' : ''}${size === 'lg' ? ' lg' : ''}`} disabled={busy}
      onClick={e => { e.stopPropagation(); onToggle(r) }} onKeyDown={e => e.stopPropagation()}
      aria-label={`${closed ? 'Reopen' : 'Close'} request from ${r.name}`}>
      {busy ? 'Saving…' : closed ? 'Reopen' : <><span aria-hidden="true">✓</span> Close</>}
    </button>
  )
}

const ArchiveIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></svg>
)

// Archive hides a request from the working lists; restore brings it back with its status intact
function ArchiveButton({ r, busy, onArchive, size }) {
  const archived = Boolean(r.archived_at)
  const label = `${archived ? 'Restore' : 'Archive'} request from ${r.name}`
  return (
    <button type="button" className={`adm-archive-btn${archived ? ' restore' : ''}${size === 'lg' ? ' lg' : ''}`} disabled={busy}
      onClick={e => { e.stopPropagation(); onArchive(r) }} onKeyDown={e => e.stopPropagation()}
      aria-label={label} title={archived ? 'Restore' : 'Archive'}>
      {archived ? (busy ? 'Saving…' : 'Restore') : <><ArchiveIcon />{size === 'lg' && <span>Archive</span>}</>}
    </button>
  )
}

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></svg>
)

function DeleteButton({ r, busy, onDelete, size }) {
  return (
    <button type="button" className={`adm-archive-btn adm-delete-btn${size === 'lg' ? ' lg' : ''}`} disabled={busy}
      onClick={e => { e.stopPropagation(); onDelete(r) }} onKeyDown={e => e.stopPropagation()}
      aria-label={`Delete request from ${r.name}`} title="Delete">
      <TrashIcon />{size === 'lg' && <span>Delete</span>}
    </button>
  )
}

function StatusBadge({ r }) {
  return r.status === 'closed'
    ? <span className="adm-badge closed" title={r.closed_at ? `Closed ${formatDateTime(r.closed_at)}` : undefined}>Closed</span>
    : <span className="adm-badge open">Open</span>
}

function ArchivedBadge({ r }) {
  return <span className="adm-badge archived" title={`Archived ${formatDateTime(r.archived_at)}`}>Archived</span>
}

function Field({ label, children }) {
  return <><dt>{label}</dt><dd>{children || '—'}</dd></>
}

function Detail({ r, onClose, busy, onToggle, onArchive, onDelete }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const fullAddress = [r.address, r.city, [r.state, r.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  const map = r.place_id
    ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(r.place_id)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

  return (
    <div className="adm-overlay" onClick={onClose}>
      <aside className="adm-detail" role="dialog" aria-modal="true" aria-label={`Request ${r.reference}`} onClick={e => e.stopPropagation()}>
        <div className="adm-detail-head">
          <div>
            <p className="adm-ref">{r.reference} <StatusBadge r={r} />{r.archived_at && <> <ArchivedBadge r={r} /></>}</p>
            <h2>{r.name}</h2>
            <p className="adm-muted">
              {formatDateTime(r.created_at)}
              {r.status === 'closed' && r.closed_at ? ` · closed ${formatDateTime(r.closed_at)}` : ''}
              {r.archived_at ? ` · archived ${formatDateTime(r.archived_at)}` : ''}
            </p>
          </div>
          <button type="button" className="adm-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="adm-actions">
          <a className="adm-btn" href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>Call {r.phone}</a>
          <a className="adm-btn ghost" href={`mailto:${r.email}?subject=${encodeURIComponent(`Your property assessment (${r.reference})`)}`}>Email</a>
          <StatusButton r={r} busy={busy} onToggle={onToggle} size="lg" />
          <ArchiveButton r={r} busy={busy} onArchive={onArchive} size="lg" />
          <DeleteButton r={r} busy={busy} onDelete={onDelete} size="lg" />
        </div>

        <h3>Property</h3>
        <dl className="adm-dl">
          <Field label="Address">{fullAddress} <a href={map} target="_blank" rel="noopener">Map ↗</a></Field>
          <Field label="Type">{r.property_type}</Field>
          <Field label="Units">{r.units}</Field>
          <Field label="Beds / baths">{(r.beds ?? '—') + ' / ' + (r.baths ?? '—')}</Field>
          <Field label="Occupancy">{r.occupancy}</Field>
          <Field label="Place ID">{r.place_id && <code>{r.place_id}</code>}</Field>
        </dl>

        <h3>Situation</h3>
        <div className="adm-chips">{r.distress.map(d => <span key={d} className="adm-chip">{d}</span>)}</div>
        <dl className="adm-dl">
          <Field label="Condition">{r.condition}</Field>
          <Field label="Timeline">{r.timeline}</Field>
        </dl>

        <h3>Contact</h3>
        <dl className="adm-dl">
          <Field label="Name">{r.name}</Field>
          <Field label="Phone"><a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>{r.phone}</a></Field>
          <Field label="Email"><a href={`mailto:${r.email}`}>{r.email}</a></Field>
          <Field label="Relationship">{r.relationship}</Field>
        </dl>

        {r.notes && (<><h3>Notes</h3><p className="adm-notes">{r.notes}</p></>)}
      </aside>
    </div>
  )
}

// Archived requests only appear under the Archived tab
const VIEWS = {
  open: r => !r.archived_at && r.status !== 'closed',
  closed: r => !r.archived_at && r.status === 'closed',
  all: r => !r.archived_at,
  archived: r => Boolean(r.archived_at),
}
const TABS = [['open', 'Open'], ['closed', 'Closed'], ['all', 'All'], ['archived', 'Archived']]

// ?id=… opens that request's detail panel (used by links from the dashboard)
const idFromUrl = () => new URLSearchParams(location.search).get('id')

export default function Requests({ onAuthError }) {
  const [range, setRange] = useState('all')
  const { data, requests, error, busy, change, remove } = useRequests(range, onAuthError)
  const [q, setQ] = useState('')
  const [view, setView] = useState('open')
  const [selectedId, setSelectedId] = useState(idFromUrl)

  useEffect(() => {
    const onPop = () => setSelectedId(idFromUrl())
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  const select = id => {
    setSelectedId(id)
    history.replaceState(null, '', id ? `?id=${encodeURIComponent(id)}` : location.pathname)
  }

  const counts = Object.fromEntries(Object.entries(VIEWS).map(([k, fn]) => [k, requests.filter(fn).length]))
  const selected = requests.find(r => r.id === selectedId) || null

  const needle = q.trim().toLowerCase()
  const shown = requests
    .filter(VIEWS[view])
    .filter(r => !needle || [r.name, r.address, r.city, r.reference, r.email, r.phone].some(v => v?.toLowerCase().includes(needle)))

  const toggleStatus = r => change(r, { status: r.status === 'closed' ? 'open' : 'closed' })
  const toggleArchive = r => change(r, { archived: !r.archived_at })
  const del = r => {
    if (!confirm(`Delete the request from ${r.name} (${r.address})?\n\nThis can't be undone. Archive it instead if you might need it later.`)) return
    remove(r).then(ok => { if (ok && selectedId === r.id) select(null) })
  }

  return (
    <>
      <PageHead title="Requests" range={range} onRange={setRange} />

      {error && <p className="adm-error" role="alert">{error}</p>}
      {!data && !error && <Skeleton tiles={false} />}

      {data && (
        <section className="adm-card adm-section adm-section-first">
          <div className="adm-section-head">
            <div className="adm-tabs" role="group" aria-label="Show requests">
              {TABS.map(([k, l]) => (
                <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)}>
                  {l} <span>{counts[k]}</span>
                </button>
              ))}
            </div>
            <input className="adm-search" type="search" placeholder="Search name, address, reference…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search requests" />
          </div>
          {shown.length === 0 ? (
            <p className="adm-empty">{needle ? 'No requests match your search.'
              : view === 'open' && requests.length ? 'All caught up. No open requests in this period.'
              : view === 'closed' ? 'No closed requests in this period.'
              : view === 'archived' ? 'Nothing archived in this period.'
              : 'No requests in this period yet.'}</p>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Received</th><th>Name</th><th>Property</th><th>Situation</th><th>Condition</th><th>Timeline</th><th><span className="adm-sr">Status</span></th></tr></thead>
                <tbody>
                  {shown.map(r => (
                    <tr key={r.id} tabIndex={0} className={r.status === 'closed' && !r.archived_at ? 'is-closed' : undefined}
                      onClick={() => select(r.id)} onKeyDown={e => e.key === 'Enter' && select(r.id)}>
                      <td className="c-date adm-nowrap">{formatDay(r.created_at)}<span className="adm-muted"> · {new Date(r.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span></td>
                      <td className="c-name"><b>{r.name}</b><span className="adm-sub">{r.phone}</span></td>
                      <td className="c-prop">{r.address}<span className="adm-sub">{[r.city, r.state].filter(Boolean).join(', ')}{r.property_type ? ` · ${r.property_type}` : ''}</span></td>
                      <td className="c-sit"><div className="adm-chips">{r.distress.slice(0, 2).map(d => <span key={d} className="adm-chip">{d}</span>)}{r.distress.length > 2 && <span className="adm-chip more">+{r.distress.length - 2}</span>}</div></td>
                      <td className="c-cond" data-label="Condition">{r.condition || '—'}</td>
                      <td className="c-time" data-label="Timeline">{r.timeline || '—'}</td>
                      <td className="c-act">
                        {r.archived_at
                          ? <><StatusBadge r={r} /><ArchiveButton r={r} busy={busy.has(r.id)} onArchive={toggleArchive} /></>
                          : <>
                              {r.status === 'closed' && <StatusBadge r={r} />}
                              <StatusButton r={r} busy={busy.has(r.id)} onToggle={toggleStatus} />
                              <ArchiveButton r={r} busy={busy.has(r.id)} onArchive={toggleArchive} />
                            </>}
                        <DeleteButton r={r} busy={busy.has(r.id)} onDelete={del} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {selected && <Detail r={selected} onClose={() => select(null)} busy={busy.has(selected.id)} onToggle={toggleStatus} onArchive={toggleArchive} onDelete={del} />}
    </>
  )
}
