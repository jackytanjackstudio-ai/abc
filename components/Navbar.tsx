'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/catalog'
import { useCart } from '@/lib/cart'

const LINKS = [
  { href: '/products', label: 'Shop luggage' },
  { href: '/collections', label: 'Patterns' },
  { href: '/studio', label: 'Personalize' },
  { href: '/contact', label: 'Help' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const lines = useCart()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => setOpen(false), [pathname])
  const count = mounted ? lines.reduce((n, l) => n + l.qty, 0) : 0

  return (
    <header className="sticky top-0 z-40 border-b border-forest/10 bg-paper/95 backdrop-blur">
      <nav className="container-custom flex h-16 items-center justify-between" aria-label="Main">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-[0.12em]">
          {BRAND}
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium hover:text-forest-soft ${pathname?.startsWith(l.href) ? 'underline underline-offset-8' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-sm font-semibold" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
            Cart ({count})
          </Link>
          <button
            type="button"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-nav" className="container-custom flex flex-col gap-4 border-t border-forest/10 py-4 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-base font-medium">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
