"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Filter } from "lucide-react";
import Modal from "@/components/Modal";
import { getSales, getClients, getProducts, addSale, updateSale, saveSales } from "@/lib/store";
import { formatCurrency, formatDate, generateId, getStatusColor } from "@/lib/utils";
import type { Sale, SaleItem, Client, Product } from "@/types";

export default function SalesPage() {
  const [mounted, setMounted] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Sale | null>(null);

  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    setMounted(true);
    setSales(getSales());
    setClients(getClients());
    setProducts(getProducts());
  }, []);

  if (!mounted) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>;

  const filtered = sales
    .filter((s) => {
      const matchSearch = s.clientName.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const openNewSale = () => {
    setSelectedClient("");
    setItems([]);
    setDiscount(0);
    setNotes("");
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]);
    setShowModal(true);
  };

  const addItem = () => {
    setItems([...items, { productId: "", productName: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index] = { ...updated[index], productId: prod.id, productName: prod.name, unitPrice: prod.price, total: prod.price * updated[index].quantity };
      }
    } else if (field === "quantity") {
      const qty = Number(value) || 0;
      updated[index] = { ...updated[index], quantity: qty, total: qty * updated[index].unitPrice };
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = (subtotal - discount) * 0.15;
  const total = subtotal - discount + tax;

  const handleSaveSale = () => {
    if (!selectedClient || items.length === 0) return;
    const client = clients.find((c) => c.id === selectedClient);
    if (!client) return;

    const newSale: Sale = {
      id: generateId(),
      clientId: client.id,
      clientName: client.name,
      items,
      subtotal,
      discount,
      tax,
      total,
      amountPaid: 0,
      balance: total,
      status: "pending",
      notes,
      createdAt: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
    };
    addSale(newSale);
    setSales(getSales());
    setShowModal(false);
  };

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales & Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{sales.length} total orders · {formatCurrency(sales.reduce((s, o) => s + o.total, 0))} total value</p>
        </div>
        <button onClick={openNewSale} className="btn-primary"><Plus className="h-4 w-4" /> New Sale</button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by client or order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="All">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Order</th>
                <th className="table-header">Client</th>
                <th className="table-header">Items</th>
                <th className="table-header">Total</th>
                <th className="table-header">Paid</th>
                <th className="table-header">Balance</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/50">
                  <td className="table-cell font-mono text-xs text-gray-500">#{sale.id?.slice(0, 8)}</td>
                  <td className="table-cell font-medium text-gray-900">{sale.clientName}</td>
                  <td className="table-cell text-gray-500">{sale.items.length} items</td>
                  <td className="table-cell font-semibold">{formatCurrency(sale.total)}</td>
                  <td className="table-cell text-green-600">{formatCurrency(sale.amountPaid)}</td>
                  <td className="table-cell text-red-600 font-medium">{sale.balance > 0 ? formatCurrency(sale.balance) : "—"}</td>
                  <td className="table-cell"><span className={`badge ${getStatusColor(sale.status)}`}>{sale.status}</span></td>
                  <td className="table-cell text-gray-500">{formatDate(sale.createdAt)}</td>
                  <td className="table-cell">
                    <button onClick={() => setShowDetail(sale)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No sales found</p></div>}
      </div>

      {/* New Sale Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Sale" size="xl">
        <div className="space-y-4">
          <div>
            <label className="label">Client *</label>
            <select className="input" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              <option value="">Select a client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Items</label>
              <button onClick={addItem} className="text-sm text-brand-600 hover:text-brand-700 font-medium">+ Add Item</button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  {idx === 0 && <label className="text-xs text-gray-400">Product</label>}
                  <select className="input" value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}>
                    <option value="">Select...</option>
                    {products.filter((p) => p.isActive).map((p) => <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>)}
                  </select>
                </div>
                <div className="w-20">
                  {idx === 0 && <label className="text-xs text-gray-400">Qty</label>}
                  <input type="number" className="input" min={1} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                </div>
                <div className="w-28">
                  {idx === 0 && <label className="text-xs text-gray-400">Total</label>}
                  <div className="input bg-gray-50 text-gray-600">{formatCurrency(item.total)}</div>
                </div>
                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 pb-2.5 text-lg">&times;</button>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-gray-400 py-2">No items added yet. Click &quot;+ Add Item&quot; above.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount (R)</label>
              <input type="number" className="input" value={discount || ""} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-red-500">-{formatCurrency(discount)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">VAT (15%)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveSale} className="btn-primary">Create Sale</button>
          </div>
        </div>
      </Modal>

      {/* Sale Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title={`Order #${showDetail?.id?.slice(0, 8) || ""}`} size="lg">
        {showDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400">Client</p><p className="font-medium">{showDetail.clientName}</p></div>
              <div><p className="text-xs text-gray-400">Status</p><span className={`badge ${getStatusColor(showDetail.status)}`}>{showDetail.status}</span></div>
              <div><p className="text-xs text-gray-400">Date</p><p>{formatDate(showDetail.createdAt)}</p></div>
              <div><p className="text-xs text-gray-400">Due Date</p><p>{formatDate(showDetail.dueDate)}</p></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Items</h4>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-1 text-gray-400 font-medium">Product</th><th className="text-right py-1 text-gray-400 font-medium">Qty</th><th className="text-right py-1 text-gray-400 font-medium">Price</th><th className="text-right py-1 text-gray-400 font-medium">Total</th></tr></thead>
                <tbody>
                  {showDetail.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50"><td className="py-1.5">{item.productName}</td><td className="text-right">{item.quantity}</td><td className="text-right">{formatCurrency(item.unitPrice)}</td><td className="text-right font-medium">{formatCurrency(item.total)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(showDetail.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>-{formatCurrency(showDetail.discount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">VAT</span><span>{formatCurrency(showDetail.tax)}</span></div>
              <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span>{formatCurrency(showDetail.total)}</span></div>
              <div className="flex justify-between text-green-600"><span>Paid</span><span>{formatCurrency(showDetail.amountPaid)}</span></div>
              <div className="flex justify-between text-red-600 font-semibold"><span>Balance</span><span>{formatCurrency(showDetail.balance)}</span></div>
            </div>
            {showDetail.notes && <div><p className="text-xs text-gray-400">Notes</p><p className="text-sm">{showDetail.notes}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
