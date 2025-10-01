import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-jack-light">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
        <div className="relative z-10 text-center container-custom">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            REDEFINE YOUR JOURNEY
          </h1>
          <p className="text-lg md:text-xl mb-12 text-gray-700 max-w-2xl mx-auto">
            Precision-engineered luggage for the discerning traveler. Uncompromising quality meets timeless design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary">
              EXPLORE COLLECTION
            </Link>
            <Link href="/about" className="btn-secondary">
              OUR STORY
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">ICONIC COLLECTION</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our signature luggage pieces, crafted with premium materials and innovative design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product 1 */}
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] bg-jack-light mb-6 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                  <span className="text-gray-400 text-sm">CABIN S</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-wide">THE CABIN S</h3>
              <p className="text-gray-600 text-sm mb-3">Carry-On Luggage</p>
              <p className="text-lg font-medium">$895</p>
            </div>

            {/* Product 2 */}
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] bg-jack-light mb-6 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                  <span className="text-gray-500 text-sm">CHECK-IN M</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-wide">THE CHECK-IN M</h3>
              <p className="text-gray-600 text-sm mb-3">Medium Luggage</p>
              <p className="text-lg font-medium">$1,195</p>
            </div>

            {/* Product 3 */}
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] bg-jack-light mb-6 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                  <span className="text-gray-600 text-sm">CHECK-IN L</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-wide">THE CHECK-IN L</h3>
              <p className="text-gray-600 text-sm mb-3">Large Luggage</p>
              <p className="text-lg font-medium">$1,395</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/products" className="btn-primary">
              VIEW ALL PRODUCTS
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
