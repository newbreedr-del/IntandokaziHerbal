import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';
import { MessageCircle, Phone, Clock, MapPin, Package, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ | Intandokazi Herbal Products',
  description: 'Frequently asked questions about Intandokazi Herbal Products - ordering, shipping, payments, and product information.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "You can place an order through our online store by browsing products, adding items to your cart, and proceeding to checkout. You can also contact us via WhatsApp for assistance."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept PayFast (credit/debit cards, instant EFT), Capitec Pay, and manual EFT/bank transfers. All payment details are provided at checkout."
    },
    {
      question: "How long does delivery take?",
      answer: "We ship nationwide via PAXI Courier. Orders placed before 12pm ship the same day. Delivery typically takes 2-5 business days."
    },
    {
      question: "Is there free shipping?",
      answer: "Yes! We offer free delivery on orders over R500. For orders under R500, there's a R110 shipping fee."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email and WhatsApp. You can use this to track your package with PAXI Courier."
    },
    {
      question: "What if I need to return or exchange a product?",
      answer: "Please contact our customer service team at disputes@intandokaziherbal.co.za within 7 days of receiving your order. We'll assist you with returns or exchanges."
    },
    {
      question: "Are your products safe to use?",
      answer: "Our products are traditional herbal remedies, but we recommend consulting with a healthcare professional before use, especially if you have existing health conditions or are taking medication."
    },
    {
      question: "Do you offer consultations?",
      answer: "Yes! You can book a consultation through our website. Our herbal specialists can provide personalized recommendations based on your needs."
    },
    {
      question: "Can I visit your physical stores?",
      answer: "Yes! We have branches in Durban, PMB, Cape Town, and Johannesburg CBD. Visit our 'Find A Store' page for exact locations and hours."
    },
    {
      question: "How do I contact customer service?",
      answer: "You can reach us via WhatsApp at {SITE_CONFIG.whatsappFormatted}, call us at {SITE_CONFIG.phoneFormatted}, or email info@intandokaziherbal.co.za. We respond within 24 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Link href="/" className="inline-flex items-center mb-4 sm:mb-6">
            <Image src="/icon.png" alt="Intandokazi Herbal" width={48} height={48} className="object-contain h-10 w-10 sm:h-12 sm:w-12" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-900 mb-3 sm:mb-4">Frequently Asked Questions</h1>
          <p className="text-brand-600 text-sm sm:text-base">Find answers to common questions about our products and services</p>
        </div>

        {/* FAQ Content */}
        <div className="bg-white border border-brand-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-brand-100 last:border-b-0 pb-6 last:pb-0">
                <h3 className="text-lg font-semibold text-brand-900 mb-3">{faq.question}</h3>
                <p className="text-brand-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* Quick Contact */}
          <div className="mt-8 p-4 bg-brand-50 rounded-xl">
            <h3 className="text-lg font-semibold text-brand-900 mb-4">Still have questions?</h3>
            <p className="text-brand-700 mb-4">Our customer service team is here to help!</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
              <a
                href="/contact"
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors justify-center"
              >
                <Phone className="w-4 h-4" />
                Contact Page
              </a>
            </div>
          </div>

          {/* Back to Store */}
          <div className="text-center mt-8">
            <Link 
              href="/store" 
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
