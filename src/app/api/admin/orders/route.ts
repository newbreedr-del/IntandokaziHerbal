import { createServiceClient } from '@/utils/supabase/service';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

function isAdmin(session: any) {
  const role = session?.user?.role;
  return ['admin', 'super_admin'].includes(role);
}

// GET - Fetch all orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin(session)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('orders')
      .select(`*, order_items (*, products (name, image_url))`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') query = query.eq('order_status', status);
    if (paymentStatus && paymentStatus !== 'all') query = query.eq('payment_status', paymentStatus);
    if (search) query = query.or(`order_number.ilike.%${search}%,customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`);

    const { data: orders, error } = await query;
    if (error) return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });

    const { count: totalCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

    return NextResponse.json({ orders, pagination: { total: totalCount || 0, limit, offset, hasMore: (offset + limit) < (totalCount || 0) } });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update order
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin(session)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    const supabase = createServiceClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    const { data: oldOrder } = await supabase.from('orders').select('*').eq('id', id).single();

    const { data: order, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    try {
      await supabase.from('activity_log').insert({
        user_email: session.user.email,
        action: 'update_order',
        entity_type: 'order',
        entity_id: order.id,
        old_values: oldOrder,
        new_values: order,
      });
    } catch {}

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Orders PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin(session)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    const supabase = createServiceClient();
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Orders DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
