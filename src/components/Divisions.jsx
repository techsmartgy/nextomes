const DIVISIONS = [
  {
    k: 'Renovation', name: 'Value-Add™',
    body: 'Distressed acquisition and strategic renovation, executed through the NexOmes Rehab Control System™.',
    points: ['Scope, budget and schedule fixed before demolition', 'Licensed contractors under a dedicated rehab entity', 'Staged renovation with inspection at every gate'],
  },
  {
    k: 'Residential', name: 'Residential',
    body: 'Long-term partnerships with owners of 1–4 unit residential homes who want dependable income without the day-to-day.',
    points: ['Clear terms agreed up front', 'One accountable point of contact', 'Homes kept to a consistent standard'],
  },
  {
    k: 'Income property', name: 'Multifamily',
    body: "Multifamily acquisitions along Rochester's transit corridors, with a focus on income optimization over time.",
    points: ['Corridor-based site selection', 'Rent roll and expense normalization', 'Capital improvements tied to income'],
  },
]

export default function Divisions() {
  return (
    <section className="divisions" id="divisions">
      <div className="wrap">
        <div className="sec-head">
          <div><p className="eyebrow">Three divisions</p><h2 style={{ marginTop: 16 }}>One operating company, three disciplines.</h2></div>
          <p className="lede">Each division runs on the same underwriting standard and reporting cadence, so an asset can move from renovation to long-term hold without changing hands.</p>
        </div>
        <div className="div-list">
          {DIVISIONS.map(d => (
            <article key={d.k} className="div-item">
              <span className="k">{d.k}</span>
              <h3>NexOmes <em>{d.name}</em></h3>
              <p>{d.body}</p>
              <ul>{d.points.map(p => <li key={p}>{p}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
