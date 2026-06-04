# CLAUDE.md — Intandokazi Herbal Products v2.0

This file provides guidance to AI coding assistants (Claude Code, Cursor, Copilot, etc.) working in this repository.

---

## Project Overview

**Intandokazi Herbal Products** is a unified Next.js 14 (App Router) e-commerce and AI agent platform for a South African traditional herbal remedies business. It replaces two previously separate apps:
- The original Intandokazi Herbal store (`intandokaziherbal.co.za`)
- Engage Africa IO (a standalone WhatsApp AI agent platform on Railway)

Everything now lives in one codebase: the store, payments, WhatsApp AI agent, web chat widget, bookings, and admin panel.

**Live URL:** `https://intandokaziherbal.co.za`
**Deployment:** Vercel
**Database:** Supabase (project ref: `oaeirdgffwodkbcstdfh`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| Styling | Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js v4 (JWT, CredentialsProvider) |
| AI | Google Gemini 1.5 Flash (primary), fallback responses built-in |
| WhatsApp | Evolution API (self-hosted on Railway) |
| Payments | PayFast (primary), EFT with manual confirmation |
| Courier | PAXI to PEP stores (R110 flat delivery fee) |
| Calendar | Google Calendar API (service account) |
| PDF | jsPDF + jspdf-autotable |

---

## Architecture

### Three Distinct Systems

**1. Public Store (`/store`)**
- Product listing, search, category filter
- Cart (client-side React context, session only)
- Checkout → PayFast redirect
- Floating AI chat widget (bottom-right)
- Booking popup (triggers after 15s)

**2. Admin Panel (`/admin`)**
- Protected by NextAuth JWT session
- Orders, products, customers, bookings, availability, invoices, analytics, dispatch

**3. AI Agent Layer**
- Unified: powers BOTH the web chat widget AND WhatsApp
- Same persona (Nthandokazi), same product knowledge, same conversation history
- Web sessions: `web_<random>` session ID stored in `sessionStorage`
- WhatsApp sessions: `wa_<phone>` — linked by phone number
- If customer chats on website then messages on WhatsApp, context is shared

---

## Key Files

### AI & WhatsApp

**`src/lib/aiAgent.ts`** — The unified AI brain. Do not create other AI files.
- `runAgent(message, sessionId, phone?)` — used by web chat API
- `handleWhatsAppMessage(phone, message, senderName?)` — used by WhatsApp webhook
- Loads product catalog live from Supabase on every call (cached by Next.js fetch)
- Saves/loads conversation history from `chat_sessions` table
- Calls Gemini 1.5 Flash; has built-in fallback responses if Gemini fails

**`src/lib/whatsapp.ts`** — Single WhatsApp send utility. Use this everywhere.
- `sendWhatsAppText(phone, text)` — send to any number
- `sendDispatchAlert(text)` — sends to all numbers in `DISPATCH_NUMBERS` env var
- Never use inline `fetch` to Evolution API elsewhere — always import from here

**`src/app/api/whatsapp/webhook/route.ts`** — Evolution API webhook receiver
- POST: receives incoming WhatsApp messages, passes to `handleWhatsAppMessage()`
- GET: health check for webhook URL verification
- Skips: group messages, staff/dispatch numbers, messages from the bot itself

**`src/app/api/chat/route.ts`** — Web chat widget API
- POST `{ message, sessionId, phone? }` → returns `{ reply }`
- Powers the floating `<ChatWidget />` component

**`src/components/ChatWidget.tsx`** — Floating chat bubble component
- Green bubble, bottom-right, opens a 360×520px panel
- Quick questions shown on first load
- Typing indicator (animated dots)
- After 4 messages: prompts for phone number to link WhatsApp history
- Uses `/api/chat` endpoint

### Payments

**`src/lib/payfast.ts`** — PayFast signature generation and verification
- Currently on SANDBOX (`PAYFAST_ENVIRONMENT=sandbox`)
- Switch to production: update `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY` in env

**`src/app/api/payments/payfast/notify/route.ts`** — PayFast ITN (webhook)
- Verifies MD5 signature
- Updates `orders` table: `payment_status`, `order_status`, `transaction_id`
- Sends WhatsApp to customer (confirmation) and dispatch numbers (alert)
- Pings Engage Africa webhook (legacy — can be removed once fully migrated)

**`src/app/api/agent/orders/prepare/route.ts`** — Creates order + PayFast URL
- Called by the WhatsApp agent when a customer wants to buy
- Requires `x-agent-secret` header

### Auth

**`src/lib/auth.ts`** — NextAuth config
- Reads admin users from `ADMIN_USERS_JSON` environment variable (JSON array)
- NEVER hardcode passwords in this file
- Format: `[{"id":"1","email":"...","name":"...","role":"super_admin","password":"..."}]`
- Roles: `super_admin`, `admin`

**`src/middleware.ts`** — Protects `/admin/*` routes via NextAuth session

### Agent API Routes (called by WhatsApp agent)

All routes under `/api/agent/*` require the `x-agent-secret` header matching `AGENT_API_SECRET` env var.

| Route | Method | Purpose |
|---|---|---|
| `/api/agent/products/search` | GET | Search product catalog |
| `/api/agent/orders/prepare` | POST | Create order + return PayFast URL |
| `/api/agent/orders/[id]/status` | GET | Check order status |
| `/api/agent/bookings` | GET/POST | List / create bookings |
| `/api/agent/bookings/availability` | GET | Available consultation slots |

---

## Database Tables

**Core (Supabase):**
- `products` — 18 herbal products with name, category, price, unit, stock_quantity, benefits[], image_url
- `orders` — customer orders (key columns: `order_reference`, `customer_name`, `customer_phone`, `pep_store_code`, `pep_store_name`, `delivery_fee`, `order_status`, `payment_status`, `total`)
- `order_items` — line items per order
- `payments` — payment records linked to orders
- `customers` — registered customers
- `available_slots` — consultation time slots
- `consultation_bookings` — booked consultations (R1,500 default)

**Added in Phase 1:**
- `chat_sessions` — conversation history for web and WhatsApp (session_id, phone, messages JSONB)
  - Run `add-chat-sessions.sql` in Supabase SQL Editor to create this table

**Important:** The `orders` table uses `order_reference` (not `order_number`), `delivery_fee` (not `shipping_cost`), and `pep_store_code`/`pep_store_name` (not standard shipping address fields). The schema SQL file (`complete_schema_with_products.sql`) has outdated column names — the application code column names are correct.

---

## Environment Variables

All required variables (local dev in `.env.local`, production in Vercel dashboard):

```
# PayFast — switch to production before going live
PAYFAST_MERCHANT_ID=10047469           # sandbox; production: 34249465
PAYFAST_MERCHANT_KEY=2cqkmx8bozbps    # sandbox; production: oktxmly5tlwxf
PAYFAST_PASSPHRASE=Intandokazi2026
PAYFAST_ENVIRONMENT=sandbox            # change to: production

# App URLs
NEXT_PUBLIC_BASE_URL=https://intandokaziherbal.co.za
NEXT_PUBLIC_SITE_URL=https://intandokaziherbal.co.za
NEXTAUTH_URL=https://intandokaziherbal.co.za
NEXTAUTH_SECRET=<random 64-char hex>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://oaeirdgffwodkbcstdfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — NEVER expose to browser>

# AI Agent
GEMINI_API_KEY=<your Gemini API key>

# Admin Auth — JSON array, set in Vercel, never commit real passwords
ADMIN_USERS_JSON=[{"id":"1","email":"nthandokazi@intandokaziherbal.co.za","name":"Nthandokazi","role":"admin","password":"<real password>"},{"id":"2","email":"mandubusabelo@gmail.com","name":"Sabelo","role":"super_admin","password":"<real password>"}]

# WhatsApp — Evolution API (Railway)
EVOLUTION_API_URL=https://evolution-api-volume-production.up.railway.app
EVOLUTION_API_KEY=breed-api-key-2025-secure
EVOLUTION_INSTANCE_NAME=breed-agent

# Dispatch WhatsApp numbers (comma-separated, E.164 format)
DISPATCH_NUMBERS=27685037221,27672239798

# Agent API secret (shared with any external services calling /api/agent/*)
AGENT_API_SECRET=<random secret>

# Google Calendar
GOOGLE_CALENDAR_ID=<calendar id>
GOOGLE_CALENDAR_CLIENT_EMAIL=<service account email>
GOOGLE_CALENDAR_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## Key Conventions

- **All Supabase writes use `SUPABASE_SERVICE_ROLE_KEY`** via `createClient()` in API routes. Never use the anon key for writes.
- **All WhatsApp sends go through `src/lib/whatsapp.ts`** — `sendWhatsAppText()` or `sendDispatchAlert()`. Never write inline fetch calls to Evolution API.
- **All AI calls go through `src/lib/aiAgent.ts`** — `runAgent()` or `handleWhatsAppMessage()`. The old `/store/api/chat/route.ts` is legacy and should be removed once the new `/api/chat` route is confirmed working.
- **Currency:** South African Rand (ZAR). Format as `R{amount}` in headings. Prices in the database are in **rands** (not cents).
- **Phone numbers:** Always store and pass in E.164 format without `+` (e.g. `27821234567`). The `formatPhone()` function in `src/lib/whatsapp.ts` handles conversion.
- **PayFast is on SANDBOX.** Before going live: update `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, and set `PAYFAST_ENVIRONMENT=production` in Vercel.

---

## What Was Built in Phase 1 (June 2026)

The following was added to unify the store and the WhatsApp agent:

1. **`src/lib/whatsapp.ts`** — Created. Centralised WhatsApp send utility.
2. **`src/lib/aiAgent.ts`** — Created. Unified AI service powering web chat + WhatsApp.
3. **`src/app/api/whatsapp/webhook/route.ts`** — Created. Evolution API webhook receiver.
4. **`src/app/api/chat/route.ts`** — Created. Web chat widget API endpoint.
5. **`src/components/ChatWidget.tsx`** — Created. Floating chat bubble for the store.
6. **`src/app/store/page.tsx`** — Updated. Added `<ChatWidget />` import and render.
7. **`src/lib/auth.ts`** — Updated. Removed hardcoded passwords; now reads from `ADMIN_USERS_JSON` env var.
8. **`src/app/store/api/chat/route.ts`** — Updated. Removed hardcoded Gemini API key fallback.
9. **`src/app/api/payments/payfast/notify/route.ts`** — Updated. Replaced inline WhatsApp fetch with `sendWhatsAppText()` / `sendDispatchAlert()` from the shared lib.
10. **`add-chat-sessions.sql`** — Created. Run once in Supabase SQL Editor to create the `chat_sessions` table.
11. **`.env.local`** — Updated. Added `GEMINI_API_KEY` and `ADMIN_USERS_JSON` variables.

---

## What Was Built in Phase 2 (June 2026)

1. **`src/app/admin/ai-controls/page.tsx`** — Created. Super-admin-only AI Controls page. Only `mandubusabelo@gmail.com` can access it. Contains:
   - LLM configuration panel (model, temperature, max tokens, timeout, enable/disable)
   - Persona & system prompt editor (with reset-to-default)
   - Knowledge base editor (custom business info + special agent instructions)
   - Quick reference section
2. **`src/app/api/admin/ai-settings/route.ts`** — Created. GET/PUT API for AI settings, guarded to super_admin only.
3. **`add-ai-settings.sql`** — Created. Run once in Supabase SQL Editor to create the `ai_settings` table with default rows.
4. **`src/lib/aiAgent.ts`** — Updated. Now loads all AI settings (model, temperature, persona, knowledge base) dynamically from the `ai_settings` Supabase table, cached for 60 seconds. Supports enable/disable toggle.
5. **`src/app/admin/layout.tsx`** — Updated. Upgraded UI (dark sidebar, user initials avatar, polished nav states). Added "AI Controls" nav item visible only to super_admin.
6. **`src/app/store/page.tsx`** — Fixed. All 3 hardcoded WhatsApp numbers (`27604964105`) replaced with `SITE_CONFIG.whatsappNumber`. Operating hours now read from `SITE_CONFIG.operatingHours`.
7. **`src/app/store/order-success/page.tsx`** — Fixed. Hardcoded dispatch number replaced with `SITE_CONFIG.whatsappNumber`.

### AI Controls — Access
- URL: `/admin/ai-controls`
- Only accessible to users with email `mandubusabelo@gmail.com` or role `super_admin`
- All other admin users see an "Access Restricted" screen

### ai_settings Table Setup
Run `add-ai-settings.sql` once in Supabase SQL Editor. The table has 3 rows:
- `llm_config` — model, temperature, maxOutputTokens, timeoutMs, enabled
- `persona` — name, system_prompt
- `knowledge_base` — custom_info, special_instructions

---

## Phase 3 — Planned (Next)

- Unified admin panel: single dashboard showing orders + WhatsApp conversations + contacts
- CRM contacts table synced from WhatsApp conversations (name, phone, last message, order history)
- Staff reply routing: admin can reply to customers from the dashboard, sends via WhatsApp
- Remove legacy Engage Africa Railway dependency entirely
- Switch PayFast to production credentials
- Add Resend for transactional emails (order confirmation, booking confirmation)
- RLS policies on Supabase tables
