import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ASSESS_PATH } from '../constants.js'

const STAGES = [
  {
    name: 'Foundation', paths: [
      ['ln', 'M96 350 V338 H344 V350'],
      ['ln2', 'M120 344 H150 M170 344 H200 M240 344 H270 M290 344 H320'],
    ],
  },
  {
    name: 'Framing', paths: [
      ['ln', 'M100 338 V160 H340 V338'],
      ['ln', 'M100 250 H340'],
      ['ln2', 'M124 250 V160 M148 250 V160 M172 250 V160 M196 250 V160 M244 250 V160 M268 250 V160 M292 250 V160 M316 250 V160'],
      ['ln2', 'M124 338 V250 M148 338 V250 M172 338 V250 M196 338 V250 M244 338 V250 M268 338 V250 M292 338 V250 M316 338 V250'],
    ],
  },
  {
    name: 'Roof', paths: [
      ['ln', 'M86 166 L220 64 L354 166'],
      ['ln2', 'M120 140 L220 76 L320 140 M152 116 H288'],
    ],
  },
  {
    name: 'Windows & doors', paths: [
      ['ln', 'M200 104 h40 v34 h-40 z M220 104 v34'],
      ['ln', 'M126 182 h40 v52 h-40 z M146 182 v52 M126 208 h40'],
      ['ln', 'M200 182 h40 v52 h-40 z M220 182 v52 M200 208 h40'],
      ['ln', 'M274 182 h40 v52 h-40 z M294 182 v52 M274 208 h40'],
      ['ln', 'M190 284 h24 v52 h-24 z M226 284 h24 v52 h-24 z'],
    ],
  },
  {
    name: 'Porch', paths: [
      ['ln', 'M90 270 H350 M96 262 H344 L350 270'],
      ['ln', 'M108 270 V336 M172 270 V336 M268 270 V336 M332 270 V336'],
      ['ln', 'M100 336 H340'],
      ['ln', 'M108 314 H172 M268 314 H332'],
      ['ln2', 'M118 314 v22 M128 314 v22 M138 314 v22 M148 314 v22 M158 314 v22 M278 314 v22 M288 314 v22 M298 314 v22 M308 314 v22 M318 314 v22'],
      ['ln', 'M184 338 H256 M178 344 H262 M172 350 H268'],
    ],
  },
  {
    name: 'Finish', paths: [
      ['ln2', 'M102 172 H124 M102 196 H124 M102 220 H124 M102 244 H124 M316 172 H338 M316 196 H338 M316 220 H338 M316 244 H338'],
      ['ln2', 'M166 196 H200 M240 196 H274 M166 220 H200 M240 220 H274'],
      ['ln2', 'M100 372 H340 M100 366 v12 M340 366 v12'],
    ],
    caption: true,
  },
]

const N = STAGES.length
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Hero build-up: the same house assembles stage by stage, then loops.
// `on` = stages drawn, `done` = stages finished drawing (no longer highlighted).
function BuildPlate() {
  const svgRef = useRef(null)
  const [{ on, done, fade, snap }, setS] = useState(() =>
    reducedMotion() ? { on: N, done: N, fade: false, snap: false } : { on: 0, done: 0, fade: false, snap: false })

  useEffect(() => {
    if (reducedMotion()) return
    const timers = []
    const later = (fn, ms) => timers.push(setTimeout(fn, ms))
    let i = 0
    function step() {
      if (i < N) {
        i++
        const n = i
        setS(s => ({ ...s, on: n, done: n - 1 }))
        later(step, n === 1 ? 900 : 1300)
        return
      }
      setS(s => ({ ...s, done: N }))
      later(() => {
        setS(s => ({ ...s, fade: true }))
        later(() => {
          setS({ on: 0, done: 0, fade: true, snap: true })
          i = 0
          later(step, 300)
        }, 750)
      }, 4200)
    }
    later(step, 250)
    return () => timers.forEach(clearTimeout)
  }, [])

  // After resetting with transitions off, force a reflow, then switch them back on
  useLayoutEffect(() => {
    if (!snap) return
    svgRef.current.getBoundingClientRect()
    setS(s => ({ ...s, fade: false, snap: false }))
  }, [snap])

  const complete = done === N
  const label = complete ? 'Complete · Ready for residents' : `Stage 0${Math.max(on, 1)} · ${STAGES[Math.max(on, 1) - 1].name}`
  const svgClass = [fade && 'fade', snap && 'snap'].filter(Boolean).join(' ') || undefined

  return (
    <figure className="plate build-plate">
      <svg viewBox="0 0 440 400" role="img" aria-label="Line drawing of a two-family Rochester home being built stage by stage" ref={svgRef} className={svgClass}>
        {/* drawing sheet: always visible */}
        <line className="ln2" x1="20" y1="350" x2="420" y2="350" />
        <g className="ln2" strokeDasharray="2 5"><line x1="80" y1="40" x2="80" y2="350" /><line x1="360" y1="40" x2="360" y2="350" /><line x1="20" y1="150" x2="420" y2="150" /></g>
        {STAGES.map((st, k) => (
          <g key={st.name} className={['bs', k < on && 'on', k < done && 'done'].filter(Boolean).join(' ')} data-name={st.name}>
            {st.paths.map(([cls, d], j) => <path key={j} className={`${cls} d`} pathLength="1" d={d} />)}
            {st.caption && (
              <text x="220" y="390" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="9" letterSpacing="2" fill="var(--slate)">TWO-FAMILY · 2½ STORY · ELEVATION</text>
            )}
          </g>
        ))}
      </svg>
      <figcaption>
        <span aria-live="off">{label}</span>
        <span className="ticks" aria-hidden="true">
          {STAGES.map((st, k) => <i key={st.name} className={k < on ? 'on' : undefined} />)}
        </span>
      </figcaption>
    </figure>
  )
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-copy">
          <p className="eyebrow">Real estate company · Rochester, New York</p>
          <h1>We engineer <span className="i">the outcome.</span></h1>
          <p className="lede">NexOmes acquires, renovates and stabilizes residential real estate across Rochester. Conservative underwriting, a dedicated LLC for every project, and one accountable team from acquisition to stabilized income.</p>
          <div className="ctas">
            <a className="btn" href={ASSESS_PATH}>Is your property underperforming? <span className="arr">→</span></a>
            <a className="btn ghost" href="#process">How we work</a>
          </div>
        </div>
        <BuildPlate />
      </div>
    </section>
  )
}
