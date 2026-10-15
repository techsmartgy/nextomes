import { useMemo, useState } from 'react'
import { DAY_MS, Link, PageHead, RequestsChart, Skeleton, StatTile, changeText, countValues, dailyCounts, formatDay, topValue, useRequests } from './shared.jsx'

// Horizontal bars, most common first (like "Top pages" on the TechSmart dashboard)
function BarList({ rows, total, empty }) {
  if (!rows.length) return <p className="adm-empty">{empty}</p>
  const max = rows[0][1]
  return (
    <ul className="adm-bars">
      {rows.map(([label, n]) => (
        <li key={label}>
          <div className="adm-bar-row"><span>{label}</span><span><b>{n}</b> <span className="adm-muted">{Math.round((n / total) * 100)}%</span></span></div>
          <div className="adm-bar"><i style={{ width: `${(n / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}

export default function Dashboard({ onAuthError }) {
  const [range, setRange] = useState('28')
  const { data, requests, error } = useRequests(range, onAuthError)

  const daily = useMemo(() => dailyCounts(requests, range), [requests, range])
  const open = requests.filter(r => !r.archived_at && r.status !== 'closed')
  const closed = requests.filter(r => !r.archived_at && r.status === 'closed').length
  const lastWeek = requests.filter(r => Date.now() - new Date(r.created_at) < 7 * DAY_MS).length
  const topSituation = topValue(requests.flatMap(r => r.distress))
  const topType = topValue(requests.map(r => r.property_type))
  const situations = countValues(requests.flatMap(r => r.distress)).slice(0, 6)
  const types = countValues(requests.map(r => r.property_type))

  return (
    <>
      <PageHead title="Dashboard" range={range} onRange={setRange} />

      {error && <p className="adm-error" role="alert">{error}</p>}
      {!data && !error && <Skeleton />}

      {data && (
        <>
          <div className="adm-tiles">
            <StatTile label="Requests" value={requests.length} sub={changeText(requests.length, data.previousCount, range)} />
            <StatTile label="Open" value={open.length} sub={`${closed} closed · ${lastWeek} new in the last 7 days`} />
            <StatTile text label="Top situation" value={topSituation ? topSituation[0] : '—'} sub={topSituation ? `${topSituation[1]} of ${requests.length} requests` : 'No requests yet'} />
            <StatTile text label="Top property type" value={topType ? topType[0] : '—'} sub={topType ? `${topType[1]} of ${requests.length} requests` : 'No requests yet'} />
          </div>

          <section className="adm-card adm-section">
            <h2>Requests per day</h2>
            <RequestsChart daily={daily} />
          </section>

          <div className="adm-split">
            <section className="adm-card adm-section">
              <div className="adm-section-head">
                <h2>Latest open requests</h2>
                <Link to="/admin/requests" className="adm-more">View all →</Link>
              </div>
              {open.length === 0 ? (
                <p className="adm-empty">{requests.length ? 'All caught up. No open requests in this period.' : 'No requests in this period yet.'}</p>
              ) : (
                <ul className="adm-recent">
                  {open.slice(0, 5).map(r => (
                    <li key={r.id}>
                      <Link to={`/admin/requests?id=${encodeURIComponent(r.id)}`}>
                        <span><b>{r.name}</b><span className="adm-sub">{r.address}{r.city ? `, ${r.city}` : ''}</span></span>
                        <span className="adm-muted adm-nowrap">{formatDay(r.created_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="adm-card adm-section">
              <h2>Situations</h2>
              <BarList rows={situations} total={requests.length} empty="No requests in this period yet." />
              <h2 className="adm-h2-gap">Property types</h2>
              <BarList rows={types} total={requests.length} empty="No requests in this period yet." />
            </section>
          </div>
        </>
      )}
    </>
  )
}
