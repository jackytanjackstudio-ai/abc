import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-jack-black text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">JACK STUDIO</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Premium luggage crafted for the modern traveler. Quality, design, and durability in every piece.
            </p>
            <a href="tel:01112015288" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              011-1201-5288
            </a>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">SHOP</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link href="/collections" className="hover:text-white transition">Collections</Link></li>
              <li><Link href="/new" className="hover:text-white transition">New Arrivals</Link></li>
              <li><Link href="/bestsellers" className="hover:text-white transition">Bestsellers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">SUPPORT</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white transition">Returns</Link></li>
              <li><Link href="/warranty" className="hover:text-white transition">Warranty</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">COMPANY</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition">Sustainability</Link></li>
              <li><Link href="/stores" className="hover:text-white transition">Store Locator</Link></li>
              <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; 2025 Jack Studio. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
