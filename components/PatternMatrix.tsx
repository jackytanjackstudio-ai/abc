import Link from 'next/link'
import SvgImage from '@/components/ui/SvgImage'
import { COLORS, PATTERNS, SERIES, getModel, type CaseColor, type SeriesId } from '@/lib/catalog'
import { renderCaseSvg, renderSwatchSvg } from '@/lib/render'

/** Pattern wall: patterns in a matrix, each with the pattern on the case below it (brief p.2). */
export default function PatternMatrix({
  series,
  color,
  basePath,
  highlight,
}: {
  series: SeriesId[]
  color: CaseColor
  basePath: string
  highlight?: string
}) {
  const cabin = getModel('cabin')!
  return (
    <>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Case colour">
        <span className="mr-2 text-sm font-medium">Case colour</span>
        {COLORS.map((c) => (
          <Link
            key={c.id}
            href={`${basePath}?color=${c.id}`}
            scroll={false}
            replace
            aria-current={c.id === color.id ? 'true' : undefined}
            className={`chip flex items-center gap-2 ${c.id === color.id ? 'chip-active' : ''}`}
          >
            <span className="h-4 w-4 rounded-full border border-forest/30" style={{ background: c.hex }} aria-hidden />
            {c.name}
          </Link>
        ))}
      </div>

      {series.map((sid) => {
        const s = SERIES.find((x) => x.id === sid)!
        const patterns = PATTERNS.filter((p) => p.series === sid && p.active)
        return (
          <section key={sid} className="mt-12" aria-labelledby={`series-${sid}`}>
            <div className="flex items-baseline justify-between">
              <h2 id={`series-${sid}`} className="font-sans text-xl font-semibold tracking-[0.18em]">
                {s.name}
              </h2>
              <p className="text-sm text-forest-soft">{s.tagline}</p>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {patterns.map((p) => (
                <li key={p.id} id={p.id} className={`rounded-2xl bg-sand p-4 ${highlight === p.id ? 'ring-2 ring-forest' : ''}`}>
                  <Link href={`/products/cabin?pattern=${p.id}&color=${color.id}`} className="group block">
                    <SvgImage svg={renderSwatchSvg(p.id, color, `${p.name} pattern swatch`)} className="aspect-square overflow-hidden rounded-xl" />
                    <SvgImage
                      svg={renderCaseSvg(cabin, color, p.id, { uid: `m-${p.id}`, title: `${p.name} pattern on a ${color.name} case` })}
                      className="mx-auto mt-4 h-40"
                    />
                    <p className="mt-3 font-semibold group-hover:underline">{p.name}</p>
                    <p className="text-sm text-forest-soft">{p.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
