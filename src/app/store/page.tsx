"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Search,
  Leaf,
  Phone,
  Mail,
  MapPin,
  Star,
  AlertCircle,
  MessageCircle,
  Facebook,
  Menu,
  X,
  Calendar,
  Truck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useProducts, Product } from "@/hooks/useProducts";
import ProductCard from "@/components/store/ProductCard";
import ProductModal from "@/components/store/ProductModal";
import CartDrawer from "@/components/store/CartDrawer";
import BookingCalendar from "@/components/BookingCalendar";
import { SITE_CONFIG } from "@/lib/constants";

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { products, loading, error } = useProducts();

  // Category list
  const baseCategories = [
    "Internal Health",
    "External Health",
    "Mental Wellness",
    "Traditional Remedies",
    "Natural Beauty",
    "Immune Support",
    "Digestive Health",
  ];
  const productCategories = Array.from(new Set(products.map((p) => p.category)));
  const categories = useMemo(
    () =>
      ["All", "Popular", ...baseCategories.filter((c) => baseCategories.includes(c) || productCategories.includes(c))].sort(
        (a, b) => {
          if (a === "All") return -1;
          if (b === "All") return 1;
          if (a === "Popular") return -1;
          if (b === "Popular") return 1;
          return a.localeCompare(b);
        },
      ),
    [productCategories],
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      if (selectedCategory === "All") return matchesSearch;
      if (selectedCategory === "Popular") return p.is_featured && matchesSearch;
      return p.category === selectedCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const featured = useMemo(() => products.filter((p) => p.is_featured).slice(0, 6), [products]);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* ============ Top Nav ============ */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 flex-shrink-0">
                <Image src="/icon.png" alt="Intandokazi Herbal" fill className="object-contain" />
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="font-elegant-title text-brand-900 text-base">Intandokazi Herbal</div>
                <div className="text-[11px] text-neutral-500">Traditional &amp; Organic</div>
              </div>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-7 text-sm text-neutral-700">
              <button onClick={scrollToProducts} className="hover:text-brand-700 transition-colors">
                Shop
              </button>
              <a href="#about" className="hover:text-brand-700 transition-colors">
                About
              </a>
              <button onClick={() => setShowBookingModal(true)} className="hover:text-brand-700 transition-colors">
                Book Consultation
              </button>
              <a href="#contact" className="hover:text-brand-700 transition-colors">
                Contact
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white px-3.5 py-2 rounded-full text-sm font-medium transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-200 py-3 flex flex-col gap-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToProducts();
                }}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-neutral-800"
              >
                Shop Products
              </button>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-neutral-800">
                About
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowBookingModal(true);
                }}
                className="text-left px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-neutral-800"
              >
                Book Consultation
              </button>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-neutral-800">
                Contact
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* ============ Compact Hero (Split, product-forward) ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f4f0e8] via-[#efe8d9] to-[#e9e3cf] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Copy */}
            <div className="lg:col-span-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-white/80 border border-neutral-200 text-brand-800 text-xs font-medium px-3 py-1 rounded-full mb-4">
                <Leaf className="w-3 h-3" /> Wild-harvested · 100% Natural
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-elegant-title text-brand-950 leading-[1.05] mb-5">
                Nature&rsquo;s remedies,
                <span className="block text-brand-700">crafted with care.</span>
              </h1>
              <p className="text-neutral-700 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-7 leading-relaxed">
                Handcrafted herbal products rooted in traditional African healing. Shop the full range
                below — every product is formulated, tested and loved by our community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button
                  onClick={scrollToProducts}
                  className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-7 py-3.5 rounded-full font-semibold text-base transition-all shadow-lg shadow-brand-900/15 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Shop Products
                </button>
                <a
                  href="#featured"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 px-7 py-3.5 rounded-full font-semibold text-base transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Bestsellers
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-neutral-600">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-700" /> Accredited</span>
                <span className="inline-flex items-center gap-1.5"><Truck className="w-4 h-4 text-brand-700" /> PAXI nationwide</span>
                <span className="inline-flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 890+ happy clients</span>
              </div>
            </div>

            {/* Product collage */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] sm:aspect-[5/4] lg:aspect-square max-w-xl mx-auto">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-200/40 to-amber-200/40 blur-2xl" />
                <div className="relative grid grid-cols-2 gap-3 sm:gap-4 h-full">
                  <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl border border-neutral-100">
                    <Image src="/images/hero-bg.jpeg" alt="Herbal products" fill className="object-cover" priority />
                  </div>
                  <div className="grid grid-rows-2 gap-3 sm:gap-4">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 shadow-xl p-5 flex flex-col justify-between text-white">
                      <Leaf className="w-7 h-7 opacity-80" />
                      <div>
                        <div className="text-xs uppercase tracking-wider text-brand-200 mb-1">Shop</div>
                        <div className="font-elegant-title text-xl leading-tight">Healing &amp; Beauty</div>
                      </div>
                    </div>
                    <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl border border-neutral-100 p-5 flex flex-col justify-between">
                      <Sparkles className="w-7 h-7 text-amber-500" />
                      <div>
                        <div className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Made with</div>
                        <div className="font-elegant-title text-xl leading-tight text-brand-900">Wild herbs &amp; love</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Category Quick Nav (Mobile-first horizontal scroll) ============ */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  scrollToProducts();
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-brand-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Featured / Bestsellers ============ */}
      {!loading && !error && featured.length > 0 && (
        <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          <div className="flex items-end justify-between mb-5 sm:mb-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-1">Bestsellers</div>
              <h2 className="text-2xl sm:text-3xl font-elegant-title text-brand-950">Loved by our community</h2>
            </div>
            <button onClick={scrollToProducts} className="hidden sm:inline text-sm text-brand-700 hover:text-brand-900 font-medium">
              See all →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 pb-2">
            {featured.map((product, index) => (
              <div key={product.id} className="w-[78%] flex-shrink-0 snap-start sm:w-auto">
                <ProductCard product={product} index={index} onOpen={() => setSelectedProduct(product)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============ All Products ============ */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-1">Full Range</div>
            <h2 className="text-2xl sm:text-3xl font-elegant-title text-brand-950">
              {selectedCategory === "All" ? "All Products" : selectedCategory}
            </h2>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products, conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-neutral-500">
            <div className="animate-spin w-10 h-10 border-4 border-neutral-200 border-t-brand-600 rounded-full mx-auto mb-3" />
            <p>Loading products…</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-600 bg-red-50 rounded-2xl border border-red-200">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p className="font-semibold">Couldn&rsquo;t load products</p>
            <p className="text-sm mt-1 text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <Leaf className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No products found. Try a different search.</p>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => (
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

      {/* ============ About / Values strip ============ */}
      <section id="about" className="bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Leaf, title: "Wild-harvested", text: "Ingredients sourced from the land with respect for tradition and environment." },
              { icon: ShieldCheck, title: "Formulated with care", text: "Every blend is crafted by Intandokazi with decades of herbal knowledge." },
              { icon: Truck, title: "Fast SA delivery", text: "PAXI courier nationwide, 2–5 business days. Free on orders over R500." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-elegant-title text-lg text-brand-950 mb-1">{title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Single Booking Band (only booking section on page) ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-navy-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 80%, white 0%, transparent 40%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-brand-100 text-xs font-medium px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
            <Calendar className="w-3 h-3" /> Need guidance?
          </div>
          <h2 className="text-3xl sm:text-4xl font-elegant-title text-white mb-3 leading-tight">
            Book a personal consultation
          </h2>
          <p className="text-brand-100/90 text-base sm:text-lg max-w-2xl mx-auto mb-7">
            Not sure which remedy is right for you? Book a 60-minute session with Intandokazi for a personalized plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowBookingModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-900 hover:bg-brand-50 px-7 py-3.5 rounded-full font-semibold text-base transition-colors shadow-xl"
            >
              <Calendar className="w-5 h-5" />
              Book Consultation
            </button>
            <a
              href="https://wa.me/27604964105?text=Hi%20Intandokazi%2C%20I%20need%20help%20choosing%20the%20right%20product"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-7 py-3.5 rounded-full font-semibold text-base transition-colors backdrop-blur-sm"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ============ Testimonials ============ */}
      <section className="bg-[#fafaf7] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-1">Real results</div>
            <h2 className="text-2xl sm:text-3xl font-elegant-title text-brand-950">What our clients say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              { name: "Thandi M.", location: "Pretoria", text: "The Intandokazi Yothando cream is incredible! My skin has never felt so soft and nourished. My whole family loves it.", stars: 5 },
              { name: "Sipho N.", location: "Johannesburg", text: "The Intanmorati Body Butter is amazing — the lavender scent is so calming and my skin stays moisturised all day.", stars: 5 },
              { name: "Nomsa K.", location: "Centurion", text: "Nthandokazi really knows her craft. The Mavula Kuvaliwe scrub left my skin glowing. I order every month without fail!", stars: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="text-brand-950 font-semibold text-sm">{t.name}</div>
                  <div className="text-neutral-500 text-xs">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer id="contact" className="bg-brand-950 text-brand-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image src="/icon.png" alt="Intandokazi Herbal" fill className="object-contain" />
                </div>
                <span className="text-white font-elegant-title">Intandokazi Herbal</span>
              </div>
              <p className="text-brand-300 text-sm leading-relaxed mb-3">Traditional African herbal remedies and organic wellness, crafted with care.</p>
              <div className="text-brand-400 text-xs">
                <div>📍 {SITE_CONFIG.branches.join(" · ")}</div>
                <div className="mt-1">🕘 {SITE_CONFIG.operatingHours}</div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
              <div className="space-y-2 text-sm text-brand-300">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{SITE_CONFIG.phoneFormatted}</span></div>
                <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /><span>{SITE_CONFIG.whatsappFormatted}</span></div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{SITE_CONFIG.email}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>Nationwide delivery</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Delivery</h4>
              <div className="text-sm text-brand-300 space-y-1">
                <p>PAXI Courier nationwide</p>
                <p>Orders before 12pm ship same day</p>
                <p>Delivery in 2–5 business days</p>
                <p>Free delivery over R500</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Follow</h4>
              <div className="flex gap-2 mb-4">
                <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-brand-800 hover:bg-brand-700 rounded-lg flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={SITE_CONFIG.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-brand-800 hover:bg-brand-700 rounded-lg flex items-center justify-center transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-600 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors text-white">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
              {SITE_CONFIG.business.accredited && (
                <div className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                  <span className="text-amber-400 text-xs font-medium">✓ Accredited Company</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-brand-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-brand-500 text-xs">© {new Date().getFullYear()} Intandokazi Herbal. All rights reserved.</p>
            <a href="/terms" className="text-brand-400 hover:text-brand-200 text-xs underline">Terms &amp; Conditions</a>
          </div>
          <p className="text-brand-600 text-[11px] text-center mt-3 max-w-2xl mx-auto leading-relaxed">
            These products are not intended to diagnose, treat, cure or prevent any disease. Consult a healthcare professional for medical advice.
          </p>
        </div>
      </footer>

      {/* ============ Modals & Drawers ============ */}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-neutral-900/75" onClick={() => setShowBookingModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-elegant-title text-brand-950">Book Your Consultation</h2>
                  <button onClick={() => setShowBookingModal(false)} className="text-neutral-400 hover:text-neutral-700 p-1">
                    <X className="h-6 w-6" />
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
