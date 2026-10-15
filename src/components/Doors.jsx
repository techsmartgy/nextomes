import { ASSESS_PATH } from '../constants.js'

const DOORS = [
  { href: ASSESS_PATH, k: 'Sellers', title: 'Sell a distressed property', body: 'Vacant, behind on taxes, or costing you every month.', go: 'Request an assessment' },
  { href: '#divisions', k: 'Owners', title: 'Stabilize what you own', body: 'Steady income from your 1–4 unit home, without the hassle.', go: 'NexOmes Residential' },
  { href: '#residents', k: 'Residents', title: 'Live in a NexOmes home', body: 'Well-kept homes, ready on move-in day.', go: 'For residents' },
]

export default function Doors() {
  return (
    <div className="doors">
      <div className="wrap">
        {DOORS.map(d => (
          <a key={d.k} className="door" href={d.href}>
            <span className="k">{d.k}</span><h3>{d.title}</h3><p>{d.body}</p>
            <span className="go">{d.go} <b>→</b></span>
          </a>
        ))}
      </div>
    </div>
  )
}
