'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            JACK STUDIO
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
              PRODUCTS
            </Link>
            <Link href="/collections" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
              COLLECTIONS
            </Link>
            <Link href="/about" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
              ABOUT
            </Link>
            <Link href="/contact" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
              CONTACT
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="tel:01112015288" className="text-sm font-medium tracking-wide hover:text-gray-600 transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              011-1201-5288
            </a>
            <button className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
              SEARCH
            </button>
            <button className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
              CART (0)
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-jack-black focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <a href="tel:01112015288" className="text-sm font-medium tracking-wide hover:text-gray-600 transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                011-1201-5288
              </a>
              <Link href="/products" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
                PRODUCTS
              </Link>
              <Link href="/collections" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
                COLLECTIONS
              </Link>
              <Link href="/about" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
                ABOUT
              </Link>
              <Link href="/contact" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
                CONTACT
              </Link>
              <Link href="/cart" className="text-sm font-medium tracking-wide hover:text-gray-600 transition">
                CART (0)
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
