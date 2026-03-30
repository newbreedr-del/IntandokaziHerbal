import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock webhook handler for testing
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    console.log('🎭 MOCK WEBHOOK received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment.paid':
        console.log('✅ Mock payment paid:', event.data.id);
        // TODO: Update order status in database
        break;
      
      case 'payment.failed':
        console.log('❌ Mock payment failed:', event.data.id);
        break;
      
      default:
        console.log('Unknown mock event type:', event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Mock webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
