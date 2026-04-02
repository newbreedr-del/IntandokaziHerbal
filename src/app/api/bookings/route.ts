import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentReference = searchParams.get('paymentReference');

    let query = supabase
      .from('consultation_bookings')
      .select('*, booking_payments(*)')
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (status) {
      query = query.eq('booking_status', status);
    }

    if (startDate) {
      query = query.gte('booking_date', startDate);
    }

    if (endDate) {
      query = query.lte('booking_date', endDate);
    }

    if (paymentReference) {
      // Join with booking_payments to find by payment reference
      query = supabase
        .from('consultation_bookings')
        .select('*, booking_payments(*)')
        .eq('booking_payments.payment_reference', paymentReference);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slotId,
      clientName,
      clientEmail,
      clientPhone,
      clientNotes,
      bookingDate,
      startTime,
      endTime,
      consultationType = 'video',
      amount = 1500.00
    } = body;

    // Validate required fields
    if (!clientName || !clientEmail || !clientPhone || !bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slot is still available
    if (slotId) {
      const { data: slot, error: slotError } = await supabase
        .from('available_slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (slotError || !slot) {
        return NextResponse.json(
          { error: 'Slot not found' },
          { status: 404 }
        );
      }

      if (!slot.is_available || slot.current_bookings >= slot.max_bookings) {
        return NextResponse.json(
          { error: 'Slot is no longer available' },
          { status: 409 }
        );
      }
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('consultation_bookings')
      .insert({
        slot_id: slotId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_notes: clientNotes,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        consultation_type: consultationType,
        amount: amount,
        payment_status: 'pending',
        booking_status: 'confirmed'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Create payment record
    const paymentReference = `BK-${booking.id.substring(0, 8).toUpperCase()}-${Date.now()}`;
    
    const { data: payment, error: paymentError } = await supabase
      .from('booking_payments')
      .insert({
        booking_id: booking.id,
        amount: amount,
        payment_method: 'pending',
        payment_reference: paymentReference,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
    }

    // Send admin notification
    await sendAdminNotification(booking);

    return NextResponse.json({
      booking,
      payment,
      paymentReference
    }, { status: 201 });
  } catch (error) {
    console.error('Create booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update booking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status, paymentStatus, paymentReference } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    
    if (status) {
      updates.booking_status = status;
      if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
    }

    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }

    if (paymentReference) {
      updates.payment_reference = paymentReference;
    }

    const { data: booking, error } = await supabase
      .from('consultation_bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Update booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Delete booking (cascade will delete related records)
    const { error } = await supabase
      .from('consultation_bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to send admin notification
async function sendAdminNotification(booking: any) {
  try {
    // Create notification record
    await supabase
      .from('booking_notifications')
      .insert({
        booking_id: booking.id,
        notification_type: 'admin_alert',
        recipient_type: 'admin',
        recipient_email: 'nthandokazi@intandokaziherbal.co.za',
        recipient_phone: '27768435876',
        subject: 'New Consultation Booking',
        message: `New booking from ${booking.client_name} for ${booking.booking_date} at ${booking.start_time}`,
        status: 'pending'
      });

    // TODO: Implement actual email/WhatsApp sending
    console.log('Admin notification created for booking:', booking.id);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}
