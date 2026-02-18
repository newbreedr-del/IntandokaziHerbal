import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Ntankokazi, a traditional African healer and herbalist with decades of experience. You are warm, knowledgeable, and deeply passionate about natural healing. You speak in a friendly, personal tone — like a trusted healer who genuinely cares about each client's wellbeing.

You run Ntankokazi Herbal, an online store selling authentic African herbal remedies, traditional medicines and organic wellness products in South Africa.

When answering questions about products:
- Draw on traditional African healing knowledge and modern herbal science
- Be specific about benefits, usage, ingredients and expected results
- Always mention realistic timelines for results (e.g. "most clients feel improvement within 2–3 weeks")
- If someone asks about a condition, suggest the most relevant product(s) from the store
- Be honest about what herbs can and cannot do — never make false medical claims
- Encourage clients to consult a doctor for serious conditions, while still offering herbal support
- Share personal anecdotes about how you've seen these remedies help clients
- Use occasional Zulu/Sotho/Xhosa words with translations to feel authentic
- Keep responses concise but warm — 3–5 sentences usually

You handle about 890 client questions per day, so you are experienced at quickly identifying what someone needs and giving helpful, actionable advice.

Never say you are an AI. You are Ntankokazi.`;

const GEMINI_API_KEY = "AIzaSyCKzsID--6ockxc_RdxKFfIXiNqGGwXITo";

export async function POST(req: NextRequest) {
  try {
    const { messages, productName, productContext } = await req.json();

    const contextMessage = productContext
      ? `\n\nThe client is asking about: ${productName}\n\nProduct details:\n${productContext}`
      : "";

    const systemWithContext = SYSTEM_PROMPT + contextMessage;

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemWithContext }] },
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const fallback = getFallbackResponse(lastUserMessage, productName);
      return NextResponse.json({ reply: fallback });
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      getFallbackResponse(lastUserMessage, productName);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Sawubona! I'm having a little trouble connecting right now. Please try again in a moment, or WhatsApp me directly for immediate help. 🌿" });
  }
}

function getFallbackResponse(question: string, productName?: string): string {
  const q = question.toLowerCase();

  if (q.includes("how long") || q.includes("when will") || q.includes("how fast")) {
    return `Sawubona! Every body is different, but most of my clients start noticing results with ${productName || "this product"} within 2–3 weeks of consistent use. For best results, take it daily without skipping. I always say — nature works gently but deeply. Give it time and you will be amazed! 🌿`;
  }
  if (q.includes("side effect") || q.includes("safe") || q.includes("danger")) {
    return `This is a great question to ask! ${productName || "This product"} is made from 100% natural ingredients and is generally very safe. As with any herbal remedy, I recommend starting with the suggested dose and seeing how your body responds. If you are pregnant, breastfeeding or on chronic medication, please check with your doctor first. I am always here if you have concerns! 🌱`;
  }
  if (q.includes("child") || q.includes("kid") || q.includes("baby")) {
    return `Yebo, many of my products are safe for children! ${productName || "This product"} — please check the usage instructions for the specific age recommendation. I always recommend halving the adult dose for children under 12. For babies under 2, please consult with a healthcare provider first. Safety is everything when it comes to our little ones! 💚`;
  }
  if (q.includes("price") || q.includes("cost") || q.includes("discount") || q.includes("bulk")) {
    return `I understand — value matters! For bulk orders or if you are buying for a family or community, please WhatsApp me directly and we can discuss special pricing. I believe everyone deserves access to natural healing, so I always try to find a way to help. 🌿`;
  }
  if (q.includes("delivery") || q.includes("shipping") || q.includes("pixi")) {
    return `We deliver nationwide via PIXI courier! Orders placed before 12pm usually ship the same day and arrive within 2–5 business days. Free delivery on orders over R500. You will receive a tracking number as soon as your order is dispatched. 📦`;
  }
  return `Sawubona! Thank you for your question about ${productName || "our products"}. This is one of my most trusted remedies — I have seen it help hundreds of clients. Please feel free to ask me anything specific about ingredients, usage or what condition you are trying to address, and I will give you my honest advice. 🌿`;
}
