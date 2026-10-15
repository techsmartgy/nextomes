import { useRef, useState } from 'react'
import { ASSESS_PATH } from '../constants.js'

const PANELS = [
  {
    id: 'own', tab: 'Property owners', head: 'What most owners are stuck doing',
    rows: [
      ['List it, wait months, and hope a buyer shows up', 'A clear, written path forward after one walkthrough'],
      ['Pay for repairs before anyone will make an offer', 'Sell as-is. We handle the repairs'],
      ['Cover the mortgage while the unit sits vacant', 'Turn a monthly loss into dependable income'],
      ['Face code violations, liens and back taxes alone', 'One plan that covers every issue'],
      ['Juggle contractors, permits and surprise costs', 'Scope, budget and schedule fixed before work begins'],
      ['Wait weeks to hear back', 'A response within one business day'],
    ],
    cta: [ASSESS_PATH, 'Get my property assessed', 'Confidential. No obligation. Two minutes to start.'],
  },
  {
    id: 'res', tab: 'Residents', head: 'What most renters put up with',
    rows: [
      ['Move into a unit that was patched, not cared for', 'Move into a well-kept home, ready on day one'],
      ['Repair requests that disappear', 'Every request tracked from submission to completion'],
      ['Problems fixed only after they break', 'Preventive maintenance on a set schedule'],
      ['Different rules for different applicants', 'One clear, consistent screening standard'],
      ['Nobody to call when something goes wrong', 'A responsive team with a clear escalation path'],
    ],
    cta: ['#residents', 'See resident information', 'Homes across Rochester, kept to one standard.'],
  },
]

// Old way vs NexOmes way tabs
export default function Versus() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef([])

  const onKeyDown = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + PANELS.length) % PANELS.length
    setActive(n)
    tabRefs.current[n].focus()
  }

  return (
    <section className="versus" id="versus">
      <div className="wrap">
        <div className="vs-top">
          <div>
            <p className="eyebrow">Why NexOmes</p>
            <h2 style={{ marginTop: 16 }}>The old way vs. <em>the NexOmes way.</em></h2>
            <p className="lede">A struggling property feels like a list of bad options. It doesn&apos;t have to be.</p>
          </div>
          <div className="vs-tabs" role="tablist" aria-label="Choose who you are">
            {PANELS.map((p, i) => (
              <button key={p.id} type="button" role="tab" id={`tab-${p.id}`} aria-controls={`vs-${p.id}`}
                aria-selected={active === i} tabIndex={active === i ? 0 : -1}
                ref={el => { tabRefs.current[i] = el }}
                onClick={() => setActive(i)} onKeyDown={e => onKeyDown(e, i)}>
                {p.tab}
              </button>
            ))}
          </div>
        </div>

        {PANELS.map((p, i) => (
          <div key={p.id} className="vs-panel vs-table" id={`vs-${p.id}`} role="tabpanel" aria-labelledby={`tab-${p.id}`} hidden={active !== i}>
            <div className="vs-row vs-head"><div className="vs-old">{p.head}</div><div className="vs-new">The NexOmes way</div></div>
            {p.rows.map(([oldWay, newWay]) => (
              <div key={oldWay} className="vs-row">
                <div className="vs-old"><span className="vs-mk">✕</span><s>{oldWay}</s></div>
                <div className="vs-new"><span className="vs-mk">✓</span>{newWay}</div>
              </div>
            ))}
            <div className="vs-cta"><a className="btn" href={p.cta[0]}>{p.cta[1]} <span className="arr">→</span></a><span className="fine">{p.cta[2]}</span></div>
          </div>
        ))}
      </div>
    </section>
  )
}
