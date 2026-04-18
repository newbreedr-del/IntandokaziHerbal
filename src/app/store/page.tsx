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
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useProducts, Product } from "@/hooks/useProducts";
import ProductCard from "@/components/store/ProductCard";
import ProductModal from "@/components/store/ProductModal";
import CartDrawer from "@/components/store/CartDrawer";
import BookingCalendar from "@/components/BookingCalendar";
import { SITE_CONFIG } from "@/lib/constants";

// Brand green for Faithful-to-Nature inspired palette
const GREEN = "#0f5a47";
const GREEN_DARK = "#0a4436";
const GREEN_LIGHT = "#e8f0ec";

const NAV_LINKS = [
  { label: "Health", category: "Internal Health" },
  { label: "Body & Beauty", category: "Natural Beauty" },
  { label: "Wellness", category: "Mental Wellness" },
  { label: "Traditional", category: "Traditional Remedies" },
  { label: "Immune", category: "Immune Support" },
  { label: "New", category: "All", highlight: false },
  { label: "Deals", category: "Popular", highlight: true },
];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const { totalItems, setIsOpen } = useCart();
  const { products, loading, error } = useProducts();

  const heroSlides = [
    {
      eyebrow: "FEATURED HERBAL RANGE",
      title: "20% Off the Intandokazi Signature Range",
      cta: "SHOP NOW",
      bg: GREEN,
      image: "/images/hero-bg.jpeg",
    },
    {
      eyebrow: "PERSONALIZED HEALING",
      title: "Book a 1-on-1 Consultation with Intandokazi",
      cta: "BOOK NOW",
      bg: "#8b6a3d",
      image: "/images/hero-bg.jpeg",
      action: "booking" as const,
    },
    {
      eyebrow: "WILD-HARVESTED & NATURAL",
      title: "Traditional Remedies Rooted in African Healing",
      cta: "EXPLORE",
      bg: "#4a5d3f",
      image: "/images/hero-bg.jpeg",
    },
  ];

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

  const featured = useMemo(() => products.filter((p) => p.is_featured).slice(0, 8), [products]);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const selectNavCategory = (cat: string) => {
    setSelectedCategory(cat);
    setMobileMenuOpen(false);
    scrollToProducts();
  };

  const slide = heroSlides[heroSlide];

  return (
    <div className="min-h-screen bg-white">
      {/* ============ Announcement Bar ============ */}
      <div className="text-white text-xs sm:text-sm" style={{ background: GREEN }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>
              All products are <span className="font-semibold text-amber-300">wild-harvested &amp; natural</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <button onClick={() => setShowBookingModal(true)} className="hover:underline">
              📅 Book a consultation
            </button>
            <span className="opacity-60">|</span>
            <a href="#contact" className="hover:underline">Free delivery over R500</a>
          </div>
        </div>
      </div>

      {/* ============ Top Header ============ */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-6 h-20">
            {/* Logo */}
            <a href="/store" className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-10 h-10">
                <Image src="/icon.png" alt="Intandokazi Herbal" fill className="object-contain" />
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="font-elegant-title text-lg" style={{ color: GREEN }}>Intandokazi Herbal</div>
                <div className="text-[11px] text-neutral-500">Traditional &amp; Organic</div>
              </div>
            </a>

            {/* Search (centered, big) */}
            <div className="flex-1 max-w-2xl mx-auto hidden md:block">
              <div className="text-xs text-neutral-500 mb-1 px-1">Welcome to Intandokazi Herbal!</div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={scrollToProducts}
                  placeholder="Search…"
                  className="w-full bg-neutral-100 border border-neutral-200 rounded-md pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-neutral-400 transition-all"
                />
                <button
                  onClick={scrollToProducts}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white"
                  style={{ background: GREEN }}
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-4 sm:gap-5 ml-auto">
              <button
                onClick={() => setShowBookingModal(true)}
                className="hidden lg:flex flex-col items-center gap-0.5 text-neutral-700 hover:text-[color:var(--green)] transition-colors"
                style={{ ["--green" as string]: GREEN }}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-[11px]">booking</span>
              </button>
              <button className="hidden sm:flex flex-col items-center gap-0.5 text-neutral-700 hover:text-neutral-900 transition-colors">
                <User className="w-5 h-5" />
                <span className="text-[11px]">account</span>
              </button>
              <button className="hidden sm:flex flex-col items-center gap-0.5 text-neutral-700 hover:text-neutral-900 transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-[11px]">wishlist</span>
              </button>
              <button
                onClick={() => setIsOpen(true)}
                className="relative flex flex-col items-center gap-0.5 text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-[11px]">basket {totalItems > 0 && <span className="font-semibold">({totalItems})</span>}</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={scrollToProducts}
                placeholder="Search products…"
                className="w-full bg-neutral-100 border border-neutral-200 rounded-md pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-neutral-400"
              />
              <button
                onClick={scrollToProducts}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white"
                style={{ background: GREEN }}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal nav */}
        <div className="border-t border-neutral-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-8 lg:gap-12 h-12 text-sm font-medium text-neutral-700">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => selectNavCategory(link.category)}
                  className={`uppercase tracking-wide hover:opacity-70 transition-opacity ${
                    link.highlight ? "text-red-600 font-semibold" : ""
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => selectNavCategory(link.category)}
                  className={`text-left px-3 py-3 rounded-lg hover:bg-neutral-100 uppercase tracking-wide text-sm font-medium ${
                    link.highlight ? "text-red-600" : "text-neutral-800"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-neutral-200 mt-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowBookingModal(true);
                  }}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-neutral-100 text-sm font-medium text-neutral-800 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book a Consultation
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ============ Hero Promo Banner ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative rounded-lg overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr] min-h-[260px] sm:min-h-[320px] md:min-h-[380px]">
            {/* Left colored panel */}
            <div className="relative flex flex-col justify-center px-6 sm:px-10 py-8 sm:py-10 text-white" style={{ background: slide.bg }}>
              <div className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase opacity-90 mb-3">
                {slide.eyebrow}
              </div>
              <h1 className="font-elegant-title text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] leading-tight mb-6">
                {slide.title}
              </h1>
              <div>
                <button
                  onClick={() => {
                    if (slide.action === "booking") setShowBookingModal(true);
                    else scrollToProducts();
                  }}
                  className="inline-flex items-center gap-2 border border-white/80 hover:bg-white hover:text-neutral-900 px-7 py-3 text-sm font-semibold tracking-wider transition-colors"
                >
                  {slide.cta}
                </button>
              </div>
              {/* Arrows */}
              <button
                onClick={() => setHeroSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            {/* Right image panel */}
            <div className="relative bg-[#f4efe6] min-h-[200px] sm:min-h-0">
              <Image src={slide.image} alt={slide.title} fill className="object-cover" priority />
              {/* Offer badge */}
              {heroSlide === 0 && (
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8 bg-red-600 text-white px-4 py-2 sm:px-5 sm:py-3 text-lg sm:text-xl font-bold tracking-wide shadow-lg">
                  20% OFF
                </div>
              )}
              <button
                onClick={() => setHeroSlide((s) => (s + 1) % heroSlides.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 bg-white/70 rounded-full"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Slide indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === heroSlide ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3 Category Tiles (like FtN) ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {[
            {
              label: "HEALTH & WELLNESS",
              image: "/images/hero-bg.jpeg",
              onClick: () => selectNavCategory("Internal Health"),
            },
            {
              label: "BEAUTY & SKINCARE",
              image: "/images/hero-bg.jpeg",
              onClick: () => selectNavCategory("Natural Beauty"),
            },
            {
              label: "BOOK A CONSULTATION",
              image: "/images/hero-bg.jpeg",
              onClick: () => setShowBookingModal(true),
              isBooking: true,
            },
          ].map((tile) => (
            <button
              key={tile.label}
              onClick={tile.onClick}
              className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow aspect-[4/3] sm:aspect-[3/2]"
            >
              <Image src={tile.image} alt={tile.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              {tile.isBooking && (
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/50" />
              )}
              <div
                className="absolute bottom-0 left-0 right-0 text-white font-semibold tracking-wider text-sm sm:text-base text-center py-3 sm:py-4"
                style={{ background: GREEN }}
              >
                {tile.isBooking && <Calendar className="inline w-4 h-4 mr-1.5 -mt-0.5" />}
                {tile.label}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ============ Bestsellers Row ============ */}
      {!loading && !error && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: GREEN }}>
                Bestsellers
              </div>
              <h2 className="text-2xl sm:text-3xl font-elegant-title text-neutral-900">Loved by our community</h2>
            </div>
            <button onClick={scrollToProducts} className="hidden sm:inline text-sm font-medium hover:underline" style={{ color: GREEN }}>
              See all →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-visible no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 pb-2">
            {featured.map((product, index) => (
              <div key={product.id} className="w-[72%] flex-shrink-0 snap-start sm:w-auto">
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
            <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: GREEN }}>
              Full Range
            </div>
            <h2 className="text-2xl sm:text-3xl font-elegant-title text-neutral-900">
              {selectedCategory === "All" ? "All Products" : selectedCategory}
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 sm:max-w-lg">
            {["All", "Popular", "Internal Health", "External Health", "Natural Beauty", "Traditional Remedies"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap border"
                style={
                  selectedCategory === cat
                    ? { background: GREEN, color: "white", borderColor: GREEN }
                    : { background: "white", color: "#525252", borderColor: "#e5e5e5" }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-neutral-500">
            <div className="animate-spin w-10 h-10 border-4 border-neutral-200 rounded-full mx-auto mb-3" style={{ borderTopColor: GREEN }} />
            <p>Loading products…</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-600 bg-red-50 rounded-2xl border border-red-200">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" />
            <p className="font-semibold">Couldn&rsquo;t load products</p>
            <p className="text-sm mt-1 text-red-700">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors">
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
              <ProductCard key={product.id} product={product} index={index} onOpen={() => setSelectedProduct(product)} />
            ))}
          </div>
        )}
      </section>

      {/* ============ Values Strip ============ */}
      <section className="border-y border-neutral-200 py-10" style={{ background: GREEN_LIGHT }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: "Wild-harvested", text: "100% natural ingredients sourced with respect for tradition." },
              { icon: ShieldCheck, title: "Accredited formulations", text: "Crafted by Intandokazi with decades of herbal expertise." },
              { icon: Truck, title: "Fast SA delivery", text: "PAXI nationwide, 2–5 business days. Free over R500." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center" style={{ color: GREEN }}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-0.5">{title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Testimonials ============ */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: GREEN }}>Real results</div>
            <h2 className="text-2xl sm:text-3xl font-elegant-title text-neutral-900">What our clients say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              { name: "Thandi M.", location: "Pretoria", text: "The Intandokazi Yothando cream is incredible! My skin has never felt so soft and nourished.", stars: 5 },
              { name: "Sipho N.", location: "Johannesburg", text: "The Intanmorati Body Butter is amazing — the lavender scent is calming and my skin stays moisturised all day.", stars: 5 },
              { name: "Nomsa K.", location: "Centurion", text: "Nthandokazi really knows her craft. The Mavula Kuvaliwe scrub left my skin glowing. I order every month!", stars: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="text-neutral-900 font-semibold text-sm">{t.name}</div>
                  <div className="text-neutral-500 text-xs">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer id="contact" className="text-white pt-12 pb-6 px-4" style={{ background: GREEN_DARK }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image src="/icon.png" alt="Intandokazi Herbal" fill className="object-contain" />
                </div>
                <span className="text-white font-elegant-title">Intandokazi Herbal</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-3">Traditional African herbal remedies and organic wellness, crafted with care.</p>
              <div className="text-white/60 text-xs space-y-1">
                <div>📍 {SITE_CONFIG.branches.join(" · ")}</div>
                <div>🕘 {SITE_CONFIG.operatingHours}</div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h4>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{SITE_CONFIG.phoneFormatted}</span></div>
                <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /><span>{SITE_CONFIG.whatsappFormatted}</span></div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{SITE_CONFIG.email}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>Nationwide delivery</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Services</h4>
              <div className="text-sm text-white/80 space-y-2">
                <button onClick={() => setShowBookingModal(true)} className="block hover:underline text-left">Book a consultation</button>
                <button onClick={scrollToProducts} className="block hover:underline text-left">Shop products</button>
                <a href={`https://wa.me/27604964105`} target="_blank" rel="noopener noreferrer" className="block hover:underline">WhatsApp support</a>
                <a href="/terms" className="block hover:underline">Terms &amp; conditions</a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Follow</h4>
              <div className="flex gap-2 mb-4">
                <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={SITE_CONFIG.social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-600 hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
              {SITE_CONFIG.business.accredited && (
                <div className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                  <span className="text-amber-300 text-xs font-medium">✓ Accredited Company</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-white/50 text-xs">© {new Date().getFullYear()} Intandokazi Herbal. All rights reserved.</p>
            <p className="text-white/40 text-[11px] max-w-lg">
              These products are not intended to diagnose, treat, cure or prevent any disease. Consult a healthcare professional for medical advice.
            </p>
          </div>
        </div>
      </footer>

      {/* ============ Floating Booking FAB (mobile only, subtle) ============ */}
      <button
        onClick={() => setShowBookingModal(true)}
        className="sm:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white"
        style={{ background: GREEN }}
        aria-label="Book consultation"
      >
        <Calendar className="w-6 h-6" />
      </button>

      {/* ============ Modals & Drawers ============ */}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-neutral-900/75" onClick={() => setShowBookingModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-elegant-title text-neutral-900">Book Your Consultation</h2>
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
