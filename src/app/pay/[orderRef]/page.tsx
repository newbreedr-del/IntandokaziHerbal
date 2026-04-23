'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function PayRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error' | 'already_paid'>('loading')
  const [amount, setAmount] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const fetchPaymentUrl = async () => {
      const orderRef = params.orderRef

      try {
        const response = await fetch(`/api/pay/${orderRef}`)
        const data = await response.json()

        if (!response.ok) {
          if (data.already_paid) {
            setStatus('already_paid')
          } else {
            setStatus('error')
            setErrorMessage(data.error || 'Failed to load payment details')
          }
          return
        }

        if (data.success && data.payment_url) {
          setAmount(data.total)
          setStatus('redirecting')

          // Redirect after 1.2 seconds
          setTimeout(() => {
            window.location.href = data.payment_url
          }, 1200)
        } else {
          setStatus('error')
          setErrorMessage('Invalid payment response')
        }
      } catch (err: any) {
        console.error('[Pay Redirect] Error:', err)
        setStatus('error')
        setErrorMessage('Failed to connect to payment server')
      }
    }

    fetchPaymentUrl()
  }, [params.orderRef])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Payment</h1>
            <p className="text-gray-600">Please wait while we prepare your payment...</p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Taking you to payment</h1>
            <p className="text-gray-600 mb-4">Redirecting to PayFast...</p>
            {amount && (
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-3xl font-bold text-green-700">R{amount}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">If you're not redirected automatically, <a href="#" className="text-green-600 underline">click here</a></p>
          </>
        )}

        {status === 'already_paid' && (
          <>
            <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Already Paid</h1>
            <p className="text-gray-600 mb-6">This order has already been paid for.</p>
            <button
              onClick={() => router.push('/store')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Return to Store
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/store')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Return to Store
            </button>
          </>
        )}
      </div>
    </div>
  )
}
