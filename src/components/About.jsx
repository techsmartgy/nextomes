const TENETS = [
  ['Disciplined', "We only buy when the numbers work. If they don't, we walk away."],
  ['Systems-led', 'Clear systems, including AI, keep every project on schedule and every request on track.'],
  ['Accountable', 'One team owns each property from start to finish.'],
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
            <p className="lede">We turn struggling properties into well-run homes. We&apos;re not a brokerage, and we don&apos;t gamble on renovations.</p>
            <nav className="ah-divs" aria-label="Divisions"><a href="#divisions">Value-Add™</a><a href="#divisions">Residential</a><a href="#divisions">Multifamily</a></nav>
          </div>
        </div>
        <ol className="tenets">
          {TENETS.map(([t, d], i) => (
            <li key={t}><span className="tn">0{i + 1}</span><strong>{t}</strong><p>{d}</p></li>
          ))}
        </ol>
        <figure className="purpose-card">
          <blockquote className="purpose">We provide quality homes that improve residents&apos; lives and build lasting value for owners and neighborhoods.</blockquote>
          <figcaption className="sig">
            <i>With warm regards,</i>
            <b>Carlean Reynolds</b>
            <span>Chief Operating Officer · NexOmes Corporation</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
