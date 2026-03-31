import { NextRequest, NextResponse } from 'next/server';
import { getPayFastClient, PayFastITNData } from '@/lib/payfast';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('PayFast ITN received');

    // Get form data from PayFast
    const formData = await request.formData();
    const itnData: any = {};
    
    formData.forEach((value, key) => {
      itnData[key] = value.toString();
    });

    console.log('ITN Data:', itnData);

    const payfast = getPayFastClient();

    // Verify signature
    const isValid = payfast.verifyITNSignature(itnData as PayFastITNData);
    
    if (!isValid) {
      console.error('Invalid PayFast signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('PayFast signature verified');

    // Verify payment status from PayFast servers
    const headersList = headers();
    const pfHost = headersList.get('host');
    
    // Check if request is from PayFast
    const validHosts = [
      'www.payfast.co.za',
      'sandbox.payfast.co.za',
      'w1w.payfast.co.za',
      'w2w.payfast.co.za',
    ];

    // In production, verify the request is from PayFast
    // For now, we'll log and continue

    const paymentStatus = itnData.payment_status;
    const paymentId = itnData.m_payment_id;
    const pfPaymentId = itnData.pf_payment_id;
    const amountGross = itnData.amount_gross;

    console.log('Payment Status:', {
      paymentId,
      pfPaymentId,
      status: paymentStatus,
      amount: amountGross,
    });

    // TODO: Update order status in database based on payment_status
    // COMPLETE - Payment successful
    // FAILED - Payment failed
    // PENDING - Payment pending
    // CANCELLED - Payment cancelled

    if (paymentStatus === 'COMPLETE') {
      console.log(`Payment ${paymentId} completed successfully`);
      // Update order status to paid
    } else if (paymentStatus === 'FAILED') {
      console.log(`Payment ${paymentId} failed`);
      // Update order status to failed
    } else if (paymentStatus === 'CANCELLED') {
      console.log(`Payment ${paymentId} cancelled`);
      // Update order status to cancelled
    }

    // Return 200 OK to acknowledge receipt
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error('PayFast webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

// Allow POST requests without CSRF protection for webhooks
export const dynamic = 'force-dynamic';
