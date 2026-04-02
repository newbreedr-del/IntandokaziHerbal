"use client";

import { Calendar, Clock, CheckCircle, AlertCircle, ExternalLink, CreditCard, Mail, Phone } from "lucide-react";

export default function AdminBookingsPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultation Bookings</h1>
          <p className="text-gray-600">Manage your online consultation bookings and payments</p>
        </div>

        {/* Booking System Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking System Active</h2>
              <p className="text-gray-600">
                Your consultation booking system is live and accepting bookings. All bookings are processed through PayFast with automatic payment confirmation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">Available Times</span>
              </div>
              <p className="text-sm text-gray-600">9 AM - 5 PM daily</p>
              <p className="text-xs text-gray-500 mt-1">Hourly slots auto-generated</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">Pricing</span>
              </div>
              <p className="text-sm text-gray-600">R1,500 per session</p>
              <p className="text-xs text-gray-500 mt-1">60-minute consultations</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Payment</span>
              </div>
              <p className="text-sm text-gray-600">Via PayFast</p>
              <p className="text-xs text-gray-500 mt-1">Instant confirmation</p>
            </div>
          </div>
        </div>

        {/* How to View Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to View Your Bookings</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">PayFast Dashboard</p>
                <p className="text-sm text-gray-600">Login to your PayFast account to view all successful bookings and payments</p>
                <a 
                  href="https://www.payfast.co.za/login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Go to PayFast Dashboard
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">You'll receive email notifications for each booking at: <strong>nthandokazi@intandokaziherbal.co.za</strong></p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Client Contact Info</p>
                <p className="text-sm text-gray-600">Each booking includes client name, email, phone, and consultation type in the payment description</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What Clients See</h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Calendar with next 30 days available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Hourly time slots from 9 AM to 5 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Choice of video call, phone, or WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure payment via PayFast (R1,500)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Instant confirmation after payment</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Need Help?</p>
              <p>For booking management questions, contact PayFast support or check your PayFast merchant dashboard for detailed transaction reports.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
