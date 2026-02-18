"use client";

import { useRouter } from "next/navigation";
import { X, ShoppingCart, Plus, Minus, Trash2, Leaf } from "lucide-react";
import { useCart } from "@/lib/cartContext";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/store/checkout");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div className="relative w-full max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-600" />
              <h2 className="text-brand-900 font-bold text-lg">Your Cart</h2>
              {totalItems > 0 && (
                <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                  <Leaf className="w-8 h-8 text-brand-600" />
                </div>
                <p className="text-brand-700 text-sm">Your cart is empty</p>
                <p className="text-brand-400 text-xs mt-1">Add some herbal remedies to get started</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 text-brand-600 hover:text-brand-900 text-sm underline transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.product.gradient} flex items-center justify-center flex-shrink-0 text-xl`}>
                      {item.product.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-brand-900 font-semibold text-sm leading-tight">{item.product.name}</h4>
                      <p className="text-brand-500 text-xs mt-0.5">{item.product.unit}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-brand-100 hover:bg-brand-200 text-brand-700 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-brand-900 text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-brand-100 hover:bg-brand-200 text-brand-700 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-brand-900 font-bold text-sm">R{(item.product.price * item.quantity).toFixed(2)}</span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-brand-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-200 space-y-3">
              {totalPrice >= 500 && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs px-3 py-2 rounded-xl">
                  <span>🎉</span>
                  <span>You qualify for <strong>free delivery!</strong></span>
                </div>
              )}
              {totalPrice < 500 && (
                <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-600 text-xs px-3 py-2 rounded-xl">
                  <span>📦</span>
                  <span>Add <strong className="text-brand-800">R{(500 - totalPrice).toFixed(2)}</strong> more for free delivery</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-brand-600 text-sm">Subtotal</span>
                <span className="text-brand-900 font-bold text-lg">R{totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-brand-600 to-navy-600 hover:from-brand-500 hover:to-navy-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-brand-900/40"
              >
                Proceed to Checkout →
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-brand-500 hover:text-brand-800 text-sm py-2 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
