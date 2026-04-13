import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch EFT confirmations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    let query = supabase
      .from('eft_confirmations')
      .select('*, customers(*)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: confirmations, error } = await query;

    if (error) {
      console.error('Error fetching EFT confirmations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch EFT confirmations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ confirmations });
  } catch (error) {
    console.error('Fetch EFT confirmations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create EFT confirmation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      orderReference,
      amount,
      paymentReference,
      bankName,
      accountHolder,
      paymentDate,
      proofOfPaymentUrl,
      notes
    } = body;

    if (!customerName || !customerPhone || !amount || !paymentReference || !paymentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to find existing customer by phone
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customerPhone)
      .single();

    const { data: confirmation, error } = await supabase
      .from('eft_confirmations')
      .insert({
        customer_id: existingCustomer?.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        order_reference: orderReference,
        amount,
        payment_reference: paymentReference,
        bank_name: bankName,
        account_holder: accountHolder,
        payment_date: paymentDate,
        proof_of_payment_url: proofOfPaymentUrl,
        notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating EFT confirmation:', error);
      return NextResponse.json(
        { error: 'Failed to create EFT confirmation', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ confirmation }, { status: 201 });
  } catch (error) {
    console.error('Create EFT confirmation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update EFT confirmation (verify/reject)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirmationId, status, verifiedBy, notes, orderReference } = body;

    if (!confirmationId || !status) {
      return NextResponse.json(
        { error: 'Confirmation ID and status are required' },
        { status: 400 }
      );
    }

    const updates: any = {
      status,
      notes
    };

    if (status === 'verified') {
      updates.verified_by = verifiedBy;
      updates.verified_at = new Date().toISOString();

      // If order reference provided, update the order payment status
      if (orderReference) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_method: 'eft',
            order_status: 'confirmed'
          })
          .eq('order_reference', orderReference);
      }
    }

    const { data: confirmation, error } = await supabase
      .from('eft_confirmations')
      .update(updates)
      .eq('id', confirmationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating EFT confirmation:', error);
      return NextResponse.json(
        { error: 'Failed to update EFT confirmation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ confirmation });
  } catch (error) {
    console.error('Update EFT confirmation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
