const STAGES = [
  ['Identify', 'Source and screen assets against strict acquisition criteria.'],
  ['Acquire', 'Underwrite conservatively, complete due diligence, close in a dedicated LLC.'],
  ['Transform', 'Fixed scope of work, budget and schedule. Renovate in controlled stages.'],
  ['Stabilize', 'Place qualified residents and establish dependable cash flow.'],
  ['Optimize', 'Long-term stewardship, refinance or disposition on plan.'],
]

export default function Process() {
  return (
    <section id="process">
      <div className="wrap">
        <div className="sec-head">
          <div><p className="eyebrow">The Value-Add™ system</p><h2 style={{ marginTop: 16 }}>Five stages. <em className="it">No improvisation.</em></h2></div>
          <p className="lede">Every asset moves through the same sequence, with defined deliverables and sign-off before the next stage begins.</p>
        </div>
        <ol className="stages">
          {STAGES.map(([t, d]) => <li key={t} className="stage"><span className="n" /><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
        <div className="rcs">
          <p>The NexOmes Rehab Control System™ governs every renovation: <em className="it">scope locked, costs tracked, milestones inspected.</em></p>
          <a className="btn ghost" href="#sell">Request an assessment <span className="arr">→</span></a>
        </div>
      </div>
    </section>
  )
}
