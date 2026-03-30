"use client";

import { useSession, signOut } from "next-auth/react";

export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp, 
  FileText, 
  Truck,
  LogOut,
  Download,
  Eye,
  Search,
  Filter,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: string;
  orderRef: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  courier: 'paxi' | 'pargo' | 'none';
  trackingNumber?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const session = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    shippedToday: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (session && session.status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [session?.status, router]);

  useEffect(() => {
    // Load mock data - replace with actual API calls
    const mockOrders: Order[] = [
      {
        id: "1",
        orderRef: "NTH-2024-001",
        customerName: "Thandi Mokoena",
        customerEmail: "thandi@email.com",
        total: 450,
        status: "processing",
        paymentStatus: "paid",
        courier: "paxi",
        trackingNumber: "PX123456789",
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        orderRef: "NTH-2024-002",
        customerName: "John Smith",
        customerEmail: "john@email.com",
        total: 320,
        status: "shipped",
        paymentStatus: "paid",
        courier: "pargo",
        trackingNumber: "PG987654321",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    setOrders(mockOrders);
    setStats({
      totalOrders: mockOrders.length,
      totalRevenue: mockOrders.reduce((sum, o) => sum + o.total, 0),
      pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
      shippedToday: mockOrders.filter(o => o.status === 'shipped' && new Date(o.createdAt).toDateString() === new Date().toDateString()).length
    });
  }, []);

  // Defensive check for undefined session
  if (!session || !session.status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Show loading state while session is loading
  if (session.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (session.status === "unauthenticated") {
    return null; // Will redirect via useEffect
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  const handleGenerateInvoice = (order: Order) => {
    toast.success(`Generating invoice for ${order.orderRef}...`);
    router.push(`/admin/invoices/${order.id}`);
  };

  const handleViewTracking = (order: Order) => {
    if (order.trackingNumber) {
      router.push(`/admin/tracking/${order.trackingNumber}`);
    } else {
      toast.error("No tracking number available");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (!session.data) {
    return null;
  }

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error'
  };

  const paymentStatusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    paid: 'success',
    pending: 'warning',
    failed: 'error'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-900">Admin Dashboard</h1>
              <p className="text-sm text-brand-600">Welcome back, {session.data?.user?.name}</p>
            </div>
            <Button onClick={handleSignOut} variant="secondary" icon={<LogOut className="w-4 h-4" />}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "bg-blue-500" },
            { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "bg-green-500" },
            { label: "Pending Orders", value: stats.pendingOrders, icon: TrendingUp, color: "bg-yellow-500" },
            { label: "Shipped Today", value: stats.shippedToday, icon: Truck, color: "bg-purple-500" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button onClick={() => router.push("/admin/invoices")} icon={<FileText className="w-4 h-4" />}>
            Manage Invoices
          </Button>
          <Button onClick={() => router.push("/admin/tracking")} variant="secondary" icon={<Truck className="w-4 h-4" />}>
            Track Shipments
          </Button>
          <Button onClick={() => router.push("/")} variant="outline" icon={<Users className="w-4 h-4" />}>
            View Store
          </Button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              
              <div className="flex gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-64"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Courier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderRef}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={paymentStatusColors[order.paymentStatus]}>{order.paymentStatus}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 uppercase">{order.courier}</div>
                      {order.trackingNumber && (
                        <div className="text-xs text-gray-500">{order.trackingNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateInvoice(order)}
                          className="text-brand-600 hover:text-brand-900 transition-colors"
                          title="Generate Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {order.trackingNumber && (
                          <button
                            onClick={() => handleViewTracking(order)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Track Shipment"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
