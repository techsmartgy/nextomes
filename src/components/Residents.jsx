import { Mark } from './icons.jsx'

const PROMISES = [
  ['Ready before you arrive', 'Every home is cleaned, repaired and inspected before move-in.'],
  ['Heard, not handled', 'Track every repair request until the job is done.'],
  ['Respect, every time', 'The same fair screening for every applicant. No fine print.'],
  ['Cared for, not chased', 'Regular maintenance, so small problems stay small.'],
]

const STEPS = [
  ['Find your home', 'Browse available homes across Rochester.'],
  ['Apply', 'One simple, fair application.'],
  ['Move in', 'Walk through your clean, ready home with our team.'],
  ['Settle in', 'Pay rent and send requests online, with a team that knows you.'],
]

export default function Residents() {
  return (
    <section className="residents" id="residents">
      <div className="wrap">
        <div className="res-top">
          <div>
            <span className="res-tag"><i />NexOmes Resident</span>
            <h2 style={{ marginTop: 20 }}>You&apos;re not a lease. <em className="it">You&apos;re family.</em></h2>
            <p className="lede" style={{ marginTop: 22 }}>You&apos;re looking for a home, not just a unit. As a NexOmes Resident, you&apos;re treated like family from your first visit to every renewal.</p>
          </div>
          <div className="res-card" aria-hidden="true">
            <div className="rc-top"><span className="mark"><Mark /></span><span className="rc-chip" /></div>
            <div className="rc-mid">
              <span className="rc-k">Resident</span>
              <span className="rc-name">Welcome home.</span>
            </div>
            <div className="rc-bot"><span>Rochester, New York</span><span>Family since day one</span></div>
          </div>
        </div>

        <div className="res-promise">
          {PROMISES.map(([t, d]) => <div key={t}><h4>{t}</h4><p>{d}</p></div>)}
        </div>

        <div className="res-join">
          <div className="rj-head">
            <p className="eyebrow">Join the NexOmes Resident family</p>
            <h3>Four steps home.</h3>
          </div>
          <ol className="rj-steps">
            {STEPS.map(([t, d], i) => <li key={t}><span>0{i + 1}</span><h4>{t}</h4><p>{d}</p></li>)}
          </ol>
          <div className="rj-cta"><a className="btn" href="#contact">Become a NexOmes Resident <span className="arr">→</span></a><span className="fine">Ask about homes available now.</span></div>
        </div>
      </div>
    </section>
  )
}
