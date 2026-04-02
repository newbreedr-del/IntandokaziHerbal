import { NextRequest, NextResponse } from 'next/server';
import { paygateService } from '@/lib/paygate';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Convert FormData to object
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('PayGate notification received:', data);

    // Verify checksum
    const isValid = paygateService.verifyChecksum({ ...data });
    
    if (!isValid) {
      console.error('Invalid PayGate checksum');
      return NextResponse.json(
        { error: 'Invalid checksum' },
        { status: 400 }
      );
    }

    // Extract payment details
    const {
      PAY_REQUEST_ID,
      REFERENCE,
      TRANSACTION_STATUS,
      RESULT_CODE,
      RESULT_DESC,
      TRANSACTION_ID,
      AUTH_CODE,
      AMOUNT,
      CURRENCY,
    } = data;

    // Transaction status codes:
    // 0 = Not Done
    // 1 = Approved
    // 2 = Declined
    // 4 = Cancelled
    
    const isSuccess = TRANSACTION_STATUS === '1';

    // TODO: Update order/booking status in database
    // Example:
    // await updateOrderPaymentStatus(REFERENCE, {
    //   status: isSuccess ? 'paid' : 'failed',
    //   transactionId: TRANSACTION_ID,
    //   payRequestId: PAY_REQUEST_ID,
    //   resultCode: RESULT_CODE,
    //   resultDesc: RESULT_DESC,
    //   authCode: AUTH_CODE,
    //   amount: parseInt(AMOUNT) / 100, // Convert from cents
    // });

    console.log(`Payment ${REFERENCE}: ${isSuccess ? 'SUCCESS' : 'FAILED'} - ${RESULT_DESC}`);

    // Return success to PayGate
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayGate notify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
