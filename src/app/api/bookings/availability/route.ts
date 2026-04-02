import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      );
    }

    // Query available slots
    let query = supabase
      .from('available_slots')
      .select('*')
      .eq('is_available', true)
      .gte('date', startDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: slots, error } = await query;

    if (error) {
      console.error('Error fetching available slots:', error);
      return NextResponse.json(
        { error: 'Failed to fetch available slots' },
        { status: 500 }
      );
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, maxBookings = 1 } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, start time, and end time are required' },
        { status: 400 }
      );
    }

    // Create new available slot
    const { data: slot, error } = await supabase
      .from('available_slots')
      .insert({
        date,
        start_time: startTime,
        end_time: endTime,
        max_bookings: maxBookings,
        is_available: true,
        current_bookings: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating slot:', error);
      return NextResponse.json(
        { error: 'Failed to create slot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    console.error('Create slot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
