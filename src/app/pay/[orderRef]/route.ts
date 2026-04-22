import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPayFastClient } from '@/lib/payfast'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderRef: string } }
) {
  try {
    const rawOrderRef = decodeURIComponent(String(params.orderRef || ''))
    const orderRef = rawOrderRef.trim().replace(/[^A-Za-z0-9-]/g, '')

    const primaryLookup = await supabase
      .from('orders')
      .select('id, order_reference, customer_name, customer_email, customer_phone, total')
      .eq('order_reference', orderRef)
      .single()

    let order = primaryLookup.data
    let orderError = primaryLookup.error

    if (!order && orderRef && orderRef !== orderRef.toUpperCase()) {
      const uppercaseLookup = await supabase
        .from('orders')
        .select('id, order_reference, customer_name, customer_email, customer_phone, total')
        .eq('order_reference', orderRef.toUpperCase())
        .single()

      order = uppercaseLookup.data
      orderError = uppercaseLookup.error
    }

    if (!order && orderError && String((orderError as any).code || '') === 'PGRST116') {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    if (!order) {
      console.error('[Pay Redirect] Order lookup failed:', orderError)
      return NextResponse.json({ success: false, error: 'Failed to load order' }, { status: 500 })
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('product_name, quantity')
      .eq('order_id', order.id)

    const payfast = getPayFastClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://intandokaziherbal.co.za'

    const nameParts = (order.customer_name || '').trim().split(/\s+/)
    const paymentData = payfast.createPayment({
      return_url: `${siteUrl}/store/order-success?ref=${order.order_reference}`,
      cancel_url: `${siteUrl}/store/order-cancelled?ref=${order.order_reference}`,
      notify_url: `${siteUrl}/api/payments/payfast/notify`,
      name_first: nameParts[0] || order.customer_name || 'Customer',
      name_last: nameParts.slice(1).join(' '),
      email_address: order.customer_email || `${order.customer_phone || 'unknown'}@agent.local`,
      cell_number: (order.customer_phone || '').replace(/^27/, '0'),
      m_payment_id: order.order_reference,
      amount: Number(order.total || 0).toFixed(2),
      item_name: `Intandokazi Order ${order.order_reference}`,
      item_description: (items || [])
        .map((i: any) => `${i.quantity || 1}x ${i.product_name}`)
        .join(', ')
        .substring(0, 255)
    })

    const query = new URLSearchParams()
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        query.append(key, String(value))
      }
    })

    const longUrl = `${payfast.getPaymentUrl()}?${query.toString()}`
    return NextResponse.redirect(longUrl, 302)
  } catch (error: any) {
    console.error('[Pay Redirect] Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to build payment link' }, { status: 500 })
  }
}
