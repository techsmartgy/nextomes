import { FACEBOOK_URL, INSTAGRAM_URL } from '../constants.js'
import { FacebookIcon, InstagramIcon, Mark } from './icons.jsx'

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span className="mark"><Mark /></span>
        <span className="tag">Better homes. Stronger assets. Disciplined execution.</span>
        <span className="foot-r">
          <a className="soc-ic" href={FACEBOOK_URL} target="_blank" rel="noopener" aria-label="NexOmes on Facebook"><FacebookIcon /></a>
          <a className="soc-ic" href={INSTAGRAM_URL} target="_blank" rel="noopener" aria-label="NexOmes on Instagram"><InstagramIcon /></a>
          <a className="foot-link" href="/privacy-policy.html">Privacy Policy</a>
          <span>© 2026 NexOmes Corporation · Rochester, New York</span>
        </span>
      </div>
    </footer>
  )
}
