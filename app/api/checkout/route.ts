import { NextResponse } from 'next/server'
import crypto from 'crypto'
import Stripe from 'stripe'
import { QuoteError, quote } from '@/lib/pricing'
import { tx, type Order } from '@/lib/store'

const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'landing_pattern']

function orderNumber() {
  const d = new Date()
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
  return `VR-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' })
  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin

  try {
    const body = await request.json()
    // Prices, stock and designs are re-resolved server-side; client totals are ignored.
    const q = quote(body.lines, String(body.country))
    const attribution: Record<string, string> = {}
    for (const k of ATTRIBUTION_KEYS) {
      const v = body.attribution?.[k]
      if (typeof v === 'string' && v) attribution[k] = v.slice(0, 100)
    }

    const order: Order = {
      id: crypto.randomUUID(),
      number: orderNumber(),
      token: crypto.randomBytes(18).toString('base64url'),
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      currency: q.currency,
      country: q.country,
      lines: q.lines.map((l) => ({
        lineNo: l.lineNo,
        designId: l.design.id,
        designVersion: l.design.version,
        sku: l.design.sku,
        qty: l.qty,
        unitCents: l.design.pricing.unitCents,
        title: l.title,
      })),
      subtotalCents: q.subtotalCents,
      personalizationCents: q.personalizationCents,
      shippingCents: q.shippingCents,
      taxCents: q.taxCents,
      totalCents: q.totalCents,
      attribution,
      events: [{ at: new Date().toISOString(), type: 'created' }],
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: order.number },
      payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.number } },
      line_items: q.lines.map((l) => ({
        quantity: l.qty,
        price_data: {
          currency: q.currency,
          unit_amount: l.design.pricing.unitCents,
          product_data: {
            name: l.title,
            // the customer's name is never sent to the payment provider
            description: l.design.name ? 'Personalized · made to order' : 'Made to order',
          },
        },
      })),
      shipping_address_collection: {
        allowed_countries: [q.country as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: `Tracked shipping · ${q.transitTime} after production`,
            fixed_amount: { amount: q.shippingCents, currency: q.currency },
          },
        },
      ],
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      success_url: `${base}/checkout/success?order=${order.id}&token=${order.token}`,
      cancel_url: `${base}/cart?cancelled=1`,
    })
    order.stripeSessionId = session.id
    await tx((db) => {
      db.orders[order.id] = order
    })
    return NextResponse.json({ url: session.url, orderId: order.id })
  } catch (e) {
    if (e instanceof QuoteError) return NextResponse.json({ error: e.message, lineIndex: e.lineIndex }, { status: 422 })
    console.error('Checkout error:', e)
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 })
  }
}
