import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendOrderNotification, sendAdminAlert } from '@/lib/notifications';

async function sendWhatsApp(to: string, text: string) {
  const apiUrl = process.env.EVOLUTION_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE
  if (!apiUrl || !apiKey || !instance) return
  const phone = to.replace(/\D/g, '')
  await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    body: JSON.stringify({ number: phone, textMessage: { text } })
  }).catch(err => console.error('[ITN] WhatsApp send failed:', err?.message))
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - PayFast IPN (Instant Payment Notification) for store orders
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: any = {};
    
    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log('PayFast IPN received for store order:', data);

    // Verify PayFast signature
    const isValid = verifyPayFastSignature(data);
    
    if (!isValid) {
      console.error('Invalid PayFast signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Extract payment details
    const orderReference = data.m_payment_id;
    const paymentStatus = data.payment_status;
    const transactionId = data.pf_payment_id;
    const amount = parseFloat(data.amount_gross);

    console.log(`Processing payment for order ${orderReference}: ${paymentStatus}`);

    // Map PayFast status to our status
    let status = 'pending';
    let orderStatus = 'pending';
    
    if (paymentStatus === 'COMPLETE') {
      status = 'paid';
      orderStatus = 'confirmed';
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      status = 'failed';
      orderStatus = 'cancelled';
    }

    // Update order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: status,
        order_status: orderStatus,
        transaction_id: transactionId,
        payment_method: 'payfast',
        paid_at: status === 'paid' ? new Date().toISOString() : null
      })
      .eq('order_reference', orderReference)
      .select()
      .single();

    if (orderError) {
      console.error('Error updating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`Order ${orderReference} updated to status: ${status}`);

    // Send notifications if payment successful
    if (status === 'paid' && order) {
      await sendOrderNotifications(order);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayFast IPN error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify PayFast signature
function verifyPayFastSignature(data: any): boolean {
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const signature = data.signature;
  
  // Remove signature from data
  const dataToVerify = { ...data };
  delete dataToVerify.signature;

  // Create parameter string
  let pfParamString = '';
  for (let key in dataToVerify) {
    if (dataToVerify.hasOwnProperty(key)) {
      pfParamString += `${key}=${encodeURIComponent(dataToVerify[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  }

  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);
  
  if (passphrase) {
    pfParamString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  const generatedSignature = crypto.createHash('md5').update(pfParamString).digest('hex');

  return generatedSignature === signature;
}

// Send order notifications
async function sendOrderNotifications(order: any) {
  try {
    console.log('Sending notifications for order:', order.order_reference);

    // Create notification record for admin
    try {
      await supabase
        .from('notifications')
        .insert({
          type: 'order_paid',
          title: 'New Order Payment Received',
          message: `Payment of R${order.total} received for order ${order.order_reference} from ${order.customer_name}`,
          data: {
            orderId: order.id,
            orderReference: order.order_reference,
            amount: order.total,
            customerName: order.customer_name
          },
          read: false
        })
    } catch (_) {}

    // Fetch order items for notification
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    const itemSummary = (orderItems || [])
      .map((i: any) => `${i.quantity}x ${i.product_name}`)
      .join(', ') || 'Order items'

    // ── WhatsApp: confirmation to customer ───────────────────────────────────
    if (order.customer_phone) {
      const customerMsg =
        `✅ *Payment Confirmed!*\n\n` +
        `Hi ${order.customer_name?.split(' ')[0] || 'there'}! Your payment of *R${Number(order.total).toFixed(2)}* has been received.\n\n` +
        `📦 *Order:* ${order.order_reference}\n` +
        `🛍️ *Items:* ${itemSummary}\n` +
        (order.pep_store_name ? `📍 *Collection:* ${order.pep_store_name}\n` : '') +
        `\nWe'll notify you once dispatched. Thank you! 🌿`
      await sendWhatsApp(order.customer_phone, customerMsg)
      console.log('[ITN] Customer WhatsApp sent to', order.customer_phone)
    }

    // ── WhatsApp: dispatch alert ──────────────────────────────────────────────
    const dispatchNumbers = (process.env.DISPATCH_NUMBERS || process.env.DISPATCH_NUMBER || '')
      .split(',')
      .map((n: string) => n.trim())
      .filter(Boolean)

    if (dispatchNumbers.length > 0) {
      const dispatchMsg =
        `🚨 *New Order — Payment Received*\n\n` +
        `👤 *Customer:* ${order.customer_name}\n` +
        `📱 *Phone:* ${order.customer_phone || 'N/A'}\n` +
        `📦 *Ref:* ${order.order_reference}\n` +
        `🛍️ *Items:* ${itemSummary}\n` +
        (order.pep_store_name ? `📍 *Collection:* ${order.pep_store_name}\n` : '') +
        `💰 *Total:* R${Number(order.total).toFixed(2)}\n` +
        `⏰ ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}`
      for (const num of dispatchNumbers) {
        await sendWhatsApp(num, dispatchMsg)
      }
      console.log('[ITN] Dispatch WhatsApp sent to', dispatchNumbers.join(', '))
    }

    // Send email/log notifications
    try {
      await sendOrderNotification({
        type: 'order_paid',
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerEmail: order.customer_email,
        orderReference: order.order_reference,
        total: order.total,
        items: (orderItems || []).map((item: any) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price
        }))
      });

      await sendAdminAlert({
        type: 'payment_received',
        reference: order.order_reference,
        customerName: order.customer_name,
        amount: order.total,
        details: `Order payment confirmed\nItems: ${orderItems?.length || 0}\nDelivery: ${order.pep_store_name}`
      });
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }

    console.log('Order notifications created for:', order.order_reference);
  } catch (error) {
    console.error('Error sending order notifications:', error);
  }
}
