import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPayFastClient } from '@/lib/payfast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyAgentSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-agent-secret');
  return secret === process.env.AGENT_API_SECRET;
}

// POST /api/agent/orders/prepare - Create an order from agent conversation
export async function POST(request: NextRequest) {
  if (!verifyAgentSecret(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      items,
      total_amount,
      customer_name,
      customer_phone,
      customer_email,
      delivery_method,
      delivery_location,
      pep_store_code,
      notes
    } = body;

    // Validate required fields
    if (!items || items.length === 0 || !customer_name || !customer_phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: items, customer_name, customer_phone' },
        { status: 400 }
      );
    }

    // Generate order reference
    const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const lineTotal = (item.price || 0) * (item.quantity || 1);
      subtotal += lineTotal;
      return {
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity || 1,
        unit_price: item.price || 0,
        total: lineTotal
      };
    });

    const deliveryFee = delivery_method === 'courier' ? 99 : 0;
    const finalTotal = total_amount || (subtotal + deliveryFee);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_reference: orderRef,
        customer_name,
        customer_email: customer_email || customer_phone,
        customer_phone,
        pep_store_code: pep_store_code || null,
        pep_store_name: delivery_location || null,
        delivery_notes: notes || `Agent order — ${delivery_method || 'pep'} delivery to ${delivery_location || 'TBD'}`,
        subtotal,
        delivery_fee: deliveryFee,
        total: finalTotal,
        payment_method: 'pending',
        payment_status: 'pending',
        order_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('[Agent Order Prepare] Error creating order:', orderError);
      return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const itemRows = orderItems.map((item: any) => ({
      order_id: order.id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemRows);

    if (itemsError) {
      console.error('[Agent Order Prepare] Error creating items:', itemsError);
    }

    // Build PayFast payment URL (with signature)
    let paymentUrl = null;
    let shortPaymentUrl = null;
    if (process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY) {
      const payfast = getPayFastClient();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        'https://intandokaziherbal.co.za';

      const paymentData = payfast.createPayment({
        return_url: `${siteUrl}/store/order-success?ref=${orderRef}`,
        cancel_url: `${siteUrl}/store/order-cancelled?ref=${orderRef}`,
        notify_url: `${siteUrl}/api/payments/payfast/notify`,
        name_first: customer_name.split(' ')[0] || customer_name,
        name_last: customer_name.split(' ').slice(1).join(' ') || '',
        email_address: customer_email || `${customer_phone}@agent.local`,
        cell_number: customer_phone.replace(/^27/, '0'),
        m_payment_id: orderRef,
        amount: finalTotal.toFixed(2),
        item_name: `Intandokazi Order ${orderRef}`,
        item_description: items.map((i: any) => `${i.quantity || 1}x ${i.name}`).join(', ').substring(0, 255)
      });

      const params = new URLSearchParams();
      Object.entries(paymentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value) !== '') {
          params.append(key, String(value));
        }
      });

      paymentUrl = `${payfast.getPaymentUrl()}?${params.toString()}`;
      shortPaymentUrl = `${siteUrl}/pay/${orderRef}`;
    }

    console.log(`[Agent Order Prepare] Order ${orderRef} created — total R${finalTotal}`);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_ref: orderRef,
        total: finalTotal,
        status: 'pending'
      },
      payment_url: shortPaymentUrl || paymentUrl,
      payment_url_long: paymentUrl
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Agent Order Prepare] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
