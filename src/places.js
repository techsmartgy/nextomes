const KEY = import.meta.env.PLACE_API

let placesLib

// Load the Maps JS API once and resolve with the Places library (null if unavailable)
export function loadPlaces() {
  if (!KEY) return Promise.resolve(null)
  if (!placesLib) {
    placesLib = new Promise((resolve, reject) => {
      const cb = '__nxMapsReady'
      window[cb] = () => { delete window[cb]; resolve() }
      const s = document.createElement('script')
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}&v=weekly&loading=async&callback=${cb}`
      s.async = true
      s.onerror = reject
      document.head.appendChild(s)
    })
      .then(() => window.google.maps.importLibrary('places'))
      .catch(e => { console.warn('[places] could not load Google Maps', e); return null })
  }
  return placesLib
}

// Rochester, NY: bias suggestions toward the area we operate in
const ROCHESTER = { center: { lat: 43.1566, lng: -77.6088 }, radius: 40000 }

export async function suggest(lib, input, sessionToken) {
  const { suggestions } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken,
    includedRegionCodes: ['us'],
    includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
    locationBias: ROCHESTER,
  })
  return suggestions.map(s => s.placePrediction).filter(Boolean)
}

// Resolve a prediction to { placeId, address, city, state, zip }
export async function resolve(prediction) {
  const place = prediction.toPlace()
  await place.fetchFields({ fields: ['addressComponents'] })
  const get = (type, short) => {
    const c = place.addressComponents?.find(x => x.types.includes(type))
    return c ? (short ? c.shortText : c.longText) : ''
  }
  const street = [get('street_number'), get('route', true)].filter(Boolean).join(' ')
  const unit = get('subpremise')
  return {
    placeId: place.id,
    address: unit ? `${street} #${unit}` : street,
    city: get('locality') || get('sublocality') || get('postal_town') || get('administrative_area_level_3'),
    state: get('administrative_area_level_1', true),
    zip: get('postal_code'),
  }
}
