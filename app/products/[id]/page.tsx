'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [selectedColor, setSelectedColor] = useState('Matte Black')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
          <p>Product not found</p>
        </div>
        <Footer />
      </>
    )
  }

  const addToCart = () => {
    const cartItem = {
      ...product,
      color: selectedColor,
      quantity: quantity
    }

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    existingCart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(existingCart))

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const buyNow = () => {
    addToCart()
    window.location.href = '/checkout'
  }

  const colors = [
    { name: 'Matte Black', class: 'bg-black' },
    { name: 'Silver', class: 'bg-gray-300' },
    { name: 'Navy Blue', class: 'bg-blue-900' },
    { name: 'Desert Rose', class: 'bg-rose-300' },
  ]

  return (
    <>
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container-custom">
          {/* Breadcrumb */}
          <div className="mb-8 text-sm text-gray-600">
            <Link href="/" className="hover:text-jack-black">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-jack-black">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-jack-black">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-jack-light relative overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">{product.name}</span>
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.slice(0, 4).map((img: string, i: number) => (
                    <div key={i} className="aspect-square bg-jack-light cursor-pointer hover:opacity-75 transition relative overflow-hidden">
                      <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">{product.name}</h1>
              <p className="text-xl text-gray-600 mb-6">{product.category}</p>
              <p className="text-3xl font-semibold mb-8">${product.price}</p>

              {/* Description */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {product.description}
                </p>
                {product.features && (
                  <ul className="space-y-2 text-sm text-gray-600">
                    {product.features.map((feature: string, i: number) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-4 tracking-wide">COLOR: {selectedColor}</h3>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-12 h-12 rounded-full border-2 transition ${
                        selectedColor === color.name
                          ? 'border-jack-black scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-full h-full rounded-full ${color.class}`}></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-4 tracking-wide">QUANTITY</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 hover:border-jack-black transition"
                  >
                    −
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 hover:border-jack-black transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={addToCart}
                className="w-full btn-primary mb-4 relative"
              >
                {addedToCart ? '✓ ADDED TO CART' : 'ADD TO CART'}
              </button>
              <button onClick={buyNow} className="w-full btn-secondary">
                BUY NOW
              </button>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">Free Shipping</p>
                    <p className="text-gray-600">Complimentary shipping on all orders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">Lifetime Warranty</p>
                    <p className="text-gray-600">Backed by our comprehensive lifetime warranty</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">30-Day Returns</p>
                    <p className="text-gray-600">Easy returns within 30 days of purchase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold mb-12 tracking-tight">YOU MIGHT ALSO LIKE</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Link key={i} href={`/products/${i}`} className="group cursor-pointer">
                  <div className="aspect-[3/4] bg-jack-light mb-4 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 transition-transform group-hover:scale-105 duration-500"></div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 tracking-wide">THE CHECK-IN M</h3>
                  <p className="text-sm text-gray-600">$1,195</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
