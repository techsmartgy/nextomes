import { ASSESS_PATH } from '../constants.js'

const STAGES = [
  ['Identify', 'Find properties that meet our standards.'],
  ['Acquire', 'Check the numbers, inspect, and buy.'],
  ['Transform', 'Renovate on a fixed scope, budget and schedule.'],
  ['Stabilize', 'Place good residents and steady the income.'],
  ['Optimize', 'Manage for the long term, then refinance or sell on plan.'],
]

export default function Process() {
  return (
    <section id="process">
      <div className="wrap">
        <div className="sec-head">
          <div><p className="eyebrow">The Value-Add™ system</p><h2 style={{ marginTop: 16 }}>Five stages. <em className="it">No improvisation.</em></h2></div>
          <p className="lede">Every property follows the same five steps. Each one is checked before the next begins.</p>
        </div>
        <ol className="stages">
          {STAGES.map(([t, d]) => <li key={t} className="stage"><span className="n" /><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
        <div className="rcs">
          <p>Every renovation runs on our Rehab Control System™: <em className="it">fixed scope, tracked costs, inspected milestones.</em></p>
          <a className="btn ghost" href={ASSESS_PATH}>Request an assessment <span className="arr">→</span></a>
        </div>
      </div>
    </section>
  )
}
