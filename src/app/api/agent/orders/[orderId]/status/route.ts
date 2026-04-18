import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  // Validate agent secret
  const secret = request.headers.get('x-agent-secret')
  if (secret !== process.env.AGENT_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('order_ref, status, created_at, dispatched_at, tracking_number, courier')
      .eq('order_ref', params.orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      orderId: order.order_ref,
      status: order.status,
      placedAt: order.created_at,
      dispatchedAt: order.dispatched_at,
      trackingNumber: order.tracking_number,
      courier: order.courier
    })

  } catch (error: any) {
    console.error('[Agent Order Status] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
