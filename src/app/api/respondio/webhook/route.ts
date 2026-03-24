import { NextRequest, NextResponse } from 'next/server';

/**
 * Respond.io Webhook Handler
 * Handles incoming messages and events from Respond.io
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature if configured
    const signature = request.headers.get('x-respondio-signature');
    if (process.env.RESPONDIO_WEBHOOK_SECRET && signature) {
      const isValid = verifySignature(JSON.stringify(body), signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Handle different event types
    switch (body.event) {
      case 'message.received':
        await handleIncomingMessage(body.data);
        break;
      case 'message.delivered':
        await handleMessageDelivered(body.data);
        break;
      case 'message.read':
        await handleMessageRead(body.data);
        break;
      case 'contact.created':
        await handleContactCreated(body.data);
        break;
      default:
        console.log('Unhandled Respond.io event:', body.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Respond.io webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleIncomingMessage(data: any) {
  console.log('Incoming message:', data);
  
  // TODO: Process customer inquiries
  // TODO: Auto-respond to common questions
  // TODO: Route to appropriate department
  // TODO: Log conversation in database
  
  const message = data.message?.text?.toLowerCase() || '';
  
  // Auto-respond to common queries
  if (message.includes('order status') || message.includes('track')) {
    // TODO: Send order tracking information
  } else if (message.includes('price') || message.includes('cost')) {
    // TODO: Send product pricing information
  } else if (message.includes('delivery') || message.includes('shipping')) {
    // TODO: Send delivery information
  }
}

async function handleMessageDelivered(data: any) {
  console.log('Message delivered:', data);
  // TODO: Update message status in database
}

async function handleMessageRead(data: any) {
  console.log('Message read:', data);
  // TODO: Update message status in database
}

async function handleContactCreated(data: any) {
  console.log('Contact created:', data);
  // TODO: Add contact to CRM
  // TODO: Send welcome message
}

function verifySignature(payload: string, signature: string): boolean {
  const crypto = require('crypto');
  const secret = process.env.RESPONDIO_WEBHOOK_SECRET || '';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  return signature === expectedSignature;
}
