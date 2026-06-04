'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function generateSessionId(): string {
  return 'web_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreateSessionId(): string {
  try {
    const stored = sessionStorage.getItem('inth_chat_session');
    if (stored) return stored;
    const id = generateSessionId();
    sessionStorage.setItem('inth_chat_session', id);
    return id;
  } catch {
    return generateSessionId();
  }
}

const GREETING: Message = {
  role: 'assistant',
  content: "Sawubona! 🌿 I'm Nthandokazi. I'm here to help you find the right herbal remedy, answer questions about our products, or help you place an order. What can I do for you today?",
  timestamp: new Date(),
};

const QUICK_QUESTIONS = [
  'What do you have for energy?',
  'How does delivery work?',
  'Best remedy for men?',
  'What helps with pain?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(getOrCreateSessionId);
  const [unread, setUnread] = useState(0);
  const [phone, setPhone] = useState('');
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId, phone: phone || undefined }),
      });

      const data = await res.json();
      const reply = data.reply || "Sawubona! I'm having a little trouble right now. Please try again. 🌿";

      const assistantMsg: Message = { role: 'assistant', content: reply, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);

      if (!open) setUnread((n) => n + 1);

      // After 4 messages, prompt for phone number to link WhatsApp
      if (messages.length >= 4 && !phone && !showPhonePrompt) {
        setShowPhonePrompt(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sawubona! I'm having a little trouble right now. Please try again in a moment. 🌿", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId, phone, open, messages.length, showPhonePrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const savePhone = () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 9) {
      setShowPhonePrompt(false);
      sendMessage("My phone number is " + phone);
    }
  };

  return (
    <>
      {/* ── Floating Bubble ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #2d5a27, #4a8c3f)' }}
        aria-label="Chat with Nthandokazi"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '520px', background: '#fff', border: '1px solid #e5e7eb' }}>

          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #2d5a27, #4a8c3f)' }}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
              🌿
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Nthandokazi</p>
              <p className="text-green-100 text-xs">Traditional Healer & Herbalist</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-green-100 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ background: '#f9fafb' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">🌿</div>
                )}
                <div
                  className="max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: '#2d5a27', color: '#fff', borderBottomRightRadius: 4 }
                    : { background: '#fff', color: '#1f2937', borderBottomLeftRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">🌿</div>
                <div className="px-4 py-3 rounded-2xl bg-white shadow-sm" style={{ borderBottomLeftRadius: 4 }}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Phone prompt */}
            {showPhonePrompt && !phone && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                <p className="text-green-800 font-medium mb-2">💬 Continue on WhatsApp?</p>
                <p className="text-green-700 text-xs mb-2">Enter your number to sync our chat to WhatsApp.</p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="0821234567"
                    className="flex-1 px-2 py-1.5 rounded-lg border border-green-300 text-xs focus:outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <button onClick={savePhone} className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                    style={{ background: '#2d5a27' }}>Save</button>
                  <button onClick={() => setShowPhonePrompt(false)} className="px-2 py-1.5 text-green-600 text-xs">Skip</button>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick questions — show only at start */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 flex gap-2 flex-wrap" style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-green-50"
                  style={{ borderColor: '#2d5a27', color: '#2d5a27' }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 py-3 flex gap-2 border-t bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nthandokazi anything..."
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
              style={{ borderColor: '#d1d5db' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
              style={{ background: '#2d5a27' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
