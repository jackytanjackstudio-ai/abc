import Link from 'next/link'
import SvgImage from '@/components/ui/SvgImage'
import { COLORS, MODELS, PATTERNS, SERIES, getColor, getModel } from '@/lib/catalog'
import { renderCaseSvg, renderSwatchSvg } from '@/lib/render'
import { heroNameLayer } from '@/lib/hero'

export default async function Home() {
  const cabin = getModel('cabin')!
  const sand = getColor('sand')!
  const hero = renderCaseSvg(cabin, sand, 'journey-peaks', {
    uid: 'hero',
    title: 'Cabin case in Sand with the Peaks pattern and a printed name',
    name: await heroNameLayer(cabin),
  })

  return (
    <>
      <section className="bg-sand">
        <div className="container-custom grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow">Front-opening luggage</p>
            <h1 className="mt-4 text-4xl leading-tight sm:text-6xl">Opens from the front. Carries your name.</h1>
            <p className="mt-6 max-w-md text-lg text-forest-soft">
              Pick a pattern from four series, add a name if you like, and place it exactly where you want it. We print it on the front lid.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">Shop luggage</Link>
              <Link href="/collections" className="btn-secondary">Browse patterns</Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <SvgImage svg={hero} />
          </div>
        </div>
      </section>

      <section className="container-custom py-16">
        <h2 className="text-3xl">Why the front opens</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            ['Reach in, standing up', 'The front lid unzips while the case stands, so you can grab a jacket or laptop without laying it flat.'],
            ['Laptop and documents up front', 'A padded sleeve and document pocket sit behind the lid, separate from your packed clothes.'],
            ['Full clamshell when you need it', 'The main compartment still opens fully for packing at home.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-sand/50 p-6">
              <h3 className="font-sans text-base font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-forest-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-custom pb-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl">Four series</h2>
          <Link href="/collections" className="text-sm font-semibold underline underline-offset-4">All patterns</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {SERIES.map((s) => {
            const p = PATTERNS.find((x) => x.series === s.id)!
            return (
              <Link key={s.id} href={`/collections/${s.id}`} className="group">
                <div className="overflow-hidden rounded-2xl">
                  <SvgImage svg={renderSwatchSvg(p.id, COLORS[0], `${s.name} series, ${p.name} pattern`)} className="aspect-square transition group-hover:scale-[1.03]" />
                </div>
                <p className="mt-3 font-semibold tracking-[0.15em]">{s.name}</p>
                <p className="text-sm text-forest-soft">{s.tagline}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="container-custom py-16">
        <h2 className="text-3xl">Three sizes</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {MODELS.map((m) => (
            <Link key={m.id} href={`/products/${m.id}`} className="rounded-2xl bg-sand p-6 transition hover:bg-sand-deep/60">
              <SvgImage svg={renderCaseSvg(m, COLORS[0], null, { uid: `home-${m.id}`, title: `${m.name} case` })} className="mx-auto h-56" />
              <p className="mt-4 font-semibold">{m.name}</p>
              <p className="text-sm text-forest-soft">
                {m.capacityL} L · {m.weightKg} kg
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
