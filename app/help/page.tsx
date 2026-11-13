import type { Metadata } from 'next'
import Link from 'next/link'
import { MARKETS, PRODUCTION_DAYS } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Shipping, changes & FAQ',
  description: 'Production times, shipping destinations, name changes, returns and order status.',
  alternates: { canonical: '/help' },
}

// Policy wording is a draft for operations/legal to replace (brief p.9, p.17).
export default function Help() {
  return (
    <div className="container-custom max-w-3xl py-12">
      <h1 className="text-4xl">Help</h1>

      <section id="shipping" className="mt-10 scroll-mt-24">
        <h2 className="text-2xl">Shipping</h2>
        <p className="mt-3 text-forest-soft">Every case is printed to order in {PRODUCTION_DAYS}, then shipped tracked.</p>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-forest-soft">
              <th className="py-2 font-medium">Destination</th>
              <th className="py-2 font-medium">In transit</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(MARKETS).map(([code, m]) => (
              <tr key={code} className="border-t border-forest/10">
                <td className="py-2">{m.name}</td>
                <td className="py-2">{m.transit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="changes" className="mt-10 scroll-mt-24">
        <h2 className="text-2xl">Changes &amp; returns</h2>
        <p className="mt-3 text-forest-soft">
          Need to change a name or cancel? Contact us with your order number before production starts and we’ll send you a new preview to
          confirm. Once printing has started, personalized cases can’t be changed; quality issues are always covered.
        </p>
      </section>

      <section id="faq" className="mt-10 scroll-mt-24">
        <h2 className="text-2xl">FAQ</h2>
        <h3 className="mt-4 font-sans font-semibold">Do I have to add a name?</h3>
        <p className="mt-1 text-forest-soft">No. Leave the name empty and you get the pattern exactly as shown, with no extra charge.</p>
        <h3 className="mt-4 font-sans font-semibold">Why can’t I put the name everywhere?</h3>
        <p className="mt-1 text-forest-soft">The lid zipper, pull tab and badge can’t be printed over. The studio stops the name at those areas.</p>
      </section>

      <section id="orders" className="mt-10 scroll-mt-24">
        <h2 className="text-2xl">Order status</h2>
        <p className="mt-3 text-forest-soft">
          Your confirmation page and email include your order number and a private link to the order. Lost it? <Link href="/contact" className="underline">Contact us</Link> with the email you paid with.
        </p>
      </section>
    </div>
  )
}
