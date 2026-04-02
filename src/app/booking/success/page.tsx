"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Clock, Mail, Phone, Download, Home } from "lucide-react";
import Link from "next/link";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get("ref");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentRef) {
      fetchBookingDetails(paymentRef);
    }
  }, [paymentRef]);

  const fetchBookingDetails = async (ref: string) => {
    try {
      // Fetch booking by payment reference
      const response = await fetch(`/api/bookings?paymentReference=${ref}`);
      const data = await response.json();
      
      if (data.bookings && data.bookings.length > 0) {
        setBooking(data.bookings[0]);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">Your consultation has been successfully booked</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">
                  {booking ? new Date(booking.booking_date).toLocaleDateString('en-ZA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Loading...'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold text-gray-900">
                  {booking ? `${booking.start_time} - ${booking.end_time}` : 'Loading...'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">60 minutes</p>
              </div>
            </div>

            {booking && (
              <>
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Client Name</p>
                    <p className="font-semibold text-gray-900">{booking.client_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{booking.client_email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{booking.client_phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Consultation Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{booking.consultation_type || 'Video Call'}</p>
                  </div>
                </div>
              </>
            )}

            {paymentRef && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Reference</p>
                  <p className="font-mono text-sm text-gray-900">{paymentRef}</p>
                </div>
              </div>
            )}
          </div>

          <div className={`mt-6 p-4 rounded-lg ${
            booking?.payment_status === 'paid' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                booking?.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`} />
              <div className={`text-sm ${
                booking?.payment_status === 'paid' ? 'text-green-800' : 'text-yellow-800'
              }`}>
                <p className="font-semibold mb-1">
                  {booking?.payment_status === 'paid' ? 'Payment Confirmed' : 'Payment Processing'}
                </p>
                <p>
                  {booking?.payment_status === 'paid' 
                    ? `Your payment of <strong>R${booking?.amount || '1,500.00'}</strong> has been successfully processed.`
                    : `Your payment of <strong>R${booking?.amount || '1,500.00'}</strong> is being processed. You'll receive a confirmation once payment is complete.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Confirmation Email</p>
                <p className="text-sm text-gray-600">You'll receive a confirmation email with all the details shortly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Practitioner Notification</p>
                <p className="text-sm text-gray-600">Nthandokazi will be notified of your booking and will prepare for your consultation.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Reminder</p>
                <p className="text-sm text-gray-600">You'll receive a reminder 24 hours before your consultation.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                4
              </div>
              <div>
                <p className="font-medium text-gray-900">Consultation Day</p>
                <p className="text-sm text-gray-600">Nthandokazi will contact you at the scheduled time via your preferred method.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-purple-50 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need to Make Changes?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you need to reschedule or have any questions, please contact us:
          </p>
          <div className="space-y-2">
            <a href="mailto:nthandokazi@intandokaziherbal.co.za" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <Mail className="w-4 h-4" />
              <span className="text-sm">nthandokazi@intandokaziherbal.co.za</span>
            </a>
            <a href="tel:+27768435876" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <Phone className="w-4 h-4" />
              <span className="text-sm">076 843 5876</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/store"
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-center flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Store
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
}
