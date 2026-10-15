import { useEffect } from 'react'

const SELECTORS = [
  '.about-head>*', '.purpose', '.sig', '.tenets li',
  '.sec-head>*', '.div-item', '.stage', '.rcs',
  '.vs-top>*', '#vs-own',
  '.sell-grid>div:first-child>*', '#leadPanel',
  '.res-top>div:first-child>*', '.res-card', '.res-promise>div', '.rj-head', '.rj-steps li', '.rj-cta',
  '.contact-grid>div:first-child>*', '.coords>div',
].join(',')

// Scroll-in reveal, staggered among siblings
export default function useReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = [...document.querySelectorAll(SELECTORS)]
    const seen = new Map()
    els.forEach(el => {
      const n = seen.get(el.parentNode) || 0
      seen.set(el.parentNode, n + 1)
      el.style.setProperty('--rv-d', Math.min(n, 5) * 0.09 + 's')
      el.classList.add('rv')
    })
    document.querySelector('.res-card')?.classList.add('rv-fade') // fade only, keeps its tilt
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -10% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}
