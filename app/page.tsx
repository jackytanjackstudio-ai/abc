import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center luxury-gradient overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-jack-black/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-jack-black/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center container-custom animate-fade-in">
          <div className="mb-6 inline-block">
            <span className="text-xs tracking-[0.3em] uppercase text-gray-500 font-light">Since 2025</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-[0.95]">
            Redefine Your<br />
            <span className="text-gradient">Journey</span>
          </h1>
          <p className="text-lg md:text-xl mb-14 text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Precision-engineered luggage for the discerning traveler.<br />
            Uncompromising quality meets timeless design.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/products" className="btn-primary">
              Explore Collection
            </Link>
            <Link href="/about" className="btn-secondary">
              Our Story
            </Link>
          </div>
          <div className="mt-20 flex items-center justify-center gap-12 text-sm text-gray-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-jack-black mb-1">100%</div>
              <div className="text-xs tracking-wider">PREMIUM</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-jack-black mb-1">∞</div>
              <div className="text-xs tracking-wider">WARRANTY</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-jack-black mb-1">5★</div>
              <div className="text-xs tracking-wider">RATED</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-px divider-luxury"></div>
        <div className="container-custom">
          <div className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-4 block">Our Collection</span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Iconic Pieces</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Explore our signature luggage collection, where craftsmanship<br className="hidden md:block" />
              meets innovation in every detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Product 1 */}
            <Link href="/products/1" className="group cursor-pointer">
              <div className="card-premium overflow-hidden mb-6">
                <div className="aspect-[3/4] bg-jack-light overflow-hidden relative">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center transition-all duration-700 group-hover:scale-110">
                    <span className="text-gray-400 text-sm tracking-[0.2em] font-light">CABIN S</span>
                  </div>
                  <div className="absolute inset-0 bg-jack-black opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-xl font-semibold mb-2 tracking-tight group-hover:text-gray-600 transition-colors">The Cabin S</h3>
                <p className="text-gray-500 text-sm mb-3 font-light tracking-wide">Carry-On Luggage</p>
                <p className="text-xl font-medium">$895</p>
              </div>
            </Link>

            {/* Product 2 */}
            <Link href="/products/3" className="group cursor-pointer">
              <div className="card-premium overflow-hidden mb-6">
                <div className="aspect-[3/4] bg-jack-light overflow-hidden relative">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center transition-all duration-700 group-hover:scale-110">
                    <span className="text-gray-500 text-sm tracking-[0.2em] font-light">CHECK-IN M</span>
                  </div>
                  <div className="absolute inset-0 bg-jack-black opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-xl font-semibold mb-2 tracking-tight group-hover:text-gray-600 transition-colors">The Check-In M</h3>
                <p className="text-gray-500 text-sm mb-3 font-light tracking-wide">Medium Luggage</p>
                <p className="text-xl font-medium">$1,195</p>
              </div>
            </Link>

            {/* Product 3 */}
            <Link href="/products/4" className="group cursor-pointer">
              <div className="card-premium overflow-hidden mb-6">
                <div className="aspect-[3/4] bg-jack-light overflow-hidden relative">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center transition-all duration-700 group-hover:scale-110">
                    <span className="text-gray-600 text-sm tracking-[0.2em] font-light">CHECK-IN L</span>
                  </div>
                  <div className="absolute inset-0 bg-jack-black opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-xl font-semibold mb-2 tracking-tight group-hover:text-gray-600 transition-colors">The Check-In L</h3>
                <p className="text-gray-500 text-sm mb-3 font-light tracking-wide">Large Luggage</p>
                <p className="text-xl font-medium">$1,395</p>
              </div>
            </Link>
          </div>

          <div className="text-center mt-16">
            <Link href="/products" className="btn-primary inline-block">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-jack-black text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-wide">LIFETIME WARRANTY</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every Jack Studio piece is backed by our comprehensive lifetime warranty.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-wide">PREMIUM MATERIALS</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Crafted from aerospace-grade aluminum and polycarbonate for ultimate durability.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 tracking-wide">FREE SHIPPING</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Complimentary shipping on all orders. Your journey begins at our door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-jack-light">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            CRAFTED TO LAST
          </h2>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
            Every detail is meticulously designed and tested to ensure your Jack Studio luggage stands the test of time.
          </p>
          <Link href="/about" className="btn-primary">
            DISCOVER OUR CRAFT
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
