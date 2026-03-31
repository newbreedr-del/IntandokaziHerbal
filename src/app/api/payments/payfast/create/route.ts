import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPayFastClient } from '@/lib/payfast';

const paymentSchema = z.object({
  amount: z.number().min(5),
  reference: z.string(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  itemName: z.string(),
  itemDescription: z.string().optional(),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = paymentSchema.parse(body);

    const payfast = getPayFastClient();

    // Validate amount
    if (!payfast.validateAmount(validated.amount)) {
      return NextResponse.json(
        { error: 'Amount must be at least R5' },
        { status: 400 }
      );
    }

    // Get base URL from environment or request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Split customer name into first and last
    const nameParts = validated.customerName?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create payment data
    const paymentData = payfast.createPayment({
      return_url: validated.returnUrl || `${baseUrl}/store/order-confirmation`,
      cancel_url: validated.cancelUrl || `${baseUrl}/store/checkout`,
      notify_url: `${baseUrl}/api/payments/payfast/webhook`,
      name_first: firstName,
      name_last: lastName,
      email_address: validated.customerEmail,
      cell_number: validated.customerPhone,
      m_payment_id: validated.reference,
      amount: validated.amount.toFixed(2),
      item_name: validated.itemName,
      item_description: validated.itemDescription,
      email_confirmation: '1',
      confirmation_address: validated.customerEmail,
    });

    // Return payment data for form submission
    return NextResponse.json({
      success: true,
      paymentId: validated.reference,
      paymentUrl: payfast.getPaymentUrl(),
      paymentData,
    });

  } catch (error: any) {
    console.error('PayFast payment creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment', message: error.message },
      { status: 500 }
    );
  }
}
