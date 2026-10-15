import { ASSESS_PATH, ASSESS_STEPS } from '../constants.js'

const SIGNS = [
  ['A', 'Vacant, or residents who aren\'t paying'],
  ['B', 'Back taxes, liens or a foreclosure notice'],
  ['C', 'Code violations or deferred repairs'],
  ['D', 'Inherited, or more work than you want to take on'],
]

export default function Sell() {
  return (
    <section id="sell">
      <div className="wrap sell-grid">
        <div>
          <p className="eyebrow">For property owners</p>
          <h2 style={{ marginTop: 16 }}>Is your property in distress, or <em className="it">not cash flowing?</em></h2>
          <p className="lede">Tell us about it in two minutes. We&apos;ll review it in confidence and offer clear options: we buy it, partner with you, or help turn it around.</p>
          <ul className="signs">
            {SIGNS.map(([k, t]) => <li key={k}><span>{k}</span>{t}</li>)}
          </ul>
        </div>
        {/* The form itself lives on its own page (src/assess/AssessPage.jsx) */}
        <div className="panel sell-start" id="leadPanel">
          <h3>Property assessment</h3>
          <p className="sub">Confidential. No obligation. About two minutes.</p>
          <ol className="as-steps">
            {ASSESS_STEPS.map(([title, hint], i) => (
              <li key={title}><span className="n">0{i + 1}</span><span><b>{title}</b><small>{hint}</small></span></li>
            ))}
          </ol>
          <div className="actions">
            <span className="fine">We respond within one business day.</span>
            <a className="btn" href={ASSESS_PATH}>Start my assessment <span className="arr">→</span></a>
          </div>
        </div>
      </div>
    </section>
  )
}
