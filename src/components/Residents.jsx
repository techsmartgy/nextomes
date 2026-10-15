import { Mark } from './icons.jsx'

const PROMISES = [
  ['Ready before you arrive', "Every home is well maintained and inspected before move-in. You never move into someone else's leftovers."],
  ['Heard, not handled', 'Repair requests are tracked from the moment you submit them until the job is done, and you see every step.'],
  ['Respect, every time', 'One clear, consistent screening standard for every applicant. No surprises, no fine print games.'],
  ['Cared for, not chased', 'Preventive maintenance on a set schedule, so small problems never become your problem.'],
]

const STEPS = [
  ['Find your home', 'Browse available homes across Rochester.'],
  ['Apply', 'One simple application, reviewed the same way for everyone.'],
  ['Move in', 'A clean, well-maintained home and a walkthrough with our team.'],
  ['Settle in', 'Your resident portal for payments and requests, and a team that knows your name.'],
]

export default function Residents() {
  return (
    <section className="residents" id="residents">
      <div className="wrap">
        <div className="res-top">
          <div>
            <span className="res-tag"><i />NexOmes Resident</span>
            <h2 style={{ marginTop: 20 }}>You&apos;re not a lease. <em className="it">You&apos;re family.</em></h2>
            <p className="lede" style={{ marginTop: 22 }}>Everyone who walks through our door is looking for a home, not a unit. As a NexOmes Resident, you&apos;re part of our family, and we treat you that way from the first walkthrough to every renewal after.</p>
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
