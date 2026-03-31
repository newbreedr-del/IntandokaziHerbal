import { NextRequest, NextResponse } from 'next/server';

// In a real implementation, this would be stored in a database
// For now, we'll use a simple in-memory store (this resets on server restart)
const paymentConfirmations = new Map<string, {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  proofSent: boolean;
  confirmed: boolean;
  confirmedAt?: string;
  createdAt: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderRef, customerName, customerEmail, customerPhone, proofType } = body;

    if (!orderRef || !customerName) {
      return NextResponse.json(
        { error: 'Order reference and customer name are required' },
        { status: 400 }
      );
    }

    // Store payment confirmation
    const confirmation = {
      orderRef,
      customerName,
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      paymentMethod: 'eft',
      proofSent: true,
      confirmed: false,
      createdAt: new Date().toISOString(),
    };

    paymentConfirmations.set(orderRef, confirmation);

    console.log('=== EFT PAYMENT CONFIRMATION RECEIVED ===');
    console.log('Order Reference:', orderRef);
    console.log('Customer Name:', customerName);
    console.log('Customer Email:', customerEmail);
    console.log('Customer Phone:', customerPhone);
    console.log('Proof Type:', proofType);
    console.log('=== END CONFIRMATION ===');

    // In a real implementation, you would:
    // 1. Send notification to admin WhatsApp/email
    // 2. Update database
    // 3. Send confirmation to customer
    // 4. Create task for admin to verify payment

    return NextResponse.json({
      success: true,
      message: 'Payment confirmation received. We will verify and process your order within 2 hours.',
      orderRef,
      referenceNumber: `EFT-${Date.now()}`
    });

  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderRef = searchParams.get('orderRef');

    if (orderRef) {
      // Get specific confirmation
      const confirmation = paymentConfirmations.get(orderRef);
      if (!confirmation) {
        return NextResponse.json(
          { error: 'Payment confirmation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(confirmation);
    } else {
      // Get all pending confirmations
      const pending = Array.from(paymentConfirmations.values())
        .filter(c => !c.confirmed)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        pending,
        total: pending.length
      });
    }
  } catch (error: any) {
    console.error('Get confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment confirmations' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderRef, confirmed } = body;

    if (!orderRef) {
      return NextResponse.json(
        { error: 'Order reference is required' },
        { status: 400 }
      );
    }

    const confirmation = paymentConfirmations.get(orderRef);
    if (!confirmation) {
      return NextResponse.json(
        { error: 'Payment confirmation not found' },
        { status: 404 }
      );
    }

    // Update confirmation status
    confirmation.confirmed = confirmed;
    confirmation.confirmedAt = confirmed ? new Date().toISOString() : undefined;

    console.log(`=== EFT PAYMENT ${confirmed ? 'CONFIRMED' : 'REJECTED'} ===`);
    console.log('Order Reference:', orderRef);
    console.log('Customer Name:', confirmation.customerName);
    console.log('=== END UPDATE ===');

    return NextResponse.json({
      success: true,
      message: `Payment ${confirmed ? 'confirmed' : 'rejected'} successfully`,
      confirmation
    });

  } catch (error: any) {
    console.error('Update confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to update payment confirmation' },
      { status: 500 }
    );
  }
}
