import { NextResponse } from 'next/server'
import { authorizeProduction } from '@/lib/production'
import { listJobs } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!authorizeProduction(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const jobs = await listJobs(status)
  return NextResponse.json(jobs, { headers: { 'Cache-Control': 'no-store' } })
}
