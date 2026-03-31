import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin permissions
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Sales Overview
    const { data: salesData } = await supabase
      .from('orders')
      .select('total_amount, order_status, payment_status, created_at')
      .gte('created_at', startDate.toISOString());

    const totalRevenue = salesData?.reduce((sum, order) => 
      order.payment_status === 'paid' ? sum + parseFloat(order.total_amount) : sum, 0
    ) || 0;

    const totalOrders = salesData?.length || 0;
    const paidOrders = salesData?.filter(o => o.payment_status === 'paid').length || 0;
    const pendingOrders = salesData?.filter(o => o.payment_status === 'pending').length || 0;

    // Product Performance
    const { data: productSales } = await supabase
      .from('order_items')
      .select(`
        product_id,
        product_name,
        quantity,
        total_amount,
        orders!inner(payment_status, created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .eq('orders.payment_status', 'paid');

    // Aggregate product sales
    const productPerformance = productSales?.reduce((acc: any[], item: any) => {
      const existing = acc.find(p => p.product_id === item.product_id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += parseFloat(item.total_amount);
        existing.orders += 1;
      } else {
        acc.push({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          revenue: parseFloat(item.total_amount),
          orders: 1,
        });
      }
      return acc;
    }, []) || [];

    // Sort by revenue
    productPerformance.sort((a, b) => b.revenue - a.revenue);

    // Daily sales for chart
    const dailySales = salesData?.reduce((acc: any, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      if (order.payment_status === 'paid') {
        acc[date].revenue += parseFloat(order.total_amount);
        acc[date].orders += 1;
      }
      return acc;
    }, {});

    const dailySalesArray = Object.values(dailySales || {}).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );

    // Customer insights
    const { data: customers } = await supabase
      .from('customers')
      .select('id, total_spent, total_orders, created_at')
      .gte('created_at', startDate.toISOString());

    const newCustomers = customers?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / paidOrders : 0;

    // Low stock products
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('id, name, stock_quantity, low_stock_threshold')
      .eq('is_active', true)
      .lte('stock_quantity', 10)
      .order('stock_quantity', { ascending: true })
      .limit(10);

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total_amount, order_status, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      overview: {
        totalRevenue,
        totalOrders,
        paidOrders,
        pendingOrders,
        newCustomers,
        avgOrderValue,
      },
      productPerformance: productPerformance.slice(0, 10),
      dailySales: dailySalesArray,
      lowStockProducts,
      recentOrders,
      period: parseInt(period),
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
