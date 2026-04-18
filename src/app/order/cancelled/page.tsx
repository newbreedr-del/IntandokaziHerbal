'use client'

import { useSearchParams } from 'next/navigation'
import { XCircle } from 'lucide-react'

export default function OrderCancelledPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. Don't worry — your cart has been saved!
        </p>

        {orderId && (
          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              Order <span className="font-semibold">#{orderId}</span> is still pending.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-6">
          Return to the chat and type <span className="font-semibold">"resume order"</span> to try again, or we can help you with a different payment method.
        </p>

        <button
          onClick={() => window.close()}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Close this window
        </button>
      </div>
    </div>
  )
}
