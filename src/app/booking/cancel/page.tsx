"use client";

import { useSearchParams } from "next/navigation";
import { XCircle, Home, Calendar, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function BookingCancelPage() {
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get("ref");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Cancel Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Cancelled</h1>
          <p className="text-lg text-gray-600">Your booking was not completed</p>
        </div>

        {/* Information Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happened?</h2>
          <p className="text-gray-600 mb-6">
            Your booking was cancelled during the payment process. No charges have been made to your account.
          </p>

          {paymentRef && (
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Reference Number</p>
              <p className="font-mono text-sm text-gray-900">{paymentRef}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your selected time slot has been released and is now available for other clients.
            </p>
          </div>
        </div>

        {/* Try Again */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Want to Try Again?</h2>
          <p className="text-gray-600 mb-6">
            You can book another consultation at any time. We have many available time slots to choose from.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
          >
            <Calendar className="w-5 h-5" />
            Book Another Consultation
          </Link>
        </div>

        {/* Alternative Contact Methods */}
        <div className="bg-purple-50 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you experienced any issues or have questions, please contact us:
          </p>
          <div className="space-y-3">
            <a 
              href="mailto:nthandokazi@intandokaziherbal.co.za" 
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <Mail className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Email Us</p>
                <p className="text-sm text-gray-600">nthandokazi@intandokaziherbal.co.za</p>
              </div>
            </a>
            <a 
              href="tel:+27768435876" 
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <Phone className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Call Us</p>
                <p className="text-sm text-gray-600">076 843 5876</p>
              </div>
            </a>
            <a 
              href="https://wa.me/27768435876?text=Hi%20Nthandokazi,%20I%20need%20help%20with%20booking%20a%20consultation" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <div>
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">Chat with us directly</p>
              </div>
            </a>
          </div>
        </div>

        {/* Back to Store */}
        <div className="text-center">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            <Home className="w-5 h-5" />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
