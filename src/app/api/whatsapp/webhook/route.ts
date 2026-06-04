/**
 * WhatsApp Webhook — Evolution API
 * Receives all incoming WhatsApp messages and routes them to the AI agent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/aiAgent';

export const runtime = 'nodejs';

// Internal staff numbers that should NOT get AI replies
const STAFF_NUMBERS = (process.env.DISPATCH_NUMBERS ?? '')
  .split(/[,;\n]/)
  .map((n) => n.replace(/\D/g, '').trim())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Webhook] Received body:', JSON.stringify(body).slice(0, 500));

    // Evolution API sends different event types — we only care about messages
    const event = body.event ?? body.type;
    console.log('[Webhook] Event type:', event);
    if (event !== 'messages.upsert' && event !== 'MESSAGES_UPSERT') {
      console.log('[Webhook] Ignoring non-message event');
      return NextResponse.json({ received: true });
    }

    // Extract message data (Evolution API v2 structure)
    const msgData =
      body.data?.messages?.[0] ??
      body.data?.message ??
      body.message ??
      null;

    console.log('[Webhook] Message data:', msgData ? 'present' : 'missing');
    if (!msgData) return NextResponse.json({ received: true });

    // Only handle incoming messages (fromMe = false)
    const fromMe = msgData.key?.fromMe === true;
    console.log('[Webhook] fromMe:', fromMe);
    if (fromMe) {
      console.log('[Webhook] Ignoring own message');
      return NextResponse.json({ received: true });
    }

    // Extract phone number — strip the WhatsApp suffix (@s.whatsapp.net)
    const rawJid: string =
      msgData.key?.remoteJid ??
      msgData.remoteJid ??
      '';
    const phone = rawJid.replace('@s.whatsapp.net', '').replace(/\D/g, '');
    console.log('[Webhook] Phone:', phone, 'rawJid:', rawJid);

    if (!phone) return NextResponse.json({ received: true });

    // Skip group messages
    if (rawJid.includes('@g.us')) {
      console.log('[Webhook] Ignoring group message');
      return NextResponse.json({ received: true });
    }

    // Skip messages from staff / dispatch numbers
    console.log('[Webhook] STAFF_NUMBERS:', STAFF_NUMBERS);
    if (STAFF_NUMBERS.some((n) => phone.endsWith(n) || n.endsWith(phone))) {
      console.log('[Webhook] Ignoring staff message');
      return NextResponse.json({ received: true });
    }

    // Extract message text
    const text: string =
      msgData.message?.conversation ??
      msgData.message?.extendedTextMessage?.text ??
      msgData.message?.imageMessage?.caption ??
      msgData.message?.documentMessage?.caption ??
      '';

    console.log('[Webhook] Text:', text);
    if (!text.trim()) {
      console.log('[Webhook] Empty text, ignoring');
      return NextResponse.json({ received: true });
    }

    const senderName: string =
      msgData.pushName ??
      msgData.key?.participant ??
      phone;

    console.log(`[Webhook] Processing message from ${senderName} (${phone}): ${text.slice(0, 80)}`);

    // Await the handler — Vercel kills the function after response is sent
    // so fire-and-forget does not work on serverless. Evolution API waits up to 30s.
    await handleWhatsAppMessage(phone, text, senderName).catch((err) =>
      console.error('[Webhook] Handler error:', err?.message),
    );

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Webhook] Parse error:', err?.message);
    return NextResponse.json({ received: true }); // Always return 200 to avoid Evolution API retries
  }
}

// Evolution API sends a GET to verify the webhook URL
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Intandokazi Herbal WhatsApp' });
}
