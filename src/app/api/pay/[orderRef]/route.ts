import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPayFastClient } from '@/lib/payfast'

/**
 * /api/pay/[orderRef]/route.ts
 * ─────────────────────────────────────────────────────────────────
 * Looks up an order by reference and returns the full PayFast URL.
 * Called by the /pay/[orderRef] page to redirect customers to payment.
 *
 * Place this file at: src/app/api/pay/[orderRef]/route.ts
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { orderRef: string } }
) {
  const { orderRef } = params

  if (!orderRef) {
    return NextResponse.json({ success: false, error: 'Missing order reference' }, { status: 400 })
  }

  try {
    // Fetch the order — try order_reference column first, then id
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_reference,
        customer_name,
        customer_email,
        customer_phone,
        total,
        payment_status,
        order_status,
        order_items (
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq('order_reference', orderRef)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: `Order ${orderRef} not found` },
        { status: 404 }
      )
    }

    // If already paid, return early with a friendly flag
    if (order.payment_status === 'paid' || order.payment_status === 'complete') {
      return NextResponse.json({
        success: false,
        already_paid: true,
        error: 'This order has already been paid'
      })
    }

    // Build PayFast payment URL
    if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    const payfast = getPayFastClient()
    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://intandokaziherbal.co.za'
    ).replace(/\/$/, '')

    const itemNames = (order.order_items || [])
      .map((i: any) => `${i.quantity}x ${i.product_name}`)
      .join(', ')
      .substring(0, 255) || `Order ${orderRef}`

    const paymentData = payfast.createPayment({
      return_url: `${siteUrl}/store/order-success?ref=${orderRef}`,
      cancel_url:  `${siteUrl}/store/order-cancelled?ref=${orderRef}`,
      notify_url:  `${siteUrl}/api/payments/payfast/notify`,
      name_first:  order.customer_name?.split(' ')[0] || order.customer_name || 'Customer',
      name_last:   order.customer_name?.split(' ').slice(1).join(' ') || '',
      ...(order.customer_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customer_email) ? { email_address: order.customer_email } : {}),
      cell_number: (order.customer_phone || '').replace(/^27/, '0').replace(/\D/g, ''),
      m_payment_id: orderRef,
      amount: Number(order.total).toFixed(2),
      item_name: `Intandokazi Order ${orderRef}`,
      item_description: itemNames
    })

    // Build the full PayFast URL with all params
    const queryParams = new URLSearchParams()
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        queryParams.append(key, String(value))
      }
    })

    const paymentUrl = `${payfast.getPaymentUrl()}?${queryParams.toString()}`

    return NextResponse.json({
      success: true,
      order_ref: orderRef,
      total: Number(order.total).toFixed(2),
      payment_url: paymentUrl
    })

  } catch (err: any) {
    console.error('[Pay Route] Error:', err.message)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
