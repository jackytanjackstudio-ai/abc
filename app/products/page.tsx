import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const products = [
  { id: 1, name: 'THE CABIN S', category: 'Carry-On', price: 895, color: 'Matte Black' },
  { id: 2, name: 'THE CABIN S', category: 'Carry-On', price: 895, color: 'Silver' },
  { id: 3, name: 'THE CABIN S', category: 'Carry-On', price: 895, color: 'Desert Rose' },
  { id: 4, name: 'THE CHECK-IN M', category: 'Medium Luggage', price: 1195, color: 'Matte Black' },
  { id: 5, name: 'THE CHECK-IN M', category: 'Medium Luggage', price: 1195, color: 'Navy Blue' },
  { id: 6, name: 'THE CHECK-IN M', category: 'Medium Luggage', price: 1195, color: 'White' },
  { id: 7, name: 'THE CHECK-IN L', category: 'Large Luggage', price: 1395, color: 'Matte Black' },
  { id: 8, name: 'THE CHECK-IN L', category: 'Large Luggage', price: 1395, color: 'Silver' },
  { id: 9, name: 'THE TRUNK', category: 'Travel Trunk', price: 1895, color: 'Matte Black' },
]

export default function Products() {
  return (
    <>
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">ALL PRODUCTS</h1>
            <p className="text-gray-600 text-lg">Discover the complete Jack Studio collection</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-12 pb-8 border-b border-gray-200">
            <button className="px-6 py-2 bg-jack-black text-white text-sm font-medium tracking-wide">
              ALL
            </button>
            <button className="px-6 py-2 border border-gray-300 text-jack-black text-sm font-medium tracking-wide hover:border-jack-black transition">
              CARRY-ON
            </button>
            <button className="px-6 py-2 border border-gray-300 text-jack-black text-sm font-medium tracking-wide hover:border-jack-black transition">
              CHECK-IN
            </button>
            <button className="px-6 py-2 border border-gray-300 text-jack-black text-sm font-medium tracking-wide hover:border-jack-black transition">
              ACCESSORIES
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] bg-jack-light mb-6 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                    <span className="text-gray-500 text-sm font-medium">{product.name}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 tracking-wide group-hover:text-gray-600 transition">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">{product.category}</p>
                  <p className="text-gray-500 text-sm mb-3">{product.color}</p>
                  <p className="text-lg font-medium">${product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
