import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyAgentSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-agent-secret');
  return secret === process.env.AGENT_API_SECRET;
}

// GET /api/agent/bookings?phone=27...  — Check bookings for a customer
export async function GET(request: NextRequest) {
  if (!verifyAgentSecret(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const bookingRef = searchParams.get('ref');
    const status = searchParams.get('status');

    if (!phone && !bookingRef) {
      return NextResponse.json(
        { success: false, error: 'phone or ref parameter is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('consultation_bookings')
      .select('id, client_name, client_email, client_phone, booking_date, start_time, end_time, consultation_type, amount, payment_status, booking_status, client_notes, created_at, booking_payments(payment_reference, payment_status)')
      .order('booking_date', { ascending: true });

    if (phone) {
      // Normalize phone — match with or without country code
      const normalizedPhone = phone.replace(/^0/, '27').replace(/^\+/, '');
      query = query.or(`client_phone.eq.${phone},client_phone.eq.${normalizedPhone},client_phone.eq.0${normalizedPhone.substring(2)},client_phone.eq.+${normalizedPhone}`);
    }

    if (bookingRef) {
      // Search in booking_payments by reference
      query = supabase
        .from('consultation_bookings')
        .select('id, client_name, client_email, client_phone, booking_date, start_time, end_time, consultation_type, amount, payment_status, booking_status, client_notes, created_at, booking_payments!inner(payment_reference, payment_status)')
        .ilike('booking_payments.payment_reference', `%${bookingRef}%`);
    }

    if (status) {
      query = query.eq('booking_status', status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('[Agent Bookings] Error:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookings: (bookings || []).map((b: any) => ({
        id: b.id,
        client_name: b.client_name,
        client_phone: b.client_phone,
        date: b.booking_date,
        time: `${b.start_time} - ${b.end_time}`,
        type: b.consultation_type,
        amount: b.amount,
        payment_status: b.payment_status,
        booking_status: b.booking_status,
        notes: b.client_notes,
        reference: b.booking_payments?.[0]?.payment_reference || null,
        created_at: b.created_at
      })),
      count: bookings?.length || 0
    });
  } catch (error: any) {
    console.error('[Agent Bookings] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/agent/bookings — Create a new booking from agent
export async function POST(request: NextRequest) {
  if (!verifyAgentSecret(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      client_name,
      client_email,
      client_phone,
      client_notes,
      booking_date,
      start_time,
      end_time,
      consultation_type = 'video',
      slot_id
    } = body;

    // Validate required fields
    if (!client_name || !client_phone || !booking_date || !start_time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: client_name, client_phone, booking_date, start_time' },
        { status: 400 }
      );
    }

    // Default end_time to 1 hour after start if not provided
    const finalEndTime = end_time || calculateEndTime(start_time, 60);

    // If slot_id provided, verify it's available
    if (slot_id) {
      const { data: slot, error: slotError } = await supabase
        .from('available_slots')
        .select('*')
        .eq('id', slot_id)
        .single();

      if (slotError || !slot) {
        return NextResponse.json({ success: false, error: 'Slot not found' }, { status: 404 });
      }

      if (!slot.is_available || slot.current_bookings >= slot.max_bookings) {
        return NextResponse.json({ success: false, error: 'Slot is no longer available' }, { status: 409 });
      }

      // Increment slot bookings
      await supabase
        .from('available_slots')
        .update({
          current_bookings: slot.current_bookings + 1,
          is_available: (slot.current_bookings + 1) < slot.max_bookings
        })
        .eq('id', slot_id);
    }

    const amount = 150.00; // Default consultation fee

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('consultation_bookings')
      .insert({
        slot_id: slot_id || null,
        client_name,
        client_email: client_email || `${client_phone}@agent.local`,
        client_phone,
        client_notes: client_notes || 'Booked via WhatsApp agent',
        booking_date,
        start_time,
        end_time: finalEndTime,
        consultation_type,
        amount,
        payment_status: 'pending',
        booking_status: 'confirmed'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('[Agent Bookings] Error creating booking:', bookingError);
      return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
    }

    // Create payment record
    const paymentRef = `BK-${booking.id.substring(0, 8).toUpperCase()}-${Date.now()}`;
    
    await supabase
      .from('booking_payments')
      .insert({
        booking_id: booking.id,
        amount,
        payment_method: 'pending',
        payment_reference: paymentRef,
        payment_status: 'pending'
      });

    console.log(`[Agent Bookings] Booking ${paymentRef} created for ${client_name} on ${booking_date} at ${start_time}`);

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        reference: paymentRef,
        client_name,
        date: booking_date,
        time: `${start_time} - ${finalEndTime}`,
        type: consultation_type,
        amount,
        status: 'confirmed',
        payment_status: 'pending'
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Agent Bookings] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}
