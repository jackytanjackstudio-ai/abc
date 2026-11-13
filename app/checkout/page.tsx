'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MARKETS, formatMoney } from '@/lib/catalog'
import { useCart } from '@/lib/cart'
import { getAttribution, track } from '@/lib/analytics'

interface QuoteResponse {
  currency: string
  lines: { lineNo: number; designId: string; qty: number; title: string; unitCents: number }[]
  subtotalCents: number
  personalizationCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  productionTime: string
  transitTime: string
}

export default function Checkout() {
  const lines = useCart()
  const [mounted, setMounted] = useState(false)
  const [country, setCountry] = useState('US')
  const [q, setQ] = useState<QuoteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  useEffect(() => setMounted(true), [])

  const payload = lines.map((l) => ({ designId: l.design.id, qty: l.qty }))
  const key = JSON.stringify(payload)

  useEffect(() => {
    if (!mounted || payload.length === 0) return
    let live = true
    setQ(null)
    setError(null)
    fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines: payload, country }) })
      .then(async (r) => {
        const d = await r.json()
        if (!live) return
        if (!r.ok) setError(d.error)
        else setQ(d)
      })
      .catch(() => live && setError('Could not calculate the total. Check your connection.'))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, key, country])

  async function pay() {
    if (!q) return
    setPaying(true)
    setError(null)
    track('begin_checkout', { value: q.totalCents / 100, currency: q.currency, lines: q.lines.length })
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: payload, country, attribution: getAttribution() }),
      })
      const d = await r.json()
      if (!r.ok || !d.url) throw new Error(d.error || 'Could not start payment.')
      window.location.href = d.url
    } catch (e) {
      setError((e as Error).message)
      setPaying(false)
    }
  }

  if (!mounted) return <div className="container-custom py-12" aria-busy="true" />
  if (lines.length === 0)
    return (
      <div className="container-custom py-12">
        <h1 className="text-4xl">Checkout</h1>
        <p className="mt-6 text-forest-soft">Your cart is empty.</p>
        <Link href="/products" className="btn-primary mt-6">Shop luggage</Link>
      </div>
    )

  return (
    <div className="container-custom max-w-3xl py-12">
      <h1 className="text-4xl">Checkout</h1>

      <div className="mt-8">
        <label htmlFor="country" className="text-sm font-semibold">Ship to</label>
        <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="mt-2 block w-full rounded-full border border-forest/30 bg-white px-4 py-3">
          {Object.entries(MARKETS).map(([code, m]) => (
            <option key={code} value={code}>{m.name}</option>
          ))}
        </select>
        <p className="mt-2 text-sm text-forest-soft">Not listed? We don’t ship there yet — you’ll be told before paying.</p>
      </div>

      <section className="mt-8 rounded-2xl bg-sand/60 p-6" aria-live="polite" aria-busy={!q && !error}>
        {lines.map((l) => (
          <div key={l.lineId} className="flex justify-between py-1 text-sm">
            <span>
              {l.qty} × {l.design.modelName} · {l.design.patternName}
              {l.design.name && <> · <span className="font-mono">{l.design.name.text}</span></>}
            </span>
            <span>{formatMoney(l.design.pricing.unitCents * l.qty)}</span>
          </div>
        ))}
        <hr className="my-4 border-forest/15" />
        {q ? (
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt>Cases</dt><dd>{formatMoney(q.subtotalCents, q.currency)}</dd></div>
            <div className="flex justify-between"><dt>Name printing</dt><dd>{formatMoney(q.personalizationCents, q.currency)}</dd></div>
            <div className="flex justify-between"><dt>Shipping to {MARKETS[country].name}</dt><dd>{formatMoney(q.shippingCents, q.currency)}</dd></div>
            <div className="flex justify-between"><dt>Taxes &amp; duties</dt><dd>{formatMoney(q.taxCents, q.currency)}</dd></div>
            <div className="flex justify-between pt-2 text-base font-semibold"><dt>Total ({q.currency.toUpperCase()})</dt><dd>{formatMoney(q.totalCents, q.currency)}</dd></div>
            <p className="pt-3 text-forest-soft">
              Made to order in {q.productionTime}, then {q.transitTime} in transit.
            </p>
          </dl>
        ) : (
          !error && <p className="text-sm text-forest-soft">Calculating…</p>
        )}
        {error && (
          <p className="text-sm text-alert">
            {error} <Link href="/cart" className="underline">Back to cart</Link>
          </p>
        )}
      </section>

      <button type="button" className="btn-primary mt-6 w-full" disabled={!q || paying} onClick={pay}>
        {paying ? 'Redirecting to secure payment…' : q ? `Pay ${formatMoney(q.totalCents, q.currency)}` : 'Pay'}
      </button>
      <p className="mt-3 text-center text-xs text-forest-soft">Card details are entered on Stripe’s secure page.</p>
    </div>
  )
}
