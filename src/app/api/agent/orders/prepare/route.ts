import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'
import crypto from 'crypto'

function generateSignature(data: Record<string, string>, passphrase?: string): string {
  const str = Object.entries(data)
    .filter(([_, v]) => v !== '' && v != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
    .join('&')
  const final = passphrase
    ? str + '&passphrase=' + encodeURIComponent(passphrase)
    : str
  return crypto.createHash('md5').update(final).digest('hex')
}

function randomOrderRef(): string {
  return 'ORD-' + crypto.randomUUID().slice(0, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    // Verify agent API secret
    const apiSecret = request.headers.get('x-agent-secret')
    if (apiSecret !== process.env.AGENT_API_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      contactName,
      contactPhone,
      contactEmail,
      deliveryAddress,
      items,
      totalAmount,
      conversationId,
      contactId,
      channel,
      agentId
    } = body

    // Validate required fields
    if (!contactName || !contactPhone || !items || !totalAmount || !deliveryAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: contactName, contactPhone, items, totalAmount, deliveryAddress' 
      }, { status: 400 })
    }

    // Generate unique order reference
    const orderRef = randomOrderRef()
    
    // Calculate expiry time
    const expiryMinutes = 30 // TODO: Get from agent settings
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

    // Save order to database with status "awaiting_payment"
    const supabase = createServiceClient()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_ref: orderRef,
        conversation_id: conversationId,
        contact_id: contactId,
        agent_id: agentId,
        contact_name: contactName,
        contact_email: contactEmail || `${contactPhone}@placeholder.com`, // PayFast requires email
        contact_phone: contactPhone,
        delivery_address: deliveryAddress,
        items: items,
        total_amount: totalAmount,
        currency: 'ZAR',
        status: 'awaiting_payment',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (orderError) {
      console.error('[Agent Orders] Failed to create order:', orderError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create order: ' + orderError.message 
      }, { status: 500 })
    }

    console.log(`[Agent Orders] Created order ${orderRef} for ${contactName}`)

    // Build PayFast payment data
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://intandokaziherbal.co.za'
    const isSandbox = process.env.PAYFAST_ENVIRONMENT === 'sandbox'

    const pfData: Record<string, string> = {
      merchant_id:  process.env.PAYFAST_MERCHANT_ID || '',
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || '',
      return_url:   `${siteUrl}/order/success?orderId=${orderRef}`,
      cancel_url:   `${siteUrl}/order/cancelled?orderId=${orderRef}`,
      notify_url:   `${siteUrl}/api/payfast/notify`,
      name_first:   contactName.split(' ')[0],
      name_last:    contactName.split(' ').slice(1).join(' ') || '-',
      email_address: contactEmail || `${contactPhone.replace(/\D/g, '')}@placeholder.com`,
      cell_number:  contactPhone.replace(/\D/g, ''),
      m_payment_id: orderRef,
      amount:       totalAmount.toFixed(2),
      item_name:    `Order ${orderRef}`,
      item_description: items.map((i: any) => `${i.qty}x ${i.productName}`).join(', ').substring(0, 255),
      custom_str1:  conversationId || '',
      custom_str2:  contactId || '',
      custom_str3:  channel || 'whatsapp'
    }

    pfData.signature = generateSignature(pfData, process.env.PAYFAST_PASSPHRASE)

    const baseUrl = isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process'
    const paymentUrl = baseUrl + '?' + new URLSearchParams(pfData).toString()

    console.log(`[Agent Orders] Payment URL generated for ${orderRef}`)
    console.log(`[Agent Orders] Expires at: ${expiresAt.toISOString()}`)

    return NextResponse.json({
      success: true,
      orderId: orderRef,
      paymentUrl: paymentUrl,
      totalAmount: totalAmount,
      expiresAt: expiresAt.toISOString(),
      order: order
    })

  } catch (error: any) {
    console.error('[Agent Orders] Error preparing order:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
