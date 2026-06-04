# DEPLOY PROMPT — Intandokazi Herbal Products v2.0

Paste this into Claude Code. Your job is to verify all Phase 1 files exist and are correct, fix anything missing, then commit and prepare for deployment.

---

## Step 1 — Verify All Phase 1 Files Exist

Check that every file listed below exists. If any is missing, create it using the exact implementation described in CLAUDE.md and IDE_PROMPT.md.

Run this check:

```bash
ls src/lib/whatsapp.ts
ls src/lib/aiAgent.ts
ls src/app/api/whatsapp/webhook/route.ts
ls src/app/api/chat/route.ts
ls src/components/ChatWidget.tsx
ls add-chat-sessions.sql
```

For each file that exists, read it and confirm:

**`src/lib/whatsapp.ts`** must contain:
- `export function formatPhone(raw: string): string`
- `export async function sendWhatsAppText(rawPhone: string, text: string): Promise<boolean>`
- `export async function sendDispatchAlert(text: string): Promise<void>`
- Uses `process.env.EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`
- NO hardcoded API keys or URLs

**`src/lib/aiAgent.ts`** must contain:
- `export async function runAgent(userMessage, sessionId, phone?)` 
- `export async function handleWhatsAppMessage(phone, message, senderName?)`
- Loads products from Supabase `products` table
- Reads/writes to `chat_sessions` table
- Calls Gemini API using `process.env.GEMINI_API_KEY` — no hardcoded key
- Has fallback responses if Gemini fails

**`src/app/api/whatsapp/webhook/route.ts`** must contain:
- `export const runtime = 'nodejs'`
- `export async function POST(req: NextRequest)`
- `export async function GET()`
- Calls `handleWhatsAppMessage()` from `@/lib/aiAgent`
- Always returns HTTP 200 — even on errors
- Skips group messages (`@g.us`)
- Skips staff/dispatch numbers

**`src/app/api/chat/route.ts`** must contain:
- `export const runtime = 'nodejs'`
- `export async function POST(req: NextRequest)`
- Calls `runAgent()` from `@/lib/aiAgent`
- Accepts `{ message, sessionId, phone? }` body

**`src/components/ChatWidget.tsx`** must contain:
- `'use client'` directive at top
- Floating bubble (fixed, bottom-right, z-50)
- Calls `/api/chat` endpoint
- Quick question buttons
- Typing indicator
- Phone number prompt after 4 messages
- `sessionStorage` access wrapped in try/catch

---

## Step 2 — Verify Store Page Has ChatWidget

Read `src/app/store/page.tsx` and confirm:
- `import ChatWidget from "@/components/ChatWidget"` is present
- `<ChatWidget />` appears inside the return JSX after `<CartDrawer />`

If missing, add both.

---

## Step 3 — Verify Auth Fix

Read `src/lib/auth.ts` and confirm:
- There are NO hardcoded passwords anywhere in the file
- Admin users are loaded from `process.env.ADMIN_USERS_JSON`
- If `ADMIN_USERS_JSON` is not set, the function returns `null` gracefully

---

## Step 4 — Verify .env.local Is Clean

Read `.env.local` and confirm:
- `NEXT_PUBLIC_SITE_URL` appears exactly ONCE (value: `https://intandokaziherbal.co.za`)
- `AGENT_WEBHOOK_URL` does NOT appear (removed as no longer needed)
- `EVOLUTION_API_URL=https://evolution-api-volume-production.up.railway.app`
- `EVOLUTION_API_KEY=breed-api-key-2025-secure`
- `EVOLUTION_INSTANCE_NAME=intandokazi-agent`
- `GEMINI_API_KEY` is present and not empty
- `ADMIN_USERS_JSON` is present (passwords can be placeholder for local dev)
- No variable is defined more than once

---

## Step 5 — Run Build

```bash
npm run build
```

Fix every error until the build passes clean. Do not move to Step 6 until build succeeds.

Common issues to watch for:
- Missing `export const runtime = 'nodejs'` on API routes that use Supabase
- `sessionStorage` used outside `'use client'` component
- Type mismatches on Supabase query results
- Missing imports

---

## Step 6 — Run Lint

```bash
npm run lint
```

Fix all errors. Warnings are acceptable.

---

## Step 7 — Check Git Status

```bash
git status
git diff --stat
```

This will show all files that have changed. Confirm the following files appear as modified or new:
- `src/lib/whatsapp.ts` (new)
- `src/lib/aiAgent.ts` (new)
- `src/app/api/whatsapp/webhook/route.ts` (new)
- `src/app/api/chat/route.ts` (new)
- `src/components/ChatWidget.tsx` (new)
- `src/app/store/page.tsx` (modified)
- `src/lib/auth.ts` (modified)
- `src/app/store/api/chat/route.ts` (modified)
- `src/app/api/payments/payfast/notify/route.ts` (modified)
- `add-chat-sessions.sql` (new)
- `CLAUDE.md` (new)
- `.env.local` (modified)

If any are missing from git status, something went wrong — re-check Step 1.

---

## Step 8 — Commit

```bash
git add .
git commit -m "Phase 1: unified AI agent, WhatsApp webhook, chat widget, security fixes

- Added unified aiAgent.ts powering both WhatsApp and web chat
- Added WhatsApp webhook at /api/whatsapp/webhook (Evolution API)
- Added floating ChatWidget on store page
- Added /api/chat endpoint for web widget
- Added centralised whatsapp.ts send utility
- Fixed auth.ts to use ADMIN_USERS_JSON env var (no hardcoded passwords)
- Fixed hardcoded Gemini API key in /store/api/chat
- Fixed duplicate env vars in .env.local
- Fixed Evolution API URL and instance name
- Added add-chat-sessions.sql for Supabase migration"
```

---

## Step 9 — Verify Vercel Environment Variables

List all environment variables that MUST be set in Vercel before the deployment will work. Print this list so the user can verify each one:

```
Required in Vercel dashboard (Settings → Environment Variables):

PAYFAST_MERCHANT_ID
PAYFAST_MERCHANT_KEY
PAYFAST_PASSPHRASE
PAYFAST_ENVIRONMENT

NEXT_PUBLIC_BASE_URL
NEXT_PUBLIC_SITE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

GEMINI_API_KEY
ADMIN_USERS_JSON        ← must have REAL passwords, not CHANGE_ME_IN_VERCEL

EVOLUTION_API_URL       = https://evolution-api-volume-production.up.railway.app
EVOLUTION_API_KEY       = breed-api-key-2025-secure
EVOLUTION_INSTANCE_NAME = intandokazi-agent

DISPATCH_NUMBERS        = 27685037221,27672239798
AGENT_API_SECRET

GOOGLE_CALENDAR_ID
GOOGLE_CALENDAR_CLIENT_EMAIL
GOOGLE_CALENDAR_PRIVATE_KEY
```

---

## Step 10 — Final Report

When done, report back with:

1. ✅/❌ for each of the 5 Phase 1 files (exist and correct)
2. ✅/❌ Build passes
3. ✅/❌ Lint passes  
4. ✅/❌ Git commit made — include the commit hash
5. List of any files that were missing and had to be created
6. List of any errors fixed during build/lint
7. Any blockers that need human attention before deploying to Vercel
