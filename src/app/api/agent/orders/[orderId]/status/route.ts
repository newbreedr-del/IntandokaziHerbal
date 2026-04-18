import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyAgentSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-agent-secret');
  return secret === process.env.AGENT_API_SECRET;
}

// GET /api/agent/orders/[orderId]/status - Check order status by reference or ID
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  if (!verifyAgentSecret(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orderId = params.orderId;

    // Try by order_reference first, then by ID
    let query = supabase
      .from('orders')
      .select('id, order_reference, customer_name, customer_phone, total, payment_status, order_status, payment_method, created_at, order_items(product_name, quantity, unit_price, total)')
      .or(`order_reference.eq.${orderId},id.eq.${orderId}`)
      .single();

    const { data: order, error } = await query;

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_ref: order.order_reference,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        total: order.total,
        payment_status: order.payment_status,
        order_status: order.order_status,
        payment_method: order.payment_method,
        created_at: order.created_at,
        items: order.order_items
      }
    });
  } catch (error: any) {
    console.error('[Agent Order Status] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
