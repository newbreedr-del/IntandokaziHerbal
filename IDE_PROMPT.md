# IDE Prompt — Intandokazi Herbal Products v2.0

Paste this entire prompt into Claude Code, Cursor, or any AI IDE to continue development.

---

## Context

You are working on **Intandokazi Herbal Products v2.0** — a unified Next.js 14 (App Router) e-commerce and AI agent platform for a South African traditional herbal remedies business.

Read `CLAUDE.md` first. It contains the full architecture, conventions, database structure, and environment variable reference. Do not proceed until you have read it.

---

## What Was Already Built (Phase 1 — Complete)

The following files were created or modified in Phase 1. Do not rewrite or duplicate them:

| File | Status | Purpose |
|---|---|---|
| `src/lib/whatsapp.ts` | ✅ Created | Single WhatsApp send utility (`sendWhatsAppText`, `sendDispatchAlert`) |
| `src/lib/aiAgent.ts` | ✅ Created | Unified Gemini AI — powers web chat + WhatsApp, reads products from Supabase |
| `src/app/api/whatsapp/webhook/route.ts` | ✅ Created | Evolution API webhook receiver |
| `src/app/api/chat/route.ts` | ✅ Created | Web chat widget API (`POST { message, sessionId, phone? }`) |
| `src/components/ChatWidget.tsx` | ✅ Created | Floating chat bubble (green, bottom-right) |
| `src/app/store/page.tsx` | ✅ Modified | Added `<ChatWidget />` |
| `src/lib/auth.ts` | ✅ Modified | Reads admin users from `ADMIN_USERS_JSON` env var — no hardcoded passwords |
| `src/app/store/api/chat/route.ts` | ✅ Modified | Hardcoded Gemini key removed |
| `src/app/api/payments/payfast/notify/route.ts` | ✅ Modified | Uses shared whatsapp lib |
| `add-chat-sessions.sql` | ✅ Created | Supabase migration for `chat_sessions` table |
| `CLAUDE.md` | ✅ Created | Full project documentation |

---

## Your Task

Run a full verification pass on the Phase 1 changes, then complete the outstanding setup items.

### Step 1 — TypeScript Check

Run a full TypeScript type check across the project:

```bash
npm run build
```

Fix any type errors you find. Pay special attention to:
- `src/lib/aiAgent.ts` — Supabase client usage, `ChatMessage` type
- `src/components/ChatWidget.tsx` — `sessionStorage` access (must be guarded for SSR)
- `src/app/api/whatsapp/webhook/route.ts` — body parsing and optional chaining
- `src/lib/auth.ts` — `ADMIN_USERS_JSON` parse and the returned user object shape matching NextAuth's expected type

### Step 2 — Lint Check

```bash
npm run lint
```

Fix all errors. Warnings are acceptable but errors must be resolved.

### Step 3 — Manual Logic Audit

Read each Phase 1 file carefully and verify:

**`src/lib/aiAgent.ts`**
- [ ] `getProductCatalog()` correctly queries Supabase `products` table with `is_active = true`
- [ ] `getHistory()` handles the case where no session exists yet (returns `[]` not an error)
- [ ] `saveHistory()` uses `upsert` on `session_id` conflict — verify the upsert syntax is correct for Supabase JS v2
- [ ] `callGemini()` correctly maps `assistant` role to `model` for the Gemini API
- [ ] `handleWhatsAppMessage()` never throws — errors are caught and a fallback WhatsApp message is sent
- [ ] `runAgent()` returns `{ reply: string }` in all code paths including error cases

**`src/lib/whatsapp.ts`**
- [ ] `formatPhone()` correctly handles: `0821234567` → `27821234567`, `821234567` → `27821234567`, already-formatted `27821234567` → `27821234567`
- [ ] `sendWhatsAppText()` returns `false` (not throws) if env vars are missing
- [ ] `sendDispatchAlert()` correctly splits `DISPATCH_NUMBERS` on commas AND semicolons AND newlines

**`src/app/api/whatsapp/webhook/route.ts`**
- [ ] Returns HTTP 200 in ALL cases (even on parse errors) — Evolution API will retry if it gets non-200
- [ ] Correctly extracts message text from `message.conversation` AND `message.extendedTextMessage.text`
- [ ] `handleWhatsAppMessage()` is called without `await` (fire-and-forget) so webhook returns fast
- [ ] Group messages (`@g.us` JIDs) are skipped

**`src/components/ChatWidget.tsx`**
- [ ] `sessionStorage` access is inside a `try/catch` (SSR safe)
- [ ] The component is marked `'use client'`
- [ ] Typing indicator uses CSS animation (no setTimeout polling)
- [ ] Phone number prompt appears after 4 messages, not before
- [ ] Quick questions disappear after the first user message

**`src/lib/auth.ts`**
- [ ] If `ADMIN_USERS_JSON` is missing or invalid JSON, auth returns `null` (not throws)
- [ ] Password comparison is plain string equality (acceptable for now — document that bcrypt should be added in Phase 2)
- [ ] `permissions` field on returned user defaults gracefully if not in the JSON

### Step 4 — Fix Any Issues Found

Fix all issues discovered in Steps 1–3. Do not create new files unless absolutely necessary. Prefer editing existing Phase 1 files.

### Step 5 — Add Missing `runtime` Export

Verify that all API routes that use Supabase or fetch have the Node.js runtime declaration. Check each of these files and add `export const runtime = 'nodejs'` at the top if missing:

- `src/app/api/whatsapp/webhook/route.ts`
- `src/app/api/chat/route.ts`
- `src/lib/aiAgent.ts` is a lib, not a route — skip
- `src/app/api/payments/payfast/notify/route.ts` — check if it already has it

### Step 6 — Verify Store Chat Widget Integration

Open `src/app/store/page.tsx` and confirm:
- `import ChatWidget from "@/components/ChatWidget"` is present
- `<ChatWidget />` is rendered inside the return JSX, after `<CartDrawer />`
- No TypeScript errors on these lines

### Step 7 — Verify `.env.local` Has All Required Keys

Check `.env.local` and confirm these keys are present (values can be placeholders for local dev):
- `GEMINI_API_KEY` — required for AI to work
- `ADMIN_USERS_JSON` — required for admin login
- `EVOLUTION_API_URL` — required for WhatsApp
- `EVOLUTION_API_KEY` — required for WhatsApp
- `EVOLUTION_INSTANCE_NAME` — required for WhatsApp
- `DISPATCH_NUMBERS` — required for dispatch alerts
- `AGENT_API_SECRET` — required for agent API routes

If any are missing, add them with placeholder values and add a `// REQUIRED` comment.

### Step 8 — Run Build Again

After all fixes:

```bash
npm run build
```

The build must pass with zero errors before you stop. If there are errors, fix them. Keep fixing until the build is clean.

---

## Conventions To Follow

- **Never** use inline `fetch` to Evolution API — always import from `src/lib/whatsapp.ts`
- **Never** import Gemini directly in a route — always import from `src/lib/aiAgent.ts`
- **Never** hardcode API keys, passwords, or secrets — use `process.env.*`
- **All API routes** that use Node.js features must export `export const runtime = 'nodejs'`
- **Supabase writes** always use `SUPABASE_SERVICE_ROLE_KEY` via server-side `createClient()`
- **Phone numbers** are E.164 without `+` (e.g. `27821234567`) — use `formatPhone()` from `src/lib/whatsapp.ts`
- **Currency** is ZAR in rands (not cents) — format as `R{amount}`

---

## What NOT To Do

- Do not modify `src/app/api/agent/*` routes — they are stable and used by the existing WhatsApp agent
- Do not modify `src/lib/payfast.ts` — payment logic is working
- Do not delete `src/app/store/api/chat/route.ts` yet — it is still used by the product modal chat; it will be migrated in Phase 2
- Do not change the database schema — the `orders` table column names differ from the SQL file; trust the application code
- Do not add new npm packages without checking if a built-in or already-installed alternative exists first

---

## When You Are Done

Report back with:
1. Build output (pass/fail + any warnings)
2. List of files changed and what was fixed
3. Any issues you could not fix and why
4. Confirmation that all 8 steps are complete
