import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendBookingNotification, sendAdminAlert } from '@/lib/notifications';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - PayFast IPN (Instant Payment Notification)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: any = {};
    
    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log('PayFast IPN received:', data);

    // Verify PayFast signature
    const isValid = verifyPayFastSignature(data);
    
    if (!isValid) {
      console.error('Invalid PayFast signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Extract payment details
    const paymentReference = data.m_payment_id;
    const paymentStatus = data.payment_status;
    const transactionId = data.pf_payment_id;
    const amount = parseFloat(data.amount_gross);

    // Map PayFast status to our status
    let status = 'pending';
    if (paymentStatus === 'COMPLETE') {
      status = 'paid';
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      status = 'failed';
    }

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('booking_payments')
      .update({
        payment_status: status,
        gateway_transaction_id: transactionId,
        gateway_response: data,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        receipt_number: status === 'paid' ? `RCP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}` : null
      })
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

    // Update booking
    if (payment) {
      await supabase
        .from('consultation_bookings')
        .update({
          payment_status: status,
          payment_reference: paymentReference
        })
        .eq('id', payment.booking_id);

      // Send notifications if payment successful
      if (status === 'paid') {
        await sendPaymentNotifications(payment.booking_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayFast IPN error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify PayFast signature
function verifyPayFastSignature(data: any): boolean {
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const signature = data.signature;
  
  // Remove signature from data
  const dataToVerify = { ...data };
  delete dataToVerify.signature;

  // Create parameter string
  let pfParamString = '';
  for (let key in dataToVerify) {
    if (dataToVerify.hasOwnProperty(key)) {
      pfParamString += `${key}=${encodeURIComponent(dataToVerify[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  }

  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);
  
  if (passphrase) {
    pfParamString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  const generatedSignature = crypto.createHash('md5').update(pfParamString).digest('hex');

  return generatedSignature === signature;
}

// Send payment notifications
async function sendPaymentNotifications(bookingId: string) {
  try {
    const { data: booking } = await supabase
      .from('consultation_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (!booking) return;

    // Client notification
    await supabase
      .from('booking_notifications')
      .insert({
        booking_id: bookingId,
        notification_type: 'payment_receipt',
        recipient_type: 'client',
        recipient_email: booking.client_email,
        recipient_phone: booking.client_phone,
        subject: 'Payment Confirmed - Consultation Booking',
        message: `Your payment of R${booking.amount} has been received. Your consultation is confirmed for ${booking.booking_date} at ${booking.start_time}.`,
        status: 'pending'
      });

    // Admin notification
    await supabase
      .from('booking_notifications')
      .insert({
        booking_id: bookingId,
        notification_type: 'admin_alert',
        recipient_type: 'admin',
        recipient_email: 'nthandokazi@intandokaziherbal.co.za',
        recipient_phone: '27768435876',
        subject: 'Payment Received',
        message: `Payment of R${booking.amount} received from ${booking.client_name} for ${booking.booking_date} at ${booking.start_time}.`,
        status: 'pending'
      });

    // Send notifications
    try {
      await sendBookingNotification({
        type: 'booking_confirmed',
        customerName: booking.client_name,
        customerPhone: booking.client_phone,
        customerEmail: booking.client_email,
        bookingDate: new Date(booking.booking_date).toLocaleDateString('en-ZA', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        bookingTime: `${booking.start_time} - ${booking.end_time}`,
        consultationType: booking.consultation_type,
        bookingReference: booking.payment_reference || '',
        amount: booking.amount
      });

      await sendAdminAlert({
        type: 'payment_received',
        reference: booking.payment_reference || '',
        customerName: booking.client_name,
        amount: booking.amount,
        details: `Booking confirmed for ${booking.booking_date} at ${booking.start_time}`
      });
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }

    console.log('Payment notifications created for booking:', bookingId);
  } catch (error) {
    console.error('Error sending payment notifications:', error);
  }
}
