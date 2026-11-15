import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { insertContactMessage } from '@/lib/store'

const TOPICS = ['order', 'personalization', 'shipping', 'returns', 'other']
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: Request) {
  try {
    const b = await request.json()
    if (str(b.company, 100)) return NextResponse.json({ ok: true }) // honeypot: bots fill hidden field
    const name = str(b.name, 100)
    const email = str(b.email, 200)
    const message = str(b.message, 4000)
    const topic = TOPICS.includes(b.topic) ? b.topic : 'other'
    const orderNumber = str(b.orderNumber, 40) || undefined
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5)
      return NextResponse.json({ error: 'Please add your name, a valid email and a message.' }, { status: 422 })
    await insertContactMessage({ id: crypto.randomUUID(), name, email, orderNumber, topic, message })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('contact failed', e)
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 })
  }
}
