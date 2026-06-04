import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';
import { Phone, Mail, MapPin, Clock, MessageCircle, Building } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Intandokazi Herbal Products',
  description: 'Get in touch with Intandokazi Herbal Products. Find our contact information, branch locations, and operating hours.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Link href="/" className="inline-flex items-center mb-4 sm:mb-6">
            <Image src="/icon.png" alt="Intandokazi Herbal" width={48} height={48} className="object-contain h-10 w-10 sm:h-12 sm:w-12" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-900 mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-brand-600 text-sm sm:text-base">We're here to help with your herbal remedy needs</p>
        </div>

        {/* Contact Content */}
        <div className="bg-white border border-brand-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Quick Contact */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-6">Get in Touch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-brand-50 rounded-lg p-4 text-center hover:bg-brand-100 transition-colors">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-brand-900 mb-2">Phone</h3>
                <p className="text-brand-700 text-sm">{SITE_CONFIG.phoneFormatted}</p>
                <p className="text-brand-500 text-xs mt-1">Mon-Sat 8:30-17:00</p>
              </div>
              
              <div className="bg-brand-50 rounded-lg p-4 text-center hover:bg-brand-100 transition-colors">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-brand-900 mb-2">WhatsApp</h3>
                <p className="text-brand-700 text-sm">{SITE_CONFIG.whatsappFormatted}</p>
                <p className="text-brand-500 text-xs mt-1">Fast response</p>
              </div>
              
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="bg-brand-50 rounded-lg p-4 text-center hover:bg-brand-100 transition-colors block"
              >
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-brand-900 mb-2">Email</h3>
                <p className="text-brand-700 text-sm">{SITE_CONFIG.email}</p>
                <p className="text-brand-500 text-xs mt-1">24h response</p>
              </a>
              
              <div className="bg-brand-50 rounded-lg p-4 text-center hover:bg-brand-100 transition-colors">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-brand-900 mb-2">Delivery</h3>
                <p className="text-brand-700 text-sm">Nationwide</p>
                <p className="text-brand-500 text-xs mt-1">PAXI Courier</p>
              </div>
            </div>
          </section>

          {/* Branch Locations */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-6">Our Branch Locations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {SITE_CONFIG.branches.map((branch, index) => (
                <div key={index} className="border border-brand-200 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Building className="w-5 h-5 text-brand-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-brand-900 mb-1">{branch.name}</h3>
                      <p className="text-brand-700 text-sm leading-relaxed mb-3">{branch.address}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-8">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-brand-500" />
                      <span className="text-brand-700">{branch.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-brand-500" />
                      <span className="text-brand-700">{branch.phone}</span>
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
              ))}
            </div>
          </section>

          {/* Department Emails */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-6">Department Contacts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-brand-50 rounded-lg p-4">
                <h3 className="font-semibold text-brand-900 mb-2">General Info</h3>
                <a href={`mailto:${SITE_CONFIG.emails.info}`} className="text-brand-700 hover:text-brand-600 text-sm transition-colors">
                  {SITE_CONFIG.emails.info}
                </a>
              </div>
              <div className="bg-brand-50 rounded-lg p-4">
                <h3 className="font-semibold text-brand-900 mb-2">Sales</h3>
                <a href={`mailto:${SITE_CONFIG.emails.sales}`} className="text-brand-700 hover:text-brand-600 text-sm transition-colors">
                  {SITE_CONFIG.emails.sales}
                </a>
              </div>
              <div className="bg-brand-50 rounded-lg p-4">
                <h3 className="font-semibold text-brand-900 mb-2">Disputes</h3>
                <a href={`mailto:${SITE_CONFIG.emails.disputes}`} className="text-brand-700 hover:text-brand-600 text-sm transition-colors">
                  {SITE_CONFIG.emails.disputes}
                </a>
              </div>
              <div className="bg-brand-50 rounded-lg p-4">
                <h3 className="font-semibold text-brand-900 mb-2">Accounts</h3>
                <a href={`mailto:${SITE_CONFIG.emails.accounts}`} className="text-brand-700 hover:text-brand-600 text-sm transition-colors">
                  {SITE_CONFIG.emails.accounts}
                </a>
              </div>
              <div className="bg-brand-50 rounded-lg p-4">
                <h3 className="font-semibold text-brand-900 mb-2">Admin</h3>
                <a href={`mailto:${SITE_CONFIG.emails.admin}`} className="text-brand-700 hover:text-brand-600 text-sm transition-colors">
                  {SITE_CONFIG.emails.admin}
                </a>
              </div>
            </div>
          </section>

          {/* Urgent Notice */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
              <h3 className="font-semibold text-amber-900 mb-2">⚡ Urgent Inquiries</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                For urgent matters, please call <strong>{SITE_CONFIG.phoneFormatted}</strong> (no WhatsApp calls). 
                For faster response, please send messages via WhatsApp or email - calls are attended to in order received.
              </p>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/booking"
                className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                <Clock className="w-4 h-4" />
                Book Consultation
              </a>
              <a
                href="/store"
                className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Browse Products
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
