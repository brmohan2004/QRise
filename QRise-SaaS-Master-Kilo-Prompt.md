# QRise SaaS — Master Agentic Build Prompt for Kilo Code (Auto Model)

> Paste this entire document into Kilo Code as a single task. The auto model will execute each phase sequentially.

---

## ABSOLUTE RULES — READ BEFORE DOING ANYTHING

1. **Every file must be MAX 300–400 lines of code.** If a file exceeds 400 lines, STOP and split it into sub-components/modules before continuing.
2. **TypeScript strict mode everywhere.** No `any` types unless absolutely unavoidable (and comment why).
3. **Never hardcode secrets.** All keys/URLs read from `process.env`.
4. **After each Phase, output a checklist of created files before moving to the next Phase.**
5. **Folder-first architecture:** Pages are thin shells. All logic goes into `/lib`, `/services`, `/components`.
6. **Always create `.env.local.example`** with every env variable needed (empty values).
7. **Name exports consistently:** PascalCase for components, camelCase for functions/hooks, SCREAMING_SNAKE for constants.
8. Use `pnpm` as the package manager throughout.

---

## PRODUCT OVERVIEW

**QRise** is a full-stack QR code SaaS with:
- 5 QR types: URL, Smart Routing, Password Protected, Multiple Action, Bulk Generator
- Dynamic QR (editable redirect without reprinting)
- Per-QR analytics (scans, location, device, time)
- Drag & drop Form Builder → auto-generates a QR
- Design Studio (custom colors, logo, frames)
- API manager (keys, webhooks)
- Settings (general, billing, backup)
- Public site: Landing, Features, Pricing, API Docs, Auth pages

---

## FREE INFRASTRUCTURE (NO CARD REQUIRED)

| Service | Purpose | Free Limits | Setup |
|---|---|---|---|
| Vercel | Next.js hosting + serverless | 100GB bandwidth, 100k fn calls/mo | vercel.com — hobby plan |
| Supabase | PostgreSQL + Auth + Storage | 500MB DB, 1GB storage, 50k users | supabase.com — free plan |
| Upstash Redis | Rate limiting + cache | 10k commands/day, 256MB | upstash.com — free plan |
| Cloudflare Workers | QR redirect edge layer | 100k req/day, KV 100k reads/day | workers.cloudflare.com — free |
| Cloudflare KV | Short code → URL cache | 100k reads, 1k writes/day | Part of Workers free plan |
| Cloudinary | QR logos + QR exports | 25GB storage, 25GB bandwidth/mo | cloudinary.com — free plan |
| UploadThing | Bulk job ZIPs | 2GB total (auto-delete after 7 days) | uploadthing.com — free plan |
| Resend | Email (OTP, alerts) | 3000 emails/month | resend.com — free plan |
| GitHub Actions | CI/CD | 2000 min/month | github.com — free |

**Domain:** Use `your-app.vercel.app` (frontend) and `your-worker.workers.dev` (redirect) — both free subdomains. No custom domain needed to launch.

---

## TECH STACK

```
Framework:     Next.js 15 (App Router, TypeScript)
Styling:       Tailwind CSS v4 + shadcn/ui
State:         Zustand v5 + TanStack Query v5
Database:      Supabase (PostgreSQL) + Drizzle ORM v0.30
Auth:          Supabase Auth (built-in)
Cache:         Upstash Redis (@upstash/redis)
Edge Worker:   Cloudflare Workers (separate wrangler project)
Storage:       Cloudinary (QR logos, QR exports) + UploadThing (bulk ZIPs) + Supabase Storage (avatars only)
Email:         Resend (@resend/node)
QR Generation: qr-code-styling (client) + qrcode (server)
Charts:        Recharts
Drag & Drop:   @dnd-kit/core + @dnd-kit/sortable
Form:          React Hook Form + Zod
Animation:     Framer Motion
Icons:         Lucide React
Validation:    Zod v3
```

---

## COMPLETE FILE STRUCTURE

```
qrise/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                         # Landing page
│   │   ├── features/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── docs/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-otp/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                       # App shell with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx              # First-time create-QR flow
│   │   ├── qr-codes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── analytics/page.tsx
│   │   ├── create/
│   │   │   ├── page.tsx                     # Step 1: type selector
│   │   │   ├── [type]/page.tsx              # Step 2: config
│   │   │   └── design/page.tsx             # Step 3: design studio
│   │   ├── form-builder/page.tsx
│   │   ├── api-manager/page.tsx
│   │   └── settings/
│   │       ├── page.tsx                     # General settings
│   │       ├── billing/page.tsx
│   │       └── backup/page.tsx
│   ├── api/
│   │   ├── auth/callback/route.ts
│   │   ├── qr/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── analytics/route.ts
│   │   ├── bulk/
│   │   │   ├── route.ts
│   │   │   └── [jobId]/route.ts
│   │   ├── forms/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── api-keys/route.ts
│   │   ├── webhooks/route.ts
│   │   ├── export/route.ts
│   │   └── stats/public/route.ts
│   ├── f/[slug]/page.tsx                    # Hosted form page (public)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                                  # shadcn/ui auto-generated
│   ├── landing/
│   │   ├── hero.tsx
│   │   ├── trusted-by.tsx
│   │   ├── demo-dashboard.tsx
│   │   ├── features-section.tsx
│   │   ├── why-qrise.tsx
│   │   ├── reviews-carousel.tsx
│   │   ├── pricing-teaser.tsx
│   │   └── site-footer.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── otp-input.tsx                    # 6-box OTP input
│   │   └── provider-buttons.tsx
│   ├── app/
│   │   ├── sidebar-nav.tsx
│   │   ├── app-header.tsx
│   │   ├── stat-card.tsx
│   │   ├── activity-feed.tsx
│   │   └── user-menu.tsx
│   ├── qr/
│   │   ├── qr-preview.tsx                   # Live QR preview
│   │   ├── qr-card.tsx                      # QR library card
│   │   ├── qr-download-menu.tsx
│   │   ├── dynamic-badge.tsx
│   │   ├── wizard/
│   │   │   ├── wizard-shell.tsx
│   │   │   ├── type-selector.tsx
│   │   │   ├── url-config.tsx
│   │   │   ├── smart-routing-config.tsx
│   │   │   ├── password-config.tsx
│   │   │   ├── multi-action-config.tsx
│   │   │   └── bulk-upload.tsx
│   │   └── design-studio/
│   │       ├── studio-panel.tsx
│   │       ├── color-picker.tsx
│   │       ├── logo-uploader.tsx
│   │       ├── frame-selector.tsx
│   │       ├── dot-pattern-selector.tsx
│   │       ├── eye-shape-selector.tsx
│   │       └── scannability-score.tsx
│   ├── analytics/
│   │   ├── scan-timeline.tsx
│   │   ├── location-map.tsx
│   │   ├── device-chart.tsx
│   │   ├── time-heatmap.tsx
│   │   └── raw-events-table.tsx
│   └── form-builder/
│       ├── builder-canvas.tsx
│       ├── field-palette.tsx
│       ├── field-renderer.tsx
│       ├── field-settings-panel.tsx
│       └── form-preview.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        # Browser client
│   │   ├── server.ts                        # Server client (RSC)
│   │   └── admin.ts                         # Service role client
│   ├── db/
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── qr-codes.ts
│   │   │   ├── routing-rules.ts
│   │   │   ├── qr-actions.ts
│   │   │   ├── analytics.ts
│   │   │   ├── forms.ts
│   │   │   ├── api-keys.ts
│   │   │   ├── bulk-jobs.ts
│   │   │   └── index.ts                     # Re-exports all schemas
│   │   ├── queries/
│   │   │   ├── qr.queries.ts
│   │   │   ├── analytics.queries.ts
│   │   │   ├── user.queries.ts
│   │   │   └── form.queries.ts
│   │   └── index.ts                         # Drizzle instance
│   ├── services/
│   │   ├── qr.service.ts                    # QR CRUD business logic
│   │   ├── analytics.service.ts
│   │   ├── bulk.service.ts
│   │   ├── form.service.ts
│   │   └── export.service.ts
│   ├── redis.ts                             # Upstash client
│   ├── resend.ts                            # Resend email client
│   ├── qr-generator.ts                      # QR image generation (server)
│   ├── short-code.ts                        # Crypto short code generator
│   ├── rate-limit.ts                        # Rate limiting with Upstash
│   ├── api-key.ts                           # API key hash/verify
│   ├── bot-filter.ts                        # Bot UA list
│   └── validations/
│       ├── qr.schema.ts
│       ├── auth.schema.ts
│       └── form.schema.ts
├── stores/
│   ├── qr-wizard.store.ts                   # Wizard multi-step state
│   └── user.store.ts
├── hooks/
│   ├── use-qr-list.ts
│   ├── use-qr-analytics.ts
│   ├── use-wizard.ts
│   └── use-toast.ts
├── types/
│   ├── qr.types.ts
│   ├── analytics.types.ts
│   ├── form.types.ts
│   └── api.types.ts
├── middleware.ts                            # Auth guard (protects /app routes)
├── next.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
├── .env.local.example
└── cloudflare-worker/                       # Separate Cloudflare Worker project
    ├── src/
    │   ├── index.ts
    │   ├── redirect.ts
    │   ├── analytics-logger.ts
    │   ├── bot-filter.ts
    │   └── rate-limiter.ts
    └── wrangler.toml
```

---

## PHASE 1 — Project Foundation

### Task 1.1: Initialize Project
```bash
pnpm create next-app@latest qrise --typescript --tailwind --app --src-dir=false --import-alias="@/*"
cd qrise
pnpm add drizzle-orm @supabase/supabase-js @supabase/ssr @upstash/redis @upstash/ratelimit resend qrcode qr-code-styling recharts zustand @tanstack/react-query @tanstack/react-query-devtools framer-motion lucide-react react-hook-form zod @hookform/resolvers @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add -D drizzle-kit @types/qrcode tsx
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label select textarea tabs badge avatar dialog sheet dropdown-menu tooltip progress separator skeleton toast
```

### Task 1.2: Create Environment Config
Create `.env.local.example` with ALL of these keys:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Cloudflare Worker (redirect endpoint)
NEXT_PUBLIC_REDIRECT_BASE_URL=https://your-worker.workers.dev

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=

# Cloudflare Worker KV binding (set in wrangler.toml, not here)
```

### Task 1.3: Configure Drizzle ORM
Create `drizzle.config.ts` (max 30 lines):
```typescript
import type { Config } from 'drizzle-kit'
export default {
  schema: './lib/db/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

Create `lib/supabase/client.ts` — browser Supabase client using `createBrowserClient` from `@supabase/ssr`.
Create `lib/supabase/server.ts` — server Supabase client using `createServerClient` from `@supabase/ssr` with cookie handling for RSC and Server Actions.
Create `lib/supabase/admin.ts` — service role client for admin operations (bypass RLS).
Create `lib/db/index.ts` — Drizzle instance connected to Supabase Postgres via `DATABASE_URL`.

### Task 1.4: Create Auth Middleware
Create `middleware.ts`:
- Protect all routes under `/(app)` — redirect to `/login` if no session
- Allow all `/(public)`, `/(auth)`, `/api/auth`, `/f/` routes without auth
- Refresh session cookie on each request using Supabase SSR

---

## PHASE 2 — Database Schema

Create each schema file independently. Each schema file must stay under 150 lines.

### Task 2.1: `lib/db/schema/users.ts`
Tables: `users` (id UUID PK, email, full_name, avatar_url, plan ENUM['free','pro','business'], plan_expires_at, created_at, updated_at), `plans` (id, name, max_qr_codes, max_scans_per_month, has_analytics, has_api, has_bulk, has_design_studio, price_monthly, price_annual)

### Task 2.2: `lib/db/schema/qr-codes.ts`
Tables:
- `qr_codes` (id UUID, user_id FK, name, type ENUM['url','smart_routing','password','multi_action','bulk'], short_code VARCHAR(10) UNIQUE, target_url, is_dynamic BOOL DEFAULT true, is_active BOOL DEFAULT true, password_hash, design_config JSONB, bulk_job_id FK nullable, created_at, updated_at)
- `qr_redirect_history` (id, qr_id FK, old_url, new_url, changed_by UUID, changed_at)

### Task 2.3: `lib/db/schema/routing-rules.ts`
Tables:
- `routing_rules` (id UUID, qr_id FK, priority INT, conditions JSONB [{field: 'device'|'os'|'country'|'language'|'time_range', op: 'eq'|'in'|'between', value: string}], target_url, label, created_at)

### Task 2.4: `lib/db/schema/qr-actions.ts`
Tables:
- `qr_actions` (id UUID, qr_id FK, label, action_type ENUM['url','phone','email','map','download','whatsapp'], action_value, icon, display_order INT)

### Task 2.5: `lib/db/schema/analytics.ts`
Tables:
- `scan_events` (id UUID, qr_id FK, scanned_at TIMESTAMP, country VARCHAR(2), city, device_type ENUM['mobile','tablet','desktop'], os, browser, ip_hash VARCHAR(64), is_bot BOOL DEFAULT false, is_unique BOOL, matched_rule_id UUID nullable)
- `scan_daily_rollups` (qr_id, date DATE, total_scans, unique_scans, bot_scans) — for fast dashboard queries

### Task 2.6: `lib/db/schema/forms.ts`
Tables:
- `forms` (id UUID, user_id FK, qr_id FK, name, slug VARCHAR UNIQUE, fields_schema JSONB, success_message, is_active, created_at)
- `form_submissions` (id UUID, form_id FK, submission_data JSONB, submitted_at, ip_hash)

### Task 2.7: `lib/db/schema/api-keys.ts`
Tables:
- `api_keys` (id UUID, user_id FK, name, key_prefix VARCHAR(12), key_hash VARCHAR(64), scopes TEXT[] ['qr:read','qr:write','analytics:read','forms:read','bulk:write'], created_at, last_used_at, is_active BOOL)
- `webhooks` (id UUID, user_id FK, endpoint_url, events TEXT[], secret_hash, is_active, created_at)
- `webhook_deliveries` (id UUID, webhook_id FK, event_type, payload JSONB, response_status, delivered_at, attempts INT)

### Task 2.8: `lib/db/schema/bulk-jobs.ts`
Tables:
- `bulk_jobs` (id UUID, user_id FK, status ENUM['queued','processing','done','failed'], total_rows INT, processed_rows INT DEFAULT 0, zip_url, error_log JSONB, created_at, updated_at)

### Task 2.9: `lib/db/schema/index.ts`
Re-export all schemas and define all relations using Drizzle `relations()`.

---

## PHASE 3 — Core Utilities

### Task 3.1: `lib/short-code.ts` (max 50 lines)
- `generateShortCode()`: uses `crypto.randomBytes(6).toString('base64url')` → returns 8-char URL-safe string
- `validateShortCode(code: string)`: checks format
- Collision detection: check DB for existing code, retry up to 5 times

### Task 3.2: `lib/api-key.ts` (max 80 lines)
- `generateApiKey()`: returns `{ raw: 'qr_live_' + crypto.randomBytes(24).toString('hex'), prefix: first 12 chars }`
- `hashApiKey(raw: string)`: SHA-256 hash using Web Crypto API
- `verifyApiKey(raw: string, hash: string)`: constant-time comparison
- NEVER log or return the raw key after initial generation

### Task 3.3: `lib/rate-limit.ts` (max 80 lines)
Use `@upstash/ratelimit` with sliding window:
- `rateLimitByIP(ip: string, action: string, limit: number, window: string)`: generic rate limiter
- Presets: `authAttempts` (5/15min), `otpRequests` (5/hour), `apiRequests` (100/min), `qrScans` (1000/min)
- Returns `{ success: boolean, remaining: number, reset: number }`

### Task 3.4: `lib/bot-filter.ts` (max 100 lines)
- `isBotUserAgent(ua: string)`: check against known bot UA substrings (Googlebot, bingbot, curl, wget, python-requests, node-fetch, Go-http, etc. — include at least 30 common bots)
- `isLikelyBot(req: { ua: string, hasJsCookie: boolean })`: composite check

### Task 3.5: `lib/qr-generator.ts` (max 120 lines)
Server-side QR image generation:
- `generateQRBuffer(data: string, options: QROptions): Promise<Buffer>` — uses `qrcode` npm package
- `generateQRSVG(data: string, options: QROptions): Promise<string>` — returns SVG string
- `QROptions`: { dotColor, backgroundColor, logoUrl?, errorCorrectionLevel, size }
- `calculateScannabilityScore(dotColor: string, bgColor: string, logoCoveragePercent: number): number` — returns 0–100 score

### Task 3.6: `lib/resend.ts` (max 60 lines)
- Initialize Resend client
- `sendOTPEmail(to: string, otp: string, expiresInMinutes: number)`
- `sendWelcomeEmail(to: string, name: string)`
- `sendQRReadyEmail(to: string, jobId: string, downloadUrl: string)` — for bulk job completion
- `sendAlertEmail(to: string, subject: string, message: string)` — for password QR brute-force alerts

---

## PHASE 4 — Authentication System

### Task 4.1: `app/(auth)/layout.tsx` (max 60 lines)
Centered auth layout with QRise logo, no sidebar, clean white background.

### Task 4.2: `components/auth/provider-buttons.tsx` (max 80 lines)
- `GoogleSignInButton`: calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
- `AppleSignInButton`: calls `supabase.auth.signInWithOAuth({ provider: 'apple' })`
- Both redirect to `/auth/callback` on success

### Task 4.3: `components/auth/otp-input.tsx` (max 100 lines)
- 6 individual `<input>` boxes, each max 1 char
- Auto-advance to next box on input
- Backspace navigates to previous box
- Paste: detect paste event, distribute digits across boxes
- On 6th digit entry: auto-submit form
- Expose `value: string` and `onChange(val: string)` props

### Task 4.4: `components/auth/register-form.tsx` (max 150 lines)
- React Hook Form + Zod validation
- Fields: email, password, full_name
- Provider buttons at top with "or continue with email" divider
- On submit: `supabase.auth.signUp()` → redirect to `/verify-otp`
- Show loading state, error handling

### Task 4.5: `components/auth/login-form.tsx` (max 150 lines)
- React Hook Form + Zod
- Fields: email, password + "Remember me" checkbox
- Provider buttons
- Link to `/forgot-password`
- On submit: `supabase.auth.signInWithPassword()` → redirect to `/dashboard`

### Task 4.6: `app/(auth)/verify-otp/page.tsx` (max 100 lines)
- Display OTP input component
- Show email address that OTP was sent to
- Resend button with 60s cooldown timer
- On verify: `supabase.auth.verifyOtp()` → redirect to `/dashboard`
- Show attempt count remaining (max 3)

### Task 4.7: `app/(auth)/forgot-password/page.tsx` (max 100 lines)
- Step 1: email input → call `supabase.auth.resetPasswordForEmail()`
- Step 2: OTP input (redirect from email link)
- Step 3: new password input → `supabase.auth.updateUser({ password })`
- Three-step local state machine

### Task 4.8: `app/api/auth/callback/route.ts` (max 60 lines)
Handle OAuth callback: exchange code for session using `supabase.auth.exchangeCodeForSession()`, redirect to `/dashboard` on success.

---

## PHASE 5 — Cloudflare Worker (QR Redirect Engine)

Create a SEPARATE project in `cloudflare-worker/` directory. This is deployed independently to Cloudflare Workers.

### Task 5.1: `cloudflare-worker/wrangler.toml`
```toml
name = "qrise-redirect"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "QR_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_KV_ID"

[vars]
SUPABASE_URL = ""
SUPABASE_SERVICE_KEY = ""
ANALYTICS_ENDPOINT = ""
```

### Task 5.2: `cloudflare-worker/src/bot-filter.ts` (max 120 lines)
- `BOT_UA_PATTERNS`: array of 30+ bot user agent substrings
- `isBot(userAgent: string): boolean`: check against patterns
- `parseDevice(ua: string): { type: 'mobile'|'tablet'|'desktop', os: string, browser: string }`: simple UA parsing

### Task 5.3: `cloudflare-worker/src/rate-limiter.ts` (max 80 lines)
- Use Cloudflare KV to implement sliding window rate limiting
- `checkRateLimit(kv: KVNamespace, key: string, limit: number, windowSec: number): Promise<{ allowed: boolean, remaining: number }>`
- Key format: `rl:{action}:{identifier}:{windowSlot}`

### Task 5.4: `cloudflare-worker/src/analytics-logger.ts` (max 100 lines)
- `logScanEvent(event: ScanEvent): Promise<void>`
- `ScanEvent`: { qr_id, country, city, device_type, os, browser, ip_hash, is_bot, is_unique, matched_rule_id? }
- Log to Supabase via REST API (POST to `/rest/v1/scan_events`)
- Use `waitUntil()` so it doesn't block the redirect

### Task 5.5: `cloudflare-worker/src/redirect.ts` (max 150 lines)
- `resolveRedirect(shortCode: string, kv: KVNamespace, supabaseUrl: string, supabaseKey: string): Promise<{ targetUrl: string, qrId: string, type: string, data: any } | null>`
- Check KV cache first (key: `qr:{shortCode}`)
- On KV miss: fetch from Supabase REST API
- Cache result in KV with 60s TTL
- For `smart_routing` type: evaluate routing rules (see rule evaluator logic below)
- For `password` type: return `{ type: 'password', qrId, ... }` to trigger password gate

**Rule evaluator logic** (include in redirect.ts):
```typescript
function evaluateRules(rules: RoutingRule[], context: RequestContext): string | null {
  const sorted = rules.sort((a, b) => a.priority - b.priority)
  for (const rule of sorted) {
    if (rule.conditions.every(c => evaluateCondition(c, context))) {
      return rule.targetUrl
    }
  }
  return null
}
// Add circular redirect prevention: check X-QRise-Hops header, abort if >= 3
```

### Task 5.6: `cloudflare-worker/src/index.ts` (max 200 lines)
Main worker handler:
```
GET /r/{shortCode}
  1. Check X-QRise-Hops header — if >= 3, return 400 "Redirect loop detected"
  2. Parse User-Agent → isBot check
  3. Resolve redirect (KV → DB)
  4. If not found → 404 branded page
  5. If type=password → serve password HTML page
  6. If type=multi_action → serve action menu HTML page (pre-rendered)
  7. Otherwise → 302 redirect to targetUrl
  8. Set X-QRise-Hops = (current + 1) on redirect
  9. waitUntil: log scan event (non-blocking)

POST /r/{shortCode}/unlock
  1. Rate limit: 5 attempts per IP per QR per 15min
  2. Get password_hash from DB
  3. Compare (use bcrypt-wasm for edge compatibility)
  4. If match: set unlock_session cookie (JWT, 24h) → 302 to targetUrl
  5. If fail: increment attempt counter → if >= 5: log alert → 429 response

GET /r/{shortCode}/actions
  Returns JSON of QR actions for multi-action type
```

---

## PHASE 6 — Public Pages

### Task 6.1: `app/(public)/layout.tsx` (max 80 lines)
Public layout with sticky navigation (Logo, Features, Pricing, Docs links, Login + "Get started" CTA buttons).

### Task 6.2: `components/landing/hero.tsx` (max 150 lines)
- Headline: "The QR platform that thinks ahead"
- Sub-headline with key value props
- Two CTAs: "Start free" → `/register`, "See demo" → smooth scroll to demo section
- Animated QR code graphic using CSS keyframe animations (no external 3D lib needed — use CSS transforms)
- Hero is above the fold, mobile responsive

### Task 6.3: `components/landing/trusted-by.tsx` (max 60 lines)
- "Trusted by teams at" heading
- Row of 6 company name placeholders with subtle grayscale logo treatment
- Marquee animation (CSS-only infinite scroll)

### Task 6.4: `components/landing/demo-dashboard.tsx` (max 120 lines)
- Static mockup of the dashboard using real shadcn/ui components
- Shows stat cards, a mini line chart (Recharts), and 3 fake QR code cards
- Framed in a browser chrome mockup
- "Explore demo" button below

### Task 6.5: `components/landing/features-section.tsx` (max 150 lines)
- 6-card grid of features with icons, names, short descriptions
- Cards have hover lift effect (Framer Motion)
- Features: Dynamic QR, Smart Routing, Analytics, Design Studio, Form Builder, Bulk Generator

### Task 6.6: `components/landing/why-qrise.tsx` (max 100 lines)
- 3-column comparison layout: QRise vs Static QR tools vs Competitor SaaS
- Check/cross matrix

### Task 6.7: `components/landing/reviews-carousel.tsx` (max 120 lines)
- 6 review cards with avatar initials, name, role, company, rating stars, review text
- CSS-scroll-snap carousel, no external carousel lib
- Auto-advances every 4 seconds, pauses on hover

### Task 6.8: `components/landing/site-footer.tsx` (max 100 lines)
- 4-column footer: Product links, Resources, Company, Connect
- Newsletter email capture (POST to `/api/newsletter`)
- Copyright line

### Task 6.9: `app/(public)/features/page.tsx` + split into sections (max 300 lines total across files)
- Hero section with all features in a grid
- "Upcoming features" section: 4 blurred locked cards
- Each locked card: blurred preview image, hint text, input field + "Guess" button
- On guess: POST to `/api/features/guess` → if match: show gift modal with confetti

### Task 6.10: `app/(public)/pricing/page.tsx` (max 300 lines)
- Monthly/Annual toggle (state: saves 20% on annual)
- 4 plan cards: Free ($0), Pro ($12/mo), Business ($39/mo), Enterprise (custom)
- Pro card has "Most Popular" badge and highlighted border
- Feature comparison accordion below cards
- FAQ section at bottom

### Task 6.11: `app/(public)/docs/page.tsx` (max 300 lines)
Split into:
- `app/(public)/docs/page.tsx` — layout with left sidebar nav + content area
- `components/docs/endpoint-card.tsx` — shows method, path, description, params, response
- `components/docs/code-tabs.tsx` — JS/Python/cURL tab switcher with syntax highlight (use `<pre>` + Tailwind prose classes)
- Document these endpoints: `GET /qr`, `POST /qr`, `GET /qr/{id}`, `PUT /qr/{id}`, `DELETE /qr/{id}`, `GET /qr/{id}/analytics`

---

## PHASE 7 — App Shell & Dashboard

### Task 7.1: `components/app/sidebar-nav.tsx` (max 150 lines)
- Vertical sidebar with logo, nav items, user menu at bottom
- Nav items: Dashboard, My QR Codes, Form Builder, API Manager, Settings
- "+ Create QR" prominent button at top
- Collapse to icon-only on mobile
- Active item highlighted
- Uses Next.js `usePathname()` for active state

### Task 7.2: `app/(app)/layout.tsx` (max 80 lines)
- Grid layout: sidebar (fixed, 240px) + main content area
- Mobile: sidebar slides in as drawer (use shadcn Sheet)
- Wrap with `QueryClientProvider` and `Toaster`

### Task 7.3: `components/app/stat-card.tsx` (max 60 lines)
- Props: `label, value, delta?, deltaLabel?, icon, isLoading`
- Shows skeleton while loading
- Delta shows green/red arrow with percentage change

### Task 7.4: `app/(app)/dashboard/page.tsx` (max 200 lines)
Split into:
- `app/(app)/dashboard/page.tsx` — page shell, data fetching with TanStack Query
- `components/app/dashboard-stats.tsx` — 4 stat cards row (Total QRs, Total Scans, Active QRs, Today's Scans)
- `components/app/scan-trend-chart.tsx` — Recharts AreaChart with 7/30/90 day toggle
- `components/app/world-scan-map.tsx` — simplified SVG world map (use react-simple-maps or a static SVG with country highlights)
- `components/app/recent-activity-feed.tsx` — list of last 10 scan events with QR name, flag emoji, device icon, timestamp

**First-time user:** If `totalQrCodes === 0`, replace dashboard content with `components/app/onboarding-card.tsx` — large CTA card "Create your first QR code" with illustration.

---

## PHASE 8 — My QR Codes Page

### Task 8.1: `app/(app)/qr-codes/page.tsx` (max 150 lines)
- Page with search + filter bar at top
- View toggle: grid / list
- Renders list of `QrCard` components
- Infinite scroll using TanStack Query `useInfiniteQuery`
- Filter state in URL params (type, status, sort)

### Task 8.2: `components/qr/qr-card.tsx` (max 150 lines)
- Shows: QR thumbnail (from `/api/qr/{id}/image`), name, type badge, scan count, last scan, dynamic badge
- Hover reveals action buttons: Edit (→ wizard step 2), Analytics, Copy short URL, Download, Delete
- Delete: optimistic UI (remove immediately, rollback on error, show toast)

### Task 8.3: `components/qr/qr-download-menu.tsx` (max 80 lines)
- Dropdown with: PNG 72dpi, PNG 300dpi, SVG, PDF
- Each triggers `GET /api/qr/{id}/export?format=png&dpi=72`

### Task 8.4: `app/(app)/qr-codes/[id]/analytics/page.tsx` (max 200 lines)
Split:
- `page.tsx` — data fetching, date range state, tabs
- `components/analytics/scan-timeline.tsx` — Recharts LineChart with date picker
- `components/analytics/location-map.tsx` — SVG world map + country table (sorted by scans)
- `components/analytics/device-chart.tsx` — PieChart for device type + BarChart for OS
- `components/analytics/time-heatmap.tsx` — 7×24 grid showing scan intensity by hour/day (CSS grid with opacity-based heat coloring)
- `components/analytics/raw-events-table.tsx` — paginated table: timestamp, country flag, device icon, OS, browser, unique badge

---

## PHASE 9 — QR Creation Wizard

The wizard has 3 steps. State is managed by a Zustand store. State persists in localStorage (not DB — no draft bloat).

### Task 9.1: `stores/qr-wizard.store.ts` (max 120 lines)
```typescript
interface WizardState {
  step: 1 | 2 | 3
  qrType: QRType | null
  config: Partial<QRConfig>       // Type-specific config
  design: Partial<QRDesign>       // Design studio settings
  isDynamic: boolean
  editingQrId: string | null      // Set when editing existing QR
  setStep: (step: number) => void
  setType: (type: QRType) => void
  setConfig: (config: Partial<QRConfig>) => void
  setDesign: (design: Partial<QRDesign>) => void
  setDynamic: (val: boolean) => void
  reset: () => void
}
// Persist to localStorage via zustand/middleware persist
```

### Task 9.2: `app/(app)/create/page.tsx` — Step 1: Type Selector (max 150 lines)
- Grid of 5 QR type cards + Dynamic QR toggle at bottom
- Each card: icon, name, short description, hover highlight
- Types: URL, Smart Routing, Password Protected, Multiple Action, Bulk Generator
- Dynamic toggle with explanation tooltip: "Change your destination URL anytime without reprinting"
- On type select: save to wizard store → navigate to `/create/{type}`

### Task 9.3: `app/(app)/create/[type]/page.tsx` (max 100 lines)
- Route handler for all 5 types
- Renders the matching config component + live QR preview panel side by side
- "Back" button → Step 1, "Next: Design Studio" button → `/create/design`

### Task 9.4: `components/qr/wizard/url-config.tsx` (max 150 lines)
- URL input with validation (must be valid URL, http/https only)
- UTM builder accordion (utm_source, utm_medium, utm_campaign, utm_term, utm_content) — auto-appends to URL
- QR name input
- Live preview QR updates on URL change (debounced 500ms)

### Task 9.5: `components/qr/wizard/smart-routing-config.tsx` (max 300 lines)
- Add rule button → adds a rule row
- Each rule row: condition fields (field selector + operator + value) + target URL + priority drag handle
- Field options: Device Type, OS, Country, Language, Time of Day
- Condition operators: equals, is one of, is between (for time)
- Default URL field: fallback when no rule matches
- Rule rows are drag-sortable using @dnd-kit
- Max 10 rules per QR (enforce with disabled "Add rule" button)
- Circular redirect guard: validate that no target URL matches the QRise redirect domain

### Task 9.6: `components/qr/wizard/password-config.tsx` (max 120 lines)
- Target URL input
- Password input with show/hide toggle
- Confirm password field
- "Password strength" indicator (weak/medium/strong)
- Note: "Password is hashed and stored securely. QRise staff cannot see it."

### Task 9.7: `components/qr/wizard/multi-action-config.tsx` (max 200 lines)
- "Add action" button → action form modal
- Action types: URL, Phone (tel:), Email (mailto:), Map (maps://), Download, WhatsApp
- Each action: icon picker + label + value input
- Action list with drag-to-reorder (@dnd-kit)
- Max 8 actions per QR

### Task 9.8: `components/qr/wizard/bulk-upload.tsx` (max 250 lines)
Split:
- `bulk-upload.tsx` — CSV drag & drop zone + upload button
- `bulk-data-table.tsx` — editable table rendered from parsed CSV (max 300 lines)
  - PapaParse for client-side CSV parsing
  - Column mapping: dropdowns to assign which column = Name, which = URL
  - Row-level validation: highlight invalid URLs in red
  - Edit cells inline
  - Shows row count, valid count, error count

### Task 9.9: `app/(app)/create/design/page.tsx` + Design Studio (max 300 lines total)
Split into:
- `app/(app)/create/design/page.tsx` — layout: left = controls, right = live preview (max 100 lines)
- `components/qr/design-studio/studio-panel.tsx` — tabs: Style, Logo, Frame (max 150 lines)
- `components/qr/design-studio/color-picker.tsx` — dot color + background color pickers using `<input type="color">` with presets (max 80 lines)
- `components/qr/design-studio/logo-uploader.tsx` — upload logo image to Supabase Storage, preview centered on QR (max 100 lines)
- `components/qr/design-studio/frame-selector.tsx` — grid of 6 frame styles (none, simple border, rounded, badge below, badge above, speech bubble) (max 100 lines)
- `components/qr/design-studio/scannability-score.tsx` — live score 0–100, color-coded, blocks "Finish" if < 60 (max 80 lines)

### Task 9.10: `components/qr/qr-preview.tsx` (max 150 lines)
- Uses `qr-code-styling` library (client-side)
- Props: `data: string, options: QRDesign`
- Re-renders whenever options change (debounced 300ms)
- Shows scannability score overlay
- Download button (PNG)
- "Finish & create" button → POST to `/api/qr` → success toast + option to create another

---

## PHASE 10 — API Routes

### Task 10.1: `app/api/qr/route.ts` (max 150 lines)
```
GET /api/qr
  - Auth check
  - Query params: type, status, search, page, limit
  - Returns paginated list from DB

POST /api/qr
  - Auth + plan limit check (max QRs per plan)
  - Validate body with Zod
  - Generate short_code using lib/short-code.ts
  - Hash password if type=password (bcrypt, cost=12)
  - Insert to qr_codes table
  - If is_dynamic: invalidate Cloudflare KV (DELETE request to worker admin endpoint)
  - Return created QR
```

### Task 10.2: `app/api/qr/[id]/route.ts` (max 200 lines)
```
GET /api/qr/{id} — return full QR data with design config
PUT /api/qr/{id} — update QR config, insert to qr_redirect_history on URL change, invalidate KV cache
DELETE /api/qr/{id} — soft delete (set is_active=false), return 204
```

### Task 10.3: `app/api/qr/[id]/analytics/route.ts` (max 150 lines)
```
GET /api/qr/{id}/analytics?range=7d&tab=overview
  - Auth + ownership check
  - Query scan_events from Supabase (filtered by qr_id + date range)
  - Aggregate: total, unique, by country, by device, by hour-of-day
  - Filter out is_bot=true records from counts
  - Return structured analytics response
```

### Task 10.4: `app/api/bulk/route.ts` + `app/api/bulk/[jobId]/route.ts` (max 200 lines)
```
POST /api/bulk
  - Auth + plan check (bulk feature gated to Business plan)
  - Validate CSV rows (max 1000 rows on free)
  - Create bulk_jobs record (status: queued)
  - Trigger async processing using Vercel Cron-compatible background task
  - Return { jobId }

GET /api/bulk/{jobId}
  - Auth + ownership check
  - Return job status, progress, download URL if done
```

### Task 10.5: `app/api/api-keys/route.ts` (max 150 lines)
```
GET /api/api-keys — list user's keys (return prefix + metadata, NEVER hash)
POST /api/api-keys — generate key, hash it, return raw key ONCE, store hash
DELETE /api/api-keys/{id} — set is_active=false
```

### Task 10.6: API key middleware `lib/api-key-middleware.ts` (max 100 lines)
- For API routes that accept `Authorization: Bearer {key}`
- Extract key → hash → look up in DB → verify scopes → attach user to request context
- Return 401 if invalid, 403 if insufficient scope

---

## PHASE 11 — Form Builder

### Task 11.1: `app/(app)/form-builder/page.tsx` (max 100 lines)
- Two-column layout: field palette (left) + builder canvas (center-right)
- "Save & generate QR" button in header
- Form name input at top of canvas

### Task 11.2: `components/form-builder/field-palette.tsx` (max 100 lines)
- Draggable field type cards: Text, Email, Phone, Dropdown, Checkbox Group, Date, File Upload, Signature
- Each is a drag source (useDraggable from @dnd-kit)
- Visual drag handle

### Task 11.3: `components/form-builder/builder-canvas.tsx` (max 200 lines)
- Drop zone (useDroppable from @dnd-kit)
- Renders list of dropped fields in order
- Each field is sortable (useSortable)
- Click field: open settings panel (right side)
- DndContext wraps everything

### Task 11.4: `components/form-builder/field-renderer.tsx` (max 200 lines)
- Renders preview of each field type based on schema
- Shows label, placeholder, required indicator, validation hint
- Not interactive (shows what end-user will see)

### Task 11.5: `components/form-builder/field-settings-panel.tsx` (max 200 lines)
- Slide-in panel when field is selected
- Common settings: label, placeholder, required toggle, helper text
- Type-specific: Dropdown → options list editor, Checkbox → options, Date → min/max date

### Task 11.6: Save flow (max 100 lines added to page.tsx or as separate hook)
- "Save" → POST to `/api/forms` with `{ name, fields_schema, success_message }`
- API creates form record + generates Dynamic QR pointing to `/f/{slug}`
- Show QR preview modal with download options
- `app/f/[slug]/page.tsx` — public form page rendering the form from `fields_schema`

---

## PHASE 12 — API Manager & Settings

### Task 12.1: `app/(app)/api-manager/page.tsx` (max 150 lines)
Split:
- Page shell with two sections: API Keys + Webhooks
- `components/app/api-keys-section.tsx` — create key form (name, scopes checkboxes), keys table with last-used and revoke button (max 150 lines)
- `components/app/webhooks-section.tsx` — add webhook URL + event checkboxes, webhook list, delivery log table (max 150 lines)

### Task 12.2: `app/(app)/settings/page.tsx` (max 150 lines)
- Tabs: General, Backup, Billing
- `components/settings/general-tab.tsx` — profile form (name, avatar upload, timezone select, language select, email notification toggles) (max 150 lines)
- `components/settings/backup-tab.tsx` — "Export all QRs" button (triggers async job), "Export form submissions" button, job status indicator (max 100 lines)
- `components/settings/billing-tab.tsx` — current plan card, features list, "Upgrade" CTA, invoice table (mock data — integrate Stripe later) (max 150 lines)

---

## PHASE 13 — Security Hardening

### Task 13.1: GDPR scan consent (max 80 lines added to `cloudflare-worker/src/index.ts`)
- Detect if request origin is EU/UK/CA/BR from `CF-IPCountry` header
- If GDPR region AND no `qrise_consent` cookie: serve consent interstitial HTML before redirecting
- Consent page has "Continue" button → sets cookie → redirects to target
- All scan data logged at country level only (no city) unless consent given

### Task 13.2: Scan event uniqueness (add to `analytics-logger.ts`)
- Generate uniqueness key: `SHA-256(qr_id + date + ip_truncated + ua_hash)`
- Check Cloudflare KV for this key (TTL: 24h)
- If key exists: set `is_unique=false` on scan event
- If not: set `is_unique=true` and write key to KV

### Task 13.3: QR change history trigger (add to PUT `/api/qr/{id}/route.ts`)
- If `target_url` is being changed: INSERT into `qr_redirect_history` before updating
- Return last 10 history entries with the QR detail response

---

## FINAL TASKS

### Task F.1: `middleware.ts` — complete auth guard
Protect all `/(app)` routes. Public routes, auth routes, `/f/`, `/api/auth` are all open. Use `@supabase/ssr` `updateSession` pattern.

### Task F.2: `next.config.ts`
- Set security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- Configure image domains for Supabase Storage
- Set `serverExternalPackages: ['bcrypt']` for edge-incompatible packages

### Task F.3: Error boundaries and loading states
- Create `app/error.tsx` and `app/(app)/error.tsx` — friendly error pages
- Create `app/loading.tsx` — app-wide loading skeleton
- Every page should have a `loading.tsx` sibling showing skeleton UI

### Task F.4: `README.md`
Document all environment variables, local setup steps, Cloudflare Worker deployment steps, Supabase setup steps (enable auth providers, run migrations).

---

## DEPLOYMENT CHECKLIST

After build is complete, output these deployment instructions:

1. **Supabase:** Create project → run migrations → enable Email, Google, Apple auth providers → copy ANON_KEY and SERVICE_ROLE_KEY
2. **Upstash:** Create Redis database → copy REST_URL and REST_TOKEN
3. **Resend:** Create account → verify domain (or use resend.dev for testing) → copy API key
4. **Cloudflare Workers:** `wrangler login` → `wrangler kv:namespace create QR_KV` → update wrangler.toml with KV ID → `wrangler deploy`
5. **Vercel:** Import GitHub repo → add all env vars → deploy
6. **Update env vars:** Set `NEXT_PUBLIC_REDIRECT_BASE_URL` to your `*.workers.dev` URL

---

*End of QRise SaaS Master Prompt*
