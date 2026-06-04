/**
 * Unified Chat API
 * Powers the floating chat widget on the store.
 * Uses the same AI agent as WhatsApp — same persona, same product knowledge.
 * If phone number is provided, history syncs with WhatsApp conversations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/aiAgent';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, phone } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const { reply } = await runAgent(message.trim(), sessionId, phone);

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('[Chat API] Error:', err?.message);
    return NextResponse.json(
      { reply: 'Sawubona! I am having a small difficulty right now. Please try again in a moment. 🌿' },
    );
  }
}
