import { NextResponse } from 'next/server'
import { getDesign } from '@/lib/store'

// Design ids are unguessable UUIDs held only in the customer's cart.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const d = await getDesign(params.id)
  if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(d, { headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' } })
}
