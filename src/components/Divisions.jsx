const DIVISIONS = [
  {
    k: 'Renovation', name: 'Value-Add™',
    body: 'We buy distressed properties and renovate them on a fixed plan.',
    points: ['Scope, budget and schedule set before work starts', 'Licensed contractors', 'Inspected at every stage'],
  },
  {
    k: 'Residential', name: 'Residential',
    body: 'We partner with owners of 1–4 unit homes who want steady income without the day-to-day.',
    points: ['Clear terms up front', 'One point of contact', 'Homes kept to one standard'],
  },
  {
    k: 'Income property', name: 'Multifamily',
    body: "We buy apartment buildings near Rochester's transit routes and grow their income over time.",
    points: ['Chosen for location', 'Rents and costs put in order', 'Upgrades that raise income'],
  },
]

export default function Divisions() {
  return (
    <section className="divisions" id="divisions">
      <div className="wrap">
        <div className="sec-head">
          <div><p className="eyebrow">Three divisions</p><h2 style={{ marginTop: 16 }}>One company, three ways we work.</h2></div>
          <p className="lede">All three follow the same standards, so a property can go from renovation to long-term ownership without changing hands.</p>
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
