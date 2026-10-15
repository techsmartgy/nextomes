import { useRef, useState } from 'react'
import { CONTACT_EMAIL, FACEBOOK_URL, INSTAGRAM_URL } from '../constants.js'
import { copyText } from '../clipboard.js'
import { FacebookIcon, InstagramIcon } from './icons.jsx'

export default function Contact() {
  const emailRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const copy = () => copyText(CONTACT_EMAIL, emailRef.current, () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  })

  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 style={{ marginTop: 16 }}>We&apos;re building something. <em>If that resonates, let&apos;s talk.</em></h2>
          <p className="lede">Property owners and residents are all welcome. Every inquiry is answered by a member of our team.</p>
          <a className="btn" href="#sell">Request an assessment <span className="arr">→</span></a>
        </div>
        <div className="coords">
          <div><span className="lbl">Headquarters</span><p>902 Portland Ave<br />Rochester, NY 14621</p></div>
          <div><span className="lbl">Email</span><p><span ref={emailRef}>{CONTACT_EMAIL}</span><button className="copy" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></p></div>
          <div><span className="lbl">Hours</span><p>Monday – Friday, 9:00 a.m. – 5:00 p.m.</p></div>
          <div><span className="lbl">Follow us</span>
            <p className="socials">
              <a className="soc" href={FACEBOOK_URL} target="_blank" rel="noopener" aria-label="NexOmes on Facebook"><FacebookIcon /><span>Facebook</span></a>
              <a className="soc" href={INSTAGRAM_URL} target="_blank" rel="noopener" aria-label="NexOmes on Instagram"><InstagramIcon /><span>Instagram</span></a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
