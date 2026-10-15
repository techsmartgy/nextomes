const TENETS = [
  ['Disciplined', "Every acquisition passes the same underwriting. If the numbers don't hold at conservative assumptions, we walk."],
  ['Systems-led', 'AI is core infrastructure across every division, from deal screening to renovation scheduling and resident service.'],
  ['Accountable', 'One team owns the asset end to end, with a clear escalation path and audit-ready records.'],
]

export default function About() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="about-head">
          <p className="eyebrow">About NexOmes</p>
          <h2 className="ah-a">Better homes. Stronger assets.</h2>
          <p className="ah-b"><em className="it">Disciplined execution.</em></p>
          <div className="ah-side">
            <p className="lede">We are a real estate operating company, built to turn underperforming property into high-performing assets. We are not a brokerage, and we don&apos;t gamble on renovations.</p>
            <nav className="ah-divs" aria-label="Divisions"><a href="#divisions">Value-Add™</a><a href="#divisions">Residential</a><a href="#divisions">Multifamily</a></nav>
          </div>
        </div>
        <div className="about-grid">
          <div>
            <p className="purpose">We exist to provide quality homes and well-run real estate that improve the lives of residents while creating long-term value for owners and the neighborhoods we serve.</p>
            <div className="sig">
              <i>With warm regards,</i>
              <b>Carlean Reynolds</b>
              <span>Chief Operating Officer</span>
              <span>NexOmes Corporation</span>
            </div>
          </div>
          <ul className="tenets">
            {TENETS.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
