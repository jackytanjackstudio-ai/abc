import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LandingTracker from '@/components/LandingTracker'
import SvgImage from '@/components/ui/SvgImage'
import {
  COLORS,
  MARKETS,
  MODELS,
  PATTERNS,
  PERSONALIZATION_FEE_CENTS,
  PRODUCTION_DAYS,
  SERIES,
  formatMoney,
  getColor,
  getModel,
  getPattern,
  sku,
} from '@/lib/catalog'
import { renderCaseSvg, renderOpenSvg, renderSwatchSvg } from '@/lib/render'
import { readInventory } from '@/lib/store'

export const dynamic = 'force-dynamic' // live stock

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const m = getModel(params.slug)
  if (!m) return {}
  return {
    title: m.name,
    description: `${m.name} front-opening suitcase · ${m.capacityL} L · ${m.weightKg} kg. Pick a pattern and add your name.`,
    alternates: { canonical: `/products/${m.id}` },
  }
}

export default function ProductPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { color?: string; pattern?: string }
}) {
  const model = getModel(params.slug)
  if (!model) notFound()
  const inv = readInventory()
  const inStock = (c: string) => (inv[sku(model.id, c)] ?? 0) > 0

  const requested = searchParams.pattern ? getPattern(searchParams.pattern) : undefined
  const unavailable = !!searchParams.pattern && (!requested || !requested.active)
  const pattern = requested?.active ? requested : PATTERNS[0]
  const alternatives = unavailable && requested ? PATTERNS.filter((p) => p.series === requested.series && p.active) : []

  const asked = getColor(searchParams.color)
  const color = asked && inStock(asked.id) ? asked : COLORS.find((c) => inStock(c.id)) ?? COLORS[0]
  const colorSoldOut = !!asked && !inStock(asked.id)
  const anyStock = COLORS.some((c) => inStock(c.id))

  const href = (o: { color?: string; pattern?: string }) =>
    `/products/${model.id}?color=${o.color ?? color.id}&pattern=${o.pattern ?? pattern.id}`
  const studioHref = `/studio?model=${model.id}&color=${color.id}&pattern=${pattern.id}`

  return (
    <div className="container-custom py-10">
      <LandingTracker page="product" patternId={pattern.id} series={pattern.series} />
      <nav aria-label="Breadcrumb" className="text-sm text-forest-soft">
        <Link href="/products" className="underline underline-offset-4">Luggage</Link> / {model.name}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-3xl bg-sand p-8">
            <SvgImage
              svg={renderCaseSvg(model, color, pattern.id, { uid: 'pdp', title: `${model.name} in ${color.name}, ${pattern.name} pattern` })}
              className="mx-auto h-[420px]"
            />
          </div>
          <div className="rounded-3xl bg-sand p-8">
            <SvgImage svg={renderOpenSvg(model, color)} className="mx-auto h-56" />
            <p className="mt-3 text-center text-sm text-forest-soft">
              Front lid open: laptop sleeve and document pocket. Opening photos come from the approved product shoot.
            </p>
          </div>
        </div>

        <div>
          <h1 className="text-4xl">{model.name}</h1>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(model.priceCents)}</p>
          <p className="text-sm text-forest-soft">Name printing +{formatMoney(PERSONALIZATION_FEE_CENTS)} (optional)</p>

          {unavailable && (
            <div role="status" className="mt-6 rounded-xl bg-sand p-4 text-sm">
              The pattern you followed is no longer available.
              {alternatives.length > 0 && <> Other patterns in the same series are shown below.</>}
            </div>
          )}

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">
              Case colour: <span className="font-normal">{color.name}</span>
            </legend>
            {colorSoldOut && <p className="mt-1 text-sm text-alert">{asked!.name} is sold out in this size.</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {COLORS.map((c) =>
                inStock(c.id) ? (
                  <Link key={c.id} href={href({ color: c.id })} scroll={false} replace className={`chip flex items-center gap-2 ${c.id === color.id ? 'chip-active' : ''}`} aria-current={c.id === color.id ? 'true' : undefined}>
                    <span className="h-4 w-4 rounded-full border border-forest/30" style={{ background: c.hex }} aria-hidden />
                    {c.name}
                  </Link>
                ) : (
                  <span key={c.id} className="chip flex cursor-not-allowed items-center gap-2 opacity-50" aria-disabled="true">
                    <span className="h-4 w-4 rounded-full border border-forest/30" style={{ background: c.hex }} aria-hidden />
                    {c.name} · sold out
                  </span>
                ),
              )}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">
              Pattern: <span className="font-normal">{pattern.name}</span>
            </legend>
            {SERIES.map((s) => (
              <div key={s.id} className="mt-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-forest-soft">{s.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PATTERNS.filter((p) => p.series === s.id && p.active).map((p) => (
                    <Link key={p.id} href={href({ pattern: p.id })} scroll={false} replace aria-current={p.id === pattern.id ? 'true' : undefined} className={`w-16 overflow-hidden rounded-lg border-2 ${p.id === pattern.id ? 'border-forest' : 'border-transparent'}`} title={p.name}>
                      <SvgImage svg={renderSwatchSvg(p.id, color, p.name)} className="aspect-square" />
                      <span className="sr-only">{p.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">Size</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <Link key={m.id} href={`/products/${m.id}?color=${color.id}&pattern=${pattern.id}`} className={`chip ${m.id === model.id ? 'chip-active' : ''}`} aria-current={m.id === model.id ? 'page' : undefined}>
                  {m.name}
                </Link>
              ))}
            </div>
          </fieldset>

          <div className="mt-10">
            {anyStock ? (
              <Link href={studioHref} className="btn-primary w-full sm:w-auto">
                Continue to personalize
              </Link>
            ) : (
              <p className="font-semibold text-alert">This size is sold out in every colour.</p>
            )}
            <p className="mt-3 text-sm text-forest-soft">Adding a name is optional — you can buy the pattern as it is.</p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-4 rounded-2xl bg-sand/60 p-6 text-sm">
            <div><dt className="text-forest-soft">Dimensions</dt><dd className="font-medium">{model.dimensionsCm.h} × {model.dimensionsCm.w} × {model.dimensionsCm.d} cm</dd></div>
            <div><dt className="text-forest-soft">Weight</dt><dd className="font-medium">{model.weightKg} kg</dd></div>
            <div><dt className="text-forest-soft">Capacity</dt><dd className="font-medium">{model.capacityL} L</dd></div>
            <div><dt className="text-forest-soft">In stock ({color.name})</dt><dd className="font-medium">{inv[sku(model.id, color.id)] ?? 0}</dd></div>
            <div><dt className="text-forest-soft">Made to order</dt><dd className="font-medium">{PRODUCTION_DAYS}</dd></div>
            <div><dt className="text-forest-soft">Delivery after production</dt><dd className="font-medium">{Object.values(MARKETS)[0].transit} (US)</dd></div>
            <div className="col-span-2">
              <dt className="text-forest-soft">Inside</dt>
              <dd>
                <ul className="mt-1 list-inside list-disc">
                  {model.interior.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
