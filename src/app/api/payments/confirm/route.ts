import { NextRequest, NextResponse } from 'next/server';

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

    console.log('[Payment Confirm] Processing confirmation:', {
      customerName,
      customerPhone,
      orderId,
      amount,
      paymentMethod,
      itemCount: orderItems?.length || 0
    });

    return NextResponse.json({
      success: true,
      message: 'Payment confirmation processed successfully'
    });

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
