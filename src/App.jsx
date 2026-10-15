import './index.css'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Doors from './components/Doors.jsx'
import About from './components/About.jsx'
import Divisions from './components/Divisions.jsx'
import Process from './components/Process.jsx'
import Versus from './components/Versus.jsx'
import Sell from './components/Sell.jsx'
import Residents from './components/Residents.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import useReveal from './hooks/useReveal.js'

export default function App() {
  useReveal()
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Doors />
        <About />
        <Divisions />
        <Process />
        <Versus />
        <Sell />
        <Residents />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
