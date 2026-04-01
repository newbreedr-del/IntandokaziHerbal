"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, Save, Package, ImageIcon, CheckCircle, AlertCircle, Pencil, X } from "lucide-react";
import { fetchStoreProducts, StoreProduct } from "@/lib/storeProducts";

interface ProductEdit {
  id: string;
  name: string;
  price: number;
  stock: number;
  badge: string;
  image: string;
}

const LS_KEY = "ntk_product_overrides";

function loadOverrides(): Record<string, Partial<ProductEdit>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveOverrides(data: Record<string, Partial<ProductEdit>>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function StoreAdminPage() {
  const [overrides, setOverrides] = useState<Record<string, Partial<ProductEdit>>>(loadOverrides);
  const [editing, setEditing] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchStoreProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const getProduct = (base: StoreProduct): StoreProduct & ProductEdit => ({
    ...base,
    badge: base.badge ?? "",
    image: base.image ?? "",
    ...overrides[base.id],
  });

  const updateField = (id: string, field: keyof ProductEdit, value: string | number) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = (id: string) => {
    saveOverrides(overrides);
    setSaved(id);
    setEditing(null);
    setTimeout(() => setSaved(null), 2500);
  };

  const handleImageUpload = (id: string, file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOverrides((prev) => {
        const next = { ...prev, [id]: { ...prev[id], image: dataUrl } };
        saveOverrides(next);
        return next;
      });
      setSaved(id);
      setTimeout(() => setSaved(null), 2500);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Products</h1>
              <p className="text-gray-500 text-sm">Upload product images and manage product details</p>
            </div>
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Images are stored locally in your browser. To make them permanent, place image files in <code className="bg-amber-100 px-1 rounded">public/images/products/</code> and update the product data file.</span>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {uploadError}
            <button onClick={() => setUploadError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <p className="mt-4 text-gray-500">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((base) => {
            const p = getProduct(base);
            const isEditing = editing === p.id;
            const isSaved = saved === p.id;

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Image area */}
                <div className="relative h-48 bg-gradient-to-br from-brand-50 to-brand-100 group">
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-300">
                      <span className="text-5xl mb-2">{p.emoji}</span>
                      <span className="text-xs font-medium">No image uploaded</span>
                    </div>
                  )}

                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => fileRefs.current[p.id]?.click()}
                      className="flex items-center gap-2 bg-white text-brand-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-brand-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {p.image ? "Change Image" : "Upload Image"}
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={(el) => { fileRefs.current[p.id] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(p.id, file);
                      e.target.value = "";
                    }}
                  />

                  {/* Image indicator */}
                  {p.image && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Image set
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brand-500 font-semibold uppercase tracking-wider mb-0.5">{p.category}</p>
                      <h3 className="text-brand-900 font-semibold text-sm leading-tight">{p.name}</h3>
                    </div>
                    <button
                      onClick={() => setEditing(isEditing ? null : p.id)}
                      className="ml-2 p-1.5 rounded-lg hover:bg-brand-50 text-brand-500 hover:text-brand-700 transition-colors flex-shrink-0"
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updateField(p.id, "name", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Price (R)</label>
                          <input
                            type="number"
                            value={p.price}
                            onChange={(e) => updateField(p.id, "price", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                          <input
                            type="number"
                            value={p.stock}
                            onChange={(e) => updateField(p.id, "stock", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Badge (optional)</label>
                        <input
                          type="text"
                          value={p.badge}
                          onChange={(e) => updateField(p.id, "badge", e.target.value)}
                          placeholder="e.g. Best Seller, New, Sale"
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Image URL (or upload above)</label>
                        <input
                          type="text"
                          value={p.image}
                          onChange={(e) => updateField(p.id, "image", e.target.value)}
                          placeholder="/images/products/my-product.jpg"
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                        />
                      </div>
                      <button
                        onClick={() => handleSave(p.id)}
                        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-900">R{p.price}</span>
                        <span className="text-gray-400 text-xs">{p.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.stock > 10 ? "bg-emerald-50 text-emerald-700" : p.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  )}

                  {isSaved && !isEditing && (
                    <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Saved successfully
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-brand-900 font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-brand-500" />
            How to add permanent product images
          </h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Place your product image files in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">public/images/products/</code> — e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">chest-rub.jpg</code></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Open <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">src/lib/storeProducts.ts</code> and add the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">image</code> field to each product, e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">image: &quot;/images/products/chest-rub.jpg&quot;</code></span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>The product cards and modal will automatically display the image with glassmorphism styling.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
