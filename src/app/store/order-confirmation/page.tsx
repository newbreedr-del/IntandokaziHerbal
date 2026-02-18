"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail, MessageCircle, Package, Leaf, ArrowRight } from "lucide-react";

function ConfirmationContent() {
  const params = useSearchParams();
  const ref = params.get("ref") || "NTK-000000";
  const email = params.get("email") || "";
  const name = params.get("name") || "Valued Customer";
  const phone = params.get("phone") || "";

  const [emailSent, setEmailSent] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setEmailSent(true), 1200);
    const t2 = setTimeout(() => setWhatsappSent(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-navy-600 flex items-center justify-center shadow-lg shadow-brand-900/50">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-brand-900 font-elegant-title text-lg">Ntankokazi Herbal</span>
      </div>

      {/* Success Card */}
      <div className="w-full max-w-lg bg-white border border-brand-200 rounded-3xl p-8 text-center shadow-2xl shadow-brand-900/20">
        <div className="w-20 h-20 rounded-full bg-emerald-900/30 border border-emerald-700/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        <h1 className="text-brand-900 font-elegant-title text-2xl mb-2">Order Placed! 🌿</h1>
        <p className="text-brand-700 text-sm mb-1">
          Thank you, <strong className="text-brand-900">{name}</strong>!
        </p>
        <p className="text-brand-600 text-sm mb-6">
          Your order has been received and is being prepared with care.
        </p>

        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 mb-6">
          <p className="text-brand-600 text-xs mb-1">Order Reference</p>
          <p className="text-brand-900 font-bold text-xl tracking-wider">{ref}</p>
          <p className="text-brand-500 text-xs mt-1">Keep this reference for tracking your delivery</p>
        </div>

        {/* Notification Status */}
        <div className="space-y-3 mb-8">
          <h3 className="text-brand-900 font-semibold text-sm text-left">Notifications Sent</h3>

          <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500 ${emailSent ? "border-emerald-700/40 bg-emerald-50" : "border-brand-200 bg-brand-50"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${emailSent ? "bg-emerald-500" : "bg-brand-800"}`}>
              {emailSent ? <Mail className="w-4 h-4 text-white" /> : <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium transition-colors ${emailSent ? "text-emerald-400" : "text-brand-400"}`}>
                {emailSent ? "Confirmation email sent!" : "Sending confirmation email..."}
              </p>
              {email && <p className="text-brand-500 text-xs">{email}</p>}
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500 ${whatsappSent ? "border-emerald-700/40 bg-emerald-50" : "border-brand-200 bg-brand-50"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${whatsappSent ? "bg-emerald-500" : "bg-brand-800"}`}>
              {whatsappSent ? <MessageCircle className="w-4 h-4 text-white" /> : <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium transition-colors ${whatsappSent ? "text-emerald-400" : "text-brand-400"}`}>
                {whatsappSent ? "WhatsApp message sent!" : "Sending WhatsApp message..."}
              </p>
              {phone && <p className="text-brand-500 text-xs">{phone}</p>}
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 mb-6 text-left">
          <h3 className="text-brand-900 font-semibold text-sm mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-600" />
            What happens next?
          </h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "We prepare your order with fresh, quality ingredients", time: "Today" },
              { step: "2", text: "Your parcel is handed to PIXI courier for dispatch", time: "1–2 days" },
              { step: "3", text: "PIXI delivers to your door with a tracking number", time: "2–5 days" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</div>
                <div className="flex-1">
                  <p className="text-brand-700 text-xs">{item.text}</p>
                  <p className="text-brand-500 text-xs">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-100 to-navy-100 border border-brand-300 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-navy-700 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-brand-700 text-xs font-semibold">Message from Ntankokazi</span>
          </div>
          <p className="text-brand-800 text-sm leading-relaxed italic">
            "Sawubona {name}! 🌿 Thank you so much for your order — it truly means the world to me. I personally oversee every product that leaves my hands to make sure it is made with love and the finest natural ingredients. I hope these remedies bring you healing and wellness. Please don't hesitate to WhatsApp me if you have any questions about your order or how to use the products. Ngiyabonga!"
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/store"
            className="flex-1 flex items-center justify-center gap-2 border border-brand-300 hover:border-brand-500 text-brand-700 hover:text-brand-900 py-3 rounded-xl text-sm font-medium transition-all"
          >
            Continue Shopping
          </Link>
          <a
            href="https://wa.me/27000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Ntankokazi
          </a>
        </div>
      </div>

      <p className="text-brand-600 text-xs mt-8 text-center max-w-sm">
        Questions about your order? WhatsApp us or email info@ntankokazi.co.za — we respond within 2 hours during business hours.
      </p>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
