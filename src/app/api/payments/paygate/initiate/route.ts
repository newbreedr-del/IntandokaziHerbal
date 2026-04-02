import { NextRequest, NextResponse } from 'next/server';
import { paygateService } from '@/lib/paygate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reference,
      amount,
      email,
      customerName,
      description,
      payMethod, // 'PC' for Capitec Pay
    } = body;

    // Validate required fields
    if (!reference || !amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create payment data
    const paymentData = paygateService.createPaymentData({
      reference,
      amount: parseFloat(amount),
      email,
      returnUrl: `${appUrl}/store/payment-return`,
      notifyUrl: `${appUrl}/api/payments/paygate/notify`,
      payMethod: payMethod || undefined,
      description: description || `Order ${reference}`,
    });

    // Initiate payment with PayGate
    const result = await paygateService.initiatePayment(paymentData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment initiation failed' },
        { status: 500 }
      );
    }

    // Return redirect URL
    return NextResponse.json({
      success: true,
      payRequestId: result.payRequestId,
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    console.error('PayGate initiate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
