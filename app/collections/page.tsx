import type { Metadata } from 'next'
import Link from 'next/link'
import LandingTracker from '@/components/LandingTracker'
import PatternMatrix from '@/components/PatternMatrix'
import { COLORS, SERIES, getColor } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Patterns',
  description: 'Browse every VIAROU pattern across the LINE, JOURNEY, PATTERN and LIFESTYLE series, shown on the case.',
  alternates: { canonical: '/collections' },
}

export default function Collections({ searchParams }: { searchParams: { color?: string } }) {
  const color = getColor(searchParams.color) ?? COLORS[0]
  return (
    <div className="container-custom py-12">
      <LandingTracker page="collections" />
      <p className="eyebrow">Patterns</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Choose a pattern</h1>
      <nav aria-label="Series" className="mt-6 flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <Link key={s.id} href={`/collections/${s.id}?color=${color.id}`} className="chip">
            {s.name}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <PatternMatrix series={SERIES.map((s) => s.id)} color={color} basePath="/collections" />
      </div>
    </div>
  )
}
