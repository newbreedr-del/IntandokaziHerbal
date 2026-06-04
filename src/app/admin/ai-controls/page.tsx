"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Brain, Save, RotateCcw, ChevronDown, ChevronUp,
  Thermometer, Hash, Clock, Zap, BookOpen, MessageSquare,
  AlertTriangle, CheckCircle, Info, Shield, Settings2
} from "lucide-react";
import toast from "react-hot-toast";

const SUPER_ADMIN_EMAIL = "mandubusabelo@gmail.com";

const GEMINI_MODELS = [
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Fast & cost-efficient)" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (More capable, slower)" },
  { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)" },
];

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

interface LLMConfig {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  timeoutMs: number;
  enabled: boolean;
  _updated_at?: string;
  _updated_by?: string;
}

interface PersonaConfig {
  name: string;
  system_prompt: string;
  _updated_at?: string;
  _updated_by?: string;
}

interface KnowledgeBase {
  custom_info: string;
  special_instructions: string;
  _updated_at?: string;
  _updated_by?: string;
}

function SectionCard({
  title,
  icon: Icon,
  children,
  badge,
  defaultOpen = true,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-violet-600" />
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
          {badge && (
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

function SliderRow({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
      />
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </div>
  );
}

export default function AIControlsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    model: "gemini-1.5-flash",
    temperature: 0.75,
    maxOutputTokens: 400,
    timeoutMs: 15000,
    enabled: true,
  });

  const [persona, setPersona] = useState<PersonaConfig>({
    name: "Nthandokazi",
    system_prompt: DEFAULT_PERSONA,
  });

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>({
    custom_info: "",
    special_instructions: "",
  });

  const isSuperAdmin =
    session?.user?.email === SUPER_ADMIN_EMAIL ||
    (session?.user as any)?.role === "super_admin";

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-settings");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      const s = data.settings ?? {};

      if (s.llm_config) {
        setLlmConfig((prev) => ({ ...prev, ...s.llm_config }));
      }
      if (s.persona) {
        setPersona((prev) => ({ ...prev, ...s.persona }));
      }
      if (s.knowledge_base) {
        setKnowledgeBase((prev) => ({ ...prev, ...s.knowledge_base }));
      }
    } catch {
      toast.error("Could not load AI settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      if (!isSuperAdmin) {
        setLoading(false);
      } else {
        loadSettings();
      }
    }
  }, [status, isSuperAdmin, loadSettings, router]);

  const save = async (key: string, value: object) => {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Save failed");
      }
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading AI controls...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 text-sm mb-6">
            This section is only accessible to the super administrator account.
          </p>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Controls</h1>
          </div>
          <p className="text-gray-500 text-sm ml-14">
            Manage the Nthandokazi AI agent — persona, knowledge base, and model settings.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full">
          <Shield className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-semibold text-violet-700">Super Admin Only</span>
        </div>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
        llmConfig.enabled
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-amber-50 border-amber-200 text-amber-800"
      }`}>
        {llmConfig.enabled ? (
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        )}
        <span>
          AI Agent is currently{" "}
          <strong>{llmConfig.enabled ? "active" : "disabled"}</strong>.{" "}
          Using model: <strong>{llmConfig.model}</strong>.
        </span>
        <button
          onClick={() => {
            const next = { ...llmConfig, enabled: !llmConfig.enabled };
            setLlmConfig(next);
            save("llm_config", { model: next.model, temperature: next.temperature, maxOutputTokens: next.maxOutputTokens, timeoutMs: next.timeoutMs, enabled: next.enabled });
          }}
          className={`ml-auto text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
            llmConfig.enabled
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {llmConfig.enabled ? "Disable Agent" : "Enable Agent"}
        </button>
      </div>

      {/* LLM Configuration */}
      <SectionCard title="LLM Configuration" icon={Settings2} badge={llmConfig.model}>
        <div className="space-y-6 pt-2">
          {/* Model selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              value={llmConfig.model}
              onChange={(e) => setLlmConfig((p) => ({ ...p, model: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
            >
              {GEMINI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <SliderRow
            label="Temperature"
            hint="Lower = more focused & predictable. Higher = more creative & varied. Recommended: 0.6–0.8 for customer service."
            value={llmConfig.temperature}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => setLlmConfig((p) => ({ ...p, temperature: v }))}
            format={(v) => v.toFixed(2)}
          />

          {/* Max tokens */}
          <SliderRow
            label="Max Response Length (tokens)"
            hint="Controls how long the AI responses can be. ~1 token ≈ 0.75 words. 400 tokens ≈ 300 words."
            value={llmConfig.maxOutputTokens}
            min={100}
            max={1200}
            step={50}
            onChange={(v) => setLlmConfig((p) => ({ ...p, maxOutputTokens: v }))}
          />

          {/* Timeout */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Request Timeout
              </label>
              <span className="text-sm font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg">
                {(llmConfig.timeoutMs / 1000).toFixed(0)}s
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={30000}
              step={1000}
              value={llmConfig.timeoutMs}
              onChange={(e) => setLlmConfig((p) => ({ ...p, timeoutMs: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              How long to wait for a Gemini response before using fallback. Default: 15s.
            </p>
          </div>

          {llmConfig._updated_at && (
            <p className="text-xs text-gray-400">
              Last updated: {new Date(llmConfig._updated_at).toLocaleString()} by {llmConfig._updated_by}
            </p>
          )}

          <button
            disabled={saving === "llm_config"}
            onClick={() =>
              save("llm_config", {
                model: llmConfig.model,
                temperature: llmConfig.temperature,
                maxOutputTokens: llmConfig.maxOutputTokens,
                timeoutMs: llmConfig.timeoutMs,
                enabled: llmConfig.enabled,
              })
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving === "llm_config" ? "Saving..." : "Save LLM Settings"}
          </button>
        </div>
      </SectionCard>

      {/* Persona */}
      <SectionCard title="AI Persona & System Prompt" icon={MessageSquare} badge="Nthandokazi">
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This is the core instruction that defines how the AI behaves. It is sent to Gemini on every conversation. The product catalog is appended automatically. Changes take effect within ~60 seconds.
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Prompt
            </label>
            <textarea
              value={persona.system_prompt}
              onChange={(e) => setPersona((p) => ({ ...p, system_prompt: e.target.value }))}
              rows={18}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-y bg-gray-50"
              placeholder="Enter the AI system prompt..."
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                {persona.system_prompt.length.toLocaleString()} characters
              </p>
              <button
                onClick={() => setPersona((p) => ({ ...p, system_prompt: DEFAULT_PERSONA }))}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to default
              </button>
            </div>
          </div>

          {persona._updated_at && (
            <p className="text-xs text-gray-400">
              Last updated: {new Date(persona._updated_at).toLocaleString()} by {persona._updated_by}
            </p>
          )}

          <button
            disabled={saving === "persona"}
            onClick={() => save("persona", { name: persona.name, system_prompt: persona.system_prompt })}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving === "persona" ? "Saving..." : "Save Persona"}
          </button>
        </div>
      </SectionCard>

      {/* Knowledge Base */}
      <SectionCard title="Knowledge Base" icon={BookOpen}>
        <div className="space-y-5 pt-2">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Add extra knowledge here — promotions, seasonal info, FAQs, specific product instructions or anything the AI should know beyond the standard product catalog. This is appended to every conversation.
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Business Knowledge
            </label>
            <textarea
              value={knowledgeBase.custom_info}
              onChange={(e) => setKnowledgeBase((p) => ({ ...p, custom_info: e.target.value }))}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-y bg-gray-50"
              placeholder="e.g. We are running a 20% sale on all teas this week. Discount code: HERB20&#10;&#10;Our Durban branch is closed 25–26 Dec. The Cape Town branch is open all year.&#10;&#10;Imbiza Yamadoda is our best-seller for men's health issues..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Agent Instructions
            </label>
            <textarea
              value={knowledgeBase.special_instructions}
              onChange={(e) => setKnowledgeBase((p) => ({ ...p, special_instructions: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-y bg-gray-50"
              placeholder="e.g. Always upsell the consultation booking. If someone asks about prices, remind them about bulk discounts..."
            />
          </div>

          {knowledgeBase._updated_at && (
            <p className="text-xs text-gray-400">
              Last updated: {new Date(knowledgeBase._updated_at).toLocaleString()} by {knowledgeBase._updated_by}
            </p>
          )}

          <button
            disabled={saving === "knowledge_base"}
            onClick={() =>
              save("knowledge_base", {
                custom_info: knowledgeBase.custom_info,
                special_instructions: knowledgeBase.special_instructions,
              })
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving === "knowledge_base" ? "Saving..." : "Save Knowledge Base"}
          </button>
        </div>
      </SectionCard>

      {/* Quick Reference */}
      <SectionCard title="Quick Reference" icon={Zap} defaultOpen={false}>
        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="font-semibold text-gray-700 mb-2">Session IDs</p>
            <ul className="space-y-1 text-gray-500 text-xs">
              <li><code className="bg-gray-200 px-1 rounded">web_xxxxx</code> — Web chat widget sessions</li>
              <li><code className="bg-gray-200 px-1 rounded">wa_27821234567</code> — WhatsApp sessions</li>
              <li>History is shared when phone is linked</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="font-semibold text-gray-700 mb-2">Fallback Responses</p>
            <ul className="space-y-1 text-gray-500 text-xs">
              <li>Triggered when Gemini fails or times out</li>
              <li>Keywords: delivery, price, side effects</li>
              <li>Edit in <code className="bg-gray-200 px-1 rounded">src/lib/aiAgent.ts</code></li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="font-semibold text-gray-700 mb-2">Product Catalog</p>
            <ul className="space-y-1 text-gray-500 text-xs">
              <li>Loaded from Supabase on every AI call</li>
              <li>Cached by Next.js fetch for 60s</li>
              <li>Edit products via the Products page</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="font-semibold text-gray-700 mb-2">AI Settings Cache</p>
            <ul className="space-y-1 text-gray-500 text-xs">
              <li>Settings cached for 60 seconds in memory</li>
              <li>Changes reflect within ~1 minute</li>
              <li>Restart server to clear cache immediately</li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
