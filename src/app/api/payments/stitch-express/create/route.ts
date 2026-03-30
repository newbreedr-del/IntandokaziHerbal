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
    const body = await request.json();
    const validated = paymentSchema.parse(body);

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
    console.error('Payment creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
