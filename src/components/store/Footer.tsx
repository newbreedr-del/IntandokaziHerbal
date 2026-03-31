"use client";

import Link from "next/link";
import { Facebook, MessageCircle, Mail, Phone, MapPin, Leaf } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export default function StoreFooter() {
  return (
    <footer className="bg-gradient-to-br from-brand-900 to-navy-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-navy-600 flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-elegant-title text-lg">{SITE_CONFIG.shortName}</span>
            </div>
            <p className="text-brand-200 text-sm mb-4">
              {SITE_CONFIG.description}
            </p>
            <div className="flex gap-3">
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={SITE_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/store" className="text-brand-200 hover:text-white transition-colors">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/store#about" className="text-brand-200 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/store#testimonials" className="text-brand-200 hover:text-white transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-brand-200 hover:text-white transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/store#faq" className="text-brand-200 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/store#shipping" className="text-brand-200 hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/store#returns" className="text-brand-200 hover:text-white transition-colors">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/store#privacy" className="text-brand-200 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <a href={`tel:${SITE_CONFIG.phone}`} className="text-brand-200 hover:text-white transition-colors">
                    {SITE_CONFIG.phoneFormatted}
                  </a>
                  <p className="text-brand-400 text-xs mt-0.5">WhatsApp Available</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="text-brand-200 hover:text-white transition-colors">
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <span className="text-brand-200">
                  South Africa
                </span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-brand-300 text-xs mb-1">Support Hours</p>
              <p className="text-white text-xs font-medium">{SITE_CONFIG.support.hours}</p>
              <p className="text-brand-400 text-xs mt-1">Response time: {SITE_CONFIG.support.responseTime}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-brand-300 text-center sm:text-left">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-brand-300">
            <Link href="/terms" className="hover:text-white transition-colors text-xs">
              Terms of Service
            </Link>
            <span className="text-brand-500">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors text-xs">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
