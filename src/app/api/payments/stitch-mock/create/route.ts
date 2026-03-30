import { NextRequest, NextResponse } from 'next/server';
import { getMockStitchClient } from '@/lib/stitch-mock';
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

    console.log('🎭 MOCK MODE: Creating mock payment...');

    const mockStitch = getMockStitchClient();

    const result = await mockStitch.createPaymentLink({
      amount: validated.amount,
      reference: validated.reference,
      customerEmail: validated.customerEmail || '',
      customerName: validated.customerName || '',
      customerPhone: validated.customerPhone,
      description: validated.description || '',
      redirectUrl: validated.redirectUrl
    });

    console.log('✅ Mock payment created:', result.paymentId);

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      paymentUrl: result.paymentUrl,
      status: result.status,
      reference: result.reference,
      _mock: true
    });

  } catch (error: any) {
    console.error('Mock payment creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create mock payment' },
      { status: 500 }
    );
  }
}
