import { NextResponse } from 'next/server'
import { authorizeProduction, nameLayerSvg, positioningSheet } from '@/lib/production'
import { readDesign, readJobs } from '@/lib/store'

export const dynamic = 'force-dynamic'

// ?format=sheet (default, JSON positioning sheet) | svg (outlined name layer) | preview (composite)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!authorizeProduction(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const job = readJobs().find((j) => j.id === params.id)
  const design = job && readDesign(job.designId)
  if (!job || !design) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const format = new URL(request.url).searchParams.get('format') ?? 'sheet'
  const noStore = { 'Cache-Control': 'no-store' }
  if (format === 'svg') {
    const svg = nameLayerSvg(design)
    if (!svg) return NextResponse.json({ error: 'no name layer for this line' }, { status: 404 })
    return new NextResponse(svg, {
      headers: { ...noStore, 'Content-Type': 'image/svg+xml', 'Content-Disposition': `attachment; filename="${job.orderNumber}-L${job.lineNo}-name.svg"` },
    })
  }
  if (format === 'preview') return new NextResponse(design.previewSvg, { headers: { ...noStore, 'Content-Type': 'image/svg+xml' } })
  return NextResponse.json(positioningSheet(job, design), { headers: noStore })
}
