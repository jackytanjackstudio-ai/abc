'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    setError(null)
    const body = Object.fromEntries(new FormData(e.currentTarget).entries())
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null)
    const d = r ? await r.json().catch(() => ({})) : {}
    if (r?.ok) setState('sent')
    else {
      setError(d.error || 'Could not send your message. Please try again.')
      setState('idle')
    }
  }

  if (state === 'sent')
    return (
      <div role="status" className="rounded-2xl bg-sage-soft p-6">
        <p className="font-semibold">Thanks — your message is with us.</p>
        <p className="mt-1 text-sm text-forest-soft">We reply by email, usually within one business day.</p>
      </div>
    )

  const field = 'mt-1 w-full rounded-xl border border-forest/25 bg-white px-4 py-3 focus:border-forest'
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Name
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Topic
          <select name="topic" className={field} defaultValue="order">
            <option value="order">An order</option>
            <option value="personalization">Personalization</option>
            <option value="shipping">Shipping</option>
            <option value="returns">Changes &amp; returns</option>
            <option value="other">Something else</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Order number <span className="font-normal text-forest-soft">(optional)</span>
          <input name="orderNumber" placeholder="VR-…" className={field} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Message
        <textarea name="message" required rows={5} className={field} />
      </label>
      {/* honeypot — hidden from people */}
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && <p role="alert" className="text-sm text-alert">{error}</p>}
      <button type="submit" className="btn-primary" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
