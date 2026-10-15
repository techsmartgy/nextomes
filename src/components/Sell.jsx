import { useRef, useState } from 'react'
import { CONTACT_EMAIL } from '../constants.js'
import { copyText } from '../clipboard.js'
import { supabase } from '../lib/supabase.js'
import AddressAutocomplete from './AddressAutocomplete.jsx'

const SIGNS = [
  ['A', 'Vacant, or residents who aren\'t paying'],
  ['B', 'Back taxes, liens or a foreclosure notice'],
  ['C', 'Code violations or deferred repairs'],
  ['D', 'Inherited, or more work than you want to take on'],
]

const TYPES = ['1–4 unit residential', 'Multifamily (5+ units)', 'Mixed-use', 'Vacant land']
const OCCUPANCY = ['Owner-occupied', 'Resident-occupied', 'Partially occupied', 'Vacant']
const RELATIONSHIPS = ['Owner', 'Co-owner', 'Heir / estate executor', 'Agent or attorney']
const TIMELINES = ['As soon as possible', 'Within 30 days', '1–3 months', 'Just exploring options']

// [value sent to FormSubmit, label shown to the owner]
const DISTRESS = [
  ['Not cash flowing', 'Not cash flowing / losing money monthly'],
  ['Vacant', 'Vacant or abandoned'],
  ['Resident arrears', 'Residents behind on rent'],
  ['Eviction', 'Eviction in progress'],
  ['Code violations', 'Code violations'],
  ['Tax delinquency', 'Behind on property taxes'],
  ['Pre-foreclosure', 'Foreclosure notice / behind on mortgage'],
  ['Deferred maintenance', 'Major repairs needed'],
  ['Fire or water damage', 'Fire or water damage'],
  ['Inherited', 'Inherited / estate property'],
]
const CONDITIONS = [
  ['Move-in ready', 'Move-in ready'],
  ['Cosmetic', 'Cosmetic work'],
  ['Significant', 'Significant repairs'],
  ['Uninhabitable', 'Uninhabitable'],
]

const INITIAL = {
  address: '', city: 'Rochester', state: 'NY', zip: '', placeId: '',
  type: TYPES[0], units: '1', beds: '', baths: '', occupancy: OCCUPANCY[0], relationship: RELATIONSHIPS[0],
  distress: [], condition: '',
  name: '', phone: '', email: '', timeline: TIMELINES[0], notes: '', _honey: '',
}

const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// Numbers only, auto-formatted as (585) 555-0123
function formatPhone(raw) {
  let d = raw.replace(/\D/g, '')
  if (d.length > 10 && d[0] === '1') d = d.slice(1)
  d = d.slice(0, 10)
  return d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d
}

function buildMessages(f) {
  const d = new Date()
  const ref = 'NX-' + d.getFullYear().toString().slice(2) + String(d.getMonth() + 1).padStart(2, '0') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
  const t = k => f[k].trim()
  const v = k => t(k) || '—'
  const addr = (v('address') + ', ' + v('city') + ', ' + v('state') + ' ' + t('zip')).trim()
  const picked = DISTRESS.filter(([val]) => f.distress.includes(val))
  const cond = CONDITIONS.find(([val]) => val === f.condition)

  // Curated email: FormSubmit renders these keys, in order, as a table
  const mail = {
    _subject: 'New property assessment: ' + v('address') + ', ' + v('city') + ' (' + ref + ')',
    _template: 'table', _captcha: 'false', _replyto: t('email'),
    _honey: f._honey,
    'Reference': ref,
    'Submitted': d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    '— CONTACT —': '',
    'Name': t('name'),
    'Phone': f.phone,
    'Email': t('email'),
    'Relationship': v('relationship'),
    'Timeline': v('timeline'),
    '— PROPERTY —': '',
    'Address': addr,
    'Google Place ID': f.placeId || '— (typed manually)',
    'Map': f.placeId ? `https://www.google.com/maps/place/?q=place_id:${f.placeId}` : '—',
    'Type': v('type'),
    'Units': v('units'),
    'Beds / baths': v('beds') + ' bd · ' + v('baths') + ' ba',
    'Occupancy': v('occupancy'),
    '— SITUATION —': '',
    'Distress signals': picked.map(([val]) => val).join(', '),
    'Overall condition': cond ? cond[0] : '—',
    'Notes': v('notes'),
  }

  // Copy-ready email written in the owner's voice
  const subj = 'Property assessment request: ' + v('address') + ', ' + v('city') + ' (' + ref + ')'
  const units = t('units')
  const body = [
    'Hello NexOmes team,', '',
    'I would like a confidential assessment of my property. The details are below.', '',
    'PROPERTY',
    'Address: ' + addr,
    'Type: ' + v('type') + (units ? ' · ' + units + ' unit' + (units === '1' ? '' : 's') : ''),
    (t('beds') || t('baths')) ? 'Bedrooms / bathrooms: ' + v('beds') + ' / ' + v('baths') : null,
    'Occupancy: ' + v('occupancy'),
    'My relationship to the property: ' + v('relationship'), '',
    'SITUATION',
    ...picked.map(([, label]) => '- ' + label),
    'Overall condition: ' + (cond ? cond[1] : 'Not specified'),
    'Timeline to resolve: ' + v('timeline'),
    t('notes') ? '' : null, t('notes') ? 'Additional notes:\n' + t('notes') : null, '',
    'The best way to reach me is ' + f.phone + ' or ' + t('email') + '.', '',
    'Thank you,', t('name'), '',
    'Reference ' + ref,
  ].filter(x => x !== null).join('\n')

  return { ref, mail, subj, body }
}

// Row for the assessment_requests table (see supabase/schema.sql)
function buildRow(f, ref) {
  const t = k => f[k].trim() || null
  const num = k => (t(k) === null || Number.isNaN(Number(f[k])) ? null : Number(f[k]))
  return {
    reference: ref,
    name: f.name.trim(), phone: f.phone, email: f.email.trim(),
    relationship: t('relationship'), timeline: t('timeline'),
    address: f.address.trim(), city: t('city'), state: t('state'), zip: t('zip'), place_id: t('placeId'),
    property_type: t('type'), units: num('units'), beds: num('beds'), baths: num('baths'), occupancy: t('occupancy'),
    distress: f.distress, condition: t('condition'), notes: t('notes'),
  }
}

function saveRequest(f, ref) {
  if (f._honey) return Promise.reject(new Error('honeypot'))
  return supabase.from('assessment_requests').insert(buildRow(f, ref)).then(({ error }) => {
    if (error) { console.warn('[lead form] Supabase:', error.message); throw error }
  })
}

function Select({ id, label, name, options, value, onChange }) {
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} value={value} onChange={onChange}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function LeadForm() {
  const [f, setF] = useState(INITIAL)
  const [step, setStep] = useState(1)
  const [err1, setErr1] = useState('')
  const [err2, setErr2] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // { sent, ref, subj, body }
  const [copied, setCopied] = useState(false)
  const panelRef = useRef(null)
  const bodyRef = useRef(null)
  const inputs = useRef({})
  const reg = k => el => { inputs.current[k] = el }
  const focus = k => inputs.current[k]?.focus()
  const scrollToPanel = () => panelRef.current.scrollIntoView({ block: 'start' })

  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }))
  const toggleDistress = val => setF(s => ({
    ...s, distress: s.distress.includes(val) ? s.distress.filter(x => x !== val) : [...s.distress, val],
  }))

  const next = () => {
    const z = f.zip.trim()
    if (!f.address.trim()) { setErr1('Enter the property address to continue.'); focus('address'); return }
    if (z && !/^\d{5}$/.test(z)) { setErr1('ZIP code should be five digits.'); focus('zip'); return }
    setErr1('')
    setStep(2)
    scrollToPanel()
  }

  const submit = e => {
    e.preventDefault()
    if (!f.distress.length) { setErr2('Select at least one situation that applies.'); return }
    if (!f.name.trim()) { setErr2('Add your name so we know who to contact.'); focus('name'); return }
    if (f.phone.replace(/\D/g, '').length < 10) { setErr2('Enter a 10-digit phone number.'); focus('phone'); return }
    if (!emailOk(f.email.trim())) { setErr2('Enter a valid email address, like name@email.com.'); focus('email'); return }
    setErr2('')

    const { ref, mail, subj, body } = buildMessages(f)
    const finish = sent => {
      setResult({ sent, ref, subj, body })
      requestAnimationFrame(scrollToPanel)
    }
    setSending(true)
    const email = fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(mail),
    }).then(r => r.json().then(j => {
      if (!r.ok || String(j.success) !== 'true') { console.warn('[lead form] FormSubmit:', j.message || r.status); throw new Error('not sent') }
    }))
    // Saved for the admin portal and emailed to the team; either one reaching us counts
    Promise.allSettled([saveRequest(f, ref), email])
      .then(rs => finish(rs.some(r => r.status === 'fulfilled')))
  }

  const copyMessage = () => copyText(result.body, bodyRef.current, () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  })

  const done = result !== null
  const mailto = done ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(result.subj)}&body=${encodeURIComponent(result.body)}` : `mailto:${CONTACT_EMAIL}`

  return (
    <div className="panel" id="leadPanel" ref={panelRef}>
      <h3>Property assessment</h3>
      <p className="sub">Confidential. No obligation.</p>
      <div className="steps" aria-hidden="true" hidden={done}>
        <div className={step === 1 ? 'on' : undefined}>01 · Property basics</div>
        <div className={step === 2 ? 'on' : undefined}>02 · Condition &amp; contact</div>
      </div>

      <form noValidate onSubmit={submit} hidden={done}>
        {/* Step 1 */}
        <div hidden={step !== 1} style={{ display: 'grid', gap: 18 }}>
          <div className="f"><label htmlFor="l-addr">Property address</label>
            <AddressAutocomplete id="l-addr" ref={reg('address')} value={f.address}
              onChange={e => setF(s => ({ ...s, address: e.target.value, placeId: '' }))}
              onSelect={a => setF(s => ({ ...s, ...a, city: a.city || s.city, state: a.state || s.state, zip: a.zip || s.zip }))} />
          </div>
          <div className="row three">
            <div className="f"><label htmlFor="l-city">City</label><input id="l-city" name="city" value={f.city} onChange={set('city')} /></div>
            <div className="f"><label htmlFor="l-state">State</label><input id="l-state" name="state" value={f.state} onChange={set('state')} /></div>
            <div className="f"><label htmlFor="l-zip">ZIP</label><input id="l-zip" name="zip" inputMode="numeric" maxLength={5} placeholder="146__" ref={reg('zip')} value={f.zip} onChange={e => setF(s => ({ ...s, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))} /></div>
          </div>
          <div className="row">
            <Select id="l-type" label="Property type" name="type" options={TYPES} value={f.type} onChange={set('type')} />
            <div className="f"><label htmlFor="l-units">Number of units</label><input id="l-units" name="units" type="number" min="1" value={f.units} onChange={set('units')} /></div>
          </div>
          <div className="row three">
            <div className="f"><label htmlFor="l-beds">Bedrooms</label><input id="l-beds" name="beds" type="number" min="0" placeholder="3" value={f.beds} onChange={set('beds')} /></div>
            <div className="f"><label htmlFor="l-baths">Bathrooms</label><input id="l-baths" name="baths" type="number" min="0" step="0.5" placeholder="1.5" value={f.baths} onChange={set('baths')} /></div>
            <Select id="l-occ" label="Occupancy" name="occupancy" options={OCCUPANCY} value={f.occupancy} onChange={set('occupancy')} />
          </div>
          <Select id="l-rel" label="Your relationship to the property" name="relationship" options={RELATIONSHIPS} value={f.relationship} onChange={set('relationship')} />
          <p className="err" role="alert">{err1}</p>
          <div className="actions"><span className="fine">Step 1 of 2</span><button className="btn" type="button" onClick={next}>Continue <span className="arr">→</span></button></div>
        </div>

        {/* Step 2 */}
        <div hidden={step !== 2} style={{ display: 'grid', gap: 22 }}>
          <fieldset className="chips">
            <legend className="lbl">What best describes the situation? Select all that apply.</legend>
            {DISTRESS.map(([val, label]) => (
              <label key={val} className="chip"><input type="checkbox" name="distress" value={val} checked={f.distress.includes(val)} onChange={() => toggleDistress(val)} /><span>{label}</span></label>
            ))}
          </fieldset>
          <fieldset className="chips" style={{ display: 'block' }}>
            <legend className="lbl">Overall condition</legend>
            <div className="scale">
              {CONDITIONS.map(([val, label]) => (
                <label key={val} className="chip"><input type="radio" name="condition" value={val} checked={f.condition === val} onChange={set('condition')} /><span>{label}</span></label>
              ))}
            </div>
          </fieldset>
          <div className="row">
            <div className="f"><label htmlFor="l-name">Your name</label><input id="l-name" name="name" autoComplete="name" required placeholder="Full name" ref={reg('name')} value={f.name} onChange={set('name')} /></div>
            <div className="f"><label htmlFor="l-phone">Phone</label><input id="l-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required maxLength={14} placeholder="(585) 555-0123" ref={reg('phone')} value={f.phone} onChange={e => setF(s => ({ ...s, phone: formatPhone(e.target.value) }))} /></div>
          </div>
          <div className="row">
            <div className="f"><label htmlFor="l-email">Email</label><input id="l-email" name="email" type="email" autoComplete="email" required placeholder="name@email.com" ref={reg('email')} value={f.email} onChange={set('email')} /></div>
            <Select id="l-when" label="Timeline to resolve" name="timeline" options={TIMELINES} value={f.timeline} onChange={set('timeline')} />
          </div>
          <div className="f"><label htmlFor="l-notes">Anything else we should know?</label><textarea id="l-notes" name="notes" placeholder="Monthly shortfall, outstanding balances, access instructions…" value={f.notes} onChange={set('notes')} /></div>
          <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} value={f._honey} onChange={set('_honey')} />
          <p className="err" role="alert">{err2}</p>
          <div className="actions">
            <button className="btn ghost" type="button" onClick={() => setStep(1)}>← Back</button>
            <button className="btn" type="submit" disabled={sending}>{sending ? 'Sending…' : <>Request my assessment <span className="arr">→</span></>}</button>
          </div>
        </div>
      </form>

      {done && (
        <div className="done">
          <div className="tick">{result.sent ? '✓' : '→'}</div>
          <h3>{result.sent ? 'Thank you. We have your details.' : 'Almost there. Send it to us by email.'}</h3>
          <p>{result.sent
            ? 'A member of the NexOmes team will review the property and contact you within one business day with next steps.'
            : `We couldn’t submit your request automatically. Copy the message below and email it to ${CONTACT_EMAIL}, or open it in your email app. We’ll respond within one business day.`}</p>
          <p className="ref">Reference {result.ref}</p>
          <div className="mail-copy">
            <p className="lbl">{result.sent ? 'Want a copy for your records? Here\'s your request as an email.' : 'Your request, ready to send'}</p>
            <dl className="mc-meta"><dt>To</dt><dd>{CONTACT_EMAIL}</dd><dt>Subject</dt><dd>{result.subj}</dd></dl>
            <textarea readOnly rows={14} aria-label="Email message" ref={bodyRef} value={result.body} />
            <div className="actions"><button className="btn" type="button" onClick={copyMessage}>{copied ? 'Copied ✓' : 'Copy message'}</button><a className="btn ghost" href={mailto}>Open in email app <span className="arr">→</span></a></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Sell() {
  return (
    <section id="sell">
      <div className="wrap sell-grid">
        <div>
          <p className="eyebrow">For property owners</p>
          <h2 style={{ marginTop: 16 }}>Is your property in distress, or <em className="it">not cash flowing?</em></h2>
          <p className="lede">Tell us about it in two minutes. We&apos;ll review it confidentially and respond with clear options: a direct purchase, a long-term partnership, or a stabilization plan.</p>
          <ul className="signs">
            {SIGNS.map(([k, t]) => <li key={k}><span>{k}</span>{t}</li>)}
          </ul>
        </div>
        <LeadForm />
      </div>
    </section>
  )
}
