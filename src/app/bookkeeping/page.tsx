"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Modal from "@/components/Modal";
import { getSales, getPayments, getExpenses, addExpense, deleteExpense } from "@/lib/store";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import type { Expense } from "@/types";

const expenseCategories = ["Raw Materials", "Packaging", "Marketing", "Delivery", "Utilities", "Equipment", "Rent", "Salaries", "Other"];

export default function BookkeepingPage() {
  const [mounted, setMounted] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "Raw Materials", description: "", amount: 0, date: new Date().toISOString().split("T")[0] });

  useEffect(() => { setMounted(true); setExpenses(getExpenses()); }, []);

  if (!mounted) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>;

  const sales = getSales();
  const payments = getPayments();

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";

  const expenseByCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#dc2626", "#f87171", "#fca5a5", "#fee2e2", "#991b1b", "#7f1d1d", "#450a0a", "#fecaca", "#b91c1c"];

  const costOfGoods = (expenseByCategory["Raw Materials"] || 0) + (expenseByCategory["Packaging"] || 0);
  const grossProfit = totalRevenue - costOfGoods;

  const handleSave = () => {
    if (!form.description.trim() || form.amount <= 0) return;
    addExpense({ ...form, id: generateId(), receipt: "" });
    setExpenses(getExpenses());
    setShowModal(false);
    setForm({ category: "Raw Materials", description: "", amount: 0, date: new Date().toISOString().split("T")[0] });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this expense?")) { deleteExpense(id); setExpenses(getExpenses()); }
  };

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const profitLossData = [
    { name: "Revenue", amount: totalRevenue },
    { name: "COGS", amount: costOfGoods },
    { name: "Gross Profit", amount: grossProfit },
    { name: "Operating Exp", amount: totalExpenses - costOfGoods },
    { name: "Net Profit", amount: netProfit },
  ];

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookkeeping</h1>
          <p className="text-sm text-gray-500 mt-1">Financial overview and expense tracking</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add Expense</button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{payments.length} payments received</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <p className="text-sm text-gray-500">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-gray-400 mt-1">{expenses.length} expenses recorded</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-brand-500" />
            <p className="text-sm text-gray-500">Net Profit</p>
          </div>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(netProfit)}</p>
          <p className="text-xs text-gray-400 mt-1">Margin: {profitMargin}%</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <p className="text-sm text-gray-500">Gross Profit</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(grossProfit)}</p>
          <p className="text-xs text-gray-400 mt-1">After COGS: {formatCurrency(costOfGoods)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Profit & Loss Summary</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitLossData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `R${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#dc2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No expenses recorded yet</div>
          )}
        </div>
      </div>

      {/* Expense Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Expense Records</h3>
          <p className="text-xs text-gray-400">{expenses.length} entries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Category</th>
                <th className="table-header">Description</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50/50">
                  <td className="table-cell text-gray-500">{formatDate(expense.date)}</td>
                  <td className="table-cell"><span className="badge bg-gray-100 text-gray-700">{expense.category}</span></td>
                  <td className="table-cell text-gray-700">{expense.description}</td>
                  <td className="table-cell font-semibold text-red-600">{formatCurrency(expense.amount)}</td>
                  <td className="table-cell">
                    <button onClick={() => handleDelete(expense.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {expenses.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No expenses recorded yet</p></div>}
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <input type="text" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Shea butter bulk order" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (R) *</label>
              <input type="number" className="input" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Add Expense</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
