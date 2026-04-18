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

// GET /api/agent/bookings/availability?days=7 — Check available consultation slots
export async function GET(request: NextRequest) {
  if (!verifyAgentSecret(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];

    // Calculate end date
    const end = new Date(startDate);
    end.setDate(end.getDate() + days);
    const endDate = searchParams.get('endDate') || end.toISOString().split('T')[0];

    const { data: slots, error } = await supabase
      .from('available_slots')
      .select('id, date, start_time, end_time, max_bookings, current_bookings, is_available')
      .eq('is_available', true)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('[Agent Availability] Error:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch availability' }, { status: 500 });
    }

    // Filter to only slots with remaining capacity
    const availableSlots = (slots || []).filter(s => s.current_bookings < s.max_bookings);

    // Group by date for easier consumption
    const grouped: Record<string, Array<{ slot_id: string; time: string; start_time: string; end_time: string; spots_left: number }>> = {};
    
    for (const slot of availableSlots) {
      const dateKey = slot.date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push({
        slot_id: slot.id,
        time: `${slot.start_time} - ${slot.end_time}`,
        start_time: slot.start_time,
        end_time: slot.end_time,
        spots_left: slot.max_bookings - slot.current_bookings
      });
    }

    return NextResponse.json({
      success: true,
      availability: grouped,
      total_slots: availableSlots.length,
      date_range: { start: startDate, end: endDate }
    });
  } catch (error: any) {
    console.error('[Agent Availability] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
