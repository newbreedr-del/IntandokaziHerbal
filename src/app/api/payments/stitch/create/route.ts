import { NextRequest, NextResponse } from 'next/server';
import { getStitchClient } from '@/lib/stitch';
import { z } from 'zod';

const CreatePaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('ZAR'),
  reference: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  customerPhone: z.string().optional(),
  description: z.string(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    price: z.number()
  })).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreatePaymentSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const stitchClient = getStitchClient();
    
    const paymentRequest = await stitchClient.createPaymentRequest({
      amount: validatedData.amount,
      currency: validatedData.currency,
      reference: validatedData.reference,
      customerEmail: validatedData.customerEmail,
      customerName: validatedData.customerName,
      customerPhone: validatedData.customerPhone,
      description: validatedData.description,
      successUrl: `${baseUrl}/store/order-confirmation?ref=${validatedData.reference}&status=success`,
      cancelUrl: `${baseUrl}/store/checkout?status=cancelled`,
      webhookUrl: `${baseUrl}/api/payments/stitch/webhook`
    });

    return NextResponse.json({
      success: true,
      payment: paymentRequest
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid payment data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
