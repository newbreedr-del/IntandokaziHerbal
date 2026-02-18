"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  ShoppingCart,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import StatCard from "@/components/StatCard";
import { getClients, getProducts, getSales, getPayments, getExpenses, getMessageLogs } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Sale, Product } from "@/types";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const clients = getClients();
  const products = getProducts();
  const sales = getSales();
  const payments = getPayments();
  const expenses = getExpenses();
  const messageLogs = getMessageLogs();

  const totalRevenue = sales.reduce((sum: number, s: Sale) => sum + s.amountPaid, 0);
  const totalExpenses = expenses.reduce((sum: number, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const pendingPayments = sales.filter((s: Sale) => s.balance > 0).reduce((sum: number, s: Sale) => sum + s.balance, 0);
  const lowStockProducts = products.filter((p: Product) => p.stock <= p.minStock);

  const categoryData = products.reduce((acc: Record<string, number>, p: Product) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#dc2626", "#f87171", "#fca5a5", "#fee2e2", "#991b1b"];

  const revenueByMonth = [
    { month: "Sep", revenue: 3200, expenses: 1800 },
    { month: "Oct", revenue: 4100, expenses: 2200 },
    { month: "Nov", revenue: 5800, expenses: 2600 },
    { month: "Dec", revenue: 7200, expenses: 3100 },
    { month: "Jan", revenue: 6500, expenses: 2900 },
    { month: "Feb", revenue: totalRevenue, expenses: totalExpenses },
  ];

  const statusCounts = sales.reduce(
    (acc: Record<string, number>, s: Sale) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="This period"
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
          trend={{ value: "12% vs last month", positive: true }}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          subtitle={`Expenses: ${formatCurrency(totalExpenses)}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="brand"
          trend={{ value: "8% vs last month", positive: true }}
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(pendingPayments)}
          subtitle={`${sales.filter((s: Sale) => s.balance > 0).length} outstanding invoices`}
          icon={<CreditCard className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="Total Clients"
          value={clients.length.toString()}
          subtitle={`${sales.length} total orders`}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="card xl:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#dc2626" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Categories */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Product Categories</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="card xl:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Client</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50">
                    <td className="table-cell font-medium text-gray-900">{sale.clientName}</td>
                    <td className="table-cell">{formatCurrency(sale.total)}</td>
                    <td className="table-cell">
                      <span
                        className={`badge ${
                          sale.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : sale.status === "partial"
                            ? "bg-yellow-100 text-yellow-700"
                            : sale.status === "pending"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Quick Info */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <div className="card border-l-4 border-l-red-500">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-900">Low Stock Alert</h3>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-500">All products are well stocked!</p>
            ) : (
              <ul className="space-y-2">
                {lowStockProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="font-medium text-red-600">{p.stock} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Order Status Summary */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Status</h3>
            <div className="space-y-2">
              {[
                { label: "Paid", count: statusCounts["paid"] || 0, color: "bg-green-500" },
                { label: "Partial", count: statusCounts["partial"] || 0, color: "bg-yellow-500" },
                { label: "Pending", count: statusCounts["pending"] || 0, color: "bg-blue-500" },
                { label: "Overdue", count: statusCounts["overdue"] || 0, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Summary */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-900">Messages</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{messageLogs.length}</p>
            <p className="text-xs text-gray-500">Total messages sent</p>
          </div>
        </div>
      </div>
    </div>
  );
}
