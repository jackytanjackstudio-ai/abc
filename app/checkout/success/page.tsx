'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { formatMoney } from '@/lib/catalog'
import { cart } from '@/lib/cart'
import { track } from '@/lib/analytics'

interface OrderView {
  number: string
  status: string
  currency: string
  totalCents: number
  lines: { lineNo: number; title: string; qty: number; unitCents: number; previewSvg: string | null; nameText: string | null }[]
}

function Success() {
  const params = useSearchParams()
  const id = params.get('order')
  const token = params.get('token')
  const [order, setOrder] = useState<OrderView | null>(null)
  const [error, setError] = useState(false)
  const tries = useRef(0)

  useEffect(() => {
    if (!id || !token) return setError(true)
    let timer: ReturnType<typeof setTimeout>
    const load = () =>
      fetch(`/api/orders/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((o: OrderView) => {
          setOrder(o)
          // payment is confirmed by the webhook; poll briefly until it lands
          if (o.status === 'pending_payment' && tries.current++ < 10) timer = setTimeout(load, 2000)
        })
        .catch(() => setError(true))
    load()
    return () => clearTimeout(timer)
  }, [id, token])

  const paid = order?.status === 'paid' || order?.status === 'needs_review'
  useEffect(() => {
    if (!order || !paid) return
    cart.clear()
    const key = `viarou_purchase_${order.number}`
    try {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1')
        track('purchase', { order_number: order.number, value: order.totalCents / 100, currency: order.currency })
      }
    } catch {}
  }, [order, paid])

  if (error)
    return (
      <div className="container-custom py-16">
        <h1 className="text-4xl">We couldn’t find that order</h1>
        <p className="mt-4 text-forest-soft">If you were charged, your confirmation email has your order number. <Link href="/contact" className="underline">Contact us</Link>.</p>
      </div>
    )
  if (!order) return <div className="container-custom py-16" aria-busy="true">Loading your order…</div>

  return (
    <div className="container-custom max-w-3xl py-16">
      <p className="eyebrow">{paid ? 'Order confirmed' : 'Confirming payment'}</p>
      <h1 className="mt-3 text-4xl">Order {order.number}</h1>
      <p className="mt-4 text-forest-soft">
        {paid
          ? 'Thank you. Keep this order number — production, shipping and tracking updates all use it.'
          : 'We’re waiting for the payment confirmation. This usually takes a few seconds; you can refresh this page.'}
      </p>
      {order.status === 'needs_review' && (
        <p className="mt-4 rounded-xl bg-sand p-4 text-sm">Our team needs to review this order before production and will contact you shortly.</p>
      )}
      <ul className="mt-8 space-y-4">
        {order.lines.map((l) => (
          <li key={l.lineNo} className="flex items-center gap-5 rounded-2xl bg-sand/60 p-4">
            {l.previewSvg && <div className="svg-fill h-32 w-24 shrink-0" dangerouslySetInnerHTML={{ __html: l.previewSvg }} />}
            <div className="flex-1 text-sm">
              <p className="font-semibold">{l.title}</p>
              <p>{l.nameText ? <>Name: <span className="font-mono">{l.nameText}</span></> : 'No name'}</p>
              <p className="text-forest-soft">Qty {l.qty}</p>
            </div>
            <p className="font-semibold">{formatMoney(l.unitCents * l.qty, order.currency)}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-right text-lg font-semibold">Total {formatMoney(order.totalCents, order.currency)}</p>
      <Link href="/products" className="btn-secondary mt-8">Continue shopping</Link>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <Success />
    </Suspense>
  )
}
