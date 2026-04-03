/**
 * Unified notification system for bookings and orders
 * Integrates with Respond.io for WhatsApp messaging
 */

import { getRespondIOClient } from './respondio';

interface BookingNotification {
  type: 'booking_created' | 'booking_confirmed' | 'booking_reminder';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  bookingTime: string;
  consultationType: string;
  bookingReference: string;
  amount: number;
}

interface OrderNotification {
  type: 'order_created' | 'order_paid' | 'order_shipped';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderReference: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  trackingNumber?: string;
}

export async function sendBookingNotification(data: BookingNotification): Promise<void> {
  try {
    const client = getRespondIOClient();
    let message = '';

    switch (data.type) {
      case 'booking_created':
        message = `🌿 *Booking Received - Intandokazi Herbal*

Hi ${data.customerName}!

Thank you for booking a consultation with us!

*Booking Reference:* ${data.bookingReference}
*Date:* ${data.bookingDate}
*Time:* ${data.bookingTime}
*Type:* ${data.consultationType}
*Amount:* R${data.amount.toFixed(2)}

Your booking is pending payment confirmation. Once payment is confirmed, you'll receive a confirmation message.

Need to make changes? Reply to this message!

_Healing the natural way_ 🌿`;
        break;

      case 'booking_confirmed':
        message = `✅ *Booking Confirmed - Intandokazi Herbal*

Hi ${data.customerName}!

Your consultation booking is confirmed! 🎉

*Booking Reference:* ${data.bookingReference}
*Date:* ${data.bookingDate}
*Time:* ${data.bookingTime}
*Type:* ${data.consultationType}

*What to expect:*
${data.consultationType === 'video' ? '📹 You will receive a video call link 15 minutes before your appointment' : ''}
${data.consultationType === 'phone' ? '📞 We will call you on: ' + data.customerPhone : ''}
${data.consultationType === 'whatsapp' ? '💬 We will contact you via WhatsApp at the scheduled time' : ''}

Please be available at the scheduled time. If you need to reschedule, reply to this message at least 24 hours in advance.

Looking forward to our consultation! 🌿

_Intandokazi Mokoatle_`;
        break;

      case 'booking_reminder':
        message = `⏰ *Consultation Reminder - Intandokazi Herbal*

Hi ${data.customerName}!

This is a reminder about your upcoming consultation:

*Date:* ${data.bookingDate}
*Time:* ${data.bookingTime}
*Type:* ${data.consultationType}

Your consultation is in 24 hours. Please ensure you're available.

See you soon! 🌿`;
        break;
    }

    await client.sendMessage({
      to: data.customerPhone,
      message,
      metadata: {
        type: data.type,
        bookingReference: data.bookingReference,
        source: 'intandokazi_booking_system'
      }
    });

    console.log(`Booking notification sent: ${data.type} to ${data.customerPhone}`);
  } catch (error) {
    console.error('Failed to send booking notification:', error);
    // Don't throw - notifications are non-critical
  }
}

export async function sendOrderNotification(data: OrderNotification): Promise<void> {
  try {
    const client = getRespondIOClient();
    let message = '';

    switch (data.type) {
      case 'order_created':
        const itemsList = data.items
          .map(item => `• ${item.quantity}x ${item.name} - R${(item.price * item.quantity).toFixed(2)}`)
          .join('\n');

        message = `🌿 *Order Received - Intandokazi Herbal*

Hi ${data.customerName}!

Thank you for your order!

*Order Reference:* ${data.orderReference}
*Total:* R${data.total.toFixed(2)}

*Items:*
${itemsList}

Your order is pending payment confirmation. Once payment is confirmed, we'll start preparing your order.

Need help? Reply to this message!

_Healing the natural way_ 🌿`;
        break;

      case 'order_paid':
        const paidItemsList = data.items
          .map(item => `• ${item.quantity}x ${item.name}`)
          .join('\n');

        message = `✅ *Payment Confirmed - Intandokazi Herbal*

Hi ${data.customerName}!

Your payment has been received! 🎉

*Order Reference:* ${data.orderReference}
*Amount Paid:* R${data.total.toFixed(2)}

*Items:*
${paidItemsList}

We're now preparing your order with fresh, quality ingredients. Your parcel will be dispatched via PAXI Courier within 1-2 business days.

You'll receive tracking information once your order ships.

Thank you for choosing Intandokazi Herbal! 🌿

_Ngiyabonga!_
Intandokazi Mokoatle`;
        break;

      case 'order_shipped':
        message = `📦 *Order Shipped - Intandokazi Herbal*

Hi ${data.customerName}!

Great news! Your order has been shipped! 🚚

*Order Reference:* ${data.orderReference}
*Tracking Number:* ${data.trackingNumber || 'Will be provided soon'}

Your parcel is on its way via PAXI Courier. You should receive it within 2-5 business days.

Track your delivery: https://paxi.co.za/track

Questions? Reply to this message anytime!

Thank you! 🌿`;
        break;
    }

    await client.sendMessage({
      to: data.customerPhone,
      message,
      metadata: {
        type: data.type,
        orderReference: data.orderReference,
        source: 'intandokazi_order_system'
      }
    });

    console.log(`Order notification sent: ${data.type} to ${data.customerPhone}`);
  } catch (error) {
    console.error('Failed to send order notification:', error);
    // Don't throw - notifications are non-critical
  }
}

export async function sendAdminAlert(data: {
  type: 'new_booking' | 'new_order' | 'payment_received';
  reference: string;
  customerName: string;
  amount: number;
  details: string;
}): Promise<void> {
  try {
    const client = getRespondIOClient();
    const adminPhone = '27768435876'; // Intandokazi's phone

    let message = '';

    switch (data.type) {
      case 'new_booking':
        message = `🔔 *New Booking Alert*

A new consultation booking has been received!

*Reference:* ${data.reference}
*Client:* ${data.customerName}
*Amount:* R${data.amount.toFixed(2)}

${data.details}

Check your admin panel for full details.`;
        break;

      case 'new_order':
        message = `🔔 *New Order Alert*

A new product order has been received!

*Reference:* ${data.reference}
*Customer:* ${data.customerName}
*Total:* R${data.amount.toFixed(2)}

${data.details}

Check your admin panel for full details.`;
        break;

      case 'payment_received':
        message = `💰 *Payment Received*

Payment confirmed for ${data.reference}!

*Customer:* ${data.customerName}
*Amount:* R${data.amount.toFixed(2)}

${data.details}

Action required: Process the order/booking.`;
        break;
    }

    await client.sendMessage({
      to: adminPhone,
      message,
      metadata: {
        type: 'admin_alert',
        reference: data.reference,
        source: 'intandokazi_admin_system'
      }
    });

    console.log(`Admin alert sent: ${data.type}`);
  } catch (error) {
    console.error('Failed to send admin alert:', error);
  }
}
