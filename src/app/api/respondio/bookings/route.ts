import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch bookings for Respond.io agents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'confirmed';
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('consultation_bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit);

    if (status !== 'all') {
      query = query.eq('booking_status', status);
    }

    if (date) {
      query = query.eq('booking_date', date);
    } else {
      // Default to upcoming bookings
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('booking_date', today);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Format for Respond.io display
    const formattedBookings = bookings?.map(booking => ({
      id: booking.id,
      reference: booking.payment_reference,
      client: {
        name: booking.client_name,
        email: booking.client_email,
        phone: booking.client_phone,
      },
      appointment: {
        date: new Date(booking.booking_date).toLocaleDateString('en-ZA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: `${booking.start_time} - ${booking.end_time}`,
        type: booking.consultation_type,
      },
      status: booking.booking_status,
      paymentStatus: booking.payment_status,
      amount: booking.amount,
      notes: booking.client_notes,
      createdAt: booking.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      count: formattedBookings.length,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Respond.io bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create booking via Respond.io agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      bookingDate,
      startTime,
      endTime,
      consultationType,
      notes,
      agentId
    } = body;

    // Validate required fields
    if (!clientName || !clientPhone || !bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate booking reference
    const bookingReference = `BK-${Date.now().toString().slice(-8)}`;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('consultation_bookings')
      .insert({
        client_name: clientName,
        client_email: clientEmail || clientPhone,
        client_phone: clientPhone,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        consultation_type: consultationType || 'phone',
        amount: 1500,
        payment_status: 'pending',
        booking_status: 'confirmed',
        payment_reference: bookingReference,
        client_notes: notes,
        created_by_agent: agentId || 'respondio_agent'
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

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        reference: bookingReference,
        id: booking.id,
        client: clientName,
        date: bookingDate,
        time: `${startTime} - ${endTime}`,
        type: consultationType
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create booking via Respond.io error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update booking via Respond.io agent
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status, notes, reschedule } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};

    if (status) {
      updates.booking_status = status;
    }

    if (notes) {
      updates.client_notes = notes;
    }

    if (reschedule) {
      updates.booking_date = reschedule.date;
      updates.start_time = reschedule.startTime;
      updates.end_time = reschedule.endTime;
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

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking via Respond.io error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
