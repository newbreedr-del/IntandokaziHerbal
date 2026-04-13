"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Calendar, Phone, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Order {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pep_store_code: string;
  pep_store_name: string;
  delivery_notes: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`);
      const data = await response.json();
      
      if (data.orders && data.orders.length > 0) {
        setOrder(data.orders[0]);
      } else {
        toast.error("Order not found");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderReference: order.order_reference,
          orderStatus: newStatus,
        }),
      });

      if (response.ok) {
        toast.success("Order status updated");
        fetchOrder(params.id as string);
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    pending: 'warning',
    processing: 'info',
    confirmed: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error'
  };

  const paymentStatusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    paid: 'success',
    COMPLETE: 'success',
    pending: 'warning',
    failed: 'error'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push("/admin/dashboard")}
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order #{order.order_reference}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={statusColors[order.order_status] || 'default'}>
                {order.order_status}
              </Badge>
              <Badge variant={paymentStatusColors[order.payment_status] || 'default'}>
                {order.payment_status === 'COMPLETE' ? 'Paid' : order.payment_status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
              </div>
              
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee (PAXI)</span>
                  <span className="text-gray-900">{formatCurrency(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-brand-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{order.customer_phone}</span>
                </div>
                {order.customer_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{order.customer_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-semibold text-gray-900">Delivery Information</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">PEP Store Code</p>
                  <p className="font-medium text-gray-900">{order.pep_store_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Store Location</p>
                  <p className="font-medium text-gray-900">{order.pep_store_name}</p>
                </div>
                {order.delivery_notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Delivery Notes</p>
                    <p className="text-gray-900">{order.delivery_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Update Order Status</h3>
              <div className="space-y-2">
                {['pending', 'processing', 'confirmed', 'shipped', 'delivered'].map((status) => (
                  <Button
                    key={status}
                    onClick={() => updateOrderStatus(status)}
                    disabled={updating || order.order_status === status}
                    variant={order.order_status === status ? 'primary' : 'secondary'}
                    className="w-full justify-start"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-gray-900">Payment</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium text-gray-900 uppercase">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={paymentStatusColors[order.payment_status] || 'default'}>
                    {order.payment_status === 'COMPLETE' ? 'Paid' : order.payment_status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
