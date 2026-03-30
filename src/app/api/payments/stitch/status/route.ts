import { NextRequest, NextResponse } from 'next/server';
import { getStitchClient } from '@/lib/stitch';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const stitchClient = getStitchClient();
    const status = await stitchClient.getPaymentStatus(paymentId);

    return NextResponse.json({
      success: true,
      status
    });
  } catch (error: any) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
