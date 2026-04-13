"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Truck, Clock, CheckCircle, AlertCircle, MapPin, Phone, Printer, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_phone: string;
  pep_store_code: string;
  pep_store_name: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
  }>;
}

export default function DispatchPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped'>('all');

  useEffect(() => {
    fetchOrders();
    // Refresh every 2 minutes
    const interval = setInterval(fetchOrders, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderReference: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference,
          orderStatus: newStatus
        })
      });

      if (response.ok) {
        toast.success(`Order marked as ${newStatus}`);
        fetchOrders();
        
        // Send WhatsApp notification
        if (newStatus === 'shipped') {
          const order = orders.find(o => o.order_reference === orderReference);
          if (order) {
            notifyCustomer(order);
          }
        }
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    }
  };

  const notifyCustomer = async (order: Order) => {
    try {
      console.log('[Dispatch] Shipping notification for order:', order.order_reference, 'to', order.customer_phone);
      toast.success('Shipping notification logged');
    } catch (error) {
      console.error('Failed to notify customer:', error);
    }
  };

  const printPackingSlip = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Packing Slip - ${order.order_reference}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .items { width: 100%; border-collapse: collapse; }
          .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items th { background-color: #f2f2f2; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 Intandokazi Herbal</h1>
          <h2>Packing Slip</h2>
        </div>
        <div class="section">
          <strong>Order Reference:</strong> ${order.order_reference}<br>
          <strong>Date:</strong> ${formatDate(order.created_at)}<br>
          <strong>Status:</strong> ${order.order_status}
        </div>
        <div class="section">
          <h3>Customer Details</h3>
          <strong>Name:</strong> ${order.customer_name}<br>
          <strong>Phone:</strong> ${order.customer_phone}<br>
        </div>
        <div class="section">
          <h3>Delivery Address</h3>
          <strong>PEP Store:</strong> ${order.pep_store_code}<br>
          <strong>Location:</strong> ${order.pep_store_name}<br>
          <strong>Courier:</strong> PAXI
        </div>
        <div class="section">
          <h3>Items to Pack</h3>
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>☐ Packed</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="section">
          <strong>Total:</strong> ${formatCurrency(order.total)}
        </div>
        <div class="section">
          <p><strong>Packer Signature:</strong> _________________</p>
          <p><strong>Date Packed:</strong> _________________</p>
        </div>
        <button onclick="window.print()">Print</button>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.order_status === filter;
  });

  const stats = {
    pending: orders.filter(o => o.order_status === 'pending').length,
    processing: orders.filter(o => o.order_status === 'processing' || o.order_status === 'confirmed').length,
    shipped: orders.filter(o => o.order_status === 'shipped').length,
    total: orders.length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dispatch Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage order fulfillment and shipping</p>
            </div>
            <Button
              onClick={() => router.push('/admin/dashboard')}
              variant="secondary"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Shipped Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.shipped}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex gap-2">
              {(['all', 'pending', 'processing', 'shipped'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{order.order_reference}</h3>
                    <Badge variant={
                      order.order_status === 'shipped' ? 'success' :
                      order.order_status === 'processing' || order.order_status === 'confirmed' ? 'info' :
                      'warning'
                    }>
                      {order.order_status}
                    </Badge>
                    <Badge variant={order.payment_status === 'paid' || order.payment_status === 'COMPLETE' ? 'success' : 'warning'}>
                      {order.payment_status === 'COMPLETE' ? 'Paid' : order.payment_status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Customer</p>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {order.customer_phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Delivery</p>
                      <p className="font-medium text-gray-900">{order.pep_store_code}</p>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {order.pep_store_name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Items to Pack:</p>
                <div className="space-y-1">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <span className="text-gray-900">{item.product_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => printPackingSlip(order)}
                  variant="secondary"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                >
                  Print Slip
                </Button>
                
                {order.order_status === 'pending' && (
                  <Button
                    onClick={() => updateOrderStatus(order.order_reference, 'processing')}
                    variant="primary"
                    size="sm"
                    icon={<Package className="w-4 h-4" />}
                  >
                    Start Processing
                  </Button>
                )}
                
                {(order.order_status === 'processing' || order.order_status === 'confirmed') && (
                  <Button
                    onClick={() => updateOrderStatus(order.order_reference, 'shipped')}
                    variant="primary"
                    size="sm"
                    icon={<Truck className="w-4 h-4" />}
                  >
                    Mark as Shipped
                  </Button>
                )}
                
                {order.order_status === 'shipped' && (
                  <Button
                    onClick={() => notifyCustomer(order)}
                    variant="secondary"
                    size="sm"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Resend Notification
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No orders to display</p>
              <p className="text-sm text-gray-500 mt-1">
                {filter === 'all' ? 'Orders will appear here when placed' : `No ${filter} orders at the moment`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
