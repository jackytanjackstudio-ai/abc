import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getDesign, getOrder } from '@/lib/store'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = new URL(request.url).searchParams.get('token') ?? ''
  const order = await getOrder(params.id)
  const a = Buffer.from(token)
  const b = Buffer.from(order?.token ?? '')
  const ok = !!order && a.length === b.length && crypto.timingSafeEqual(a, b)
  if (!order || !ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(
    {
      number: order.number,
      status: order.status,
      currency: order.currency,
      totalCents: order.totalCents,
      lines: await Promise.all(order.lines.map(async (l) => {
        const d = await getDesign(l.designId)
        return { lineNo: l.lineNo, title: l.title, qty: l.qty, unitCents: l.unitCents, previewSvg: d?.previewSvg ?? null, nameText: d?.name?.text ?? null }
      })),
    },
    { headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' } },
  )
}
