import { NextRequest, NextResponse } from 'next/server';
import { getMockStitchClient } from '@/lib/stitch-mock';

/**
 * Mock Stitch payment page
 * Simulates the Stitch payment flow and redirects back
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get('paymentId');
  const redirectUrl = searchParams.get('redirect');

  if (!paymentId || !redirectUrl) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Mark payment as paid (simulate successful payment)
    const mockStitch = getMockStitchClient();
    await mockStitch.markAsPaid(paymentId);

    console.log('🎭 MOCK: Payment marked as paid:', paymentId);

    // Simulate webhook notification
    setTimeout(async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/stitch-mock/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment.paid',
            data: {
              id: paymentId,
              status: 'PAID',
              paidAt: new Date().toISOString()
            }
          })
        });
      } catch (error) {
        console.error('Failed to send mock webhook:', error);
      }
    }, 1000);

    // Redirect back to success page
    return NextResponse.redirect(decodeURIComponent(redirectUrl));

  } catch (error) {
    console.error('Mock payment error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
