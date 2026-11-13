import { NextResponse } from 'next/server'
import { QuoteError, quote } from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    const { lines, country } = await request.json()
    const q = quote(lines, String(country))
    return NextResponse.json({
      ...q,
      lines: q.lines.map((l) => ({ lineNo: l.lineNo, designId: l.design.id, qty: l.qty, title: l.title, unitCents: l.design.pricing.unitCents })),
    })
  } catch (e) {
    if (e instanceof QuoteError) return NextResponse.json({ error: e.message, lineIndex: e.lineIndex }, { status: 422 })
    return NextResponse.json({ error: 'Could not calculate the total.' }, { status: 500 })
  }
}
