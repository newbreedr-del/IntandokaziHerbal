'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [orderStatus, setOrderStatus] = useState<'checking' | 'paid' | 'pending'>('checking')
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (!orderId) return

    // Poll order status every 3 seconds
    const checkOrderStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.order) {
            setOrder(data.order)
            if (data.order.status === 'paid') {
              setOrderStatus('paid')
            } else {
              setOrderStatus('pending')
            }
          }
        }
      } catch (error) {
        console.error('Error checking order status:', error)
      }
    }

    // Check immediately
    checkOrderStatus()

    // Then poll every 3 seconds for up to 30 seconds
    const interval = setInterval(checkOrderStatus, 3000)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (orderStatus === 'checking') {
        setOrderStatus('pending')
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [orderId, orderStatus])

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600">No order ID provided</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {orderStatus === 'checking' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Confirming your payment...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your payment with PayFast.
            </p>
          </div>
        )}

        {orderStatus === 'paid' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Confirmed! 🎉
            </h1>
            <p className="text-gray-600 mb-6">
              Your order <span className="font-semibold">#{orderId}</span> has been confirmed.
            </p>
            
            {order && (
              <div className="bg-emerald-50 rounded-lg p-4 mb-6 text-left">
                <h2 className="font-semibold text-gray-900 mb-2">Order Details</h2>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><span className="font-medium">Total:</span> R{order.total_amount}</p>
                  <p><span className="font-medium">Status:</span> Paid & Confirmed</p>
                  {order.delivery_address && (
                    <p><span className="font-medium">Delivery to:</span> {order.delivery_address.city}</p>
                  )}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-6">
              Our dispatch team has been notified. You can return to the chat and we'll send you your order summary and tracking information.
            </p>

            <button
              onClick={() => window.close()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Close this window
            </button>
          </div>
        )}

        {orderStatus === 'pending' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-amber-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Processing...
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. This may take a few moments.
            </p>
            <p className="text-sm text-gray-500">
              Order #{orderId}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
