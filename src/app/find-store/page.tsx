import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';
import { MapPin, Phone, Clock, MessageCircle, Navigation, Building, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find A Store | Intandokazi Herbal Products',
  description: 'Find your nearest Intandokazi Herbal Products branch. Locations in Durban, PMB, Cape Town, and Johannesburg with contact details and operating hours.',
};

export default function FindStorePage() {
  const getDirectionsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Link href="/" className="inline-flex items-center mb-4 sm:mb-6">
            <Image src="/icon.png" alt="Intandokazi Herbal" width={48} height={48} className="object-contain h-10 w-10 sm:h-12 sm:w-12" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-900 mb-3 sm:mb-4">Find A Store</h1>
          <p className="text-brand-600 text-sm sm:text-base">Visit our branches nationwide for personalized service</p>
        </div>

        {/* Store Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {SITE_CONFIG.branches.map((branch, index) => (
            <div key={index} className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Store Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-brand-900 mb-2">{branch.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-brand-600">
                    <MapPin className="w-4 h-4" />
                    <span>Physical Store</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <h3 className="font-semibold text-brand-900 mb-2 text-sm">📍 Address</h3>
                <p className="text-brand-700 leading-relaxed">{branch.address}</p>
                <a
                  href={getDirectionsUrl(branch.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors mt-2"
                >
                  <Navigation className="w-3 h-3" />
                  Get Directions
                </a>
              </div>

              {/* Contact Information */}
              <div className="mb-4">
                <h3 className="font-semibold text-brand-900 mb-2 text-sm">📞 Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-600" />
                    <span className="text-brand-700 text-sm">{branch.phone}</span>
                  </div>
                  <a
                    href={`https://wa.me/${branch.phoneRaw.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp Branch
                  </a>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mb-6">
                <h3 className="font-semibold text-brand-900 mb-2 text-sm">🕘 Operating Hours</h3>
                <p className="text-brand-700 text-sm">{branch.hours}</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${branch.phoneRaw}`}
                  className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call Store
                </a>
                <a
                  href={`https://wa.me/${branch.phoneRaw.replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* General Information */}
        <div className="bg-brand-50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-brand-900 mb-4">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-brand-900 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                General Hours
              </h3>
              <p className="text-brand-700 text-sm">{SITE_CONFIG.operatingHours}</p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-900 mb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-600" />
                Main Contact
              </h3>
              <p className="text-brand-700 text-sm">{SITE_CONFIG.phoneFormatted}</p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-900 mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-600" />
                WhatsApp Support
              </h3>
              <p className="text-brand-700 text-sm">{SITE_CONFIG.whatsappFormatted}</p>
            </div>
          </div>
        </div>

        {/* Services Available */}
        <div className="bg-white border border-brand-200 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-brand-900 mb-4">Services Available at All Branches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-brand-50 rounded-lg">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-brand-900 mb-1">In-Store Shopping</h3>
              <p className="text-brand-700 text-sm">Browse our full product range</p>
            </div>
            <div className="text-center p-4 bg-brand-50 rounded-lg">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-brand-900 mb-1">Consultations</h3>
              <p className="text-brand-700 text-sm">Personalized herbal advice</p>
            </div>
            <div className="text-center p-4 bg-brand-50 rounded-lg">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-brand-900 mb-1">Order Collection</h3>
              <p className="text-brand-700 text-sm">Pick up online orders</p>
            </div>
            <div className="text-center p-4 bg-brand-50 rounded-lg">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-brand-900 mb-1">Customer Service</h3>
              <p className="text-brand-700 text-sm">Face-to-face support</p>
            </div>
          </div>
        </div>

        {/* Urgent Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 mb-8">
          <h3 className="font-semibold text-amber-900 mb-2">⚡ Before You Visit</h3>
          <p className="text-amber-800 text-sm leading-relaxed">
            For urgent inquiries, please call <strong>{SITE_CONFIG.phoneFormatted}</strong> (no WhatsApp calls). 
            We recommend calling ahead to confirm product availability, especially for specific herbal remedies.
          </p>
        </div>

        {/* Back to Store */}
        <div className="text-center">
          <Link 
            href="/store" 
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Back to Online Store
          </Link>
        </div>
      </div>
    </div>
  );
}
