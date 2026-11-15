import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import LandingTracker from '@/components/LandingTracker'
import SvgImage from '@/components/ui/SvgImage'
import { COLORS, MODELS, PATTERNS, PERSONALIZATION_FEE_CENTS, formatMoney, getColor, getPattern, getSeries } from '@/lib/catalog'
import { renderCaseSvg, renderSwatchSvg } from '@/lib/render'

export function generateStaticParams() {
  return PATTERNS.filter((p) => p.active).map((p) => ({ series: p.series, pattern: p.id.replace(`${p.series}-`, '') }))
}

function resolve(params: { series: string; pattern: string }) {
  const series = getSeries(params.series)
  const pattern = getPattern(`${params.series}-${params.pattern}`)
  return { series, pattern }
}

export function generateMetadata({ params }: { params: { series: string; pattern: string } }): Metadata {
  const { series, pattern } = resolve(params)
  if (!series || !pattern) return {}
  const title = `${pattern.name} luggage — ${series.name} series`
  const description = `${pattern.description} Front-opening suitcase in 20″, 24″ and 28″, printed with the ${pattern.name} pattern and, if you like, your name.`
  return {
    title,
    description,
    alternates: { canonical: `/collections/${series.id}/${params.pattern}` },
    openGraph: { title, description },
  }
}

export default function PatternPage({ params, searchParams }: { params: { series: string; pattern: string }; searchParams: { color?: string } }) {
  const { series, pattern } = resolve(params)
  if (!series || !pattern) notFound()
  // retired pattern: send visitors to the series with an explanation (brief p.12)
  if (!pattern.active) redirect(`/collections/${series.id}?pattern=${pattern.id}`)
  const color = getColor(searchParams.color) ?? COLORS[1]
  const siblings = PATTERNS.filter((p) => p.series === series.id && p.active && p.id !== pattern.id)
  const cabin = MODELS[0]

  return (
    <div className="container-custom py-10">
      <LandingTracker page="pattern" patternId={pattern.id} series={series.id} />
      <nav aria-label="Breadcrumb" className="text-sm text-forest-soft">
        <Link href="/collections" className="underline underline-offset-4">Patterns</Link> /{' '}
        <Link href={`/collections/${series.id}`} className="underline underline-offset-4">{series.name}</Link> / {pattern.name}
      </nav>

      <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
        <div className="rounded-3xl bg-sand p-8">
          <SvgImage svg={renderCaseSvg(cabin, color, pattern.id, { uid: 'pat', title: `${pattern.name} pattern on a ${color.name} case` })} className="mx-auto h-[420px]" />
        </div>
        <div>
          <p className="eyebrow">{series.name} series</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{pattern.name}</h1>
          <p className="mt-4 text-lg text-forest-soft">{pattern.description}</p>
          <p className="mt-6">
            From <span className="font-semibold">{formatMoney(cabin.priceCents)} USD</span> · add your name for {formatMoney(PERSONALIZATION_FEE_CENTS)}
          </p>

          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Case colour">
            {COLORS.map((c) => (
              <Link key={c.id} href={`/collections/${series.id}/${params.pattern}?color=${c.id}`} scroll={false} replace aria-current={c.id === color.id ? 'true' : undefined} className={`chip flex items-center gap-2 ${c.id === color.id ? 'chip-active' : ''}`}>
                <span className="h-4 w-4 rounded-full border border-forest/30" style={{ background: c.hex }} aria-hidden />
                {c.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/studio?model=cabin&color=${color.id}&pattern=${pattern.id}`} className="btn-primary">Personalize this pattern</Link>
            <Link href={`/products/cabin?color=${color.id}&pattern=${pattern.id}`} className="btn-secondary">See sizes &amp; details</Link>
          </div>
        </div>
      </div>

      {siblings.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl">More from {series.name}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {siblings.map((p) => (
              <li key={p.id}>
                <Link href={`/collections/${series.id}/${p.id.replace(`${series.id}-`, '')}?color=${color.id}`} className="group block">
                  <SvgImage svg={renderSwatchSvg(p.id, color, `${p.name} pattern`)} className="aspect-square overflow-hidden rounded-xl" />
                  <p className="mt-2 font-semibold group-hover:underline">{p.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
