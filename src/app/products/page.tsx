"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from "lucide-react";
import Modal from "@/components/Modal";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/store";
import { formatCurrency, generateId } from "@/lib/utils";
import type { Product } from "@/types";

const categories = ["Body Care", "Face Care", "Hair Care", "Wellness", "Gift Sets"];
const units = ["100g bar", "120g bar", "200ml jar", "250ml jar", "30ml bottle", "75ml tube", "100ml bottle", "15g tin", "Set"];

const emptyProduct = {
  name: "", description: "", category: "Body Care", price: 0, costPrice: 0,
  stock: 0, unit: "200ml jar", minStock: 10, imageUrl: "", isActive: true,
};

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => { setMounted(true); setProducts(getProducts()); }, []);

  if (!mounted) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>;

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditing(null); setForm(emptyProduct); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, category: p.category, price: p.price, costPrice: p.costPrice, stock: p.stock, unit: p.unit, minStock: p.minStock, imageUrl: p.imageUrl, isActive: p.isActive });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateProduct({ ...editing, ...form });
    } else {
      addProduct({ ...form, id: generateId(), createdAt: new Date().toISOString() } as Product);
    }
    setProducts(getProducts()); setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) { deleteProduct(id); setProducts(getProducts()); }
  };

  const lowStock = products.filter((p) => p.stock <= p.minStock);

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products & Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} products · {lowStock.length} low stock</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" /> Add Product</button>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6 card border-l-4 border-l-red-500 bg-red-50/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-red-800">Low Stock Alert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="badge bg-red-100 text-red-700">{p.name}: {p.stock} left</span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input w-auto">
          <option value="All">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <div key={product.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <Package className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-400">{product.category} · {product.unit}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(product)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(product.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
            <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-3">
              <div>
                <p className="text-xs text-gray-400">Price</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Cost</p>
                <p className="text-sm font-medium text-gray-600">{formatCurrency(product.costPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Stock</p>
                <p className={`text-sm font-bold ${product.stock <= product.minStock ? "text-red-600" : "text-green-600"}`}>{product.stock}</p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">Margin: <span className="font-medium text-green-600">{formatCurrency(product.price - product.costPrice)} ({Math.round(((product.price - product.costPrice) / product.price) * 100)}%)</span></p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No products found</p></div>}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Product" : "Add New Product"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lavender Body Butter" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Selling Price (R)</label>
              <input type="number" className="input" value={form.price || ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">Cost Price (R)</label>
              <input type="number" className="input" value={form.costPrice || ""} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Current Stock</label>
              <input type="number" className="input" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">Min Stock (Alert)</label>
              <input type="number" className="input" value={form.minStock || ""} onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Product is active</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editing ? "Update" : "Add Product"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
