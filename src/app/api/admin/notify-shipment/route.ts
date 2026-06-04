import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppText } from '@/lib/whatsapp';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  if (order.customer_phone) {
    await sendWhatsAppText(order.customer_phone,
      `📦 *Your Order Has Been Dispatched!*\n\n` +
      `Hi ${order.customer_name?.split(' ')[0]}! Your Intandokazi Herbal order *${order.order_reference}* is on its way.\n\n` +
      `📍 *Collection:* ${order.pep_store_name || 'Your selected PAXI point'}\n` +
      `🚚 Your order will be ready for collection in 2–5 business days.\n\n` +
      `Thank you for your order! 🌿 Reply to this message if you have any questions.`
    );
  }

  return NextResponse.json({ success: true });
}
