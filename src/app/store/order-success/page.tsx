'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, MessageCircle, Home } from 'lucide-react'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (!ref) return
    fetch(`/api/orders/${encodeURIComponent(ref)}`)
      .then(r => r.json())
      .then(d => { if (d.success) setOrder(d.order) })
      .catch(() => {})
  }, [ref])

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27685037221'
  const waMessage = encodeURIComponent(`Hi! I just paid for my order (Ref: ${ref}). Can you confirm my order details?`)
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-2 text-sm">Reference: <span className="font-mono font-semibold text-gray-700">{ref}</span></p>
        <p className="text-gray-600 mb-6">Your order has been confirmed and dispatch has been notified.</p>

        {order && (
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">Order Summary</p>
            <p className="text-sm text-gray-600">Customer: {order.customer_name}</p>
            {order.pep_store_name && (
              <p className="text-sm text-gray-600">Collection: {order.pep_store_name}</p>
            )}
            <p className="text-sm font-bold text-green-700 mt-1">Total Paid: R{Number(order.total).toFixed(2)}</p>
          </div>
        )}

        <div className="space-y-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            <MessageCircle className="w-5 h-5" />
            Continue on WhatsApp
          </a>
          <Link
            href="/store"
            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition"
          >
            <Home className="w-5 h-5" />
            Back to Store
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          You'll receive a WhatsApp confirmation message shortly.
        </p>
      </div>
    </div>
  )
}
