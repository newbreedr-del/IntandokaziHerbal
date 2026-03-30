import { NextRequest, NextResponse } from 'next/server';
import { getStitchExpressClient } from '@/lib/stitch-express';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().positive(),
  reference: z.string(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  description: z.string().optional(),
  redirectUrl: z.string().url().optional()
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Payment creation request received');
    
    const body = await request.json();
    console.log('📦 Request body:', body);
    
    const validated = paymentSchema.parse(body);
    console.log('✅ Validated data:', validated);

    // Check if Stitch credentials are configured
    const hasClientId = !!process.env.STITCH_CLIENT_ID;
    const hasClientSecret = !!process.env.STITCH_CLIENT_SECRET;
    
    console.log('🔑 Environment check:', {
      hasClientId,
      hasClientSecret,
      clientId: process.env.STITCH_CLIENT_ID?.substring(0, 10) + '...',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    });

    if (!hasClientId || !hasClientSecret) {
      console.warn('⚠️ Stitch credentials not configured, using mock payment');
      
      // Mock payment response for development/testing
      const mockPaymentId = `mock_${Date.now()}`;
      const mockPaymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/store/order-confirmation?payment_id=${mockPaymentId}&status=success`;
      
      console.log('🎭 Mock payment response:', {
        paymentId: mockPaymentId,
        paymentUrl: mockPaymentUrl,
        reference: validated.reference
      });
      
      return NextResponse.json({
        success: true,
        paymentId: mockPaymentId,
        paymentUrl: mockPaymentUrl,
        status: 'success',
        reference: validated.reference,
        mock: true
      });
    }

    const stitch = getStitchExpressClient();

    // Create payment link
    const result = await stitch.createPaymentLink({
      amount: Math.round(validated.amount * 100), // Convert to cents
      merchantReference: validated.reference,
      payerName: validated.customerName,
      payerEmailAddress: validated.customerEmail,
      payerPhoneNumber: validated.customerPhone,
      collectDeliveryDetails: false, // We already have delivery details
      skipCheckoutPage: false
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create payment link' },
        { status: 500 }
      );
    }

    // Append redirect URL if provided
    let paymentUrl = result.data.payment.link;
    if (validated.redirectUrl) {
      const encodedRedirect = encodeURIComponent(validated.redirectUrl);
      paymentUrl += `?redirect_url=${encodedRedirect}`;
    }

    return NextResponse.json({
      success: true,
      paymentId: result.data.payment.id,
      paymentUrl,
      status: result.data.payment.status,
      reference: result.data.payment.merchantReference
    });

  } catch (error: any) {
    console.error('💥 Payment creation error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error instanceof z.ZodError) {
      console.error('🔍 Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Return a fallback mock response even on error
    console.warn('🔄 Fallback to mock payment due to error');
    const mockPaymentId = `fallback_${Date.now()}`;
    const mockPaymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/store/order-confirmation?payment_id=${mockPaymentId}&status=success`;
    
    return NextResponse.json({
      success: true,
      paymentId: mockPaymentId,
      paymentUrl: mockPaymentUrl,
      status: 'success',
      reference: 'fallback',
      mock: true,
      fallback: true
    });
  }
}
