import Link from 'next/link'
import { BRAND, SERIES } from '@/lib/catalog'

export default function Footer() {
  return (
    <footer className="mt-24 bg-forest text-paper">
      <div className="container-custom grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-2xl tracking-[0.12em]">{BRAND}</p>
          <p className="mt-3 max-w-xs text-sm text-paper/70">
            Front-opening luggage, printed with the pattern you pick and the name you choose.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/60">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/products" className="hover:underline">All luggage</Link></li>
            {SERIES.map((s) => (
              <li key={s.id}>
                <Link href={`/collections/${s.id}`} className="hover:underline">{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/60">Help</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/help#shipping" className="hover:underline">Shipping</Link></li>
            <li><Link href="/help#changes" className="hover:underline">Changes &amp; returns</Link></li>
            <li><Link href="/help#faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/help#orders" className="hover:underline">Order status</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/60">Studio</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/studio" className="hover:underline">Personalize a case</Link></li>
            <li><Link href="/collections" className="hover:underline">Browse patterns</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-custom border-t border-paper/15 py-6 text-xs text-paper/60">
        © {new Date().getFullYear()} {BRAND}. Brand name is a working placeholder.
      </div>
    </footer>
  )
}
