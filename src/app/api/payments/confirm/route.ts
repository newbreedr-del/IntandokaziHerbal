import { NextRequest, NextResponse } from 'next/server';
import { processPaymentConfirmation } from '@/lib/dispatch-workflow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      customerPhone,
      customerName,
      orderId,
      amount,
      paymentMethod,
      orderItems
    } = body;

    // Validate required fields
    if (!customerPhone || !customerName || !orderId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: customerPhone, customerName, orderId, amount, paymentMethod' },
        { status: 400 }
      );
    }

    // Process payment confirmation workflow
    const result = await processPaymentConfirmation({
      customerPhone,
      customerName,
      orderId,
      amount,
      paymentMethod,
      orderItems
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Payment confirmation processed successfully',
        data: result
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to process payment confirmation', details: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Payment confirmation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Payment confirmation API endpoint',
    usage: 'POST /api/payments/confirm',
    requiredFields: [
      'customerPhone',
      'customerName', 
      'orderId',
      'amount',
      'paymentMethod'
    ],
    optionalFields: [
      'orderItems'
    ]
  });
}
