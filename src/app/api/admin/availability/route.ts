import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('available_slots')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data: slots, error } = await query;

    if (error) {
      console.error('Error fetching slots:', error);
      return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }

    return NextResponse.json({ slots: slots || [] });
  } catch (error) {
    console.error('Admin availability GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, slots } = body;

    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { error: 'Date and slots array are required' },
        { status: 400 }
      );
    }

    const records = slots.map((slot: { start_time: string; end_time: string }) => ({
      date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: true,
      max_bookings: 1,
      current_bookings: 0,
    }));

    const { data, error } = await supabase
      .from('available_slots')
      .upsert(records, { onConflict: 'date,start_time' })
      .select();

    if (error) {
      console.error('Error creating slots:', error);
      return NextResponse.json({ error: 'Failed to create slots' }, { status: 500 });
    }

    return NextResponse.json({ slots: data }, { status: 201 });
  } catch (error) {
    console.error('Admin availability POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const date = searchParams.get('date');

    if (id) {
      const { error } = await supabase
        .from('available_slots')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting slot:', error);
        return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (date) {
      const { error } = await supabase
        .from('available_slots')
        .delete()
        .eq('date', date);

      if (error) {
        console.error('Error deleting slots for date:', error);
        return NextResponse.json({ error: 'Failed to delete slots' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'id or date parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Admin availability DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
