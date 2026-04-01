"use client";

import { useEffect, useState } from "react";
import { Plus, Search, CreditCard, Banknote, Smartphone, Building } from "lucide-react";
import Modal from "@/components/Modal";
import { getPayments, getSales, addPayment, updateSale } from "@/lib/store";
import { formatCurrency, formatDate, generateId, getStatusColor } from "@/lib/utils";
import type { Payment, Sale } from "@/types";

export default function PaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState("");
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<Payment["method"]>("cash");
  const [reference, setReference] = useState("");

  useEffect(() => {
    setMounted(true);
    setPayments(getPayments());
    setSales(getSales());
  }, []);

  if (!mounted) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>;

  const filtered = payments
    .filter((p) => p.clientName.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const outstandingSales = sales.filter((s) => s.balance > 0);
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = outstandingSales.reduce((sum, s) => sum + s.balance, 0);

  const openRecordPayment = () => {
    setSelectedSale("");
    setAmount(0);
    setMethod("cash");
    setReference("");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedSale || amount <= 0) return;
    const sale = sales.find((s) => s.id === selectedSale);
    if (!sale) return;

    const payment: Payment = {
      id: generateId(),
      saleId: sale.id,
      clientId: sale.clientId,
      clientName: sale.clientName,
      amount,
      method,
      reference,
      createdAt: new Date().toISOString(),
    };
    addPayment(payment);

    const newPaid = sale.amountPaid + amount;
    const newBalance = sale.total - newPaid;
    const newStatus = newBalance <= 0 ? "paid" : "partial";
    updateSale({ ...sale, amountPaid: newPaid, balance: Math.max(0, newBalance), status: newStatus });

    setPayments(getPayments());
    setSales(getSales());
    setShowModal(false);
  };

  const methodIcon = (m: string) => {
    switch (m) {
      case "cash": return <Banknote className="h-4 w-4 text-green-500" />;
      case "card": return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "eft": return <Building className="h-4 w-4 text-purple-500" />;
      case "mobile": return <Smartphone className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">{payments.length} payments recorded</p>
        </div>
        <button onClick={openRecordPayment} className="btn-primary"><Plus className="h-4 w-4" /> Record Payment</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500">Total Received</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Overdue Invoices</p>
          <p className="text-2xl font-bold text-yellow-600">{outstandingSales.length}</p>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by client or reference..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Client</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Method</th>
                <th className="table-header">Reference</th>
                <th className="table-header">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50">
                  <td className="table-cell text-gray-500">{formatDate(payment.createdAt)}</td>
                  <td className="table-cell font-medium text-gray-900">{payment.clientName}</td>
                  <td className="table-cell font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {methodIcon(payment.method)}
                      <span className="capitalize">{payment.method}</span>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-xs text-gray-500">{payment.reference || "—"}</td>
                  <td className="table-cell font-mono text-xs text-gray-500">#{payment.saleId?.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No payments found</p></div>}
      </div>

      {outstandingSales.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Outstanding Invoices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {outstandingSales.map((sale) => (
              <div key={sale.id} className="card border-l-4 border-l-red-400">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{sale.clientName}</h3>
                  <span className={`badge ${getStatusColor(sale.status)}`}>{sale.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-gray-400 text-xs">Total</p><p className="font-medium">{formatCurrency(sale.total)}</p></div>
                  <div><p className="text-gray-400 text-xs">Balance</p><p className="font-bold text-red-600">{formatCurrency(sale.balance)}</p></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Due: {formatDate(sale.dueDate)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Select Invoice *</label>
            <select className="input" value={selectedSale} onChange={(e) => {
              setSelectedSale(e.target.value);
              const s = sales.find((x) => x.id === e.target.value);
              if (s) setAmount(s.balance);
            }}>
              <option value="">Select an outstanding invoice...</option>
              {outstandingSales.map((s) => <option key={s.id} value={s.id}>{s.clientName} — {formatCurrency(s.balance)} outstanding</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (R) *</label>
            <input type="number" className="input" value={amount || ""} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {(["cash", "card", "eft", "mobile"] as const).map((m) => (
                <button key={m} onClick={() => setMethod(m)} className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-colors ${method === m ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {methodIcon(m)}
                  <span className="capitalize">{m}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Reference</label>
            <input type="text" className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. REF-001 or receipt number" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Record Payment</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
