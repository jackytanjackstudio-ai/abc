import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LandingTracker from '@/components/LandingTracker'
import PatternMatrix from '@/components/PatternMatrix'
import { COLORS, SERIES, getColor, getPattern, getSeries } from '@/lib/catalog'

export const dynamic = 'force-dynamic' // colour filter comes from the query string

export function generateMetadata({ params }: { params: { series: string } }): Metadata {
  const s = getSeries(params.series)
  if (!s) return {}
  return {
    title: `${s.name} series`,
    description: `${s.tagline}. Front-opening luggage in the ${s.name} series, personalised with your name.`,
    alternates: { canonical: `/collections/${s.id}` },
  }
}

export default function SeriesPage({
  params,
  searchParams,
}: {
  params: { series: string }
  searchParams: { color?: string; pattern?: string }
}) {
  const s = getSeries(params.series)
  if (!s) notFound()
  const color = getColor(searchParams.color) ?? COLORS[0]
  const linked = searchParams.pattern ? getPattern(searchParams.pattern) : undefined
  const retired = searchParams.pattern && (!linked || !linked.active || linked.series !== s.id)

  return (
    <div className="container-custom py-12">
      <LandingTracker page="series" series={s.id} patternId={linked?.id} />
      <nav aria-label="Breadcrumb" className="text-sm text-forest-soft">
        <Link href="/collections" className="underline underline-offset-4">Patterns</Link> / {s.name}
      </nav>
      <h1 className="mt-3 text-4xl tracking-[0.12em] sm:text-5xl">{s.name}</h1>
      <p className="mt-2 text-forest-soft">{s.tagline}</p>
      {retired && (
        <p role="status" className="mt-6 rounded-xl bg-sand p-4 text-sm">
          The pattern you followed is no longer available. Here are the {s.name} patterns you can order now.
        </p>
      )}
      <nav aria-label="Other series" className="mt-6 flex flex-wrap gap-2">
        {SERIES.map((x) => (
          <Link key={x.id} href={`/collections/${x.id}?color=${color.id}`} className={`chip ${x.id === s.id ? 'chip-active' : ''}`} aria-current={x.id === s.id ? 'page' : undefined}>
            {x.name}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <PatternMatrix series={[s.id]} color={color} basePath={`/collections/${s.id}`} highlight={linked?.active ? linked.id : undefined} />
      </div>
    </div>
  )
}
