import { NextRequest, NextResponse } from 'next/server';
import { getStitchExpressClient } from '@/lib/stitch-express';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const stitch = getStitchExpressClient();
    const status = await stitch.getPaymentStatus(paymentId);

    return NextResponse.json({
      success: true,
      payment: {
        id: status.id,
        status: status.status,
        amount: status.amount / 100, // Convert from cents to rands
        reference: status.merchantReference,
        paidAt: status.paidAt,
        payerName: status.payerName,
        payerEmail: status.payerEmailAddress
      }
    });

  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
