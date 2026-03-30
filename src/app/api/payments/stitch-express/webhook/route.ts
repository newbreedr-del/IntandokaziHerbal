import { NextRequest, NextResponse } from 'next/server';
import { getStitchExpressClient } from '@/lib/stitch-express';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-stitch-signature');
    const webhookSecret = process.env.STITCH_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('STITCH_WEBHOOK_SECRET not configured');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payload = await request.text();

    // Verify webhook signature
    if (signature) {
      const stitch = getStitchExpressClient();
      const isValid = stitch.verifyWebhookSignature(payload, signature, webhookSecret);
      
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(payload);

    console.log('Stitch webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment.paid':
        await handlePaymentPaid(event.data);
        break;
      
      case 'payment.settled':
        await handlePaymentSettled(event.data);
        break;
      
      case 'payment.expired':
        await handlePaymentExpired(event.data);
        break;
      
      case 'payment.cancelled':
        await handlePaymentCancelled(event.data);
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentPaid(data: any) {
  console.log('Payment paid:', data.id, data.merchantReference);
  
  // TODO: Update order status in database
  // TODO: Send confirmation email/WhatsApp
  // TODO: Generate invoice
  // TODO: Initiate courier booking
  
  // Example:
  // await updateOrderStatus(data.merchantReference, 'paid');
  // await sendOrderConfirmation(data.merchantReference);
}

async function handlePaymentSettled(data: any) {
  console.log('Payment settled:', data.id, data.merchantReference);
  
  // TODO: Mark payment as settled in database
  // Funds are now in your Stitch Express account
}

async function handlePaymentExpired(data: any) {
  console.log('Payment expired:', data.id, data.merchantReference);
  
  // TODO: Update order status to expired
  // TODO: Send reminder email to customer
}

async function handlePaymentCancelled(data: any) {
  console.log('Payment cancelled:', data.id, data.merchantReference);
  
  // TODO: Update order status to cancelled
  // TODO: Release inventory if reserved
}
