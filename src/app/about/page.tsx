import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import { Phone, Mail, MapPin, Clock, Award, MessageCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'About Us | Intandokazi Herbal Products',
  description: 'Learn about Intandokazi Herbal Products - Your trusted source for traditional African herbal remedies with nationwide delivery and accredited service.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-900 mb-2">About Intandokazi Herbal</h1>
          <p className="text-brand-600 text-sm sm:text-base">Traditional African Herbal Remedies</p>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-brand-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Welcome Section */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-4">Welcome to Intandokazi Herbal Products 🌿</h2>
            <p className="text-brand-700 leading-relaxed mb-4">
              Please send a detailed message outlining how we can assist you, and our team will get back to you within 24 hours.
            </p>
            <p className="text-brand-700 leading-relaxed">
              We are dedicated to providing authentic traditional African herbal remedies to support your health and wellness journey. Our products are carefully sourced and prepared according to traditional methods that have been passed down through generations.
            </p>
          </section>

          {/* Business Information */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-4">Our Business</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-brand-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-brand-900">Status</h3>
                </div>
                <p className="text-brand-700 text-sm">Accredited Company</p>
              </div>
              <div className="bg-brand-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-brand-900">Hours</h3>
                </div>
                <p className="text-brand-700 text-sm">{SITE_CONFIG.operatingHours}</p>
              </div>
            </div>
          </section>

          {/* Our Locations */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-4">📍 Our Locations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SITE_CONFIG.branches.map((branch, index) => (
                <div key={index} className="bg-brand-50 rounded-lg p-4">
                  <h3 className="font-semibold text-brand-900 mb-2">{branch.name}</h3>
                  <p className="text-brand-700 text-sm mb-2 leading-relaxed">{branch.address}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span className="text-brand-700">{branch.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-brand-600" />
                      <span className="text-brand-700">{branch.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-brand-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-brand-900">Phone</h3>
                </div>
                <p className="text-brand-700 text-sm">{SITE_CONFIG.phoneFormatted}</p>
              </div>
              <div className="bg-brand-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-brand-900">WhatsApp</h3>
                </div>
                <p className="text-brand-700 text-sm">{SITE_CONFIG.whatsappFormatted}</p>
              </div>
              <div className="bg-brand-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-brand-900">Email</h3>
                </div>
                <p className="text-brand-700 text-sm">{SITE_CONFIG.email}</p>
              </div>
              <div className="bg-brand-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-brand-900">Service</h3>
                </div>
                <p className="text-brand-700 text-sm">Nationwide Delivery</p>
              </div>
            </div>
            
            {/* Urgent Inquiries Notice */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong className="text-amber-900">⚡ Urgent Inquiries:</strong> Please call {SITE_CONFIG.phoneFormatted} (no WhatsApp calls). 
                Kindly avoid calling for faster response - messages are attended to in order received.
              </p>
            </div>
          </section>

          {/* Order Enquiries */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-4">Order Enquiries</h2>
            <p className="text-brand-700 mb-4 leading-relaxed">
              Please follow up {SITE_CONFIG.shipping.followUpDays} days after receiving your order confirmation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-brand-50 rounded-lg p-3">
                <p className="text-brand-700 text-sm font-medium mb-1">General Info</p>
                <p className="text-brand-600 text-xs">{SITE_CONFIG.emails.info}</p>
              </div>
              <div className="bg-brand-50 rounded-lg p-3">
                <p className="text-brand-700 text-sm font-medium mb-1">Sales</p>
                <p className="text-brand-600 text-xs">{SITE_CONFIG.emails.sales}</p>
              </div>
              <div className="bg-brand-50 rounded-lg p-3">
                <p className="text-brand-700 text-sm font-medium mb-1">Disputes</p>
                <p className="text-brand-600 text-xs">{SITE_CONFIG.emails.disputes}</p>
              </div>
              <div className="bg-brand-50 rounded-lg p-3">
                <p className="text-brand-700 text-sm font-medium mb-1">Accounts</p>
                <p className="text-brand-600 text-xs">{SITE_CONFIG.emails.accounts}</p>
              </div>
              <div className="bg-brand-50 rounded-lg p-3">
                <p className="text-brand-700 text-sm font-medium mb-1">Admin</p>
                <p className="text-brand-600 text-xs">{SITE_CONFIG.emails.admin}</p>
              </div>
            </div>
          </section>

          {/* Delivery Information */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-4">Delivery Information</h2>
            <div className="bg-brand-50 rounded-lg p-4">
              <div className="space-y-2 text-sm text-brand-700">
                <p><strong className="text-brand-900">Courier:</strong> PAXI (nationwide)</p>
                <p><strong className="text-brand-900">Shipping Time:</strong> Orders placed before 12pm ship same day</p>
                <p><strong className="text-brand-900">Delivery:</strong> 2–5 business days</p>
                <p><strong className="text-brand-900">Free Shipping:</strong> Orders over R500</p>
                <p><strong className="text-brand-900">Shipping Fee:</strong> R{SITE_CONFIG.shipping.defaultFee}</p>
              </div>
            </div>
          </section>

          <div className="text-center">
            <Link href="/store" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
