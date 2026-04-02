"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Search, Leaf, Phone, Mail, MapPin, Star, ChevronDown, AlertCircle, MessageCircle, Facebook, CheckCircle, Calendar } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useProducts, Product } from "@/hooks/useProducts";
import ProductCard from "@/components/store/ProductCard";
import ProductModal from "@/components/store/ProductModal";
import CartDrawer from "@/components/store/CartDrawer";
import BookingCalendar from "@/components/BookingCalendar";
import { SITE_CONFIG, PRODUCT_CATEGORIES } from "@/lib/constants";

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { products, loading, error } = useProducts();
  
  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    // Handle "Popular" tab - show only featured products
    if (selectedCategory === "Popular") {
      const searchMatch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return product.is_featured && searchMatch;
    }
    
    // Handle "All" tab - show all products
    if (selectedCategory === "All") {
      const searchMatch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return searchMatch;
    }
    
    // Handle specific category tabs
    const categoryMatch = product.category === selectedCategory;
    const searchMatch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Get all categories - use predefined categories plus any from products
  const allCategories = [
    "Internal Health",
    "External Health", 
    "Mental Wellness",
    "Traditional Remedies",
    "Vitamins & Supplements",
    "Natural Beauty",
    "Immune Support",
    "Digestive Health"
  ];
  
  // Get unique categories from products and combine with predefined ones
  const productCategories = Array.from(new Set(products.map(p => p.category)));
  const categories = ["All", "Popular", ...allCategories.filter(cat => 
    allCategories.includes(cat) || productCategories.includes(cat)
  )].sort((a, b) => {
    // Keep "All" and "Popular" at the beginning
    if (a === "All") return -1;
    if (b === "All") return 1;
    if (a === "Popular") return -1;
    if (b === "Popular") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0d0a1a]/95 backdrop-blur-md border-b border-brand-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image src="/logo.png" alt="Nthandokazi Herbal Logo" fill className="object-contain" />
              </div>
              <div>
                <span className="text-white font-elegant-title text-lg leading-none block">Intandokazi Herbal</span>
                <span className="text-brand-300 text-xs">Traditional & Organic Medicines</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href={`tel:${SITE_CONFIG.phone}`} className="hidden sm:flex items-center gap-1.5 text-brand-300 hover:text-white text-sm transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Us</span>
              </a>
              <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-lg shadow-brand-900/40"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Real hero background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpeg"
            alt="Herbal background"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Brand colour tint at 60% opacity over the image */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(45,27,107,0.6), rgba(26,47,110,0.6))" }} />
        {/* Extra dark gradient at bottom for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-brand-900/40" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-900/60 border border-brand-700/50 text-brand-300 text-sm px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <Leaf className="w-3.5 h-3.5" />
            <span>100% Natural · Traditional African Healing · Organic</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-elegant-title text-white mb-6 leading-tight">
            Healing Rooted in{" "}
            <span className="bg-gradient-to-r from-brand-300 via-purple-300 to-brand-400 bg-clip-text text-transparent">
              African Tradition
            </span>
          </h1>
          <p className="text-lg text-brand-200/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Handcrafted herbal remedies, traditional medicines and organic wellness products — trusted by thousands across South Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-gradient-to-r from-brand-600 to-navy-600 hover:from-brand-500 hover:to-navy-500 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 shadow-xl shadow-brand-900/50 hover:shadow-brand-700/40 hover:-translate-y-0.5"
            >
              Shop All Products
            </button>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-brand-600/60 hover:border-brand-400 text-brand-300 hover:text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 hover:bg-brand-900/40"
            >
              Ask Intandokazi
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: "10+", label: "Herbal Products" },
              { value: "890+", label: "Happy Clients Daily" },
              { value: "100%", label: "Natural Ingredients" },
              { value: "PAXI", label: "Fast Delivery" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-brand-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex justify-center mt-12">
          <ChevronDown className="w-6 h-6 text-brand-500 animate-bounce" />
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-y border-brand-200 py-4" style={{background: "#ede9f8"}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-sm text-brand-700">
            {["🌿 Wild-Harvested Ingredients", "📦 PAXI Courier Delivery", "💬 AI-Powered Product Advice", "✅ Traditional Healer Formulated", "🔒 Secure Checkout"].map((item) => (
              <span key={item} className="whitespace-nowrap">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search & Filter */}
        <div className="mb-10">
          <h2 className="text-2xl font-elegant-title text-brand-900 mb-6">Our Products</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
              <input
                type="text"
                placeholder="Search products, conditions, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-brand-300 text-brand-900 placeholder-brand-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 shadow-sm transition-all"
              />
            </div>
            
            {/* Category Buttons */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 border-purple-500"
                      : "bg-white border border-purple-200 text-purple-700 hover:border-purple-400 hover:text-purple-900 hover:bg-purple-50 shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 text-brand-500">
            <div className="animate-spin w-12 h-12 border-4 border-brand-300 border-t-brand-600 rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-semibold">Error loading products</p>
            <p className="text-sm mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-brand-500">
            <Leaf className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No products found. Try a different search.</p>
          </div>
        ) : !loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onOpen={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Online Consultation Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-brand-600 rounded-3xl p-8 md:p-12 shadow-2xl text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full -ml-24 -mb-24"></div>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full mb-6">
                <Leaf className="w-5 h-5" />
                <span className="text-sm font-medium">Traditional Healing Wisdom</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Book an Online Consultation
              </h2>
              
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Get personalized herbal remedies and traditional healing advice from experienced practitioners. 
                Consultations available via WhatsApp, Phone, or Video Call.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Phone & WhatsApp Consultations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Video Call Sessions Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Personalized Treatment Plans</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white text-brand-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-5 h-5" />
                  Book Online Now
                </button>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=Hi%20Intandokazi,%20I'd%20like%20to%20book%20a%20consultation`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Consultation Includes:</h3>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Personalized health assessment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Traditional herbal remedy recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dosage and usage instructions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Lifestyle and dietary advice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Follow-up support</span>
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">R1,500</div>
                    <div className="text-sm text-white/80">Per Consultation</div>
                    <div className="text-xs text-white/60 mt-1">~60 minutes session</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-brand-200 py-16 px-4" style={{background: "#ede9f8"}}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-elegant-title text-brand-900 text-center mb-10">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Thandi M.", location: "Pretoria", text: "The Intandokazi Yothando cream is incredible! My skin has never felt so soft and nourished. My whole family loves it.", stars: 5 },
              { name: "Sipho N.", location: "Johannesburg", text: "The Intanmorati Body Butter is amazing — the lavender scent is so calming and my skin stays moisturised all day. Highly recommend!", stars: 5 },
              { name: "Nomsa K.", location: "Centurion", text: "Nthandokazi really knows her craft. The Mavula Kuvaliwe scrub left my skin glowing. I order every month without fail!", stars: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-brand-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="text-brand-900 font-semibold text-sm">{t.name}</div>
                  <div className="text-brand-600 text-xs">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-900 border-t border-brand-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image src="/logo.png" alt="Nthandokazi Herbal" fill className="object-contain" />
                </div>
                <span className="text-white font-elegant-title">Nthandokazi Herbal</span>
              </div>
              <p className="text-brand-400 text-sm leading-relaxed mb-4">
                Welcome to Intandokazi Herbal Products 🌿
              </p>
              <p className="text-brand-400 text-sm leading-relaxed mb-4">
                Please send a detailed message outlining how we can assist you, and our team will get back to you within 24 hours.
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-brand-300 text-sm">📍 Branches:</span>
                <span className="text-brand-400 text-sm">{SITE_CONFIG.branches.join(' | ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-300 text-sm">🕘 Operating Hours:</span>
                <span className="text-brand-400 text-sm">{SITE_CONFIG.operatingHours}</span>
              </div>
              {SITE_CONFIG.business.accredited && (
                <div className="mt-3 inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                  <span className="text-amber-400 text-xs font-medium">✓ Accredited Company</span>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm text-brand-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{SITE_CONFIG.phoneFormatted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: {SITE_CONFIG.whatsappFormatted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{SITE_CONFIG.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Nationwide Delivery</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-brand-800/50 rounded-lg border border-brand-700/50">
                <p className="text-brand-300 text-xs leading-relaxed">
                  <strong>Urgent Inquiries:</strong> Please call {SITE_CONFIG.phoneFormatted} (no WhatsApp calls). 
                  Kindly avoid calling for faster response - messages are attended to in order received.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Order Enquiries</h4>
              <div className="text-sm text-brand-400 space-y-2">
                <p>Please follow up {SITE_CONFIG.shipping.followUpDays} days after receiving your order confirmation.</p>
                <div className="space-y-1 mt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>info@intandokaziherbal.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>sales@intandokaziherbal.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>disputes@intandokaziherbal.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>accounts@intandokaziherbal.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>admin@intandokaziherbal.co.za</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-3 mb-4">
                <a
                  href={SITE_CONFIG.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-brand-800 hover:bg-brand-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-5 h-5 text-brand-300" />
                </a>
                <a
                  href={SITE_CONFIG.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-brand-800 hover:bg-brand-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-brand-300" />
                </a>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-green-600 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </a>
              </div>
              <h4 className="text-white font-semibold mb-4">Delivery</h4>
              <div className="text-sm text-brand-400 space-y-1">
                <p>We ship via <strong className="text-brand-300">PAXI Courier</strong> nationwide.</p>
                <p>Orders placed before 12pm ship same day.</p>
                <p>Delivery: 2–5 business days.</p>
                <p>Free delivery on orders over R500.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-brand-900/50 pt-6 text-center">
            <p className="text-brand-600 text-xs mb-2">© {new Date().getFullYear()} Nthandokazi Herbal. All rights reserved.</p>
            <p className="text-brand-600 text-xs">These products are not intended to diagnose, treat, cure or prevent any disease. Consult a healthcare professional for medical advice.</p>
            <div className="mt-3">
              <a href="/terms" className="text-brand-400 hover:text-brand-300 text-xs underline">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowBookingModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Book Your Consultation</h2>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <BookingCalendar />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <CartDrawer />
    </div>
  );
}
