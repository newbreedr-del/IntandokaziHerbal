/**
 * Intandokazi Herbal — Unified AI Agent
 *
 * Powers BOTH the floating web chat widget AND the WhatsApp agent.
 * Same persona, same product knowledge, same conversation logic.
 *
 * If a customer chats on the website and later messages on WhatsApp
 * (or vice versa), history is linked by phone number.
 *
 * AI settings (model, temperature, persona, knowledge base) are loaded
 * from the `ai_settings` Supabase table and cached for 60 seconds.
 * Edit them via the Admin → AI Controls page (super_admin only).
 */

import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppText } from './whatsapp';
import { SITE_CONFIG } from './constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Default Persona (used as fallback if DB settings unavailable) ─────────────

const DEFAULT_PERSONA = `You are Nthandokazi, a warm and knowledgeable traditional African healer and herbalist with decades of experience. You run Nthandokazi Herbal, an online store selling authentic African herbal remedies, traditional medicines and organic wellness products across South Africa.

Your personality:
- Warm, personal and deeply caring — like a trusted community healer
- Knowledgeable about both traditional African healing and modern herbal science
- Honest: you never make false medical claims. For serious conditions you always encourage consulting a doctor while still offering herbal support
- Concise but rich: 3–5 sentences usually. Never rambling
- Occasionally use Zulu words with translations (e.g. "Sawubona — hello!")
- Never say you are an AI. You ARE Nthandokazi

How you handle products:
- Be specific about benefits, usage, ingredients and realistic timelines
- If someone describes symptoms or a condition, suggest the most relevant product(s)
- Always mention "most clients feel improvement within 2–3 weeks of consistent use" when relevant
- For bulk orders or special pricing, direct them to WhatsApp

How you handle orders:
- When someone wants to buy, collect: which product, their name, phone number, and chosen PAXI PEP store
- Once you have all details, generate a payment link for them
- After payment, reassure them their order will be dispatched within 1 business day

Delivery info: We deliver nationwide via PAXI courier to any PEP store. R110 delivery fee. Orders arrive within 2–5 business days.`;

// ── Dynamic AI Config (loaded from Supabase, cached 60s) ─────────────────────

interface AIConfig {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  timeoutMs: number;
  enabled: boolean;
  systemPrompt: string;
  customInfo: string;
  specialInstructions: string;
}

const DEFAULT_CONFIG: AIConfig = {
  model: 'gemini-1.0-pro',
  temperature: 0.75,
  maxOutputTokens: 400,
  timeoutMs: 15_000,
  enabled: true,
  systemPrompt: DEFAULT_PERSONA,
  customInfo: '',
  specialInstructions: '',
};

let _configCache: { config: AIConfig; ts: number } | null = null;

async function getAIConfig(): Promise<AIConfig> {
  const now = Date.now();
  if (_configCache && now - _configCache.ts < 60_000) {
    return _configCache.config;
  }
  try {
    const { data } = await supabase
      .from('ai_settings')
      .select('key, value');
    if (!data?.length) {
      _configCache = { config: DEFAULT_CONFIG, ts: now };
      return DEFAULT_CONFIG;
    }
    const rows: Record<string, any> = {};
    for (const r of data) rows[r.key] = r.value;

    const config: AIConfig = {
      model: rows.llm_config?.model ?? DEFAULT_CONFIG.model,
      temperature: rows.llm_config?.temperature ?? DEFAULT_CONFIG.temperature,
      maxOutputTokens: rows.llm_config?.maxOutputTokens ?? DEFAULT_CONFIG.maxOutputTokens,
      timeoutMs: rows.llm_config?.timeoutMs ?? DEFAULT_CONFIG.timeoutMs,
      enabled: rows.llm_config?.enabled ?? DEFAULT_CONFIG.enabled,
      systemPrompt: rows.persona?.system_prompt ?? DEFAULT_CONFIG.systemPrompt,
      customInfo: rows.knowledge_base?.custom_info ?? '',
      specialInstructions: rows.knowledge_base?.special_instructions ?? '',
    };
    _configCache = { config, ts: now };
    return config;
  } catch {
    return DEFAULT_CONFIG;
  }
}

// ── Product Knowledge ─────────────────────────────────────────────────────────

async function getProductCatalog(): Promise<string> {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('name, category, price, unit, short_description, benefits, is_active, stock_quantity')
      .eq('is_active', true)
      .order('category');

    if (!products?.length) return 'No products currently available.';

    const byCategory: Record<string, typeof products> = {};
    for (const p of products) {
      const cat = p.category || 'General';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    }

    let catalog = 'CURRENT PRODUCT CATALOG:\n\n';
    for (const [cat, items] of Object.entries(byCategory)) {
      catalog += `--- ${cat} ---\n`;
      for (const p of items) {
        const stock = p.stock_quantity > 0 ? 'In stock' : 'Out of stock';
        catalog += `• ${p.name} — R${p.price}/${p.unit} (${stock})\n`;
        if (p.short_description) catalog += `  ${p.short_description}\n`;
        if (p.benefits?.length) catalog += `  Benefits: ${p.benefits.slice(0, 3).join(', ')}\n`;
      }
      catalog += '\n';
    }
    return catalog;
  } catch {
    return 'Product catalog temporarily unavailable.';
  }
}

// ── Chat History ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function getHistory(sessionId: string, limit = 10): Promise<ChatMessage[]> {
  try {
    const { data } = await supabase
      .from('chat_sessions')
      .select('messages')
      .eq('session_id', sessionId)
      .single();
    if (!data?.messages) return [];
    const msgs: ChatMessage[] = data.messages;
    return msgs.slice(-limit);
  } catch {
    return [];
  }
}

async function saveHistory(sessionId: string, messages: ChatMessage[], phone?: string): Promise<void> {
  try {
    // Keep last 30 messages to avoid unbounded growth
    const trimmed = messages.slice(-30);
    await supabase.from('chat_sessions').upsert({
      session_id: sessionId,
      messages: trimmed,
      phone: phone ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' });
  } catch (err) {
    console.error('[AI] Failed to save history:', err);
  }
}

// ── Gemini Call ───────────────────────────────────────────────────────────────

async function callGemini(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  config: AIConfig,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          maxOutputTokens: config.maxOutputTokens,
          temperature: config.temperature,
        },
      }),
      signal: AbortSignal.timeout(config.timeoutMs),
    },
  );

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── Order Intent Detection ────────────────────────────────────────────────────

function detectOrderIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('buy') ||
    lower.includes('order') ||
    lower.includes('purchase') ||
    lower.includes('want') ||
    lower.includes('get me') ||
    lower.includes('i need') ||
    lower.includes('add to cart') ||
    lower.includes('how do i pay') ||
    lower.includes('payment')
  );
}

async function generatePaymentLink(
  productName: string,
  customerName: string,
  phone: string,
  pepStore: string,
): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://intandokaziherbal.co.za';
    const res = await fetch(`${baseUrl}/api/agent/orders/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-secret': process.env.AGENT_API_SECRET ?? '',
      },
      body: JSON.stringify({
        customerName,
        customerPhone: phone,
        pepStoreCode: pepStore,
        pepStoreName: pepStore,
        items: [{ productName, quantity: 1 }],
        source: 'chat_widget',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.paymentUrl ?? null;
  } catch {
    return null;
  }
}

// ── Main Agent Function ───────────────────────────────────────────────────────

export interface AgentResponse {
  reply: string;
  paymentUrl?: string;
}

export async function runAgent(
  userMessage: string,
  sessionId: string,
  phone?: string,
): Promise<AgentResponse> {
  // Load history, product catalog, and AI config in parallel
  const [history, catalog, config] = await Promise.all([
    getHistory(sessionId),
    getProductCatalog(),
    getAIConfig(),
  ]);

  // If agent is disabled via admin controls, return a polite message
  if (!config.enabled) {
    return {
      reply: `Sawubona! Our assistant is temporarily unavailable. Please WhatsApp us directly at ${SITE_CONFIG.whatsappFormatted} for help. 🌿`,
    };
  }

  // Build full system prompt: persona + knowledge base + catalog
  const kbSections: string[] = [];
  if (config.customInfo?.trim()) {
    kbSections.push(`ADDITIONAL BUSINESS KNOWLEDGE:\n${config.customInfo.trim()}`);
  }
  if (config.specialInstructions?.trim()) {
    kbSections.push(`SPECIAL INSTRUCTIONS:\n${config.specialInstructions.trim()}`);
  }
  kbSections.push(catalog);

  const systemPrompt = [config.systemPrompt, ...kbSections].join('\n\n');

  let reply = '';

  try {
    reply = await callGemini(systemPrompt, history, userMessage, config);
  } catch (err: any) {
    console.error('[AI] Gemini failed:', err?.message);
    reply = getFallback(userMessage);
  }

  if (!reply) reply = getFallback(userMessage);

  // Save updated history
  const updatedHistory: ChatMessage[] = [
    ...history,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: reply },
  ];
  await saveHistory(sessionId, updatedHistory, phone);

  return { reply };
}

// ── WhatsApp-Specific Handler ────────────────────────────────────────────────

export async function handleWhatsAppMessage(
  phone: string,
  message: string,
  senderName?: string,
): Promise<void> {
  // Use phone as session ID so web + WhatsApp share history
  const sessionId = `wa_${phone}`;

  try {
    const { reply } = await runAgent(message, sessionId, phone);
    await sendWhatsAppText(phone, reply);
  } catch (err: any) {
    console.error('[AI] WhatsApp handler error:', err?.message);
    await sendWhatsAppText(
      phone,
      'Sawubona! I am having a small difficulty right now. Please try again in a moment or call us directly. 🌿',
    );
  }
}

// ── Fallback Responses ────────────────────────────────────────────────────────

function getFallback(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('delivery') || q.includes('shipping') || q.includes('paxi'))
    return 'We deliver nationwide via PAXI courier to any PEP store! R110 delivery fee, 2–5 business days. You get a tracking number once dispatched. 📦';
  if (q.includes('price') || q.includes('cost') || q.includes('how much'))
    return 'Our products range from R50 to R800. For bulk orders or special pricing, please WhatsApp us directly and we will find a way to help! 🌿';
  if (q.includes('side effect') || q.includes('safe'))
    return 'All our products are made from 100% natural ingredients and are generally very safe. If you are pregnant, breastfeeding or on chronic medication, please consult your doctor first. 🌱';
  return 'Sawubona! I am here to help you find the right herbal remedy. Tell me what you are looking for or what health concern you have and I will give you my best advice. 🌿';
}
