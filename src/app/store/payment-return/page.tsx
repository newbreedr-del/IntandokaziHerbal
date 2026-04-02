"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Home, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    // Get PayGate response parameters
    const payRequestId = searchParams.get('PAY_REQUEST_ID');
    const transactionStatus = searchParams.get('TRANSACTION_STATUS');
    const reference = searchParams.get('REFERENCE');

    if (!payRequestId) {
      setStatus('failed');
      setMessage('Invalid payment response');
      return;
    }

    // Transaction status codes:
    // 0 = Not Done
    // 1 = Approved
    // 2 = Declined
    // 4 = Cancelled

    switch (transactionStatus) {
      case '1':
        setStatus('success');
        setMessage('Payment successful! Your order has been confirmed.');
        // Clear cart after successful payment
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart');
        }
        break;
      case '2':
        setStatus('failed');
        setMessage('Payment was declined. Please try again or use a different payment method.');
        break;
      case '4':
        setStatus('cancelled');
        setMessage('Payment was cancelled. You can try again when ready.');
        break;
      default:
        setStatus('failed');
        setMessage('Payment could not be completed. Please contact support if you were charged.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-600 mb-8">{message}</p>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
              <div className="space-y-4 text-left">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmation Email</p>
                    <p className="text-sm text-gray-600">You'll receive an order confirmation email shortly.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Order Processing</p>
                    <p className="text-sm text-gray-600">We'll prepare your order for shipment.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">3</div>
                  <div>
                    <p className="font-medium text-gray-900">PAXI Delivery</p>
                    <p className="text-sm text-gray-600">Your order will be delivered to your PEP store within 2-5 business days.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">4</div>
                  <div>
                    <p className="font-medium text-gray-900">Collection</p>
                    <p className="text-sm text-gray-600">You'll receive an SMS when your order is ready for collection.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/store" className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-center flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Back to Store
              </Link>
            </div>
          </div>
        )}

        {(status === 'failed' || status === 'cancelled') && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">{message}</p>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What Can You Do?</h2>
              <div className="space-y-3 text-left text-gray-600">
                <p>• Try again with a different payment method</p>
                <p>• Check your card details and try again</p>
                <p>• Contact your bank if the issue persists</p>
                <p>• Use manual EFT as an alternative</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/store/checkout" className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-center flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Try Again
              </Link>
              <Link href="/store" className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold text-center flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Back to Store
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
