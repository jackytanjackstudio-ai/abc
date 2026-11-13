import type { Metadata } from 'next'
import Link from 'next/link'
import SvgImage from '@/components/ui/SvgImage'
import { COLORS, MODELS, formatMoney } from '@/lib/catalog'
import { renderCaseSvg } from '@/lib/render'

export const metadata: Metadata = {
  title: 'Shop luggage',
  description: 'Front-opening suitcases in three sizes. Choose a pattern and add your name.',
  alternates: { canonical: '/products' },
}

export default function Products() {
  return (
    <div className="container-custom py-12">
      <p className="eyebrow">Luggage</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Choose a size</h1>
      <p className="mt-3 max-w-xl text-forest-soft">Every size opens from the front and takes any pattern. Personalization is optional.</p>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {MODELS.map((m) => (
          <li key={m.id}>
            <Link href={`/products/${m.id}`} className="block rounded-2xl bg-sand p-6 transition hover:bg-sand-deep/60">
              <SvgImage svg={renderCaseSvg(m, COLORS[1], 'line-pinstripe', { uid: `p-${m.id}`, title: `${m.name} case` })} className="mx-auto h-64" />
              <div className="mt-6 flex items-baseline justify-between">
                <h2 className="font-sans text-lg font-semibold">{m.name}</h2>
                <p className="font-semibold">from {formatMoney(m.priceCents)}</p>
              </div>
              <p className="mt-1 text-sm text-forest-soft">
                {m.dimensionsCm.h} × {m.dimensionsCm.w} × {m.dimensionsCm.d} cm · {m.capacityL} L · {m.weightKg} kg
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
