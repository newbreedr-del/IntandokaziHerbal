import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'
import { notifyDispatchTeam } from '@/lib/dispatch-notifications'
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

// PayFast valid IPs
const PAYFAST_IPS = [
  '197.97.145.144', '197.97.145.145', '197.97.145.146', '197.97.145.147',
  '41.74.179.192', '41.74.179.193', '41.74.179.194', '41.74.179.195'
]

// Sandbox IPs
const SANDBOX_IPS = ['127.0.0.1', '::1', 'localhost']

export async function POST(request: NextRequest) {
  try {
    console.log('[PayFast ITN] Received notification')

    // Get client IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0].trim() || realIp || 'unknown'
    
    console.log('[PayFast ITN] Client IP:', clientIp)

    // Verify IP (skip in sandbox mode)
    const isSandbox = process.env.PAYFAST_ENVIRONMENT === 'sandbox'
    if (!isSandbox && !PAYFAST_IPS.includes(clientIp)) {
      console.error('[PayFast ITN] Invalid IP address:', clientIp)
      return NextResponse.json({ error: 'Invalid IP' }, { status: 403 })
    }

    // Parse body as text (PayFast sends URL-encoded form data)
    const body = await request.text()
    const params = new URLSearchParams(body)
    const data: Record<string, string> = Object.fromEntries(params.entries())

    console.log('[PayFast ITN] Data received:', {
      m_payment_id: data.m_payment_id,
      payment_status: data.payment_status,
      amount_gross: data.amount_gross
    })

    // CHECK 1: Verify signature
    const { signature, ...rest } = data
    const expectedSig = generateSignature(rest, process.env.PAYFAST_PASSPHRASE)
    if (signature !== expectedSig) {
      console.error('[PayFast ITN] Signature mismatch. Got:', signature, 'Expected:', expectedSig)
      return new Response('', { status: 400 })
    }

    console.log('[PayFast ITN] Signature verified')

    // Get order from database
    const supabase = createServiceClient()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_ref', data.m_payment_id)
      .single()

    if (orderError || !order) {
      console.error('[PayFast ITN] Order not found:', data.m_payment_id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('[PayFast ITN] Order found:', order.order_ref)

    // Idempotency — if already paid, return 200 silently
    if (order.status === 'paid') {
      console.log('[PayFast ITN] Order already processed:', order.order_ref)
      return new Response('', { status: 200 })
    }

    // CHECK 2: Verify amount
    const expectedAmount = parseFloat(order.total_amount)
    const receivedAmount = parseFloat(data.amount_gross)
    
    if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
      console.error('[PayFast ITN] Amount mismatch:', { expected: expectedAmount, received: receivedAmount })
      return new Response('', { status: 400 })
    }

    console.log('[PayFast ITN] Amount verified')

    // CHECK 3: Payment status
    const paymentStatus = data.payment_status
    let orderStatus = 'awaiting_payment'
    
    if (paymentStatus === 'COMPLETE') {
      orderStatus = 'paid'
    } else if (paymentStatus === 'FAILED') {
      orderStatus = 'failed'
    } else if (paymentStatus === 'CANCELLED') {
      orderStatus = 'cancelled'
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_id: data.pf_payment_id,
        payment_status: paymentStatus,
        payfast_signature: data.signature,
        paid_at: paymentStatus === 'COMPLETE' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('order_ref', data.m_payment_id)

    if (updateError) {
      console.error('[PayFast ITN] Failed to update order:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    console.log(`[PayFast ITN] Order ${order.order_ref} updated to status: ${orderStatus}`)

    // If payment successful, send notifications
    if (paymentStatus === 'COMPLETE') {
      // Send dispatch notification via WhatsApp (Evolution API)
      try {
        await notifyDispatchTeam(order)
        console.log('[PayFast ITN] Dispatch team notified via WhatsApp for order', order.order_ref)
      } catch (dispatchError: any) {
        console.error('[PayFast ITN] Failed to notify dispatch team:', dispatchError.message)
      }

      // Notify engagement platform agent
      try {
        const agentWebhookUrl = process.env.AGENT_WEBHOOK_URL
        if (agentWebhookUrl) {
          const webhookResponse = await fetch(agentWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-agent-secret': process.env.AGENT_API_SECRET || ''
            },
            body: JSON.stringify({
              event: 'payment_confirmed',
              orderId: order.order_ref,
              conversationId: order.conversation_id,
              contactId: order.contact_id,
              contactName: order.contact_name,
              totalAmount: order.total_amount,
              paymentStatus: 'COMPLETE',
              items: order.items,
              deliveryAddress: order.delivery_address
            })
          })

          if (!webhookResponse.ok) {
            console.error('[PayFast ITN] Failed to notify agent platform:', await webhookResponse.text())
          } else {
            console.log('[PayFast ITN] Agent platform notified successfully')
          }
        }
      } catch (webhookError: any) {
        console.error('[PayFast ITN] Error notifying agent platform:', webhookError.message)
      }
    } else {
      // Notify agent of failed/cancelled payment
      try {
        const agentWebhookUrl = process.env.AGENT_WEBHOOK_URL
        if (agentWebhookUrl) {
          await fetch(agentWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-agent-secret': process.env.AGENT_API_SECRET || ''
            },
            body: JSON.stringify({
              event: 'payment_failed',
              orderId: order.order_ref,
              conversationId: order.conversation_id,
              contactId: order.contact_id,
              contactName: order.contact_name,
              totalAmount: order.total_amount,
              paymentStatus: paymentStatus,
              items: order.items,
              deliveryAddress: order.delivery_address
            })
          })
        }
      } catch (error) {
        console.error('[PayFast ITN] Error notifying agent of failure:', error)
      }
    }

    // Always return 200 — PayFast retries up to 5x without it
    return new Response('', { status: 200 })

  } catch (error: any) {
    console.error('[PayFast ITN] Error processing notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
