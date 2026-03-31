"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ShoppingCart, ChevronLeft, Lock, Eye, EyeOff, Package, CreditCard, Smartphone } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { usePayFastPayment } from "@/hooks/usePayFastPayment";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

interface BillingAddress {
  firstName: string; lastName: string; email: string; phone: string;
  streetAddress: string; suburb: string; city: string; province: string;
  postalCode: string; country: string; deliveryNotes: string;
}

const PROVINCES = ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"];
const PAYMENT_METHODS = [
  { id: "payfast", label: "PayFast (Card, EFT, Instant EFT)", icon: <CreditCard className="w-4 h-4" />, recommended: true },
  { id: "eft", label: "Manual EFT / Bank Transfer", icon: <CreditCard className="w-4 h-4" /> },
];

const EFT_DETAILS = {
  accountName: "Miss Mokoatle",
  bank: "Capitec Bank",
  accountType: "Active Savings",
  accountNumber: "1506845620",
  linkedNumber: "0625842441",
  paxiFee: "110"
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-brand-700 text-xs font-medium mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full bg-white border ${err ? "border-red-400" : "border-gray-300"} text-brand-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 shadow-sm transition-all`;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { createPayment, loading: paymentLoading } = usePayFastPayment();
  const [step, setStep] = useState<"details" | "payment" | "review">("details");
  const [paymentMethod, setPaymentMethod] = useState("payfast");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [billing, setBilling] = useState<BillingAddress>({
    firstName: "", lastName: "", email: "", phone: "",
    streetAddress: "", suburb: "", city: "", province: "Gauteng",
    postalCode: "", country: "South Africa", deliveryNotes: "",
  });

  const deliveryFee = totalPrice >= 500 ? 0 : 85;
  const total = totalPrice + deliveryFee;
  const orderRef = `NTK-${Date.now().toString().slice(-6)}`;

  const upd = (f: keyof BillingAddress, v: string) => {
    setBilling((p) => ({ ...p, [f]: v }));
    setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!billing.firstName.trim()) e.firstName = "Required";
    if (!billing.lastName.trim()) e.lastName = "Required";
    if (!billing.email.trim() || !/\S+@\S+\.\S+/.test(billing.email)) e.email = "Valid email required";
    if (!billing.phone.trim()) e.phone = "Required";
    if (!billing.streetAddress.trim()) e.streetAddress = "Required";
    if (!billing.city.trim()) e.city = "Required";
    if (!billing.postalCode.trim()) e.postalCode = "Required";
    if (createAccount) {
      if (password.length < 8) e.password = "Minimum 8 characters";
      if (password !== confirmPw) e.confirmPw = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    
    try {
      if (paymentMethod === 'payfast') {
        // Create PayFast payment and redirect
        await createPayment({
          amount: total,
          reference: orderRef,
          customerEmail: billing.email,
          customerName: `${billing.firstName} ${billing.lastName}`,
          customerPhone: billing.phone,
          description: `Order ${orderRef} - Intandokazi Herbal`,
          items: items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          }))
        });
        // PayFast will redirect to payment page - cart will be cleared after successful payment
        // Don't clear cart here in case user cancels or payment fails
      } else {
        // For other payment methods, proceed to confirmation
        await new Promise((r) => setTimeout(r, 1800));
        clearCart();
        router.push(`/store/order-confirmation?ref=${orderRef}&email=${encodeURIComponent(billing.email)}&name=${encodeURIComponent(billing.firstName)}&phone=${encodeURIComponent(billing.phone)}&method=${paymentMethod}`);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to process order. Please try again.');
      setSubmitting(false);
      // Don't clear cart on error - user should be able to retry
    }
  };

  if (items.length === 0 && step !== "review") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <ShoppingCart className="w-12 h-12 text-brand-600 mb-4" />
        <h2 className="text-brand-900 font-bold text-xl mb-2">Your cart is empty</h2>
        <Link href="/store" className="mt-4 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-full font-semibold text-sm transition-colors">Back to Store</Link>
      </div>
    );
  }

  const stepIndex = ["details", "payment", "review"].indexOf(step);

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2 text-brand-600 hover:text-brand-900 transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" />Back to Store
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-navy-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-brand-900 font-elegant-title text-sm hidden sm:inline">Ntankokazi Herbal</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-600 text-xs"><Lock className="w-3.5 h-3.5" /><span>Secure Checkout</span></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["Details", "Payment", "Review"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 text-sm font-medium ${i === stepIndex ? "text-brand-900" : i < stepIndex ? "text-brand-500" : "text-gray-400"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === stepIndex ? "bg-brand-600 text-white" : i < stepIndex ? "bg-brand-200 text-brand-600" : "bg-gray-100 border border-gray-300 text-gray-400"}`}>{i + 1}</div>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < 2 && <div className={`h-px w-8 sm:w-16 ${i < stepIndex ? "bg-brand-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 1 */}
            {step === "details" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-brand-900 font-bold text-lg mb-1">Billing & Delivery Address</h2>
                  <p className="text-brand-500 text-xs mb-5">Used for your PAXI courier delivery — please ensure accuracy.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name *" error={errors.firstName}><input type="text" value={billing.firstName} onChange={(e) => upd("firstName", e.target.value)} className={inputCls(errors.firstName)} placeholder="Thandi" /></Field>
                    <Field label="Last Name *" error={errors.lastName}><input type="text" value={billing.lastName} onChange={(e) => upd("lastName", e.target.value)} className={inputCls(errors.lastName)} placeholder="Mokoena" /></Field>
                    <Field label="Email Address *" error={errors.email}><input type="email" value={billing.email} onChange={(e) => upd("email", e.target.value)} className={inputCls(errors.email)} placeholder="thandi@email.co.za" /></Field>
                    <Field label="Phone / WhatsApp *" error={errors.phone}><input type="tel" value={billing.phone} onChange={(e) => upd("phone", e.target.value)} className={inputCls(errors.phone)} placeholder="072 345 6789" /></Field>
                    <div className="sm:col-span-2">
                      <Field label="Street Address *" error={errors.streetAddress}><input type="text" value={billing.streetAddress} onChange={(e) => upd("streetAddress", e.target.value)} className={inputCls(errors.streetAddress)} placeholder="12 Jacaranda Street" /></Field>
                    </div>
                    <Field label="Suburb"><input type="text" value={billing.suburb} onChange={(e) => upd("suburb", e.target.value)} className={inputCls()} placeholder="Hatfield" /></Field>
                    <Field label="City / Town *" error={errors.city}><input type="text" value={billing.city} onChange={(e) => upd("city", e.target.value)} className={inputCls(errors.city)} placeholder="Pretoria" /></Field>
                    <Field label="Province *">
                      <select value={billing.province} onChange={(e) => upd("province", e.target.value)} className={inputCls()}>
                        {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </Field>
                    <Field label="Postal Code *" error={errors.postalCode}><input type="text" value={billing.postalCode} onChange={(e) => upd("postalCode", e.target.value)} className={inputCls(errors.postalCode)} placeholder="0083" /></Field>
                    <div className="sm:col-span-2">
                      <Field label="Delivery Notes (optional)"><textarea value={billing.deliveryNotes} onChange={(e) => upd("deliveryNotes", e.target.value)} rows={2} className={`${inputCls()} resize-none`} placeholder="Gate code, building name, special instructions..." /></Field>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="ca" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand-500" />
                    <div>
                      <label htmlFor="ca" className="text-brand-900 font-semibold text-sm cursor-pointer">Create an account for faster checkout next time</label>
                      <p className="text-brand-500 text-xs mt-0.5">Track orders, save your address and get exclusive member discounts.</p>
                    </div>
                  </div>
                  {createAccount && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Password *" error={errors.password}>
                        <div className="relative">
                          <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls(errors.password)} pr-10`} placeholder="Min. 8 characters" />
                          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </Field>
                      <Field label="Confirm Password *" error={errors.confirmPw}>
                        <input type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={inputCls(errors.confirmPw)} placeholder="Repeat password" />
                      </Field>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => { if (validate()) setStep("payment"); }} 
                  className="w-full py-4"
                  size="lg"
                >
                  Continue to Payment →
                </Button>
              </div>
            )}

            {/* STEP 2 */}
            {step === "payment" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-brand-900 font-bold text-lg mb-5">Payment Method</h2>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((m) => (
                      <motion.button 
                        key={m.id} 
                        onClick={() => setPaymentMethod(m.id)} 
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left relative ${paymentMethod === m.id ? "border-brand-500 bg-brand-50 text-brand-900" : "border-gray-200 bg-white text-brand-700 hover:border-brand-300"}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {m.recommended && (
                          <span className="absolute -top-2 right-4 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                            Recommended
                          </span>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === m.id ? "border-brand-500" : "border-gray-300"}`}>
                          {paymentMethod === m.id && <motion.div layoutId="payment-selected" className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                        </div>
                        {m.icon}
                        <span className="font-medium text-sm">{m.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  {paymentMethod === "eft" && (
                    <div className="mt-5 bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-700 space-y-1.5">
                      <p className="font-semibold text-brand-900 mb-2">💳 EFT Banking Details</p>
                      <p><span className="text-brand-500">Bank:</span> <strong>{EFT_DETAILS.bank}</strong></p>
                      <p><span className="text-brand-500">Account Name:</span> <strong>{EFT_DETAILS.accountName}</strong></p>
                      <p><span className="text-brand-500">Account Type:</span> {EFT_DETAILS.accountType}</p>
                      <p><span className="text-brand-500">Account Number:</span> <strong className="text-brand-900">{EFT_DETAILS.accountNumber}</strong></p>
                      <p><span className="text-brand-500">Linked Number:</span> {EFT_DETAILS.linkedNumber}</p>
                      <div className="mt-3 pt-3 border-t border-brand-200">
                        <p className="text-xs text-brand-600">📦 Payment Reference: <strong className="text-brand-900">{billing.firstName} {billing.lastName}</strong></p>
                        <p className="text-xs text-brand-600">� PAXI Delivery Fee: <strong className="text-brand-900">R{EFT_DETAILS.paxiFee}</strong></p>
                        <p className="text-xs text-brand-500 mt-1">Use your full name as payment reference. Total amount includes R{EFT_DETAILS.paxiFee} PAXI delivery fee.</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setStep("details")} variant="secondary" className="flex-1 py-3.5">← Back</Button>
                  <Button onClick={() => setStep("review")} className="flex-[2] py-3.5">Review Order →</Button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === "review" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-brand-900 font-bold text-lg mb-4">Review Your Order</h2>
                  <div className="space-y-3 mb-5">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: item.product.gradientCss }}>{item.product.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-brand-900 text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-brand-500 text-xs">Qty: {item.quantity} × R{item.product.price}</p>
                        </div>
                        <span className="text-brand-900 font-semibold text-sm">R{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-brand-600"><span>Subtotal</span><span>R{totalPrice.toFixed(2)}</span></div>
                    <div className="flex justify-between text-brand-600"><span>Delivery (PAXI)</span><span>{deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `R${deliveryFee}`}</span></div>
                    <div className="flex justify-between text-brand-900 font-bold text-base pt-2 border-t border-gray-200"><span>Total</span><span>R{total.toFixed(2)}</span></div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 text-sm shadow-sm">
                  <h3 className="text-brand-900 font-semibold mb-3">Delivery Address</h3>
                  <p className="text-brand-800">{billing.firstName} {billing.lastName}</p>
                  <p className="text-brand-600">{billing.streetAddress}{billing.suburb ? `, ${billing.suburb}` : ""}</p>
                  <p className="text-brand-600">{billing.city}, {billing.province}, {billing.postalCode}</p>
                  <p className="text-brand-600">{billing.phone} · {billing.email}</p>
                  {billing.deliveryNotes && <p className="text-brand-400 text-xs mt-1">Note: {billing.deliveryNotes}</p>}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 text-sm shadow-sm">
                  <h3 className="text-brand-900 font-semibold mb-1">Payment</h3>
                  <p className="text-brand-600">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</p>
                  <p className="text-brand-400 text-xs mt-1">Reference: {orderRef}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-700">
                  ✅ A confirmation email and WhatsApp message will be sent to <strong>{billing.email}</strong> and <strong>{billing.phone}</strong> after placing your order.
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setStep("payment")} variant="secondary" className="flex-1 py-3.5">← Back</Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    loading={submitting || paymentLoading}
                    className="flex-[2] py-3.5"
                  >
                    Place Order 🌿
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24 shadow-sm">
              <h3 className="text-brand-900 font-semibold mb-4 text-sm">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: item.product.gradientCss }}>{item.product.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-900 text-xs font-medium truncate">{item.product.name}</p>
                      <p className="text-brand-400 text-xs">×{item.quantity}</p>
                    </div>
                    <span className="text-brand-700 text-xs font-semibold">R{(item.product.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-brand-500"><span>Subtotal</span><span>R{totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-brand-500"><span>Delivery</span><span>{deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `R${deliveryFee}`}</span></div>
                <div className="flex justify-between text-brand-900 font-bold text-sm pt-1.5 border-t border-gray-200"><span>Total</span><span>R{total.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-brand-400">
                <Package className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Delivered via PAXI Courier · 2–5 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
