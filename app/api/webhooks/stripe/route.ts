import { NextResponse } from 'next/server'
import crypto from 'crypto'
import Stripe from 'stripe'
import { applyPaymentEvent } from '@/lib/store'

export const dynamic = 'force-dynamic'

const HANDLED = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.expired',
  'checkout.session.async_payment_failed',
])

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const key = process.env.STRIPE_SECRET_KEY
  if (!secret || !key) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  const stripe = new Stripe(key, { apiVersion: '2025-09-30.clover' })

  let event: Stripe.Event
  try {
    // raw body is required for signature verification
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get('stripe-signature') ?? '', secret)
  } catch {
    return NextResponse.json({ error: 'bad signature' }, { status: 400 })
  }
  if (!HANDLED.has(event.type)) return NextResponse.json({ received: true })

  const session = event.data.object as Stripe.Checkout.Session
  const orderId = session.metadata?.orderId
  if (!orderId) return NextResponse.json({ received: true })

  // Event id is recorded and the order + stock rows are locked in one transaction,
  // so duplicate or concurrent deliveries are applied at most once.
  await applyPaymentEvent(event.id, orderId, ({ order, inventory, designHasName, activeJobKeys, newJobs }) => {
    if (order.stripeSessionId !== session.id) return
    const now = new Date().toISOString()

    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      if (order.status === 'pending_payment') {
        order.status = 'expired'
        order.events.push({ at: now, type: event.type })
      }
      return
    }
    if (session.payment_status !== 'paid') return
    if (order.status === 'paid' || order.status === 'needs_review') return // already handled

    order.paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
    order.paidAt = now

    // Amount and currency must match what the server priced.
    if (session.amount_total !== order.totalCents || session.currency !== order.currency) {
      order.status = 'needs_review'
      order.events.push({ at: now, type: 'amount_mismatch', note: `${session.amount_total} ${session.currency}` })
      return
    }

    const need: Record<string, number> = {}
    order.lines.forEach((l) => (need[l.sku] = (need[l.sku] ?? 0) + l.qty))
    const short = Object.entries(need).filter(([s, n]) => (inventory[s] ?? 0) < n)
    if (short.length) {
      order.status = 'needs_review' // charged but cannot fulfil → manual handling
      order.events.push({ at: now, type: 'stock_conflict', note: short.map(([s]) => s).join(',') })
      return
    }
    Object.entries(need).forEach(([s, n]) => (inventory[s] = (inventory[s] ?? 0) - n))
    order.status = 'paid'
    order.events.push({ at: now, type: 'paid' })

    // One active production job per order line + design version.
    for (const l of order.lines) {
      const jobKey = `${order.id}:${l.lineNo}:${l.designVersion}`
      if (activeJobKeys.has(jobKey)) continue
      newJobs.push({
        id: crypto.randomUUID(),
        key: jobKey,
        orderId: order.id,
        orderNumber: order.number,
        lineNo: l.lineNo,
        designId: l.designId,
        qty: l.qty,
        needsTransfer: !!designHasName[l.designId],
        status: 'queued',
        createdAt: now,
      })
    }
  })
  return NextResponse.json({ received: true })
}
