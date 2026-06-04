import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Intandokazi Herbal Products',
  description: 'Terms and conditions for Intandokazi Herbal Products - Your trusted source for traditional African herbal remedies.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Link href="/" className="inline-flex items-center mb-4 sm:mb-6">
            <Image src="/icon.png" alt="Intandokazi Herbal" width={48} height={48} className="object-contain h-10 w-10 sm:h-12 sm:w-12" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-900 mb-3 sm:mb-4">Terms & Conditions</h1>
          <p className="text-brand-600 text-sm sm:text-base">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-brand max-w-none">
          <div className="bg-white border border-brand-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">Welcome to Intandokazi Herbal Products 🌿</h2>
              <p className="text-brand-700 leading-relaxed mb-4">
                Please send a detailed message outlining how we can assist you, and our team will get back to you within 24 hours.
              </p>
              <p className="text-brand-700 leading-relaxed">
                These Terms & Conditions govern your use of our website and services. By accessing or using Intandokazi Herbal Products, you agree to be bound by these terms.
              </p>
            </section>

            {/* Company Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">Company Information</h2>
              <div className="bg-brand-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-brand-900">Company Name:</strong> Intandokazi Herbal Products
                  </div>
                  <div>
                    <strong className="text-brand-900">Owner:</strong> Intandokazi Mokoatle
                  </div>
                  <div>
                    <strong className="text-brand-900">Status:</strong> <span className="text-green-600">✓ Accredited Company</span>
                  </div>
                  <div>
                    <strong className="text-brand-900">Email:</strong> info@intandokaziherbal.co.za
                  </div>
                </div>
              </div>
            </section>

            {/* Branch Locations */}
            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-brand-900 mb-3 sm:mb-4">📍 Branch Locations & Hours</h2>
              <div className="space-y-3 sm:space-y-4">
                {SITE_CONFIG.branches.map((branch, index) => (
                  <div key={index} className="bg-brand-50 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-brand-900 mb-2 text-sm sm:text-base">{branch.name}</h3>
                    <p className="text-brand-700 text-xs sm:text-sm mb-2 leading-relaxed">{branch.address}</p>
                    <div className="space-y-2">
                      <p className="text-brand-600 text-xs sm:text-sm leading-relaxed">
                        <span className="font-medium">Hours:</span> {branch.hours}
                      </p>
                      <p className="text-brand-600 text-xs sm:text-sm leading-relaxed">
                        <span className="font-medium">Contact:</span> {branch.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-brand-900 mb-3 sm:mb-4">Contact Information</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-brand-50 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-brand-900 mb-2 text-sm sm:text-base">📞 Phone & WhatsApp</h3>
                  <p className="text-brand-700 text-sm sm:text-base">{SITE_CONFIG.phoneFormatted}</p>
                  <p className="text-brand-600 text-xs sm:text-sm mt-1">WhatsApp: {SITE_CONFIG.whatsappFormatted}</p>
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      <strong>Important:</strong> For urgent inquiries, please call {SITE_CONFIG.phoneFormatted} (no WhatsApp calls). 
                      Kindly avoid calling for faster response - messages are attended to in order received.
                    </p>
                  </div>
                </div>

                <div className="bg-brand-50 rounded-lg p-4">
                  <h3 className="font-semibold text-brand-900 mb-2">📧 Email Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>General:</strong> info@intandokaziherbal.co.za
                    </div>
                    <div>
                      <strong>Sales:</strong> sales@intandokaziherbal.co.za
                    </div>
                    <div>
                      <strong>Disputes:</strong> disputes@intandokaziherbal.co.za
                    </div>
                    <div>
                      <strong>Accounts:</strong> accounts@intandokaziherbal.co.za
                    </div>
                    <div>
                      <strong>Admin:</strong> admin@intandokaziherbal.co.za
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Order Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">📦 Order Enquiries</h2>
              <div className="bg-brand-50 rounded-lg p-4">
                <p className="text-brand-700 mb-3">
                  Please follow up <strong>5 days</strong> after receiving your order confirmation.
                </p>
                <p className="text-brand-600 text-sm">
                  This allows us sufficient time to process and ship your order. If you haven't received your order after 5 days, please contact us using any of the methods above.
                </p>
              </div>
            </section>

            {/* Product Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">🌿 Product Information</h2>
              <div className="space-y-3 text-brand-700">
                <p>
                  Our products are traditional African herbal remedies formulated by experienced traditional healers.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Disclaimer:</strong> These products are not intended to diagnose, treat, cure or prevent any disease. 
                    Consult a healthcare professional for medical advice.
                  </p>
                </div>
              </div>
            </section>

            {/* Delivery Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">🚚 Delivery Information</h2>
              <div className="bg-brand-50 rounded-lg p-4">
                <ul className="space-y-2 text-brand-700 text-sm">
                  <li>• We ship via <strong>PAXI Courier</strong> nationwide</li>
                  <li>• Orders placed before 12pm ship same day</li>
                  <li>• Delivery: 2–5 business days</li>
                  <li>• Free delivery on orders over R500</li>
                  <li>• Standard delivery fee: R110</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">💳 Payment Terms</h2>
              <div className="space-y-3 text-brand-700">
                <p>We accept the following payment methods:</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>PayFast (Credit Card, Debit Card, Instant EFT)</li>
                  <li>EFT (Electronic Funds Transfer)</li>
                  <li>Cash on Delivery (selected areas)</li>
                </ul>
                <p className="text-sm text-brand-600">
                  All prices are in South African Rand (ZAR) and include VAT where applicable.
                </p>
              </div>
            </section>

            {/* Return Policy */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">↩️ Return Policy</h2>
              <div className="space-y-3 text-brand-700">
                <p className="text-sm">
                  Due to the nature of our herbal products, we cannot accept returns unless:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>The product is damaged during delivery</li>
                  <li>You received the wrong product</li>
                  <li>There is a manufacturing defect</li>
                </ul>
                <p className="text-sm text-brand-600">
                  In such cases, please contact us within 48 hours of receiving your order.
                </p>
              </div>
            </section>

            {/* Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">🔒 Privacy Policy</h2>
              <div className="space-y-3 text-brand-700 text-sm">
                <p>
                  We respect your privacy and are committed to protecting your personal information. 
                  Any information you provide to us will be used solely for the purpose of processing your orders 
                  and improving our services.
                </p>
                <p>
                  We do not sell, rent, or share your personal information with third parties without your consent, 
                  except as required by law.
                </p>
              </div>
            </section>

            {/* General Terms */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">📋 General Terms</h2>
              <div className="space-y-3 text-brand-700 text-sm">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We reserve the right to update these terms & conditions at any time</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Product availability is not guaranteed</li>
                  <li>We are not responsible for delays caused by courier services</li>
                  <li>By placing an order, you confirm that you are 18 years or older</li>
                  <li>These terms are governed by South African law</li>
                </ul>
              </div>
            </section>

            {/* Contact for Questions */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-brand-900 mb-4">❓ Questions?</h2>
              <div className="bg-brand-50 rounded-lg p-4">
                <p className="text-brand-700 mb-3">
                  If you have any questions about these Terms & Conditions, please don't hesitate to contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {SITE_CONFIG.email}</div>
                  <div><strong>Phone:</strong> {SITE_CONFIG.phoneFormatted}</div>
                  <div><strong>WhatsApp:</strong> {SITE_CONFIG.whatsappFormatted}</div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-900 text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
