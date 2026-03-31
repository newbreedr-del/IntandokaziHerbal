"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, ShoppingCart, Send, Leaf, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { Product } from "@/hooks/useProducts";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Sawubona! 🌿 I'm Ntankokazi. I'm so glad you're looking at the ${product.name} — this is one of my favourite remedies. Ask me anything about it: how it works, how to use it, what conditions it helps with, or anything else on your mind!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const productContext = `
Name: ${product.name}
Category: ${product.category}
Description: ${product.long_description}
Benefits: ${product.benefits.join(", ")}
Ingredients: ${product.ingredients.join(", ")}
Usage: ${product.usage_instructions}
Price: R${product.price} per ${product.unit}
Stock: ${product.stock_quantity} units available
      `.trim();

      const res = await fetch("/store/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          productName: product.name,
          productContext,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sawubona! I'm having a little trouble right now. Please WhatsApp me directly for immediate help. 🌿" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "How long before I see results?",
    "Is it safe for children?",
    "Can I take it with medication?",
    "How do I use it correctly?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-brand-900/20 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative p-6 flex-shrink-0 overflow-hidden min-h-[140px]">
          {/* Background: product image or brand gradient */}
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: product.gradient_css }} />
          )}
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="text-4xl mb-2 drop-shadow-sm">{product.emoji}</div>
              <div className="text-brand-600 text-xs font-semibold uppercase tracking-wider mb-1">{product.category}</div>
              <h2 className="text-brand-900 font-elegant-title text-xl leading-tight">{product.name}</h2>
              <p className="text-brand-700 text-sm mt-1">{product.tagline}</p>
              {product.badge && (
                <span className="inline-block mt-2 bg-brand-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            <button onClick={onClose} className="ml-4 p-2 rounded-full bg-white/70 hover:bg-white border border-white/60 text-brand-700 hover:text-brand-900 transition-colors flex-shrink-0 backdrop-blur-sm">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative mt-4 flex items-center justify-between">
            <div>
              <span className="text-brand-900 font-bold text-2xl">R{product.price}</span>
              <span className="text-brand-600 text-sm ml-2">/ {product.unit}</span>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-sm ${
                added ? "bg-emerald-500 text-white" : "bg-brand-600 hover:bg-brand-700 text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? "Added to Cart!" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          {(["details", "chat"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-brand-700 border-b-2 border-brand-600"
                  : "text-gray-400 hover:text-brand-600"
              }`}
            >
              {tab === "details" ? "📋 Product Details" : "💬 Ask Ntankokazi (AI)"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "details" ? (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-brand-900 font-semibold mb-2 text-sm uppercase tracking-wider">About This Product</h3>
                <p className="text-brand-700 text-sm leading-relaxed">{product.long_description}</p>
              </div>
              <div>
                <h3 className="text-brand-900 font-semibold mb-3 text-sm uppercase tracking-wider">Benefits</h3>
                <div className="space-y-2">
                  {product.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-2.5 text-sm text-brand-700">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0 font-bold">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-brand-900 font-semibold mb-2 text-sm uppercase tracking-wider">How to Use</h3>
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                  <p className="text-brand-700 text-sm leading-relaxed">{product.usage_instructions}</p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => setShowIngredients(!showIngredients)}
                  className="flex items-center justify-between w-full text-brand-900 font-semibold text-sm uppercase tracking-wider"
                >
                  <span>Ingredients</span>
                  {showIngredients ? <ChevronUp className="w-4 h-4 text-brand-500" /> : <ChevronDown className="w-4 h-4 text-brand-500" />}
                </button>
                {showIngredients && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.ingredients.map((ing) => (
                      <span key={ing} className="bg-brand-50 border border-brand-200 text-brand-700 text-xs px-3 py-1 rounded-full">
                        {ing}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span className="text-brand-900 text-sm font-semibold">Have questions?</span>
                </div>
                <p className="text-brand-500 text-xs mb-3">Chat with Ntankokazi directly — she answers every question personally.</p>
                <button
                  onClick={() => setActiveTab("chat")}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm py-2.5 rounded-xl font-medium transition-colors"
                >
                  Ask Ntankokazi →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0" style={{ maxHeight: "340px" }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-navy-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        <Leaf className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-brand-600 text-white rounded-br-sm"
                          : "bg-gray-100 border border-gray-200 text-brand-800 rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-navy-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Leaf className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested questions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="text-xs bg-white border border-brand-300 text-brand-600 hover:border-brand-500 hover:text-brand-900 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask Ntankokazi anything..."
                    className="flex-1 bg-white border border-gray-300 text-brand-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 shadow-sm transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
