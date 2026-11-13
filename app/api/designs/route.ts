import { NextResponse } from 'next/server'
import { DesignError, saveDesign } from '@/lib/design-server'

export async function POST(request: Request) {
  try {
    const input = await request.json()
    const snap = await saveDesign(input)
    return NextResponse.json(snap, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    if (e instanceof DesignError) return NextResponse.json({ error: e.message, field: e.field }, { status: 422 })
    console.error('design save failed', e)
    return NextResponse.json({ error: 'Could not save the design. Please try again.' }, { status: 500 })
  }
}
