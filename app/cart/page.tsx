'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { formatMoney } from '@/lib/catalog'
import { cart, useCart } from '@/lib/cart'
import { designTitle } from '@/lib/design'

function CartView() {
  const lines = useCart()
  const params = useSearchParams()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="container-custom py-12" aria-busy="true" />

  const subtotal = lines.reduce((s, l) => s + l.design.pricing.unitCents * l.qty, 0)

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl">Your cart</h1>
      {params.get('cancelled') && (
        <p role="status" className="mt-4 rounded-xl bg-sand p-4 text-sm">
          Payment was not completed. Your designs are still here — you can try again.
        </p>
      )}

      {lines.length === 0 ? (
        <div className="mt-10">
          <p className="text-forest-soft">Your cart is empty.</p>
          <Link href="/products" className="btn-primary mt-6">Shop luggage</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-forest/10">
            {lines.map((l) => (
              <li key={l.lineId} className="flex gap-5 py-6">
                <div className="svg-fill h-40 w-28 shrink-0 rounded-xl bg-sand p-2" dangerouslySetInnerHTML={{ __html: l.design.previewSvg }} />
                <div className="flex-1">
                  <p className="font-semibold">{designTitle(l.design)}</p>
                  {l.design.name ? (
                    <p className="mt-1 text-sm">
                      Name: <span className="font-mono tracking-[0.12em]">{l.design.name.text}</span>
                      <span className="text-forest-soft"> · {l.design.name.colorName}, {l.design.name.sizeMm} mm</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-forest-soft">No name</p>
                  )}
                  <p className="mt-1 text-sm text-forest-soft">{formatMoney(l.design.pricing.unitCents)} each</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center rounded-full border border-forest/25">
                      <button type="button" className="px-3 py-1" aria-label="Decrease quantity" onClick={() => cart.setQty(l.lineId, l.qty - 1)} disabled={l.qty <= 1}>−</button>
                      <span className="w-6 text-center" aria-label="Quantity">{l.qty}</span>
                      <button type="button" className="px-3 py-1" aria-label="Increase quantity" onClick={() => cart.setQty(l.lineId, l.qty + 1)} disabled={l.qty >= 10}>+</button>
                    </div>
                    <Link href={`/studio?design=${l.design.id}&line=${l.lineId}`} className="underline underline-offset-4">Edit design</Link>
                    <button type="button" className="underline underline-offset-4" onClick={() => cart.remove(l.lineId)}>Remove</button>
                  </div>
                </div>
                <p className="font-semibold">{formatMoney(l.design.pricing.unitCents * l.qty)}</p>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-2xl bg-sand/60 p-6">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <p className="mt-2 text-sm text-forest-soft">Shipping and taxes are calculated for your destination at checkout.</p>
            <Link href="/checkout" className="btn-primary mt-6 w-full">Checkout</Link>
            <Link href="/products" className="mt-3 block text-center text-sm underline underline-offset-4">Add another case</Link>
          </aside>
        </div>
      )}
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense>
      <CartView />
    </Suspense>
  )
}
