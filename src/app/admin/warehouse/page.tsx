"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertTriangle, CheckCircle, BarChart3, TrendingUp, Box, Printer } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  total_sold: number;
  shelf_location: string;
}

interface PickingOrder {
  order_reference: string;
  customer_name: string;
  pep_store_name: string;
  items: Array<{
    product_name: string;
    quantity: number;
    shelf_location?: string;
  }>;
  priority: 'high' | 'normal' | 'low';
  created_at: string;
}

export default function WarehousePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pickingOrders, setPickingOrders] = useState<PickingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'inventory' | 'picking'>('picking');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch orders for picking list
      const ordersResponse = await fetch('/api/orders');
      const ordersData = await ordersResponse.json();
      
      if (ordersData.orders) {
        // Convert to picking orders (only confirmed/processing orders)
        const picking = ordersData.orders
          .filter((o: any) => o.order_status === 'confirmed' || o.order_status === 'processing')
          .map((o: any) => ({
            order_reference: o.order_reference,
            customer_name: o.customer_name,
            pep_store_name: o.pep_store_name,
            items: o.order_items.map((item: any) => ({
              product_name: item.product_name,
              quantity: item.quantity,
              shelf_location: getShelfLocation(item.product_name)
            })),
            priority: getPriority(o.created_at),
            created_at: o.created_at
          }));
        
        setPickingOrders(picking);
      }

      // Mock inventory data (replace with actual API when products table is ready)
      const mockInventory: Product[] = [
        { id: '1', name: 'Imbiza Yamadoda', stock_quantity: 45, low_stock_threshold: 10, total_sold: 156, shelf_location: 'A3' },
        { id: '2', name: 'Bath Salt (Yokuthandeka)', stock_quantity: 8, low_stock_threshold: 15, total_sold: 89, shelf_location: 'B2' },
        { id: '3', name: 'Umakhiphi Isichitho', stock_quantity: 23, low_stock_threshold: 10, total_sold: 67, shelf_location: 'B5' },
        { id: '4', name: 'Isiwasho', stock_quantity: 31, low_stock_threshold: 10, total_sold: 45, shelf_location: 'A7' },
        { id: '5', name: 'Umuthi Wokugeza', stock_quantity: 5, low_stock_threshold: 10, total_sold: 78, shelf_location: 'C1' },
      ];
      
      setProducts(mockInventory);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load warehouse data');
    } finally {
      setLoading(false);
    }
  };

  const getShelfLocation = (productName: string): string => {
    const locations: Record<string, string> = {
      'Imbiza Yamadoda': 'A3',
      'Bath Salt (Yokuthandeka)': 'B2',
      'Bath Salt Yokuthandeka': 'B2',
      'Umakhiphi Isichitho': 'B5',
      'Isiwasho': 'A7',
      'Umuthi Wokugeza': 'C1'
    };
    return locations[productName] || 'Unknown';
  };

  const getPriority = (createdAt: string): 'high' | 'normal' | 'low' => {
    const hoursSinceCreated = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated > 24) return 'high';
    if (hoursSinceCreated > 12) return 'normal';
    return 'low';
  };

  const printPickingList = (order: PickingOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Picking List - ${order.order_reference}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .priority { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
          .priority-high { background: #fee; color: #c00; }
          .priority-normal { background: #ffa; color: #660; }
          .priority-low { background: #efe; color: #060; }
          .section { margin-bottom: 20px; }
          .items { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .items th, .items td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items th { background-color: #f2f2f2; font-weight: bold; }
          .checkbox { width: 30px; text-align: center; }
          .shelf { font-weight: bold; color: #0066cc; font-size: 18px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 Intandokazi Herbal - Warehouse</h1>
          <h2>PICKING LIST</h2>
          <span class="priority priority-${order.priority}">PRIORITY: ${order.priority.toUpperCase()}</span>
        </div>
        <div class="section">
          <strong>Order Reference:</strong> ${order.order_reference}<br>
          <strong>Customer:</strong> ${order.customer_name}<br>
          <strong>Delivery To:</strong> ${order.pep_store_name}<br>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}
        </div>
        <div class="section">
          <h3>Items to Pick</h3>
          <table class="items">
            <thead>
              <tr>
                <th class="checkbox">✓</th>
                <th>Shelf</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Picked By</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td class="checkbox">☐</td>
                  <td class="shelf">${item.shelf_location || 'N/A'}</td>
                  <td>${item.product_name}</td>
                  <td><strong>${item.quantity}</strong></td>
                  <td>_________</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="section" style="margin-top: 40px;">
          <p><strong>Picker Name:</strong> _________________</p>
          <p><strong>Time Started:</strong> _________________</p>
          <p><strong>Time Completed:</strong> _________________</p>
          <p><strong>Checked By:</strong> _________________</p>
        </div>
        <div class="section" style="border-top: 2px solid #333; padding-top: 10px; margin-top: 40px;">
          <p style="font-size: 12px; color: #666;">
            <strong>Instructions:</strong><br>
            1. Check each item as you pick it<br>
            2. Verify quantities are correct<br>
            3. Place items in designated packing area<br>
            4. Sign and date when complete
          </p>
        </div>
        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const printAllPickingLists = () => {
    pickingOrders.forEach(order => {
      setTimeout(() => printPickingList(order), 100);
    });
  };

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);

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
              <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
              <p className="text-gray-600 mt-1">Inventory tracking and order picking</p>
            </div>
            <div className="flex gap-3">
              {view === 'picking' && pickingOrders.length > 0 && (
                <Button
                  onClick={printAllPickingLists}
                  variant="secondary"
                  icon={<Printer className="w-4 h-4" />}
                >
                  Print All Lists
                </Button>
              )}
              <Button
                onClick={() => router.push('/admin/dashboard')}
                variant="secondary"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Orders to Pick</p>
                  <p className="text-2xl font-bold text-blue-600">{pickingOrders.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Box className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stock Value</p>
                  <p className="text-2xl font-bold text-green-600">R{(products.reduce((sum, p) => sum + (p.stock_quantity * 100), 0)).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setView('picking')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'picking'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Picking Lists ({pickingOrders.length})
              </button>
              <button
                onClick={() => setView('inventory')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'inventory'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inventory ({products.length})
              </button>
            </div>
          </div>
        </div>

        {/* Picking Lists View */}
        {view === 'picking' && (
          <div className="space-y-4">
            {pickingOrders.map((order, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border-l-4 border-gray-200 p-6" style={{
                borderLeftColor: order.priority === 'high' ? '#dc2626' : order.priority === 'normal' ? '#f59e0b' : '#10b981'
              }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.order_reference}</h3>
                      <Badge variant={
                        order.priority === 'high' ? 'error' :
                        order.priority === 'normal' ? 'warning' :
                        'success'
                      }>
                        {order.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Customer: {order.customer_name}</p>
                    <p className="text-sm text-gray-600">Delivery: {order.pep_store_name}</p>
                  </div>
                  <Button
                    onClick={() => printPickingList(order)}
                    variant="primary"
                    size="sm"
                    icon={<Printer className="w-4 h-4" />}
                  >
                    Print List
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Items to Pick:</p>
                  <div className="space-y-2">
                    {order.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-4 bg-white p-3 rounded border border-gray-200">
                        <div className="w-16 h-16 bg-brand-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-brand-600">{item.shelf_location}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-600">Shelf Location: {item.shelf_location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {pickingOrders.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No orders to pick</p>
                <p className="text-sm text-gray-500 mt-1">All orders have been processed!</p>
              </div>
            )}
          </div>
        )}

        {/* Inventory View */}
        {view === 'inventory' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Shelf</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{product.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-lg font-bold text-lg">
                          {product.shelf_location}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-semibold text-gray-900">{product.stock_quantity}</p>
                        <p className="text-xs text-gray-500">Min: {product.low_stock_threshold}</p>
                      </td>
                      <td className="px-6 py-4">
                        {product.stock_quantity <= product.low_stock_threshold ? (
                          <Badge variant="error">Low Stock</Badge>
                        ) : product.stock_quantity <= product.low_stock_threshold * 2 ? (
                          <Badge variant="warning">Medium Stock</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 font-medium">{product.total_sold}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
