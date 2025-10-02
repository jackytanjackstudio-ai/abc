'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)

  const handleStripeCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createPayPalOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: cart.map(item => ({
        amount: {
          currency_code: 'USD',
          value: (item.price * (item.quantity || 1)).toFixed(2),
        },
        description: `${item.name} - ${item.color}`,
      }))
    })
  }

  const onPayPalApprove = async (data: any, actions: any) => {
    const order = await actions.order.capture()
    localStorage.removeItem('cart')
    router.push('/checkout/success?payment_method=paypal')
  }

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="pt-28 pb-20 min-h-screen">
          <div className="container-custom text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products to your cart to checkout</p>
            <a href="/products" className="btn-primary inline-block">
              Browse Products
            </a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="pt-28 pb-20 min-h-screen bg-gray-50">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-12 text-center">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cart Items */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
                      <div className="w-24 h-32 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.color}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                        <p className="text-lg font-medium mt-2">${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>

                {/* Payment Method Selection */}
                <div className="mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 border-2 rounded-lg transition ${
                        paymentMethod === 'stripe'
                          ? 'border-jack-black bg-jack-light'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold mb-1">Credit Card</div>
                        <div className="text-xs text-gray-600">Powered by Stripe</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-4 border-2 rounded-lg transition ${
                        paymentMethod === 'paypal'
                          ? 'border-jack-black bg-jack-light'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold mb-1">PayPal</div>
                        <div className="text-xs text-gray-600">Fast & Secure</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Stripe Checkout */}
                {paymentMethod === 'stripe' && (
                  <div>
                    <button
                      onClick={handleStripeCheckout}
                      disabled={loading}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Pay with Credit Card'}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Secure payment processed by Stripe
                    </p>
                  </div>
                )}

                {/* PayPal Checkout */}
                {paymentMethod === 'paypal' && (
                  <div>
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                        currency: 'USD'
                      }}
                    >
                      <PayPalButtons
                        createOrder={createPayPalOrder}
                        onApprove={onPayPalApprove}
                        style={{
                          layout: 'vertical',
                          color: 'black',
                          shape: 'rect',
                          label: 'pay'
                        }}
                      />
                    </PayPalScriptProvider>
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Secure payment processed by PayPal
                    </p>
                  </div>
                )}

                {/* Security Features */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>SSL Encrypted • Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
