"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Download, BarChart3, PieChart } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const [ordersRes, customersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/customers')
      ]);

      const ordersData = await ordersRes.json();
      const customersData = await customersRes.json();

      if (ordersData.orders && customersData.customers) {
        const orders = ordersData.orders;
        const customers = customersData.customers;

        // Filter by date range
        const cutoffDate = new Date();
        if (dateRange === '7d') cutoffDate.setDate(cutoffDate.getDate() - 7);
        else if (dateRange === '30d') cutoffDate.setDate(cutoffDate.getDate() - 30);
        else if (dateRange === '90d') cutoffDate.setDate(cutoffDate.getDate() - 90);
        else cutoffDate.setFullYear(2000); // All time

        const filteredOrders = orders.filter((o: any) => 
          new Date(o.created_at) >= cutoffDate
        );

        // Calculate metrics
        const totalRevenue = filteredOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total), 0);
        const totalOrders = filteredOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate growth (compare with previous period)
        const previousPeriodStart = new Date(cutoffDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));
        
        const previousOrders = orders.filter((o: any) => {
          const date = new Date(o.created_at);
          return date >= previousPeriodStart && date < cutoffDate;
        });

        const previousRevenue = previousOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total), 0);
        const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const ordersGrowth = previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0;

        // Top products
        const productSales: Record<string, { quantity: number; revenue: number }> = {};
        filteredOrders.forEach((order: any) => {
          order.order_items?.forEach((item: any) => {
            if (!productSales[item.product_name]) {
              productSales[item.product_name] = { quantity: 0, revenue: 0 };
            }
            productSales[item.product_name].quantity += item.quantity;
            productSales[item.product_name].revenue += parseFloat(item.total);
          });
        });

        const topProducts = Object.entries(productSales)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Daily revenue
        const dailyRevenue: Record<string, { revenue: number; orders: number }> = {};
        filteredOrders.forEach((order: any) => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          if (!dailyRevenue[date]) {
            dailyRevenue[date] = { revenue: 0, orders: 0 };
          }
          dailyRevenue[date].revenue += parseFloat(order.total);
          dailyRevenue[date].orders += 1;
        });

        const recentOrders = Object.entries(dailyRevenue)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 30);

        // Payment methods
        const paymentMethods: Record<string, { count: number; revenue: number }> = {};
        filteredOrders.forEach((order: any) => {
          const method = order.payment_method || 'pending';
          if (!paymentMethods[method]) {
            paymentMethods[method] = { count: 0, revenue: 0 };
          }
          paymentMethods[method].count += 1;
          paymentMethods[method].revenue += parseFloat(order.total);
        });

        const paymentMethodsArray = Object.entries(paymentMethods)
          .map(([method, data]) => ({ method, ...data }));

        setAnalytics({
          totalRevenue,
          totalOrders,
          totalCustomers: customers.length,
          averageOrderValue,
          revenueGrowth,
          ordersGrowth,
          topProducts,
          recentOrders,
          paymentMethods: paymentMethodsArray
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!analytics) return;

    const csv = [
      ['Intandokazi Herbal - Sales Report'],
      [`Period: ${dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : dateRange === '90d' ? 'Last 90 Days' : 'All Time'}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['SUMMARY'],
      ['Total Revenue', formatCurrency(analytics.totalRevenue)],
      ['Total Orders', analytics.totalOrders.toString()],
      ['Average Order Value', formatCurrency(analytics.averageOrderValue)],
      ['Revenue Growth', `${analytics.revenueGrowth.toFixed(1)}%`],
      [],
      ['TOP PRODUCTS'],
      ['Product', 'Quantity Sold', 'Revenue'],
      ...analytics.topProducts.map(p => [p.name, p.quantity.toString(), formatCurrency(p.revenue)]),
      [],
      ['PAYMENT METHODS'],
      ['Method', 'Orders', 'Revenue'],
      ...analytics.paymentMethods.map(pm => [pm.method, pm.count.toString(), formatCurrency(pm.revenue)])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
              <p className="text-gray-600 mt-1">Performance insights and reports</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={exportReport}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
              >
                Export Report
              </Button>
              <Button
                onClick={() => router.push('/admin/dashboard')}
                variant="secondary"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`w-4 h-4 ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Orders</p>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`w-4 h-4 ${analytics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${analytics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.ordersGrowth >= 0 ? '+' : ''}{analytics.ordersGrowth.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.averageOrderValue)}</p>
            <p className="text-sm text-gray-500 mt-2">Per transaction</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Customers</p>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalCustomers}</p>
            <p className="text-sm text-gray-500 mt-2">Unique customers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
            </div>
            <div className="space-y-4">
              {analytics.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-brand-600 h-2 rounded-full"
                        style={{
                          width: `${(product.revenue / analytics.topProducts[0].revenue) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-brand-600" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            </div>
            <div className="space-y-4">
              {analytics.paymentMethods.map((method, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">{method.method}</p>
                    <p className="text-sm text-gray-500">{method.count} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(method.revenue)}</p>
                    <p className="text-sm text-gray-500">
                      {((method.revenue / analytics.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-semibold text-gray-900">Daily Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.recentOrders.slice(0, 10).map((day, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(day.date)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{day.orders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(day.revenue)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(day.revenue / day.orders)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
