import Link from 'next/link'

export default function CheckoutCancel() {
  return (
    <>
      <div className="min-h-screen pt-12 pb-20 luxury-gradient flex items-center">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">Payment Cancelled</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your payment was cancelled. No charges have been made to your account.
            </p>
            <div className="card-premium p-8 mb-8">
              <p className="text-sm text-gray-600">
                If you experienced any issues during checkout, please contact our support team or try again.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout" className="btn-primary inline-block">
                Return to Cart
              </Link>
              <Link href="/products" className="btn-secondary inline-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
