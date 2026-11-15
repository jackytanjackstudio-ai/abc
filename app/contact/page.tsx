import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/contact/ContactForm'
import { BRAND } from '@/lib/catalog'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Questions about an order, personalization or shipping? Contact ${BRAND} customer care.`,
  alternates: { canonical: '/contact' },
}

// Set NEXT_PUBLIC_SUPPORT_EMAIL once the brand's customer-care mailbox exists.
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL

export default function Contact() {
  return (
    <div className="container-custom grid gap-12 py-12 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="eyebrow">Customer care</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">How can we help?</h1>
        <p className="mt-4 text-forest-soft">
          Questions about a design, an order or delivery — send us a message and we’ll reply by email, usually within one business day.
        </p>
        {SUPPORT_EMAIL && (
          <p className="mt-6">
            Or email <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline underline-offset-4">{SUPPORT_EMAIL}</a>
          </p>
        )}
        <div className="mt-8 rounded-2xl bg-sand/60 p-6 text-sm">
          <p className="font-semibold">Changing a name?</p>
          <p className="mt-1 text-forest-soft">
            Include your order number. Changes are possible until production starts — see{' '}
            <Link href="/help#changes" className="underline">changes &amp; returns</Link>.
          </p>
        </div>
      </div>
      <div className="rounded-3xl bg-sand/40 p-6 sm:p-10">
        <ContactForm />
      </div>
    </div>
  )
}
