/**
 * Intandokazi Herbal — WhatsApp Service (Evolution API)
 * Single source of truth for all WhatsApp sends in the app.
 */

export function formatPhone(raw: string): string {
  let n = raw.replace(/\D/g, '');
  if (n.startsWith('0') && n.length === 10) n = '27' + n.slice(1);
  else if (n.length === 9) n = '27' + n;
  return n;
}

function evoConfig() {
  const url = process.env.EVOLUTION_API_URL ?? '';
  const key = process.env.EVOLUTION_API_KEY ?? '';
  const instance = process.env.EVOLUTION_INSTANCE_NAME ?? process.env.EVOLUTION_INSTANCE ?? '';
  return { url: url.replace(/\/$/, ''), key, instance };
}

export async function sendWhatsAppText(
  rawPhone: string,
  text: string,
): Promise<boolean> {
  const { url, key, instance } = evoConfig();
  if (!url || !key || !instance) {
    console.warn('[WhatsApp] Evolution API not configured — skipping send');
    return false;
  }
  const phone = formatPhone(rawPhone);
  try {
    const res = await fetch(`${url}/message/sendText/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key },
      body: JSON.stringify({ number: phone, textMessage: { text } }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      console.error(`[WhatsApp] Send failed (${res.status}):`, err);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[WhatsApp] Network error:', err?.message);
    return false;
  }
}

export async function sendDispatchAlert(text: string): Promise<void> {
  const numbers = (process.env.DISPATCH_NUMBERS ?? '')
    .split(/[,;\n]/)
    .map((n) => n.trim())
    .filter(Boolean);
  await Promise.all(numbers.map((n) => sendWhatsAppText(n, text)));
}
