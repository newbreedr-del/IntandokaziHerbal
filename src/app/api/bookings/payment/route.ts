import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Initialize payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, paymentMethod = 'payfast' } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('consultation_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Fetch or create payment record
    let { data: payment, error: paymentError } = await supabase
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (paymentError || !payment) {
      // Create payment record if it doesn't exist
      const paymentReference = `BK-${bookingId.substring(0, 8).toUpperCase()}-${Date.now()}`;
      
      const { data: newPayment, error: createError } = await supabase
        .from('booking_payments')
        .insert({
          booking_id: bookingId,
          amount: booking.amount,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_status: 'pending',
          payment_gateway: paymentMethod
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating payment:', createError);
        return NextResponse.json(
          { error: 'Failed to create payment' },
          { status: 500 }
        );
      }

      payment = newPayment;
    }

    // Generate PayFast payment data
    if (paymentMethod === 'payfast') {
      const payfastData = generatePayFastData(booking, payment);
      
      return NextResponse.json({
        payment,
        paymentGateway: 'payfast',
        paymentData: payfastData,
        paymentUrl: process.env.PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process'
      });
    }

    return NextResponse.json({
      payment,
      message: 'Payment initialized'
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update payment status (webhook/callback)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentReference,
      status,
      transactionId,
      gatewayResponse
    } = body;

    if (!paymentReference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Update payment record
    const updates: any = {
      payment_status: status,
      gateway_transaction_id: transactionId,
      gateway_response: gatewayResponse
    };

    if (status === 'paid') {
      updates.paid_at = new Date().toISOString();
      
      // Generate receipt number
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      updates.receipt_number = receiptNumber;
    }

    const { data: payment, error: paymentError } = await supabase
      .from('booking_payments')
      .update(updates)
      .eq('payment_reference', paymentReference)
      .select()
      .single();

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // Update booking payment status
    if (payment) {
      await supabase
        .from('consultation_bookings')
        .update({
          payment_status: status,
          payment_reference: paymentReference
        })
        .eq('id', payment.booking_id);

      // If payment successful, send notifications
      if (status === 'paid') {
        await sendPaymentConfirmation(payment.booking_id);
      }
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate PayFast payment data
function generatePayFastData(booking: any, payment: any) {
  const merchantId = process.env.PAYFAST_MERCHANT_ID || '10000100';
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';

  const data: any = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?ref=${payment.payment_reference}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel?ref=${payment.payment_reference}`,
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/payment/notify`,
    
    // Buyer details
    name_first: booking.client_name.split(' ')[0],
    name_last: booking.client_name.split(' ').slice(1).join(' ') || booking.client_name.split(' ')[0],
    email_address: booking.client_email,
    cell_number: booking.client_phone,
    
    // Transaction details
    m_payment_id: payment.payment_reference,
    amount: booking.amount.toFixed(2),
    item_name: `Consultation Booking - ${booking.booking_date}`,
    item_description: `${booking.duration_minutes || 60} minute ${booking.consultation_type} consultation`,
    
    // Custom fields
    custom_str1: booking.id,
    custom_str2: payment.id
  };

  // Generate signature
  if (passphrase) {
    const signature = generateSignature(data, passphrase);
    data.signature = signature;
  }

  return data;
}

// Generate PayFast signature
function generateSignature(data: any, passphrase: string = '') {
  // Create parameter string
  let pfOutput = '';
  for (let key in data) {
    if (data.hasOwnProperty(key) && key !== 'signature') {
      pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  }

  // Remove last ampersand
  pfOutput = pfOutput.slice(0, -1);
  
  if (passphrase) {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(pfOutput).digest('hex');
}

// Helper function to send payment confirmation
async function sendPaymentConfirmation(bookingId: string) {
  try {
    // Fetch booking details
    const { data: booking } = await supabase
      .from('consultation_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (!booking) return;

    // Create notification for client
    await supabase
      .from('booking_notifications')
      .insert({
        booking_id: bookingId,
        notification_type: 'payment_receipt',
        recipient_type: 'client',
        recipient_email: booking.client_email,
        recipient_phone: booking.client_phone,
        subject: 'Payment Confirmation - Consultation Booking',
        message: `Thank you for your payment! Your consultation is confirmed for ${booking.booking_date} at ${booking.start_time}.`,
        status: 'pending'
      });

    // Create notification for admin
    await supabase
      .from('booking_notifications')
      .insert({
        booking_id: bookingId,
        notification_type: 'admin_alert',
        recipient_type: 'admin',
        recipient_email: 'nthandokazi@intandokaziherbal.co.za',
        recipient_phone: '27768435876',
        subject: 'Payment Received - Consultation Booking',
        message: `Payment received from ${booking.client_name} for consultation on ${booking.booking_date} at ${booking.start_time}.`,
        status: 'pending'
      });

    console.log('Payment confirmation notifications created');
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
  }
}
