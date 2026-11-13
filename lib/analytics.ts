'use client'

// Funnel events (brief p.13). Events go to window.dataLayer only after the
// visitor accepts analytics. Never pass the customer's name, design ids or
// order tokens — only booleans/ids from the catalog.

type EventName = 'landing_view' | 'studio_start' | 'add_to_cart' | 'begin_checkout' | 'purchase'

const CONSENT_KEY = 'viarou_consent'
const ATTR_KEY = 'viarou_attribution'
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

export function getConsent(): 'granted' | 'denied' | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function setConsent(v: 'granted' | 'denied') {
  try {
    localStorage.setItem(CONSENT_KEY, v)
  } catch {}
}

export function track(event: EventName, props: Record<string, string | number | boolean | undefined> = {}) {
  if (getConsent() !== 'granted') return
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...getAttribution(), ...props })
}

/** First-touch UTM capture for this session; attached to the order for channel reporting. */
export function captureAttribution(extra: Record<string, string> = {}) {
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Record<string, string> = {}
    UTM.forEach((k) => {
      const v = params.get(k)
      if (v) found[k] = v
    })
    const existing = sessionStorage.getItem(ATTR_KEY)
    if (!existing && (Object.keys(found).length || Object.keys(extra).length)) {
      sessionStorage.setItem(ATTR_KEY, JSON.stringify({ ...found, ...extra }))
    }
  } catch {}
}

export function getAttribution(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}')
  } catch {
    return {}
  }
}
