import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderReference,
      customerName,
      customerEmail,
      customerPhone,
      pepStoreCode,
      pepStoreName,
      deliveryNotes,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod = 'pending'
    } = body;

    // Validate required fields
    if (!orderReference || !customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_reference: orderReference,
        customer_name: customerName,
        customer_email: customerEmail || customerPhone,
        customer_phone: customerPhone,
        pep_store_code: pepStoreCode,
        pep_store_name: pepStoreName,
        delivery_notes: deliveryNotes,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'pending',
        items: items
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Continue anyway - order is created
    }

    return NextResponse.json({
      success: true,
      order
    }, { status: 201 });
  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderReference = searchParams.get('orderReference');
    const status = searchParams.get('status');

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (orderReference) {
      query = query.eq('order_reference', orderReference);
    }

    if (status) {
      query = query.eq('order_status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderReference, paymentStatus, orderStatus, paymentMethod, transactionId } = body;

    if (!orderReference) {
      return NextResponse.json(
        { error: 'Order reference is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
      if (paymentStatus === 'paid') {
        updates.paid_at = new Date().toISOString();
      }
    }

    if (orderStatus) {
      updates.order_status = orderStatus;
    }

    if (paymentMethod) {
      updates.payment_method = paymentMethod;
    }

    if (transactionId) {
      updates.transaction_id = transactionId;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_reference', orderReference)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
