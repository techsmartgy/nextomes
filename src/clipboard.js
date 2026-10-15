// Copy text, falling back to selecting `el` so the user can copy it manually
export function copyText(text, el, onOk) {
  const fallback = () => {
    if (!el) return
    if (el.select) {
      el.focus(); el.select()
      try { if (document.execCommand('copy')) onOk() } catch { /* leave selected */ }
    } else {
      const r = document.createRange(); r.selectNodeContents(el)
      const s = getSelection(); s.removeAllRanges(); s.addRange(r)
    }
  }
  try { navigator.clipboard.writeText(text).then(onOk, fallback) } catch { fallback() }
}
