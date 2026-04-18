"use client";

import { useState } from "react";
import { ShoppingCart, Eye, Tag } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/cartContext";
import { Product } from "@/hooks/useProducts";

interface Props {
  product: Product;
  index: number;
  onOpen: () => void;
}

export default function ProductCard({ product, index, onOpen }: Props) {
  const { addToCart } = useCart();
  const [flipped, setFlipped] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="group relative aspect-[3/4] cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative w-full h-full transition-all duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl shadow-black/10 border border-white/60"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background: image or soft gradient */}
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100" />
          )}

          {/* Glass overlay */}
          <div className="absolute inset-0 bg-white/10" />
          {/* Bottom fade for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="relative h-full flex flex-col justify-between p-3 sm:p-5">
            {product.badge ? (
              <div className="self-start flex items-center gap-1 bg-brand-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                <Tag className="w-3 h-3" />
                {product.badge}
              </div>
            ) : (
              <div />
            )}

            <div>
              {!product.image_url && (
                <div className="text-5xl mb-3 drop-shadow-sm">{product.emoji}</div>
              )}
              <div className="text-white/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5">{product.category}</div>
              <h3 className="text-white font-elegant-title text-sm sm:text-lg leading-tight mb-0.5">{product.name}</h3>
              <p className="text-white/80 text-[10px] sm:text-xs line-clamp-2">{product.tagline}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-white font-bold text-sm sm:text-xl">R{product.price}</span>
                <span className="text-white/70 text-[10px] sm:text-xs">{product.unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/15 border border-white/60"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Background: image or soft gradient */}
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100" />
          )}

          {/* Stronger glass overlay on back for readability */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />

          <div className="relative h-full flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{product.emoji}</span>
                <h3 className="text-brand-900 font-elegant-title text-base leading-tight">{product.name}</h3>
              </div>
              <p className="text-brand-700 text-xs leading-relaxed line-clamp-3">{product.description}</p>
              <div className="mt-3 space-y-1.5">
                {product.benefits?.slice(0, 3).map((b) => (
                  <div key={b} className="flex items-start gap-1.5 text-xs text-brand-800">
                    <span className="text-emerald-600 mt-0.5 flex-shrink-0 font-bold">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-brand-900 font-bold text-lg">R{product.price}</span>
                <span className="text-brand-500 text-xs">{product.unit}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onOpen(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-brand-300 hover:border-brand-500 bg-white/70 hover:bg-white text-brand-700 hover:text-brand-900 text-xs py-2 rounded-xl transition-all duration-200 backdrop-blur-sm font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Details & Chat
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl font-semibold transition-all duration-300 shadow-sm ${
                    added
                      ? "bg-emerald-500 text-white"
                      : "bg-brand-600 hover:bg-brand-700 text-white"
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {added ? "Added!" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
