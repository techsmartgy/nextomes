import { useEffect, useRef, useState } from 'react'
import { loadPlaces, resolve, suggest } from '../places.js'

// Street address input with Google Places suggestions. Falls back to a plain
// input if the Maps API can't load. Calls onSelect({ placeId, address, city, state, zip }).
export default function AddressAutocomplete({ id, value, onChange, onSelect, ref }) {
  const [lib, setLib] = useState(null)
  const [items, setItems] = useState([])
  const [active, setActive] = useState(-1)
  const [open, setOpen] = useState(false)
  const token = useRef(null)
  const picked = useRef(null) // value filled in by the last selection; don't re-query it

  useEffect(() => {
    let live = true
    loadPlaces().then(l => { if (live && l) { setLib(l); token.current = new l.AutocompleteSessionToken() } })
    return () => { live = false }
  }, [])

  // Debounced lookup as the user types
  useEffect(() => {
    const q = value.trim()
    if (!lib || q.length < 3 || value === picked.current) { setItems([]); return }
    let live = true
    const t = setTimeout(() => {
      suggest(lib, q, token.current)
        .then(preds => { if (live) { setItems(preds); setActive(-1); setOpen(true) } })
        .catch(e => console.warn('[places] autocomplete failed', e))
    }, 200)
    return () => { live = false; clearTimeout(t) }
  }, [lib, value])

  const choose = async pred => {
    setOpen(false)
    setItems([])
    try {
      const addr = await resolve(pred)
      picked.current = addr.address
      onSelect(addr)
    } catch (e) {
      console.warn('[places] could not resolve place', e)
    }
    token.current = new lib.AutocompleteSessionToken() // one session per selection
  }

  const onKeyDown = e => {
    if (!open || !items.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % items.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a <= 0 ? items.length : a) - 1) }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(items[active]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  const listId = `${id}-list`
  const showList = open && items.length > 0

  return (
    <div className="ac">
      <input id={id} name="address" autoComplete="off" required placeholder="Street address" ref={ref}
        role="combobox" aria-autocomplete="list" aria-expanded={showList} aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        value={value} onChange={onChange} onKeyDown={onKeyDown}
        onFocus={() => items.length && setOpen(true)} onBlur={() => setOpen(false)} />
      {showList && (
        <ul className="ac-list" id={listId} role="listbox">
          {items.map((p, i) => (
            <li key={p.placeId} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              onMouseDown={e => { e.preventDefault(); choose(p) }} onMouseEnter={() => setActive(i)}>
              <b>{p.mainText?.text ?? p.text.text}</b>
              {p.secondaryText && <span>{p.secondaryText.text}</span>}
            </li>
          ))}
          <li className="ac-attr" aria-hidden="true">Powered by Google</li>
        </ul>
      )}
    </div>
  )
}
