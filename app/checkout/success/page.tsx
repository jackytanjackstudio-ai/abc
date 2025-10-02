import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function CheckoutSuccess() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-28 pb-20 luxury-gradient flex items-center">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your purchase. Your order has been confirmed and will be shipped shortly.
            </p>
            <div className="card-premium p-8 mb-8">
              <p className="text-sm text-gray-600 mb-4">
                You will receive an email confirmation with your order details and tracking information.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Check your email for order confirmation</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-primary inline-block">
                Continue Shopping
              </Link>
              <Link href="/" className="btn-secondary inline-block">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
