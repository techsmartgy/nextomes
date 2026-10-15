import { ASSESS_PATH } from '../constants.js'
import { Mark } from './icons.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const LINKS = [
  ['#about', 'About'], ['#divisions', 'Divisions'], ['#process', 'Process'],
  ['#versus', 'Why NexOmes'], ['#sell', 'Owners'], ['#residents', 'Residents'], ['#contact', 'Contact'],
]

export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap">
        <a className="mark" href="#top" aria-label="NexOmes home"><Mark /></a>
        <nav aria-label="Primary"><ul>
          {LINKS.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}
        </ul></nav>
        <div className="nav-r">
          <ThemeToggle />
          <a className="btn" href={ASSESS_PATH}>Assess my property <span className="arr">→</span></a>
        </div>
      </div>
    </header>
  )
}
