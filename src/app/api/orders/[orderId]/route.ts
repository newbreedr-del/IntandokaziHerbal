import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  if (!orderId) return NextResponse.json({ success: false, error: 'Missing ref' }, { status: 400 })

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_reference, customer_name, customer_phone, pep_store_name, total, payment_status, order_status')
    .eq('order_reference', orderId)
    .single()

  if (error || !order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, order })
}
