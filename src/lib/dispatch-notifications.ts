/**
 * Dispatch Team WhatsApp Notifications via Evolution API
 */

interface Order {
  order_ref: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  total_amount: number
  items: Array<{
    productName: string
    qty: number
    price: number
  }>
  delivery_address: {
    street: string
    city: string
    province: string
    postalCode: string
  }
  paid_at?: string
}

export async function notifyDispatchTeam(order: Order): Promise<void> {
  const EVOLUTION_URL = process.env.EVOLUTION_API_URL
  const INSTANCE = process.env.EVOLUTION_INSTANCE_NAME
  const API_KEY = process.env.EVOLUTION_API_KEY
  const dispatchNumbers = (process.env.DISPATCH_NUMBERS || '').split(',').map(n => n.trim()).filter(Boolean)

  if (!EVOLUTION_URL || !INSTANCE || !API_KEY) {
    console.warn('[Dispatch] Evolution API not configured, skipping WhatsApp notification')
    return
  }

  if (dispatchNumbers.length === 0) {
    console.warn('[Dispatch] No dispatch numbers configured')
    return
  }

  const message = `*NEW ORDER — ${order.order_ref}* ✅
Payment confirmed

*Customer:* ${order.contact_name}
*Phone:* ${order.contact_phone}
${order.contact_email ? `*Email:* ${order.contact_email}` : ''}

*Items:*
${order.items.map(i => `• ${i.qty}x ${i.productName} — R${i.price.toFixed(2)}`).join('\n')}

*Total: R${order.total_amount.toFixed(2)}*

*Deliver to:*
${order.delivery_address.street}
${order.delivery_address.city}, ${order.delivery_address.province} ${order.delivery_address.postalCode}

*Paid at:* ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}

Reply *RECEIVED ${order.order_ref}* to confirm.`

  console.log(`[Dispatch] Sending notification to ${dispatchNumbers.length} number(s)`)

  const results = await Promise.allSettled(
    dispatchNumbers.map(async (number) => {
      const response = await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
        method: 'POST',
        headers: {
          'apikey': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: number,
          text: message,
          delay: 1200
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to send to ${number}: ${error}`)
      }

      return response.json()
    })
  )

  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  console.log(`[Dispatch] Notification sent: ${successful} successful, ${failed} failed`)

  if (failed > 0) {
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason.message)
    console.error('[Dispatch] Errors:', errors)
  }
}
