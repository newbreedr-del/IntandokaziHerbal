import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_ref', params.orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order: order
    })

  } catch (error: any) {
    console.error('[Orders API] Error fetching order:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
