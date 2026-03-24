import { NextRequest, NextResponse } from 'next/server';
import { getStitchClient } from '@/lib/stitch';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-stitch-signature');
    const body = await request.text();

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const stitchClient = getStitchClient();
    const webhookSecret = process.env.STITCH_WEBHOOK_SECRET || '';

    // Verify webhook signature
    const isValid = stitchClient.verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    
    // Handle different webhook events
    switch (payload.type) {
      case 'payment.completed':
        await handlePaymentCompleted(payload.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.data);
        break;
      case 'payment.cancelled':
        await handlePaymentCancelled(payload.data);
        break;
      default:
        console.log('Unhandled webhook event:', payload.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(data: any) {
  console.log('Payment completed:', data);
  
  // TODO: Update order status in database
  // TODO: Send confirmation email
  // TODO: Trigger fulfillment process
  // TODO: Send WhatsApp notification via Respond.io
  
  // Example: Update order in your database
  // await updateOrderStatus(data.reference, 'paid');
  // await sendOrderConfirmation(data.customerEmail, data.reference);
}

async function handlePaymentFailed(data: any) {
  console.log('Payment failed:', data);
  
  // TODO: Update order status
  // TODO: Notify customer
  // TODO: Log for manual review
}

async function handlePaymentCancelled(data: any) {
  console.log('Payment cancelled:', data);
  
  // TODO: Update order status
  // TODO: Send cancellation notification
}
