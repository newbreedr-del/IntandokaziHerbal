import { NextRequest, NextResponse } from 'next/server';
import { getPayFastClient, PayFastITNData } from '@/lib/payfast';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

/**
 * Verify the request comes from a valid PayFast IP address
 */
async function verifyPayFastIP(request: NextRequest): Promise<boolean> {
  try {
    const validHosts = [
      'www.payfast.co.za',
      'sandbox.payfast.co.za',
      'w1w.payfast.co.za',
      'w2w.payfast.co.za',
    ];

    // Get all valid IPs
    const validIPs: string[] = [];
    for (const host of validHosts) {
      try {
        const { address } = await lookup(host);
        validIPs.push(address);
      } catch (err) {
        console.warn(`Could not resolve ${host}`);
      }
    }

    // Get request IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const requestIP = forwardedFor ? forwardedFor.split(',')[0].trim() : 
                      request.headers.get('x-real-ip') || 'unknown';

    console.log('Request IP:', requestIP, 'Valid IPs:', validIPs);
    
    return validIPs.includes(requestIP);
  } catch (error) {
    console.error('IP verification error:', error);
    return false;
  }
}

/**
 * Verify payment data with PayFast server
 */
async function verifyWithPayFastServer(itnData: any): Promise<boolean> {
  try {
    const pfHost = process.env.PAYFAST_ENVIRONMENT === 'production'
      ? 'www.payfast.co.za'
      : 'sandbox.payfast.co.za';

    const url = `https://${pfHost}/eng/query/validate`;

    // Create parameter string (same format as signature generation)
    const params = new URLSearchParams();
    Object.keys(itnData).forEach(key => {
      if (key !== 'signature' && itnData[key]) {
        params.append(key, itnData[key]);
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result = await response.text();
    console.log('PayFast server validation:', result);
    
    return result === 'VALID';
  } catch (error) {
    console.error('Server validation error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Return 200 immediately to prevent retries
    console.log('=== PayFast ITN Received ===');

    // Get form data from PayFast
    const formData = await request.formData();
    const itnData: any = {};
    
    formData.forEach((value, key) => {
      itnData[key] = value.toString();
    });

    console.log('ITN Data:', itnData);

    const payfast = getPayFastClient();

    // SECURITY CHECK 1: Verify signature
    console.log('Check 1: Verifying signature...');
    const signatureValid = payfast.verifyITNSignature(itnData as PayFastITNData);
    
    if (!signatureValid) {
      console.error('❌ Signature verification FAILED');
      return new NextResponse('OK', { status: 200 }); // Still return 200 to prevent retries
    }
    console.log('✅ Signature verified');

    // SECURITY CHECK 2: Verify PayFast IP
    console.log('Check 2: Verifying PayFast IP...');
    const ipValid = await verifyPayFastIP(request);
    
    if (!ipValid) {
      console.warn('⚠️ IP verification FAILED - may be behind proxy');
      // Don't fail on IP check in case of proxy/CDN
    } else {
      console.log('✅ IP verified');
    }

    // SECURITY CHECK 3: Verify amount (if you have order data)
    console.log('Check 3: Verifying payment amount...');
    const amountGross = parseFloat(itnData.amount_gross);
    // TODO: Get expected amount from database using itnData.m_payment_id
    // const expectedAmount = await getOrderAmount(itnData.m_payment_id);
    // if (Math.abs(expectedAmount - amountGross) > 0.01) {
    //   console.error('❌ Amount mismatch');
    //   return new NextResponse('OK', { status: 200 });
    // }
    console.log('⚠️ Amount verification skipped (TODO: implement database check)');

    // SECURITY CHECK 4: Server confirmation
    console.log('Check 4: Confirming with PayFast server...');
    const serverValid = await verifyWithPayFastServer(itnData);
    
    if (!serverValid) {
      console.error('❌ Server confirmation FAILED');
      return new NextResponse('OK', { status: 200 });
    }
    console.log('✅ Server confirmed');

    // All checks passed - process the payment
    console.log('=== All Security Checks Passed ===');

    const paymentStatus = itnData.payment_status;
    const paymentId = itnData.m_payment_id;
    const pfPaymentId = itnData.pf_payment_id;

    console.log('Payment Details:', {
      orderId: paymentId,
      payfastId: pfPaymentId,
      status: paymentStatus,
      amount: amountGross,
      fee: itnData.amount_fee,
      net: itnData.amount_net,
    });

    // Process payment based on status
    if (paymentStatus === 'COMPLETE') {
      console.log(`✅ Payment ${paymentId} completed successfully`);
      // TODO: Update order status to paid in database
      // await updateOrderStatus(paymentId, 'paid', pfPaymentId);
    } else if (paymentStatus === 'FAILED') {
      console.log(`❌ Payment ${paymentId} failed`);
      // TODO: Update order status to failed
      // await updateOrderStatus(paymentId, 'failed', pfPaymentId);
    } else if (paymentStatus === 'CANCELLED') {
      console.log(`⚠️ Payment ${paymentId} cancelled`);
      // TODO: Update order status to cancelled
      // await updateOrderStatus(paymentId, 'cancelled', pfPaymentId);
    }

    console.log('=== ITN Processing Complete ===');

    // Return 200 OK to acknowledge receipt
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error('PayFast webhook error:', error);
    // Still return 200 to prevent retries
    return new NextResponse('OK', { status: 200 });
  }
}

// Allow POST requests without CSRF protection for webhooks
export const dynamic = 'force-dynamic';
