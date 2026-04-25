# QRise SaaS — Multi-Agent Master Prompt for Kilo Code (Auto Model)
# Version: Multi-Agent Edition | Rate Limit: 180 requests/hour (Kilo Free Plan)

---

## HOW THIS PROMPT WORKS

This project uses **9 specialized agents** working in a defined sequence.
Each agent has a specific domain, a request budget, and hands off verified artifacts to the next agent.

**Start here:** Spawn Agent 0 (Orchestrator) first. It will spawn and coordinate all other agents.

---

## GLOBAL RULES — ALL AGENTS MUST FOLLOW

```
RULE 1  Every file: MAX 300–400 lines. Exceed 400 → split before continuing.
RULE 2  TypeScript strict mode everywhere. Zero `any` types without a comment explaining why.
RULE 3  No secrets hardcoded. All from process.env — always read .env.local.example first.
RULE 4  pnpm is the only package manager.
RULE 5  After every file created, output: ✅ {filename} ({line count} lines)
RULE 6  After every 40 requests used, output: 📊 REQUEST BUDGET: {used}/180 used this hour.
RULE 7  If budget reaches 160/180 → STOP, output a RESUME CHECKPOINT, wait for next hour.
RULE 8  Agents do NOT re-do work from previous agents. Read existing files first.
RULE 9  Each agent announces itself: 🤖 AGENT {N} — {NAME} — STARTING
RULE 10 Each agent ends with: ✅ AGENT {N} COMPLETE — Handoff to Agent {N+1}
```

---

## REQUEST BUDGET GUIDE (180 req/hr free plan)

Each request = one AI generation call. Budget breakdown per agent:

| Agent | Name | Budget | Reason |
|---|---|---|---|
| Agent 0 | Orchestrator | 10 req | Planning only, no file generation |
| Agent 1 | Foundation | 35 req | Setup, config, schema (many small files) |
| Agent 2 | Cloud Worker | 25 req | Cloudflare Worker (5 focused files) |
| Agent 3 | Auth & Public | 35 req | Auth system + 4 public pages |
| Agent 4 | QR Engine | 40 req | Wizard + 5 QR types + Design Studio |
| Agent 5 | Dashboard | 30 req | Dashboard + QR library + analytics |
| Agent 6 | Features | 30 req | Form builder + API manager + settings |
| Agent 7 | API Routes | 25 req | All backend route handlers |
| Agent 8 | Security & Polish | 20 req | Security, error boundaries, README |

**Total: 250 req** spread across multiple hour windows. Agents 0–3 in hour 1, Agents 4–6 in hour 2, Agents 7–8 in hour 3.

---

## RESUME CHECKPOINT FORMAT

When any agent hits 160/180 requests, output exactly this block and stop:

```
⏸️  RESUME CHECKPOINT
═══════════════════════════════
Agent:        Agent {N} — {Name}
Completed:    {list files created this session}
Stopped at:   {last task description}
Next task:    {exact next task to resume from}
Resume with:  "Resume Agent {N} from: {Next task}"
═══════════════════════════════
Wait ~1 hour for Kilo rate limit reset, then paste the resume command.
```

---

## TECH STACK & FREE INFRASTRUCTURE

```
Framework:     Next.js 15 (App Router, TypeScript strict)
Styling:       Tailwind CSS v4 + shadcn/ui
State:         Zustand v5 + TanStack Query v5
Database:      Supabase PostgreSQL + Drizzle ORM v0.30
Auth:          Supabase Auth (built-in, no extra config)
Cache/Rate:    Upstash Redis (@upstash/redis + @upstash/ratelimit)
Edge Worker:   Cloudflare Workers (separate wrangler project)
Edge Cache:    Cloudflare KV (short_code → URL, 60s TTL)
Storage:       Cloudinary (QR logos, QR exports) + UploadThing (bulk ZIPs) + Supabase Storage (avatars only)
Email:         Resend (@resend/node)
QR Client:     qr-code-styling (browser)
QR Server:     qrcode (Node.js)
Charts:        Recharts
DnD:           @dnd-kit/core + @dnd-kit/sortable
Forms:         React Hook Form + Zod
Animation:     Framer Motion
Icons:         Lucide React
Package mgr:   pnpm
```

**Free Services (zero card required):**
- Vercel hobby → frontend + API routes
- Supabase free → 500MB DB, 1GB storage, 50k auth users
- Upstash free → 10k Redis commands/day
- Cloudflare Workers free → 100k req/day + KV 100k reads/day
- Cloudinary free → 25GB storage, 25GB bandwidth/month
- UploadThing free → 2GB total storage (auto-deletes after 7 days)
- Resend free → 3000 emails/month
- GitHub free → source control + CI

---

## PROJECT FILE STRUCTURE (Reference for all agents)

```
qrise/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing
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
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── qr-codes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/analytics/page.tsx
│   │   ├── create/
│   │   │   ├── page.tsx
│   │   │   ├── [type]/page.tsx
│   │   │   └── design/page.tsx
│   │   ├── form-builder/page.tsx
│   │   ├── api-manager/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── billing/page.tsx
│   │       └── backup/page.tsx
│   ├── api/
│   │   ├── auth/callback/route.ts
│   │   ├── qr/route.ts
│   │   ├── qr/[id]/route.ts
│   │   ├── qr/[id]/analytics/route.ts
│   │   ├── qr/[id]/export/route.ts
│   │   ├── bulk/route.ts
│   │   ├── bulk/[jobId]/route.ts
│   │   ├── forms/route.ts
│   │   ├── forms/[id]/route.ts
│   │   ├── api-keys/route.ts
│   │   ├── webhooks/route.ts
│   │   ├── export/route.ts
│   │   └── stats/public/route.ts
│   ├── f/[slug]/page.tsx               # Public hosted form
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn (auto-generated)
│   ├── landing/
│   │   ├── hero.tsx
│   │   ├── trusted-by.tsx
│   │   ├── demo-dashboard.tsx
│   │   ├── features-section.tsx
│   │   ├── why-qrise.tsx
│   │   ├── reviews-carousel.tsx
│   │   └── site-footer.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── otp-input.tsx
│   │   └── provider-buttons.tsx
│   ├── app/
│   │   ├── sidebar-nav.tsx
│   │   ├── app-header.tsx
│   │   ├── stat-card.tsx
│   │   ├── activity-feed.tsx
│   │   ├── scan-trend-chart.tsx
│   │   ├── world-scan-map.tsx
│   │   ├── onboarding-card.tsx
│   │   └── user-menu.tsx
│   ├── qr/
│   │   ├── qr-preview.tsx
│   │   ├── qr-card.tsx
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
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
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
│   │   │   └── index.ts
│   │   ├── queries/
│   │   │   ├── qr.queries.ts
│   │   │   ├── analytics.queries.ts
│   │   │   ├── user.queries.ts
│   │   │   └── form.queries.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── qr.service.ts
│   │   ├── analytics.service.ts
│   │   ├── bulk.service.ts
│   │   ├── form.service.ts
│   │   └── export.service.ts
│   ├── redis.ts
│   ├── resend.ts
│   ├── qr-generator.ts
│   ├── short-code.ts
│   ├── rate-limit.ts
│   ├── api-key.ts
│   ├── bot-filter.ts
│   └── validations/
│       ├── qr.schema.ts
│       ├── auth.schema.ts
│       └── form.schema.ts
├── stores/
│   ├── qr-wizard.store.ts
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
├── middleware.ts
├── next.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
├── .env.local.example
└── cloudflare-worker/
    ├── src/
    │   ├── index.ts
    │   ├── redirect.ts
    │   ├── analytics-logger.ts
    │   ├── bot-filter.ts
    │   └── rate-limiter.ts
    └── wrangler.toml
```

---

# ════════════════════════════════════════════
# AGENT 0 — ORCHESTRATOR
# Budget: 10 requests | Role: Plan, verify, coordinate
# ════════════════════════════════════════════

## Agent 0 Prompt (paste this to start the entire project)

```
You are Agent 0 — the ORCHESTRATOR for building QRise SaaS.

🤖 AGENT 0 — ORCHESTRATOR — STARTING

Your job is to:
1. Initialize the project
2. Confirm the environment
3. Brief each agent on exactly what to do and in what order
4. Never generate implementation code yourself

STEP 1 — Project Init (use 3 requests max):

Run these commands in the terminal:
  pnpm create next-app@latest qrise --typescript --tailwind --app --src-dir=false --import-alias="@/*"
  cd qrise
  mkdir -p components/{landing,auth,app,qr/wizard,qr/design-studio,analytics,form-builder} lib/{supabase,db/schema,db/queries,services,validations} stores hooks types cloudflare-worker/src

STEP 2 — Install all dependencies (1 request):
  pnpm add drizzle-orm @supabase/supabase-js @supabase/ssr @upstash/redis @upstash/ratelimit resend qrcode qr-code-styling recharts zustand @tanstack/react-query @tanstack/react-query-devtools framer-motion lucide-react react-hook-form zod @hookform/resolvers @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities papaparse
  pnpm add -D drizzle-kit @types/qrcode @types/papaparse tsx
  pnpm dlx shadcn@latest init --yes
  pnpm dlx shadcn@latest add button card input label select textarea tabs badge avatar dialog sheet dropdown-menu tooltip progress separator skeleton toast alert-dialog

STEP 3 — Create .env.local.example (1 request):
Create the file with ALL env vars listed in the TECH STACK section above.

STEP 4 — Output agent briefing:
After setup, output this exact briefing:

═══════════════════════════════════════════
🗺️  QRISE BUILD PLAN — AGENT SEQUENCE
═══════════════════════════════════════════
HOUR 1 (requests 1–180):
  → Agent 1: Foundation (run now, budget 35 req)
  → Agent 2: Cloud Worker (run after Agent 1, budget 25 req)
  → Agent 3: Auth & Public Pages (run after Agent 2, budget 35 req)
  [~95 req used — 85 remaining in hour 1]

HOUR 2 (requests 1–180):
  → Agent 4: QR Engine (run first, budget 40 req)
  → Agent 5: Dashboard & Analytics (run after Agent 4, budget 30 req)
  → Agent 6: Features (run after Agent 5, budget 30 req)
  [~100 req used — 80 remaining in hour 2]

HOUR 3 (requests 1–180):
  → Agent 7: API Routes (run first, budget 25 req)
  → Agent 8: Security & Polish (run after Agent 7, budget 20 req)
  [~45 req used]

PASTE AGENT 1 PROMPT NOW TO BEGIN.
═══════════════════════════════════════════

✅ AGENT 0 COMPLETE — Handoff to Agent 1
```

---

# ════════════════════════════════════════════
# AGENT 1 — FOUNDATION AGENT
# Budget: 35 requests | Hour: 1
# Domain: Config, DB schema, core utilities, middleware
# ════════════════════════════════════════════

## Agent 1 Prompt

```
You are Agent 1 — FOUNDATION AGENT for QRise SaaS.
Budget: 35 requests this hour. Track count. Stop at 30 used and output RESUME CHECKPOINT.

🤖 AGENT 1 — FOUNDATION — STARTING
📊 REQUEST BUDGET: 0/35 used

Prerequisites: Agent 0 has already run project init and installed all deps.
Read existing files before creating anything. Never overwrite existing content.

════ TASK GROUP A: Supabase & Drizzle Config (6 requests) ════

[REQ 1] Create drizzle.config.ts (max 30 lines):
  - dialect: postgresql
  - schema: ./lib/db/schema/index.ts
  - out: ./supabase/migrations
  - dbCredentials.url from process.env.DATABASE_URL

[REQ 2] Create lib/supabase/client.ts (max 50 lines):
  - Export createBrowserClient using @supabase/ssr
  - Export a useBrowserClient() hook that memoizes the client instance
  - Read NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

[REQ 3] Create lib/supabase/server.ts (max 80 lines):
  - Export createServerClient() for use in RSC and Server Actions
  - Handle cookie get/set/remove using Next.js cookies() from next/headers
  - Export createActionClient() for use specifically in Server Actions

[REQ 4] Create lib/supabase/admin.ts (max 40 lines):
  - Export createAdminClient() using SUPABASE_SERVICE_ROLE_KEY
  - This client bypasses RLS — only use in server-side API routes

[REQ 5] Create lib/db/index.ts (max 40 lines):
  - Drizzle instance connected via postgres-js driver
  - Read DATABASE_URL from process.env
  - Export db instance and schema types

[REQ 6] Create lib/redis.ts (max 40 lines):
  - Export redis client from @upstash/redis using REST_URL and REST_TOKEN
  - Export rateLimitByIP(ip, action, limit, window) using @upstash/ratelimit sliding window
  - Presets: authAttempts(5/15min), otpRequests(5/1h), apiRequests(100/1min)

📊 REQUEST BUDGET: 6/35 used

════ TASK GROUP B: Database Schema (10 requests) ════

[REQ 7] Create lib/db/schema/users.ts (max 120 lines):
  Tables: users(id UUID PK, email, full_name, avatar_url, plan ENUM['free','pro','business','enterprise'], plan_expires_at, is_suspended BOOL DEFAULT false, created_at, updated_at)
  Table: plans(id, name, max_qr_codes INT, max_scans_per_month INT, has_analytics BOOL, has_api BOOL, has_bulk BOOL, has_design_studio BOOL, has_smart_routing BOOL, price_monthly DECIMAL, price_annual DECIMAL)

[REQ 8] Create lib/db/schema/qr-codes.ts (max 150 lines):
  Table: qr_codes(id UUID PK, user_id FK, name VARCHAR(200), type ENUM['url','smart_routing','password','multi_action','bulk'], short_code VARCHAR(10) UNIQUE NOT NULL, target_url TEXT, is_dynamic BOOL DEFAULT true, is_active BOOL DEFAULT true, password_hash CHAR(60) nullable, design_config JSONB nullable, bulk_job_id FK nullable, created_at, updated_at)
  Table: qr_redirect_history(id UUID PK, qr_id FK, old_url TEXT, new_url TEXT, changed_by UUID, changed_at TIMESTAMP DEFAULT NOW())

[REQ 9] Create lib/db/schema/routing-rules.ts (max 80 lines):
  Table: routing_rules(id UUID PK, qr_id FK, priority INT DEFAULT 0, conditions JSONB NOT NULL [{field: 'device'|'os'|'country'|'language'|'time_range', op: 'eq'|'in'|'between', value: string|string[]}], target_url TEXT NOT NULL, label VARCHAR(100), created_at)
  Add index on (qr_id, priority)

[REQ 10] Create lib/db/schema/qr-actions.ts (max 70 lines):
  Table: qr_actions(id UUID PK, qr_id FK, label VARCHAR(100), action_type ENUM['url','phone','email','map','download','whatsapp'], action_value TEXT, icon VARCHAR(50), display_order INT DEFAULT 0)

[REQ 11] Create lib/db/schema/analytics.ts (max 120 lines):
  Table: scan_events(id UUID PK, qr_id FK, scanned_at TIMESTAMP DEFAULT NOW(), country CHAR(2), city VARCHAR(100), device_type ENUM['mobile','tablet','desktop'], os VARCHAR(50), browser VARCHAR(50), ip_hash VARCHAR(64), is_bot BOOL DEFAULT false, is_unique BOOL DEFAULT true, matched_rule_id UUID nullable)
  Table: scan_daily_rollups(qr_id FK, date DATE, total_scans INT DEFAULT 0, unique_scans INT DEFAULT 0, bot_scans INT DEFAULT 0, PRIMARY KEY(qr_id, date))

[REQ 12] Create lib/db/schema/forms.ts (max 100 lines):
  Table: forms(id UUID PK, user_id FK, qr_id FK nullable, name VARCHAR(200), slug VARCHAR(100) UNIQUE NOT NULL, fields_schema JSONB NOT NULL, success_message TEXT, is_active BOOL DEFAULT true, created_at, updated_at)
  Table: form_submissions(id UUID PK, form_id FK, submission_data JSONB, submitted_at TIMESTAMP DEFAULT NOW(), ip_hash VARCHAR(64))

[REQ 13] Create lib/db/schema/api-keys.ts (max 100 lines):
  Table: api_keys(id UUID PK, user_id FK, name VARCHAR(100), key_prefix VARCHAR(12), key_hash VARCHAR(64) UNIQUE NOT NULL, scopes TEXT[] NOT NULL, created_at, last_used_at, is_active BOOL DEFAULT true)
  Table: webhooks(id UUID PK, user_id FK, endpoint_url TEXT NOT NULL, events TEXT[] NOT NULL, secret_hash VARCHAR(64), is_active BOOL DEFAULT true, created_at)
  Table: webhook_deliveries(id UUID PK, webhook_id FK, event_type VARCHAR(100), payload JSONB, response_status INT, delivered_at TIMESTAMP, attempts INT DEFAULT 0)

[REQ 14] Create lib/db/schema/bulk-jobs.ts (max 60 lines):
  Table: bulk_jobs(id UUID PK, user_id FK, status ENUM['queued','processing','done','failed'] DEFAULT 'queued', total_rows INT NOT NULL, processed_rows INT DEFAULT 0, zip_url TEXT nullable, error_log JSONB nullable, created_at, updated_at)

[REQ 15] Create lib/db/schema/index.ts (max 80 lines):
  - Re-export all schemas
  - Define all Drizzle relations() — users→qr_codes, qr_codes→routing_rules, qr_codes→qr_actions, qr_codes→scan_events, forms→form_submissions, users→api_keys, users→bulk_jobs

[REQ 16] Create lib/db/queries/qr.queries.ts (max 200 lines):
  Functions: getUserQRCodes(userId, filters), getQRById(id), createQR(data), updateQR(id, data), deleteQR(id), getQRByShortCode(shortCode)
  Each function uses Drizzle ORM query builder. All return typed results.

📊 REQUEST BUDGET: 16/35 used

════ TASK GROUP C: Core Utilities (9 requests) ════

[REQ 17] Create lib/db/queries/analytics.queries.ts (max 200 lines):
  Functions: logScanEvent(event), getScanSummary(qrId, dateRange), getScansByCountry(qrId, dateRange), getScansByDevice(qrId, dateRange), getScansByHour(qrId, dateRange), getRecentScans(qrId, limit)

[REQ 18] Create lib/db/queries/user.queries.ts (max 120 lines):
  Functions: getUserById(id), getUserByEmail(email), updateUserPlan(userId, plan), getUserStats(userId)

[REQ 19] Create lib/db/queries/form.queries.ts (max 120 lines):
  Functions: createForm(data), getFormBySlug(slug), getFormById(id), getUserForms(userId), submitForm(formId, data)

[REQ 20] Create lib/short-code.ts (max 60 lines):
  - generateShortCode(): string — crypto.randomBytes(6).toString('base64url') → 8-char URL-safe
  - isShortCodeAvailable(code, db): Promise<boolean> — check qr_codes table
  - generateUniqueShortCode(db): Promise<string> — generate + retry up to 5 times on collision

[REQ 21] Create lib/api-key.ts (max 80 lines):
  - generateApiKey(): { raw: string, prefix: string, hash: string }
    raw = 'qr_live_' + crypto.randomBytes(24).toString('hex')
    prefix = raw.slice(0, 12)
    hash = SHA-256 via Web Crypto API (never store raw)
  - verifyApiKey(raw: string, storedHash: string): Promise<boolean> — constant-time compare
  - NEVER log or return raw after hashing

[REQ 22] Create lib/bot-filter.ts (max 120 lines):
  - BOT_PATTERNS: string[] — at least 30 known bot UA substrings:
    ['googlebot','bingbot','slurp','duckduckbot','baiduspider','yandexbot','sogou','exabot','facebot','ia_archiver','wget','curl','python-requests','python-urllib','go-http-client','node-fetch','axios/','libwww-perl','java/','ruby','scrapy','phantomjs','headlesschrome','prerender','uptimerobot','pingdom','datadog','newrelic','semrushbot','ahrefsbot','mj12bot']
  - isBotUA(userAgent: string): boolean
  - parseDevice(ua: string): { type: 'mobile'|'tablet'|'desktop', os: string, browser: string }
    Use simple keyword matching (no external lib)

[REQ 23] Create lib/qr-generator.ts (max 150 lines):
  - QROptions type: { data: string, dotColor?: string, bgColor?: string, logoUrl?: string, errorCorrectionLevel?: 'L'|'M'|'Q'|'H', size?: number }
  - generateQRBuffer(options: QROptions): Promise<Buffer> — uses qrcode npm package, returns PNG buffer
  - generateQRSVG(options: QROptions): Promise<string> — returns SVG string
  - calculateScannabilityScore(dotColor: string, bgColor: string, logoCoverage: number): number
    Score 0-100: contrastRatio check (WCAG formula, min 3:1 for QR) = 50pts, logoCoverage ≤ 30% = 50pts. Partial credit proportional.

[REQ 24] Create lib/resend.ts (max 80 lines):
  - Initialize Resend with RESEND_API_KEY
  - sendOTPEmail(to, otp, expiresMin): Promise<void>
  - sendWelcomeEmail(to, name): Promise<void>
  - sendBulkJobReadyEmail(to, jobId, downloadUrl): Promise<void>
  - sendPasswordBruteForceAlert(to, qrName, attemptCount, ip): Promise<void>
  All functions log errors but never throw (email failures are non-blocking)

[REQ 25] Create lib/validations/qr.schema.ts (max 120 lines):
  Zod schemas: CreateURLQR, CreateSmartRoutingQR, CreatePasswordQR, CreateMultiActionQR, CreateBulkQR, UpdateQR, QRDesignConfig, RoutingRule, QRAction

📊 REQUEST BUDGET: 25/35 used

════ TASK GROUP D: App Infrastructure (6 requests) ════

[REQ 26] Create lib/validations/auth.schema.ts (max 60 lines):
  Zod schemas: RegisterSchema(email, password min 8, fullName), LoginSchema, ForgotPasswordSchema, VerifyOTPSchema, UpdatePasswordSchema

[REQ 27] Create lib/validations/form.schema.ts (max 80 lines):
  Zod schemas: FormField, CreateFormSchema, UpdateFormSchema, FormSubmissionSchema

[REQ 28] Create types/qr.types.ts (max 100 lines):
  TypeScript types: QRType, QRCode, QRDesign, WizardState, RoutingRule, QRAction, QRConfig (union discriminated by type)

[REQ 29] Create types/analytics.types.ts (max 80 lines):
  Types: ScanEvent, ScanSummary, CountryBreakdown, DeviceBreakdown, HourlyBreakdown, AnalyticsRange

[REQ 30] Create types/api.types.ts (max 60 lines):
  Types: APIResponse<T>, PaginatedResponse<T>, APIError, APIKey, Webhook

[REQ 31] Create middleware.ts (max 100 lines):
  - Import createServerClient from @supabase/ssr
  - updateSession() pattern — refresh session cookie on each request
  - PROTECTED: all paths starting with /dashboard, /qr-codes, /create, /form-builder, /api-manager, /settings, /onboarding
  - PUBLIC: /, /features, /pricing, /docs, /login, /register, /forgot-password, /verify-otp, /f/*, /api/auth/*, /api/stats/public
  - If no session on protected route → redirect to /login
  - If session exists and on /login or /register → redirect to /dashboard

[REQ 32] Create next.config.ts (max 60 lines):
  - Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin
  - images.remotePatterns: Supabase storage domain
  - serverExternalPackages: ['bcrypt', 'qrcode']

[REQ 33] Create stores/qr-wizard.store.ts (max 130 lines):
  Zustand store with localStorage persistence:
  State: { step: 1|2|3, qrType: QRType|null, config: Partial<QRConfig>, design: Partial<QRDesign>, isDynamic: boolean, editingQrId: string|null }
  Actions: setStep, setType, setConfig, setDesign, setDynamic, reset
  Use zustand/middleware persist to localStorage key 'qrise-wizard-draft'

[REQ 34] Create stores/user.store.ts (max 80 lines):
  Zustand store: { user: User|null, plan: Plan|null, setUser, setPlan, clearUser }
  No persistence (session-based)

[REQ 35] Create hooks/ files — all 4 hooks (1 request per hook, batch into 1 request):
  - hooks/use-qr-list.ts — TanStack Query infinite query for paginated QR list
  - hooks/use-qr-analytics.ts — query for QR analytics with date range param
  - hooks/use-wizard.ts — wrapper around qr-wizard.store with navigation helpers
  - hooks/use-toast.ts — thin wrapper around shadcn toast

📊 REQUEST BUDGET: 35/35 used

✅ AGENT 1 COMPLETE — All foundation files created.
Output file checklist, then handoff to Agent 2.
```

---

# ════════════════════════════════════════════
# AGENT 2 — CLOUD WORKER AGENT
# Budget: 25 requests | Hour: 1 (continued)
# Domain: Cloudflare Worker redirect engine
# ════════════════════════════════════════════

## Agent 2 Prompt

```
You are Agent 2 — CLOUD WORKER AGENT for QRise SaaS.
Budget: 25 requests this hour. Track count. Stop at 22 used and output RESUME CHECKPOINT.

🤖 AGENT 2 — CLOUD WORKER — STARTING
📊 REQUEST BUDGET: 0/25 used

Prerequisites: Agent 1 complete. Read lib/bot-filter.ts before writing worker's bot-filter.ts.
This is a SEPARATE project inside cloudflare-worker/ directory.

════ TASK GROUP A: Worker Setup (3 requests) ════

[REQ 1] Create cloudflare-worker/wrangler.toml (max 30 lines):
  name = "qrise-redirect"
  main = "src/index.ts"
  compatibility_date = "2024-01-01"
  [[kv_namespaces]]
  binding = "QR_KV"
  id = "REPLACE_WITH_ACTUAL_KV_ID"
  preview_id = "REPLACE_WITH_PREVIEW_KV_ID"
  [vars]
  SUPABASE_URL = ""
  SUPABASE_SERVICE_KEY = ""
  APP_URL = ""

[REQ 2] Create cloudflare-worker/package.json (max 20 lines):
  Dependencies: wrangler (dev), typescript (dev)
  Scripts: dev: wrangler dev, deploy: wrangler deploy, build: tsc

[REQ 3] Create cloudflare-worker/src/bot-filter.ts (max 130 lines):
  Re-implement (adapted for edge runtime, no Node APIs):
  - Same BOT_PATTERNS array as lib/bot-filter.ts (30+ patterns)
  - isBotUA(ua: string): boolean
  - parseDevice(ua: string): DeviceInfo { type, os, browser }
  Use only string methods (no regex with look-behinds for edge compat)

📊 REQUEST BUDGET: 3/25 used

════ TASK GROUP B: Core Worker Logic (12 requests) ════

[REQ 4] Create cloudflare-worker/src/rate-limiter.ts (max 100 lines):
  KV-based sliding window rate limiting (no Upstash in edge workers):
  - checkRateLimit(kv: KVNamespace, key: string, limit: number, windowSec: number): Promise<{allowed: boolean, remaining: number}>
  - KV key format: rl:{windowSlot}:{identifier}
  - windowSlot = Math.floor(Date.now() / (windowSec * 1000))
  - Atomic increment via KV put with expiration

[REQ 5] Create cloudflare-worker/src/analytics-logger.ts (max 120 lines):
  - ScanEvent type definition
  - hashIP(ip: string): Promise<string> — SHA-256 via Web Crypto, return hex
  - checkUniqueness(kv: KVNamespace, qrId: string, ipHash: string, uaHash: string): Promise<boolean>
    Key: uniq:{qrId}:{date}:{ipHash}:{uaHash} — TTL 86400s (24h)
  - logScanEvent(event: ScanEvent, supabaseUrl: string, serviceKey: string): Promise<void>
    POST to Supabase REST: {supabaseUrl}/rest/v1/scan_events
    Use fetch() — native in Workers
    NEVER await this in the main handler — pass to waitUntil()

[REQ 6] Create cloudflare-worker/src/redirect.ts (max 200 lines):
  Types: WorkerEnv { QR_KV: KVNamespace, SUPABASE_URL: string, SUPABASE_SERVICE_KEY: string, APP_URL: string }
  Type: ResolvedQR { qrId: string, type: string, targetUrl: string, routingRules?: RoutingRule[], actions?: QRAction[], isActive: boolean }

  - getCachedQR(kv: KVNamespace, shortCode: string): Promise<ResolvedQR|null>
    KV key: qr:{shortCode}, parse JSON

  - fetchQRFromDB(shortCode: string, env: WorkerEnv): Promise<ResolvedQR|null>
    GET from Supabase REST with joins for routing_rules and qr_actions
    Cache result in KV: kv.put(key, JSON.stringify(data), { expirationTtl: 60 })

  - evaluateRoutingRules(rules: RoutingRule[], context: RequestContext): string|null
    context = { device, os, country, language, hour }
    Evaluate rules sorted by priority. First match wins. Return targetUrl or null.
    CRITICAL: Check hop counter — if X-QRise-Hops header >= 3, return null (loop detection)

  - resolveRedirect(shortCode: string, request: Request, env: WorkerEnv): Promise<ResolvedQR|null>
    1. Check KV cache
    2. If miss: fetch from DB
    3. Return null if not found or not active

[REQ 7] Create cloudflare-worker/src/pages/password-page.ts (max 150 lines):
  - generatePasswordPage(shortCode: string, appUrl: string, error?: string): string
    Returns full HTML string for password gate page
    Design: QRise branding, centered card, password input, submit button, error message
    Form action: POST /r/{shortCode}/unlock
    Include minimal inline CSS (no external deps)

[REQ 8] Create cloudflare-worker/src/pages/action-menu.ts (max 150 lines):
  - generateActionMenu(qr: ResolvedQR, actions: QRAction[]): string
    Returns full HTML for action menu
    Design: QRise branding, list of action buttons with icons (use Unicode chars)
    Each action: icon + label, onclick triggers appropriate action (navigate, tel:, mailto:, maps://, download)
    Include inline JS to log action tap to analytics

[REQ 9] Create cloudflare-worker/src/pages/not-found.ts (max 60 lines):
  - generateNotFoundPage(appUrl: string): string
    Branded 404 page: "This QR code doesn't exist or has been deactivated."
    Link back to QRise homepage

[REQ 10] Create cloudflare-worker/src/pages/error-page.ts (max 60 lines):
  - generateErrorPage(message: string, appUrl: string): string
    Branded error page for loop detection, rate limiting, etc.

[REQ 11] Create cloudflare-worker/src/consent.ts (max 120 lines):
  GDPR consent handling:
  - GDPR_COUNTRIES: string[] = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','GB','NO','IS','LI','BR','CA']
  - needsConsent(country: string): boolean — check against GDPR_COUNTRIES
  - hasConsent(request: Request): boolean — check for qrise_consent=1 cookie
  - generateConsentPage(shortCode: string, targetUrl: string): string
    HTML page: "This QR code collects anonymous scan analytics. By continuing you agree to our privacy policy."
    "Continue" button → sets qrise_consent cookie (1 year) → redirects to targetUrl

[REQ 12] Create cloudflare-worker/src/index.ts (max 300 lines):
  Main Fetch handler. Routes:

  GET /r/{shortCode}
    1. Check X-QRise-Hops >= 3 → return errorPage("Redirect loop detected")
    2. Parse UA → isBotUA check
    3. resolveRedirect(shortCode, request, env)
    4. If null → return notFoundPage
    5. Check GDPR: needsConsent(CF-IPCountry) && !hasConsent(request) → return consentPage
    6. If type='password' && no valid unlock_session cookie → return passwordPage
    7. If type='multi_action' → return actionMenu
    8. Build response: Response.redirect(targetUrl, 302)
    9. Add header: X-QRise-Hops: (current + 1)
    10. ctx.waitUntil(logScanEvent(...)) — non-blocking analytics

  POST /r/{shortCode}/unlock  (password unlock)
    1. Rate limit: 5 attempts per IP per QR per 15min (KV-based)
    2. Parse form body for 'password' field
    3. Fetch password_hash from DB (direct Supabase REST call)
    4. bcrypt compare (use bcryptjs, wasm-compatible)
    5. If match: set unlock_session cookie (JWT-like, 24h) → redirect to targetUrl
    6. If fail: increment KV attempt counter → if >= 5 → alert via Supabase Edge Function → return passwordPage with error
    7. Return passwordPage with generic "Incorrect password" error

  GET /r/{shortCode}/actions  (action menu data)
    Return JSON of qr_actions for a multi_action QR

  GET /health
    Return { status: 'ok', timestamp: Date.now() }

  All other paths: return notFoundPage

📊 REQUEST BUDGET: 12/25 used

════ TASK GROUP C: Worker Types & Deploy Config (5 requests) ════

[REQ 13] Create cloudflare-worker/src/types.ts (max 100 lines):
  WorkerEnv, ResolvedQR, RoutingRule, QRAction, RoutingCondition, RequestContext, ScanEvent, DeviceInfo types

[REQ 14] Create cloudflare-worker/tsconfig.json (max 30 lines):
  Target: ES2022, lib: ES2022, moduleResolution: bundler, types: [@cloudflare/workers-types]

[REQ 15] Create cloudflare-worker/README.md (max 80 lines):
  Setup steps:
  1. npm install -g wrangler
  2. wrangler login
  3. wrangler kv:namespace create QR_KV → copy ID to wrangler.toml
  4. wrangler kv:namespace create QR_KV --preview → copy preview ID
  5. Set vars in wrangler.toml
  6. wrangler dev (local testing)
  7. wrangler deploy (production)
  Include: how to update KV cache busting from main app (DELETE /api/cache/{shortCode})

📊 REQUEST BUDGET: 15/25 used

════ TASK GROUP D: Service Layer (10 requests) ════

[REQ 16] Create lib/services/qr.service.ts (max 250 lines):
  Business logic wrapper (not DB queries, not HTTP):
  - createQR(userId, data, db): Promise<QRCode>
    Validate plan limits, generate short code, hash password if type=password, insert to DB, invalidate KV
  - updateQR(id, userId, data, db): Promise<QRCode>
    Verify ownership, log to redirect history if URL changed, update DB, invalidate KV
  - deleteQR(id, userId, db): Promise<void>
    Verify ownership, soft delete (is_active=false), invalidate KV
  - invalidateKVCache(shortCode: string): Promise<void>
    DELETE request to Cloudflare KV via REST API using KV ID + API token from env vars

[REQ 17] Create lib/services/analytics.service.ts (max 200 lines):
  - getScanSummary(qrId, range, db): total, unique, bot, by country, by device, by hour
  - getDashboardStats(userId, db): totalQRs, totalScans, activeQRs, scansToday
  - getRecentActivity(userId, limit, db): last N scan events across all user QRs

[REQ 18] Create lib/services/bulk.service.ts (max 200 lines):
  - processBulkJob(jobId, rows, userId, db): Promise<void>
    Process in batches of 50 rows:
    For each row: generate short_code, create qr_codes record, generate QR PNG buffer
    Store PNGs temporarily (Supabase storage)
    After all rows: create ZIP (use fflate npm package), upload to Supabase storage, update job record
  - getBulkJobStatus(jobId, userId, db): Promise<BulkJob>
  - triggerBulkJob(jobId): void — POST to Vercel serverless background route

[REQ 19] Create lib/services/form.service.ts (max 150 lines):
  - createForm(userId, data, db): Promise<Form>
    Generate unique slug (kebab-case name + random suffix)
    Create form record, generate Dynamic QR pointing to /f/{slug}
  - getFormBySlug(slug, db): Promise<Form>
  - submitForm(formId, data, ipHash, db): Promise<void>
    Validate submission data against fields_schema, insert to form_submissions

[REQ 20] Create lib/services/export.service.ts (max 150 lines):
  - exportUserQRs(userId, db): Promise<string>
    Generate CSV of all user QRs (name, type, short_code, target_url, scan_count, created_at)
    Upload to Supabase storage, return pre-signed URL (24h expiry)
  - exportFormSubmissions(formId, userId, db): Promise<string>
    Generate CSV of all form submissions, upload, return URL

[REQ 21-25] Batch remaining service and query files (5 requests):
  [REQ 21] lib/api-key-middleware.ts (max 100 lines):
    Middleware for API routes that accept Authorization: Bearer {key}
    Extract key, hash it, look up in api_keys table, verify is_active and scopes
    Attach { userId, scopes } to request context via a custom header or return value

  [REQ 22] lib/db/queries/analytics.queries.ts (max 200 lines) — if not created by Agent 1

  [REQ 23] app/api/auth/callback/route.ts (max 60 lines):
    Handle Supabase OAuth callback
    exchangeCodeForSession → redirect to /dashboard

  [REQ 24] app/api/stats/public/route.ts (max 40 lines):
    GET /api/stats/public → { totalQRsCreated: number }
    Cache in Redis for 5 minutes (no auth required)

  [REQ 25] Verify all files created, output complete checklist

📊 REQUEST BUDGET: 25/25 used

✅ AGENT 2 COMPLETE — Handoff to Agent 3.
```

---

# ════════════════════════════════════════════
# AGENT 3 — AUTH & PUBLIC PAGES AGENT
# Budget: 35 requests | Hour: 1 (final batch)
# Domain: Auth system, landing, features, pricing, docs
# ════════════════════════════════════════════

## Agent 3 Prompt

```
You are Agent 3 — AUTH & PUBLIC PAGES AGENT for QRise SaaS.
Budget: 35 requests this hour. Track count. Stop at 30 used and output RESUME CHECKPOINT.

🤖 AGENT 3 — AUTH & PUBLIC PAGES — STARTING
📊 REQUEST BUDGET: 0/35 used

Prerequisites: Agents 1 and 2 complete. Read lib/supabase/client.ts and lib/supabase/server.ts before writing auth code.

════ TASK GROUP A: Auth Components (8 requests) ════

[REQ 1] Create app/(auth)/layout.tsx (max 60 lines):
  Centered layout — no sidebar. QRise logo at top. Clean white card.
  Stack: logo → children. No nav links.

[REQ 2] Create components/auth/provider-buttons.tsx (max 80 lines):
  GoogleSignInButton → supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/api/auth/callback' } })
  AppleSignInButton → same for 'apple'
  Style: full-width, outlined buttons with provider icons (use SVG inline)
  Show loading state while OAuth popup opens

[REQ 3] Create components/auth/otp-input.tsx (max 120 lines):
  Props: { value: string, onChange: (val: string) => void, disabled?: boolean, error?: string }
  6 individual <input> elements, max 1 character each
  Auto-advance: on input → focus next input
  Backspace: if current empty → focus prev input
  Paste detection: distribute pasted digits across boxes
  Auto-submit: on 6th digit filled → call onChange with complete value
  Expose ref for programmatic focus

[REQ 4] Create components/auth/register-form.tsx (max 160 lines):
  React Hook Form + Zod RegisterSchema
  Fields: fullName, email, password (with show/hide toggle)
  Provider buttons at top with "or" divider
  Submit: supabase.auth.signUp({ email, password, options: { data: { full_name } } })
  On success: redirect to /verify-otp?email={email}
  Error handling: show field errors, show generic error on auth failure

[REQ 5] Create components/auth/login-form.tsx (max 150 lines):
  React Hook Form + Zod LoginSchema
  Fields: email, password, rememberMe checkbox
  Provider buttons
  "Forgot password?" link
  Submit: supabase.auth.signInWithPassword()
  On success: redirect to /dashboard
  Error handling: "Invalid credentials" message

[REQ 6] Create app/(auth)/login/page.tsx (max 60 lines):
  Import and render LoginForm. Add title "Welcome back".

[REQ 7] Create app/(auth)/register/page.tsx (max 60 lines):
  Import and render RegisterForm. Add title "Create your account".

[REQ 8] Create app/(auth)/verify-otp/page.tsx (max 120 lines):
  Read email from query params
  Render OTPInput component
  Resend button with 60s countdown (use useEffect interval)
  On OTP complete: supabase.auth.verifyOtp({ email, token, type: 'email' })
  Show attempt count warning after 2 failures ("1 attempt remaining")
  On success: redirect to /dashboard (or /onboarding if first login)

[REQ 9] Create app/(auth)/forgot-password/page.tsx (max 130 lines):
  Local state machine: step 'email'|'otp'|'new-password'
  Step email: input + submit → supabase.auth.resetPasswordForEmail()
  Step otp: OTPInput → verify token
  Step new-password: password + confirm + submit → supabase.auth.updateUser({ password })
  Show step indicator (1 of 3)

📊 REQUEST BUDGET: 9/35 used

════ TASK GROUP B: Landing Page (12 requests) ════

[REQ 10] Create app/(public)/layout.tsx (max 80 lines):
  Sticky nav: QRise logo (left), nav links (Features, Pricing, Docs — center), Login + "Start free" buttons (right)
  Nav uses Next.js Link. "Start free" has accent background.
  Mobile: hamburger menu (shadcn Sheet)

[REQ 11] Create components/landing/hero.tsx (max 170 lines):
  Headline: "The QR platform built for real results"
  Sub: "Create dynamic QR codes that track every scan — change destinations anytime, no reprinting."
  Two CTAs: "Start for free →" (/register), "See it live" (scroll to #demo)
  Animated QR code: use CSS keyframes to animate a QR code SVG (dots appear in sequence)
  Stats below CTA: "10,000+ QR codes created" | "2M+ scans tracked" | "Free forever to start"
  Responsive: stack vertically on mobile

[REQ 12] Create components/landing/trusted-by.tsx (max 70 lines):
  "Trusted by forward-thinking teams" heading
  Row of 6 company name placeholders styled as muted text logos
  CSS marquee: duplicate the row for seamless infinite scroll (animation: scroll 20s linear infinite)

[REQ 13] Create components/landing/demo-dashboard.tsx (max 140 lines):
  id="demo" for scroll anchor
  Browser chrome frame (address bar mockup at top)
  Inside: 3 stat cards (12,847 scans | 94 active QRs | 23 countries), mini AreaChart (Recharts, static data), 3 fake QR code cards
  Use shadcn Card, real Recharts data, Lucide icons
  "Try QRise free →" CTA below

[REQ 14] Create components/landing/features-section.tsx (max 160 lines):
  Section heading: "Everything you need to go beyond basic QR"
  6 feature cards in a 3×2 grid:
  - Dynamic QR (edit URLs, never reprint)
  - Smart Routing (route by device, location, time)
  - Deep Analytics (track every scan)
  - Design Studio (full branding control)
  - Form Builder (data collection → QR)
  - Bulk Generator (CSV → hundreds of QRs)
  Each card: Lucide icon, name, 2-line description
  Hover: subtle border color change (Framer Motion whileHover)

[REQ 15] Create components/landing/why-qrise.tsx (max 100 lines):
  Section: "Why teams switch to QRise"
  3-column comparison: Free QR tools | Basic SaaS | QRise
  Rows: Dynamic QR, Analytics, Design Studio, Bulk Generate, API Access, Smart Routing
  Checkmarks (Lucide Check) and X marks (Lucide X) in each column
  QRise column highlighted with accent background

[REQ 16] Create components/landing/reviews-carousel.tsx (max 130 lines):
  6 review cards, static data (no external API)
  CSS scroll-snap: overflow-x scroll, snap-mandatory, scroll-behavior smooth
  Auto-advance: setInterval 4000ms (pause on hover via mouseenter/mouseleave)
  Each card: avatar initials circle, name, role, company, 5-star rating, 2-3 sentence review
  Dot indicators below

[REQ 17] Create components/landing/site-footer.tsx (max 110 lines):
  4 columns: Product (Features, Pricing, Docs, API), Resources (Blog, Changelog, Status), Company (About, Privacy, Terms), Connect (Twitter, GitHub, Discord)
  Newsletter: email input + "Subscribe" button → POST /api/newsletter
  Bottom bar: copyright + "Built with ❤️ for QR enthusiasts"
  Responsive: 2×2 grid on mobile, 4 columns on desktop

[REQ 18] Create app/(public)/page.tsx (max 80 lines):
  Compose landing page from all component sections:
  <Hero /> <TrustedBy /> <DemoDashboard /> <FeaturesSection /> <WhyQRise /> <ReviewsCarousel /> <SiteFooter />
  Each section in its own <section> tag with semantic id

📊 REQUEST BUDGET: 18/35 used

════ TASK GROUP C: Features, Pricing, Docs Pages (10 requests) ════

[REQ 19] Create app/(public)/features/page.tsx (max 150 lines):
  Section 1: "All Features" — grid of all 10 features (including 4 upcoming)
  Upcoming features: blurred/grayscale cards with padlock icon
  Section 2: "Guess what's coming — win a free Pro month"
  Each locked card: blurred preview, hint text, text input, "Guess" button
  On guess submit: POST /api/features/guess { featureId, guess }
  Show confetti + gift modal on correct guess (use simple CSS animation, no external lib)

[REQ 20] Create app/api/features/guess/route.ts (max 80 lines):
  POST: validate featureId and guess
  Compare guess (lowercase, trimmed) against SHA-256 hash stored in env var FEATURE_ANSWERS
  FEATURE_ANSWERS env var format: featureId1:sha256hash,featureId2:sha256hash
  Rate limit: 5 guesses per IP per feature per day (Redis)
  If correct: generate a one-time gift code, return { correct: true, giftCode }
  If wrong: return { correct: false, remaining: N }

[REQ 21] Create app/(public)/pricing/page.tsx (max 200 lines):
  Split into:
  - Monthly/Annual state toggle at top (annual saves 20%)
  - 4 plan cards: Free ($0), Pro ($12/mo or $9.60), Business ($39/mo or $31.20), Enterprise (Contact)
  - Pro card: "Most Popular" badge + highlighted border
  - Each card: plan name, price, tagline, feature list with checkmarks, CTA button
  - Features: Dynamic QR limit, Analytics, Design Studio, API Access, Bulk Generator, Smart Routing, Support level
  - Below cards: detailed comparison table (accordion on mobile, table on desktop)
  - FAQ section: 5 common questions as Accordion

[REQ 22] Create app/(public)/docs/page.tsx (max 160 lines):
  Two-column layout: left sidebar (sticky) + content area
  Sidebar: links to sections — Authentication, QR Codes, Analytics, Forms, Webhooks
  Content: scrollable sections per endpoint group

[REQ 23] Create components/docs/endpoint-card.tsx (max 130 lines):
  Props: { method, path, description, params, requestBody, responseExample }
  Renders: method badge (color-coded GET=green, POST=blue, PUT=amber, DELETE=red), path in monospace
  Collapsible: params table, request body schema, response example JSON
  Copy button on code blocks

[REQ 24] Create components/docs/code-tabs.tsx (max 100 lines):
  Props: { examples: { lang: string, code: string }[] }
  Tab switcher: JavaScript | Python | cURL
  Code in <pre> with Tailwind typography classes
  Copy to clipboard button

[REQ 25] Render all API endpoint docs in docs/page.tsx — add 6 endpoint sections:
  GET /qr, POST /qr, GET /qr/{id}, PUT /qr/{id}, DELETE /qr/{id}, GET /qr/{id}/analytics
  Each uses EndpointCard with realistic example request/response payloads

📊 REQUEST BUDGET: 25/35 used

════ TASK GROUP D: Hosted Form Page (4 requests) ════

[REQ 26] Create app/f/[slug]/page.tsx (max 120 lines):
  Server component: fetch form by slug using lib/services/form.service.ts
  If form not found or inactive: show 404 message
  Render form fields from fields_schema JSONB
  QRise branding at bottom: "Powered by QRise"
  On submit: POST /api/forms/{id}/submit

[REQ 27] Create app/api/forms/[id]/submit/route.ts (max 100 lines):
  Rate limit: 10 submissions per IP per form per hour
  Validate submission data against form's fields_schema
  Call form.service.submitForm()
  Return { success: true, message: form.success_message }

[REQ 28] Create app/(public)/layout.tsx final check (max 80 lines) — verify it renders properly

[REQ 29] Create app/globals.css (max 100 lines):
  Tailwind base imports
  CSS custom properties for QRise brand colors
  --qrise-green: #0F6E56, --qrise-green-light: #1D9E75, etc.
  Utility classes: .sr-only, .container-qrise (max-width 1200px, centered)
  Smooth scroll behavior on html element

[REQ 30-35] Create app/layout.tsx (root layout), verify middleware.ts is correct, create app/error.tsx, app/not-found.tsx, app/loading.tsx, app/(auth) error state component

📊 REQUEST BUDGET: 35/35 used

✅ AGENT 3 COMPLETE — Handoff to Agent 4. Begin in new hour (Hour 2).
```

---

# ════════════════════════════════════════════
# AGENT 4 — QR ENGINE AGENT
# Budget: 40 requests | Hour: 2
# Domain: Wizard, all 5 QR types, Design Studio
# ════════════════════════════════════════════

## Agent 4 Prompt

```
You are Agent 4 — QR ENGINE AGENT for QRise SaaS.
Budget: 40 requests this hour. Track count. Stop at 35 used and output RESUME CHECKPOINT.

🤖 AGENT 4 — QR ENGINE — STARTING
📊 REQUEST BUDGET: 0/40 used

Prerequisites: Agents 1-3 complete. Read stores/qr-wizard.store.ts and types/qr.types.ts before starting.

════ TASK GROUP A: Wizard Shell & Navigation (5 requests) ════

[REQ 1] Create components/qr/wizard/wizard-shell.tsx (max 150 lines):
  Layout: step indicator (1→2→3 with connecting lines) + content area + floating QR preview (right side, visible in steps 2-3)
  Step indicator: step numbers, labels (Select Type | Configure | Design), completed steps show checkmark
  Floating QR preview: sticky card showing live QR image. "Auto-saved" indicator (show 2s after last change)
  Progress bar below step indicator

[REQ 2] Create app/(app)/create/page.tsx — Step 1 (max 100 lines):
  Renders TypeSelector component
  No QR preview in step 1 (just type selection)
  No "Back" button in step 1

[REQ 3] Create components/qr/wizard/type-selector.tsx (max 200 lines):
  5 QR type cards in a grid (2 columns on mobile, 3 on desktop):
  - URL QR: link icon, "Standard link QR code"
  - Smart Routing: shuffle icon, "Route scans by device, location, or time"
  - Password Protected: lock icon, "Gate your URL behind a password"
  - Multiple Action: layers icon, "Let users pick from multiple destinations"
  - Bulk Generator: grid icon, "Generate hundreds of QRs from a spreadsheet"
  Each card: hover highlight, selected state (green border + checkmark)
  Dynamic QR toggle at bottom: "Make this QR dynamic" + tooltip explanation
  "Continue →" button → setType in store + navigate to /create/{type}

[REQ 4] Create app/(app)/create/[type]/page.tsx (max 80 lines):
  Route handler: read [type] param, validate it's one of 5 types
  Render WizardShell with appropriate config component based on type
  Render QRPreview (floating, right side)
  "← Back" link to /create, "Next: Design Studio →" button

[REQ 5] Create app/(app)/create/design/page.tsx (max 80 lines):
  Step 3 wrapper: WizardShell + StudioPanel (left) + QRPreview (right, larger)
  "← Back" to /create/{type}
  "Finish & create QR" button → POST to /api/qr → success toast + option "Create another" (resets store and goes to /create)

📊 REQUEST BUDGET: 5/40 used

════ TASK GROUP B: QR Config Components (18 requests) ════

[REQ 6] Create components/qr/wizard/url-config.tsx (max 160 lines):
  React Hook Form + Zod CreateURLQR schema
  Fields:
  - QR name (text input, required)
  - Destination URL (URL input, validated, must be http/https)
  - UTM Builder accordion: utm_source, utm_medium, utm_campaign (auto-appends to URL on change)
  On every URL change (debounced 400ms): call wizard store setConfig() → triggers QRPreview update
  Show URL preview with UTM params appended

[REQ 7] Create components/qr/wizard/smart-routing-config.tsx (max 180 lines):
  Fields:
  - QR name
  - Default fallback URL (when no rule matches)
  - Rules list (DnD sortable, max 10 rules)
  - "Add rule" button (adds new rule row)
  Each rule row: field selector | operator | value input | target URL | priority handle | delete button
  Fields: Device Type (mobile/tablet/desktop), OS (iOS/Android/Windows/Mac/Linux), Country (country code input), Language (en/es/fr etc), Time of Day (hour range 0-23)
  Operators: "equals", "is one of", "is between" (for time)
  Circular redirect guard: if any rule target URL contains the QRise redirect domain → show red error

[REQ 8] Create components/qr/wizard/password-config.tsx (max 130 lines):
  Fields:
  - QR name
  - Protected URL
  - Password (show/hide toggle)
  - Confirm password
  - Password strength meter (weak/medium/strong) using character type analysis
  Show note: "Password is encrypted — QRise staff cannot access it."

[REQ 9] Create components/qr/wizard/multi-action-config.tsx (max 220 lines):
  Fields:
  - QR name
  - Actions list (DnD sortable via @dnd-kit, max 8 actions)
  - "Add action" button → opens ActionFormModal
  Each action row: icon + type badge + label + value (truncated) + drag handle + delete
  Action types: URL (globe icon), Phone (phone icon), Email (mail icon), Maps (map-pin icon), Download (download icon), WhatsApp (message-circle icon)
  ActionFormModal: type selector + label input + value input (validated per type — URL for url, tel: format for phone, etc.)
  Reorder: @dnd-kit useSortable, update store on drop

[REQ 10] Create components/qr/wizard/bulk-upload.tsx (max 200 lines):
  Two-phase component:
  Phase 1 (before upload): drag & drop zone or click to upload
  Accept .csv files only. Show file requirements.
  Phase 2 (after upload): renders BulkDataTable component
  File parsing: use papaparse, parse on client before sending to server
  Show parse errors inline (highlight rows with issues)
  Column mapping UI: dropdowns to assign Name column and URL column from parsed headers

[REQ 11] Create components/qr/wizard/bulk-data-table.tsx (max 280 lines):
  Editable data grid for parsed CSV rows (max 300 lines — split if needed)
  Columns: Row #, Name (editable), URL (editable, validated), Status (valid/error/duplicate)
  Inline editing: click cell → input appears → blur → validate → update row
  Row validation: URL must be http/https, name must not be empty
  Summary bar: "847 valid | 3 errors | 0 duplicates"
  Pagination: show 50 rows at a time (client-side)
  "Clear all" and "Download template" buttons

📊 REQUEST BUDGET: 11/40 used

[REQ 12] Create components/qr/qr-preview.tsx (max 160 lines):
  Client component using qr-code-styling
  Props: { data: string, options: QRDesign, size?: number }
  Re-renders on options change (debounced 300ms, use useEffect + useRef)
  qr-code-styling config: dots options, corners options, image (logo) option, background
  Shows loading skeleton while generating
  Download button: exports PNG using qr.download() method
  Shows ScannabilityScore component below QR
  If data is empty string → show placeholder "QR code will appear here"

[REQ 13] Create components/qr/dynamic-badge.tsx (max 50 lines):
  Small badge: pulsing green dot + "Dynamic" text if isDynamic
  Static badge: gray dot + "Static" text
  Tooltip: "Dynamic QRs let you change the destination URL without reprinting"

[REQ 14] Create components/qr/qr-download-menu.tsx (max 90 lines):
  shadcn DropdownMenu with options:
  - PNG (72 DPI) → GET /api/qr/{id}/export?format=png&dpi=72
  - PNG (300 DPI) → GET /api/qr/{id}/export?format=png&dpi=300
  - SVG → GET /api/qr/{id}/export?format=svg
  - PDF → GET /api/qr/{id}/export?format=pdf
  Show loading state per option while downloading. Use fetch + blob + URL.createObjectURL + anchor click pattern.

📊 REQUEST BUDGET: 14/40 used

════ TASK GROUP C: Design Studio (12 requests) ════

[REQ 15] Create components/qr/design-studio/studio-panel.tsx (max 160 lines):
  3-tab panel: Style | Logo | Frame
  Manages local design state, calls wizard store setDesign() on every change
  Style tab: renders ColorPicker and DotPatternSelector
  Logo tab: renders LogoUploader
  Frame tab: renders FrameSelector
  Reset to defaults button

[REQ 16] Create components/qr/design-studio/color-picker.tsx (max 100 lines):
  Two color pickers: Dot Color + Background Color
  Each: <input type="color"> + hex text input + 8 preset swatches
  Preset swatches: black, white, deep-green, dark-blue, purple, coral, amber, slate
  On change: call onColorChange(dotColor, bgColor) prop
  Show warning if contrast ratio < 3:1

[REQ 17] Create components/qr/design-studio/dot-pattern-selector.tsx (max 120 lines):
  Grid of 6 dot style options: square, rounded, extra-rounded, classy, classy-rounded, dots
  Each option shows a mini SVG preview of that dot pattern style
  Selected option highlighted with green border

[REQ 18] Create components/qr/design-studio/logo-uploader.tsx (max 130 lines):
  File upload: accept image/* (PNG, JPG, SVG — max 500KB)
  Preview: circular crop preview of uploaded logo
  Upload on file select: POST to Supabase Storage (bucket: qr-logos, path: {userId}/{timestamp}.{ext})
  Logo size control: slider 10%–30% (of QR size) — feed to ScannabilityScore
  "Remove logo" button

[REQ 19] Create components/qr/design-studio/frame-selector.tsx (max 130 lines):
  Grid of 7 frame styles: None, Simple Border, Rounded Border, Badge Below, Badge Above, Scan-Me Label, QR Only (borderless)
  Each option: mini SVG preview
  If frame includes CTA: show CTA text input (e.g., "Scan me!", "Visit now", custom)
  Selected frame applied to QRPreview

[REQ 20] Create components/qr/design-studio/eye-shape-selector.tsx (max 100 lines):
  Eyes = the 3 corner squares of a QR code
  Options: square, extra-rounded, dot, rounded
  Mini SVG previews for each
  Apply outer eye style and inner eye style separately

[REQ 21] Create components/qr/design-studio/scannability-score.tsx (max 90 lines):
  Calls calculateScannabilityScore() from lib/qr-generator.ts with current design options
  Visual: circular progress indicator (CSS conic-gradient), 0-100 score
  Color: < 60 = red, 60-79 = amber, 80-100 = green
  Message below score:
  - < 60: "⚠ Poor scannability — increase contrast or reduce logo size. Cannot finish."
  - 60-79: "⚡ Acceptable — minor adjustments recommended"
  - 80-100: "✓ Excellent scannability"
  Export the needsWarning: boolean prop (used by parent to disable Finish button)

📊 REQUEST BUDGET: 21/40 used

════ TASK GROUP D: QR Codes Library Page (6 requests) ════

[REQ 22] Create app/(app)/qr-codes/page.tsx (max 130 lines):
  Search bar (debounced, updates URL params)
  Filter row: Type select, Status select (all/active/paused), Sort select (newest/oldest/most-scanned)
  View toggle: Grid | List icons
  Renders infinite list of QrCard via useInfiniteQuery
  Loading skeleton: 6 skeleton QR cards
  Empty state: "You haven't created any QR codes yet" + "Create your first →" CTA

[REQ 23] Create components/qr/qr-card.tsx (max 170 lines):
  Card shows: QR thumbnail image (lazy-loaded from /api/qr/{id}/thumbnail), QR name, type badge, DynamicBadge, scan count, "last scan X ago" timestamp
  Hover state: overlay reveals action buttons (Edit, Analytics, Copy short URL, Download, Delete)
  Edit: navigate to /create/{type}?edit={id}
  Analytics: navigate to /qr-codes/{id}/analytics
  Copy short URL: copy to clipboard with toast confirmation
  Delete: confirm dialog → DELETE /api/qr/{id} → optimistic removal from list (rollback on error)

[REQ 24] Create app/(app)/onboarding/page.tsx (max 100 lines):
  Full-screen welcome experience for first-time users
  Animated QRise logo + "Let's create your first QR code" heading
  3-step mini overview (icons + text): Create → Customize → Track
  Single CTA: "Create my first QR →" → /create
  Skip link: "Go to dashboard →"
  Trigger: check if user has zero QR codes (from dashboard stats API)

[REQ 25] Create components/app/onboarding-card.tsx (max 90 lines):
  Shown inside dashboard when user has 0 QR codes:
  Illustration (SVG placeholder), heading, sub-text, "Create QR" button
  Dismissible (save dismissed state to localStorage)

[REQ 26] Update app/(app)/qr-codes/[id]/analytics/page.tsx — shell only (max 100 lines):
  Page shell with date range picker state, tabs (Overview, Location, Devices, Time, Raw Events)
  Data fetching: GET /api/qr/{id}/analytics?range={range}
  Renders analytics components (to be created by Agent 5)
  Loading skeleton: 4 stat cards + chart placeholder

[REQ 27] Batch: Create app/(app)/create/design/page.tsx final, app/(app)/qr-codes/[id]/page.tsx redirect (→ analytics), verify all create routes

📊 REQUEST BUDGET: 27/40 used

════ TASK GROUP E: Wizard Store Integration & Remaining QR Files (5 requests) ════

[REQ 28-32] Batch (5 files, 1 request each):
  [REQ 28] Create app/api/qr/route.ts (max 160 lines) — GET (list) + POST (create)
  [REQ 29] Create app/api/qr/[id]/route.ts (max 200 lines) — GET + PUT + DELETE
  [REQ 30] Create app/api/qr/[id]/export/route.ts (max 120 lines):
    GET ?format=png|svg|pdf&dpi=72|300
    Use lib/qr-generator.ts to generate image buffer from QR config
    Return with appropriate Content-Type and Content-Disposition headers
  [REQ 31] Create app/api/qr/[id]/thumbnail/route.ts (max 80 lines):
    Fast small PNG thumbnail (200×200) for QR card grid display
    Cache in Supabase storage to avoid re-generation on every page load
  [REQ 32] Verify all files in components/qr/ exist and export properly. Fix any missing imports.

📊 REQUEST BUDGET: 32/40 used

[REQ 33-40] Final wizard integration:
  [REQ 33] Update stores/qr-wizard.store.ts if any fields need adjustment based on actual component props
  [REQ 34] Create hooks/use-wizard.ts final version with navigation helpers (nextStep, prevStep, canProceed)
  [REQ 35] Verify QRPreview works with qr-code-styling — test with static data
  [REQ 36-40] Output full file checklist + verify no file exceeds 400 lines

✅ AGENT 4 COMPLETE — Handoff to Agent 5.
```

---

# ════════════════════════════════════════════
# AGENT 5 — DASHBOARD & ANALYTICS AGENT
# Budget: 30 requests | Hour: 2 (continued)
# Domain: App shell, dashboard, analytics pages
# ════════════════════════════════════════════

## Agent 5 Prompt

```
You are Agent 5 — DASHBOARD & ANALYTICS AGENT for QRise SaaS.
Budget: 30 requests this hour. Track count. Stop at 26 used and output RESUME CHECKPOINT.

🤖 AGENT 5 — DASHBOARD & ANALYTICS — STARTING
📊 REQUEST BUDGET: 0/30 used

Prerequisites: Agents 1-4 complete. Read app/(app)/layout.tsx structure if it exists.

════ TASK GROUP A: App Shell (6 requests) ════

[REQ 1] Create components/app/sidebar-nav.tsx (max 170 lines):
  Fixed sidebar, 240px wide. Collapsible on mobile (icon-only mode).
  Top: QRise logo + "+ Create QR" button (accent color, full width)
  Nav items with icons (Lucide):
  - Dashboard (LayoutDashboard icon)
  - My QR Codes (QrCode icon)
  - Form Builder (FormInput icon)
  - API Manager (Code2 icon)
  - Settings (Settings icon)
  Active item: green background + bold text. Use usePathname() for active detection.
  Bottom: user avatar + name + plan badge + "Sign out" option (shadcn dropdown)

[REQ 2] Create components/app/app-header.tsx (max 90 lines):
  Top bar for app pages (mobile: hamburger + sidebar drawer)
  Shows: page title (from pathname), breadcrumb on nested pages, notification bell (placeholder)
  Mobile menu: triggers sidebar Sheet

[REQ 3] Create app/(app)/layout.tsx (max 90 lines):
  Grid: SidebarNav (fixed left, 240px) + main content (flex-1, scroll)
  Mobile: SidebarNav in Sheet (shadcn), triggered by AppHeader hamburger
  Providers: QueryClientProvider, ReactQueryDevtools (dev only), Toaster
  Check if user has 0 QR codes → redirect to /onboarding on first /dashboard visit

[REQ 4] Create components/app/stat-card.tsx (max 80 lines):
  Props: { label, value, delta?, deltaDirection: 'up'|'down'|'neutral', icon: LucideIcon, isLoading }
  Loading: shadcn Skeleton
  Delta: green arrow-up if positive, red arrow-down if negative
  Animate value on mount: count-up from 0 using useEffect

[REQ 5] Create components/app/user-menu.tsx (max 90 lines):
  shadcn DropdownMenu at bottom of sidebar
  Shows: avatar (initials if no image), full name, plan badge
  Items: Profile settings, Billing, Sign out
  Sign out: supabase.auth.signOut() → router.push('/login')

[REQ 6] Create components/app/activity-feed.tsx (max 120 lines):
  Props: { events: RecentActivity[], isLoading }
  Shows last 10 scan events across all user's QRs
  Each row: country flag emoji, QR name (truncated), device icon (Smartphone/Monitor), time ago
  Empty state: "No scans yet — share your QR codes to get started"
  Loading: 5 skeleton rows

📊 REQUEST BUDGET: 6/30 used

════ TASK GROUP B: Dashboard Page (6 requests) ════

[REQ 7] Create components/app/scan-trend-chart.tsx (max 150 lines):
  Recharts AreaChart: daily scan counts
  Props: { data: {date: string, scans: number, unique: number}[], range: '7d'|'30d'|'90d', onRangeChange }
  Range toggle buttons above chart
  Two area lines: total scans (green) and unique scans (teal), legend below
  Tooltip: shows date, total scans, unique scans
  Responsive: ResponsiveContainer width 100%
  Loading skeleton: gray placeholder rect

[REQ 8] Create components/app/world-scan-map.tsx (max 160 lines):
  SVG world map using react-simple-maps (or a static inline SVG path map if library import issues)
  Color scale: 0 scans = gray, max scans = deep green
  Tooltip on hover: country name + scan count
  If react-simple-maps unavailable: use a simple bar chart of top 10 countries as fallback
  Props: { data: {country: string, count: number}[] }

[REQ 9] Create app/(app)/dashboard/page.tsx (max 150 lines):
  Server component: fetch initial data (stats) with createServerClient
  Pass to client components via TanStack Query initial data
  Layout: stats row (4 StatCards) → two columns (ScanTrendChart left, WorldScanMap right) → two columns (ActivityFeed left, top QR codes mini-list right)
  "Auto-refresh every 60s" badge in top right
  useQuery polling: refetchInterval: 60000

[REQ 10] Create components/app/dashboard-stats.tsx (max 100 lines):
  4 StatCard components in a responsive grid
  Stats: Total QRs, Total Scans, Active QRs, Scans Today
  Data from GET /api/stats (user-specific, auth required)
  useQuery with staleTime: 30000

[REQ 11] Create app/api/stats/route.ts (max 100 lines):
  GET /api/stats — user's personal dashboard stats
  Auth required
  Return: totalQRs, totalScans, activeQRs, scansToday, topQRs (top 3 by scans)
  Cache: stale for 30s (use Redis)

[REQ 12] Create app/api/analytics/route.ts (max 100 lines):
  GET /api/analytics?range=7d — user's aggregated scan trend data
  Auth required, range param validation
  Return: daily scan counts for the range, total summary

📊 REQUEST BUDGET: 12/30 used

════ TASK GROUP C: QR Analytics Page (10 requests) ════

[REQ 13] Create components/analytics/scan-timeline.tsx (max 160 lines):
  Recharts LineChart: scans over selected date range
  Date range picker: Last 7 days | 30 days | 90 days | Custom (date inputs)
  Two lines: Total scans (solid green), Unique scans (dashed teal)
  Click any point: shows scan events from that day in a side panel (later)
  Export CSV button: downloads raw data as CSV

[REQ 14] Create components/analytics/location-map.tsx (max 150 lines):
  World map + country breakdown table side by side
  Map: react-simple-maps with color scale
  Table: country flag + name + scan count + % of total, sorted by count
  Click country → filter raw events by that country
  "Approximate location — based on IP geolocation" disclaimer

[REQ 15] Create components/analytics/device-chart.tsx (max 140 lines):
  Left: Recharts PieChart — Mobile / Tablet / Desktop percentages
  Right: Recharts BarChart — top 5 OS values (iOS, Android, Windows, macOS, Linux)
  Colors: Mobile=green, Tablet=teal, Desktop=blue
  Legend below pie chart

[REQ 16] Create components/analytics/time-heatmap.tsx (max 170 lines):
  7 rows (Mon–Sun) × 24 columns (0–23h) grid
  Each cell: colored by scan count (opacity 0.1–1.0, green)
  Hover tooltip: "Wednesday 14:00 — 47 scans"
  Row/column labels: abbreviated day names, hour labels (0, 6, 12, 18, 23)
  Below: peak time label: "Most scans on Thursdays at 2pm"
  Use CSS grid, no Recharts needed

[REQ 17] Create components/analytics/raw-events-table.tsx (max 200 lines):
  Paginated table (50 rows per page, server-side)
  Columns: Timestamp (relative), Country (flag + code), Device (icon + type), OS, Browser, Unique badge, Bot badge
  Filter chips above: "Excluding bots (filtered X bot scans)"
  Empty state: "No scans yet"

[REQ 18] Create app/(app)/qr-codes/[id]/analytics/page.tsx (max 150 lines) — final version:
  5 tabs: Overview | Location | Devices | Time | Raw Events
  Each tab renders the appropriate analytics component
  Shared date range state across all tabs
  Header: QR name + thumbnail + type badge + target URL + "Edit QR" button
  Summary cards above tabs: Total Scans, Unique Scans, Today, Peak Day

[REQ 19] Create app/api/qr/[id]/analytics/route.ts (max 180 lines):
  GET /api/qr/{id}/analytics?range=7d&type=overview|location|device|time|raw
  Auth + ownership check
  Aggregate scan_events from Supabase
  Filter out is_bot=true records
  Return typed response based on type param

[REQ 20] Create app/api/qr/[id]/analytics/export/route.ts (max 80 lines):
  GET — export scan events as CSV
  Auth + ownership check
  Stream CSV response (set Content-Disposition: attachment)
  Include: scanned_at, country, device_type, os, browser, is_unique columns

📊 REQUEST BUDGET: 20/30 used

════ TASK GROUP D: Remaining Dashboard Components (5 requests) ════

[REQ 21] Create components/app/top-qr-list.tsx (max 100 lines):
  Mini list of user's top 3 QR codes by scan count
  Each row: QR name, type icon, scan count bar, "View analytics →" link

[REQ 22] Create app/loading.tsx (max 30 lines): Full-page loading skeleton with sidebar outline + content area placeholders

[REQ 23] Create app/(app)/dashboard/loading.tsx (max 50 lines): Dashboard-specific skeleton: 4 stat card skeletons + chart placeholder

[REQ 24] Create app/(app)/qr-codes/loading.tsx (max 50 lines): 6 QR card skeletons in grid

[REQ 25-30] Remaining: app/error.tsx, app/(app)/error.tsx, app/not-found.tsx, verify all analytics components export correctly, check all imports are valid, output full file checklist

📊 REQUEST BUDGET: 30/30 used

✅ AGENT 5 COMPLETE — Handoff to Agent 6.
```

---

# ════════════════════════════════════════════
# AGENT 6 — FEATURES AGENT
# Budget: 30 requests | Hour: 2 (final)
# Domain: Form builder, API manager, settings
# ════════════════════════════════════════════

## Agent 6 Prompt

```
You are Agent 6 — FEATURES AGENT for QRise SaaS.
Budget: 30 requests this hour. Track count. Stop at 26 used and output RESUME CHECKPOINT.

🤖 AGENT 6 — FEATURES — STARTING
📊 REQUEST BUDGET: 0/30 used

Prerequisites: Agents 1-5 complete. Read types/form.types.ts before writing form builder code.

════ TASK GROUP A: Form Builder (10 requests) ════

[REQ 1] Create types/form.types.ts (max 100 lines):
  FieldType enum: 'text'|'email'|'phone'|'textarea'|'dropdown'|'checkbox'|'date'|'file'|'signature'
  FormField: { id, type, label, placeholder, required, validation?, options? (for dropdown/checkbox), helperText }
  FormSchema: { id, name, slug, fields: FormField[], successMessage, isActive }
  FieldConfig: per-type settings (min/max chars, accepted file types, date range, etc.)

[REQ 2] Create app/(app)/form-builder/page.tsx (max 110 lines):
  Two-column layout: field palette (left 280px) + builder canvas (center-right)
  Header: form name editable input (click to edit) + "Save & generate QR" button
  DndContext wrapping everything (from @dnd-kit/core)
  State: fields array, selectedFieldId, formName

[REQ 3] Create components/form-builder/field-palette.tsx (max 110 lines):
  Left panel: 8 draggable field type cards
  Each card: type icon + label, useDraggable hook
  Drag handle visible on hover
  Section labels: "Basic fields" (text, email, phone, textarea), "Choice fields" (dropdown, checkbox), "Special" (date, file, signature)

[REQ 4] Create components/form-builder/builder-canvas.tsx (max 220 lines):
  Drop zone: useDroppable, accepts dragged field types from palette
  Renders sortable list of added fields: useSortable per field
  Click field → set selectedFieldId
  Empty drop zone: dashed border + "Drag fields here" placeholder text
  Drag reorder between fields: DragOverlay for ghost element
  Each rendered field: FieldRenderer + (selected: blue border highlight) + move handle + delete button

[REQ 5] Create components/form-builder/field-renderer.tsx (max 220 lines):
  Non-interactive preview of each field type (shows what user will see):
  text → labeled input (disabled)
  email → labeled email input (disabled)
  phone → labeled tel input (disabled)
  textarea → labeled textarea (disabled)
  dropdown → labeled select (disabled, shows options)
  checkbox → labeled checkboxes (disabled)
  date → labeled date input (disabled)
  file → drag/drop file area (static)
  signature → "Sign here" canvas placeholder (static)
  Show required asterisk, helper text below

[REQ 6] Create components/form-builder/field-settings-panel.tsx (max 220 lines):
  Slide-in from right when field selected
  Common settings: label input, placeholder input, required toggle, helper text input
  Type-specific settings:
  - dropdown/checkbox: options list editor (add, remove, reorder options)
  - date: min date, max date inputs
  - file: accepted types (image/*, application/pdf, etc), max size
  - text/textarea: min/max character count
  - email: domain allowlist (optional)
  Deselect on backdrop click or Escape key

[REQ 7] Create components/form-builder/form-preview.tsx (max 150 lines):
  "Preview" button in builder header toggles preview mode
  Renders actual interactive form using form schema
  Submits to nowhere (preventDefault + success message)
  Shows form title + all fields + submit button

[REQ 8] Create app/api/forms/route.ts (max 120 lines):
  POST: Auth required. Validate with CreateFormSchema.
  Generate slug (kebab-case name + 6-char random suffix)
  Insert to forms table
  Create a Dynamic QR code pointing to /f/{slug} (call qr.service.createQR internally)
  Return { form, qrCode }

[REQ 9] Create app/api/forms/[id]/route.ts (max 100 lines):
  GET: return form by id (auth + ownership)
  PUT: update form schema (auth + ownership)
  DELETE: deactivate form + deactivate linked QR

[REQ 10] Create app/f/[slug]/page.tsx (max 140 lines) — if not created by Agent 3:
  Server component, fetch form by slug
  Render each field based on type (actual interactive inputs, not preview)
  Submit: client-side fetch POST /api/forms/{id}/submit
  Show success message from form.success_message on submit
  QRise "Powered by" footer badge

📊 REQUEST BUDGET: 10/30 used

════ TASK GROUP B: API Manager (8 requests) ════

[REQ 11] Create app/(app)/api-manager/page.tsx (max 100 lines):
  Two-section layout: API Keys (top) + Webhooks (bottom)
  "API Documentation →" link to /docs page
  Plan check: if user plan doesn't have has_api → show upgrade prompt instead

[REQ 12] Create components/app/api-keys-section.tsx (max 200 lines):
  "Create API key" form: name input + scope checkboxes (qr:read, qr:write, analytics:read, forms:read, bulk:write) + "Generate" button
  On generate: POST /api/api-keys → show raw key in a modal with copy button
  Modal message: "This is the only time your API key will be shown. Copy it now."
  Keys table: columns — Name, Prefix (first 12 chars), Scopes, Created, Last Used, Status, Revoke button
  Revoke: confirm dialog → DELETE /api/api-keys/{id}

[REQ 13] Create components/app/webhooks-section.tsx (max 200 lines):
  "Add webhook" form: endpoint URL + event type checkboxes (qr.created, qr.updated, scan.received, form.submitted) + "Add" button
  Webhook list: endpoint URL (truncated), events count, status toggle, delivery log button, delete button
  Delivery log: last 10 deliveries in an expandable row — timestamp, event, status code, retry button

[REQ 14] Create app/api/api-keys/route.ts (max 150 lines):
  GET /api/api-keys — list user's keys (NEVER return hash, return prefix + metadata)
  POST /api/api-keys — validate name + scopes, generate key via lib/api-key.ts, store hash, return raw key ONCE in response
  Response on create: { id, name, prefix, scopes, rawKey } — rawKey only in create response

[REQ 15] Create app/api/api-keys/[id]/route.ts (max 60 lines):
  DELETE — verify ownership, set is_active=false

[REQ 16] Create app/api/webhooks/route.ts (max 120 lines):
  GET — list user's webhooks
  POST — validate endpoint URL (must be https://), validate events, store webhook

[REQ 17] Create app/api/webhooks/[id]/route.ts (max 100 lines):
  PATCH — toggle is_active
  DELETE — remove webhook
  GET — return webhook with delivery log (last 10 entries)

[REQ 18] Create app/api/bulk/route.ts + app/api/bulk/[jobId]/route.ts (max 200 lines):
  POST /api/bulk:
    Auth + plan check (bulk feature requires has_bulk=true)
    Validate rows array (max 1000 rows on free, 10000 on business)
    Each row: { name, url } — validate all URLs are http/https
    Create bulk_jobs record (status: queued)
    Trigger async processing via internal fetch to /api/bulk/process (Vercel serverless)
    Return { jobId }
  GET /api/bulk/{jobId}: auth + ownership, return job status + progress

📊 REQUEST BUDGET: 18/30 used

════ TASK GROUP C: Settings Pages (8 requests) ════

[REQ 19] Create app/(app)/settings/page.tsx (max 100 lines):
  3-tab layout: General | Backup | Billing
  Uses shadcn Tabs component
  Each tab renders its own component

[REQ 20] Create components/settings/general-tab.tsx (max 200 lines):
  Section "Profile": full name input, avatar upload (Supabase storage), email (read-only — auth managed)
  Section "Preferences": timezone select (all IANA timezones), language select (en/es/fr/de/pt), date format
  Section "Notifications": email notification toggles (scan alerts, weekly digest, product updates)
  Section "Danger Zone": "Delete account" button → double-confirm dialog (type email to confirm) → DELETE /api/user/account

[REQ 21] Create components/settings/backup-tab.tsx (max 120 lines):
  "Export all QR codes" button: triggers GET /api/export?type=qr-codes → async job → email link
  "Export form submissions" button: triggers GET /api/export?type=form-submissions → async job
  Show last export date if available
  Progress indicator while export job runs (poll every 5s)
  Note: "Export contains QR metadata as CSV + PNG files as ZIP archive"

[REQ 22] Create components/settings/billing-tab.tsx (max 160 lines):
  Current plan: plan name + price + features list + expiry date
  Plan comparison: brief feature grid
  "Upgrade" CTA: placeholder (note: "Stripe integration coming soon" for now)
  Invoice list: empty state or mock invoices
  Cancel plan: "Downgrade to Free" button with confirmation

[REQ 23] Create app/(app)/settings/billing/page.tsx (max 60 lines): redirects to /settings with billing tab active

[REQ 24] Create app/(app)/settings/backup/page.tsx (max 60 lines): redirects to /settings with backup tab active

[REQ 25] Create app/api/export/route.ts (max 120 lines):
  GET ?type=qr-codes|form-submissions
  Auth required
  Create background job record (simulate with Vercel serverless timeout)
  For qr-codes: generate CSV of user's QRs + async ZIP of QR images
  For form-submissions: generate CSV of all user's form submissions
  Upload to Supabase storage, return { jobId }
  Simple polling: GET /api/export/{jobId}/status

[REQ 26] Create app/api/user/account/route.ts (max 80 lines):
  DELETE: verify ownership (re-auth check), anonymize scan_events, soft-delete user
  Requires confirm=true in body AND user's own email in confirmEmail field

📊 REQUEST BUDGET: 26/30 used

[REQ 27-30] Polish:
  [REQ 27] Verify form builder DnD works — check all @dnd-kit imports and usage
  [REQ 28] Create app/(app)/form-builder/[id]/page.tsx — edit existing form (load from API, pre-populate canvas)
  [REQ 29] Verify all settings components are properly imported in settings/page.tsx
  [REQ 30] Output complete Agent 6 file checklist

✅ AGENT 6 COMPLETE — Handoff to Agent 7. Begin in new hour (Hour 3).
```

---

# ════════════════════════════════════════════
# AGENT 7 — API ROUTES AGENT
# Budget: 25 requests | Hour: 3
# Domain: All remaining API routes, middleware, error handling
# ════════════════════════════════════════════

## Agent 7 Prompt

```
You are Agent 7 — API ROUTES AGENT for QRise SaaS.
Budget: 25 requests this hour. Track count. Stop at 22 used and output RESUME CHECKPOINT.

🤖 AGENT 7 — API ROUTES — STARTING
📊 REQUEST BUDGET: 0/25 used

Prerequisites: Agents 1-6 complete. Read existing API routes to avoid duplication.
Check which routes already exist before creating. Only create missing routes.

════ TASK GROUP A: Audit & Complete API Layer (15 requests) ════

[REQ 1] Scan all app/api/ files — list what exists vs what's missing from the file structure. Output findings.

[REQ 2] Create or complete app/api/qr/route.ts (max 170 lines) — final version:
  GET: pagination (page, limit, cursor-based), filter by type/status/search, sort. Return { items, nextCursor, total }
  POST: full create flow — plan limit check, short code generation, password hash, design config save, KV cache prime

[REQ 3] Create or complete app/api/qr/[id]/route.ts (max 220 lines) — final version:
  GET: full QR data including design_config, routing_rules (for smart_routing), actions (for multi_action), redirect_history (last 10)
  PUT: validate ownership, update fields, if target_url changed → insert to qr_redirect_history, invalidate KV
  DELETE: soft delete, invalidate KV, return 204

[REQ 4] Create app/api/qr/[id]/routing-rules/route.ts (max 120 lines):
  GET: return all routing rules for this QR, sorted by priority
  POST: add new rule (validate conditions JSONB, check circular redirect)
  PUT batch: replace all rules at once (used by smart-routing config save)

[REQ 5] Create app/api/qr/[id]/routing-rules/[ruleId]/route.ts (max 80 lines):
  PATCH: update single rule (priority, conditions, target_url)
  DELETE: remove rule

[REQ 6] Create app/api/qr/[id]/actions/route.ts (max 100 lines):
  GET: return all actions for multi_action QR, sorted by display_order
  PUT batch: replace all actions at once

[REQ 7] Complete app/api/forms/route.ts — verify it includes:
  GET: list user's forms with submission counts
  POST: create form + create Dynamic QR linked to form

[REQ 8] Create app/api/forms/[id]/submit/route.ts (max 120 lines):
  POST: public endpoint (no auth — anyone with the form URL can submit)
  Rate limit: 10 submissions per IP per form per hour (Upstash)
  Validate submission against form.fields_schema
  Required field check, email format check, etc.
  Insert to form_submissions
  Return { success: true, message: form.success_message }

[REQ 9] Create app/api/bulk/process/route.ts (max 180 lines):
  POST: called internally by /api/bulk after job creation
  Secret header check (X-Internal-Secret matches env var) — prevent external calls
  Process job in batches: for each row → create qr_code → generate PNG buffer → store in memory
  After all rows: use fflate to create ZIP in memory → upload to Supabase storage
  Update bulk_job: processed_rows, status, zip_url
  Send completion email via lib/resend.ts

[REQ 10] Create app/api/webhooks/deliver/route.ts (max 150 lines):
  POST: internal route for delivering webhook events
  Called by API routes when events occur (qr.created, scan.received, etc.)
  For each matching user webhook: POST to endpoint with HMAC-SHA256 signed payload
  Sign: X-QRise-Signature: sha256={HMAC-SHA256(secret, JSON.stringify(payload))}
  Store to webhook_deliveries
  Retry logic: if delivery fails → schedule retry (use Vercel serverless + Upstash delayed job)

📊 REQUEST BUDGET: 10/25 used

════ TASK GROUP B: Missing Utility Routes (8 requests) ════

[REQ 11] Create app/api/user/profile/route.ts (max 100 lines):
  GET: return current user profile + plan info
  PATCH: update full_name, avatar_url, notification preferences

[REQ 12] Create app/api/user/avatar/route.ts (max 80 lines):
  POST: upload avatar image to Supabase storage bucket 'avatars'
  Validate: image/* only, max 2MB
  Resize if needed, return public URL

[REQ 13] Create app/api/newsletter/route.ts (max 60 lines):
  POST: validate email, store in a simple newsletter_subscribers table (or log to console if table doesn't exist)
  Return { success: true } — used by landing page footer

[REQ 14] Create app/api/export/[jobId]/status/route.ts (max 60 lines):
  GET: check export job status from Supabase storage (does the file exist?)
  Return { status: 'pending'|'ready', downloadUrl? }

[REQ 15] Create lib/api-key-middleware.ts (max 120 lines) — if not created by Agent 2:
  Function: validateAPIKey(request: Request): Promise<{ userId: string, scopes: string[] } | null>
  Extract Bearer token from Authorization header
  Hash it with SHA-256, look up in api_keys table, verify is_active=true
  Update last_used_at on every successful validation
  Return null if invalid (caller returns 401)

[REQ 16] Create middleware for API key routes — add to app/api/qr/route.ts:
  Check if request has Authorization header → use API key validation
  Check if request has session cookie → use session auth
  If neither → return 401
  This enables both dashboard users and API consumers to use the same endpoints

[REQ 17] Create app/api/cron/cleanup/route.ts (max 80 lines):
  GET: protected by CRON_SECRET header (Vercel cron)
  Tasks:
  1. Delete expired OTP records (if using custom OTP table)
  2. Delete bulk job ZIPs older than 7 days from Supabase storage
  3. Delete webhook_deliveries older than 30 days
  4. Update scan_daily_rollups for yesterday (aggregate from scan_events)
  Return { cleaned: { otps, zips, deliveries, rollups } }

[REQ 18] Create vercel.json (max 30 lines):
  Configure cron job: /api/cron/cleanup runs daily at 2am UTC
  { crons: [{ path: "/api/cron/cleanup", schedule: "0 2 * * *" }] }

📊 REQUEST BUDGET: 18/25 used

════ TASK GROUP C: Final API Verification (7 requests) ════

[REQ 19] Audit all app/api/ routes:
  - Every route must start with auth check (or have explicit public comment)
  - Every write route must validate with Zod schema
  - Every route must return proper HTTP status codes (200/201/400/401/403/404/500)
  - Every route must catch errors and return { error: string } on failure

[REQ 20] Create lib/api-response.ts (max 80 lines):
  Helper functions for consistent API responses:
  - ok<T>(data: T, status?: number): NextResponse — returns { data }
  - error(message: string, status: number): NextResponse — returns { error: message }
  - paginated<T>(items: T[], cursor, total): NextResponse — returns { items, nextCursor, total }
  Update all API routes to use these helpers

[REQ 21] Create app/api/_middleware.ts — shared auth helper (max 100 lines):
  getAuthenticatedUser(request): Promise<User | null>
  verifyOwnership(userId, resourceId, table): Promise<boolean>
  requirePlanFeature(userId, feature): Promise<boolean>

[REQ 22] Fix any type errors found during audit (scan for TypeScript issues)

[REQ 23] Create app/api/qr/[id]/history/route.ts (max 80 lines):
  GET: return last 20 entries from qr_redirect_history for this QR
  Auth + ownership. Include restored-from indicator.
  POST: "restore" — update QR target_url to a historical URL (creates new history entry)

[REQ 24] Verify all routes have proper error boundaries — wrap handlers in try/catch

[REQ 25] Output complete API routes file checklist

📊 REQUEST BUDGET: 25/25 used

✅ AGENT 7 COMPLETE — Handoff to Agent 8.
```

---

# ════════════════════════════════════════════
# AGENT 8 — SECURITY & POLISH AGENT
# Budget: 20 requests | Hour: 3 (final)
# Domain: Security, error handling, README, final verification
# ════════════════════════════════════════════

## Agent 8 Prompt

```
You are Agent 8 — SECURITY & POLISH AGENT for QRise SaaS.
Budget: 20 requests this hour. Track count.

🤖 AGENT 8 — SECURITY & POLISH — STARTING
📊 REQUEST BUDGET: 0/20 used

Prerequisites: Agents 1-7 complete. Read ALL existing files before adding anything.

════ TASK GROUP A: Security Hardening (8 requests) ════

[REQ 1] Verify middleware.ts has:
  - updateSession() pattern for cookie refresh
  - Protected routes list is complete
  - Public routes are explicitly allowed
  - Redirect logic is correct for both unauthenticated and wrong-page cases
  Update if anything is missing.

[REQ 2] Add GDPR scan consent to Cloudflare Worker (verify cloudflare-worker/src/consent.ts exists and is imported in index.ts)
  Verify consent cookie is set with: Secure, HttpOnly, SameSite=Strict, max-age=31536000
  Verify consent check happens BEFORE analytics logging

[REQ 3] Verify rate limiting is applied to all sensitive routes:
  Check: /api/auth routes (OTP, login attempts), /api/api-keys (creation rate limit), /api/bulk, all write endpoints
  Add missing rate limit calls using lib/redis.ts rateLimitByIP()

[REQ 4] Verify password hashing in QR creation:
  In lib/services/qr.service.ts createQR() — if type='password': hash the password using bcrypt before storing
  Add: import bcrypt from 'bcryptjs'  (edge-compatible version)
  const hash = await bcrypt.hash(password, 12)
  Store hash in qr_codes.password_hash — never store raw password

[REQ 5] Add Content Security Policy header to next.config.ts:
  CSP: default-src 'self'; script-src 'self' 'unsafe-inline' (for Next.js); style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: {supabase-storage-domain}; connect-src 'self' {supabase-url} {upstash-url} {worker-url}; font-src 'self'

[REQ 6] Add scan event uniqueness detection to analytics-logger.ts (Cloudflare Worker):
  Verify: hashIP + checkUniqueness + is_unique flag on every scan_event
  Key format: uniq:{qrId}:{YYYY-MM-DD}:{ipHash16chars}:{uaHash8chars}
  TTL: 86400 seconds exactly

[REQ 7] Add QR redirect history on every URL change:
  In app/api/qr/[id]/route.ts PUT handler:
  Before UPDATE qr_codes SET target_url = newUrl
  First: INSERT INTO qr_redirect_history(qr_id, old_url, new_url, changed_by, changed_at)
  Verify this is implemented. Add if missing.

[REQ 8] Create lib/sanitize.ts (max 80 lines):
  For bulk CSV protection:
  - sanitizeCSVCell(cell: string): string — prepend ' if starts with =,+,-,@,tab,CR
  - sanitizeURL(url: string): string | null — return null if not valid http/https URL
  - stripHTMLTags(str: string): string — basic XSS prevention for user-provided text
  Import and use in app/api/bulk/route.ts

📊 REQUEST BUDGET: 8/20 used

════ TASK GROUP B: Error Handling & UX Polish (6 requests) ════

[REQ 9] Create app/error.tsx (max 80 lines):
  Client component with reset() function
  Shows: QRise logo, "Something went wrong", error message (in dev only), "Try again" button + "Go home" link
  Style: centered card, not ugly browser default

[REQ 10] Create app/(app)/error.tsx (max 80 lines):
  App-specific error: same as above but with sidebar layout context
  "Go to Dashboard" instead of "Go home"

[REQ 11] Create app/not-found.tsx (max 70 lines):
  QRise logo, "404 — Page not found", "This page doesn't exist or you don't have permission to view it"
  "Go home" button + "Contact support" link

[REQ 12] Verify all pages have loading.tsx siblings:
  Check: app/(app)/dashboard/loading.tsx, app/(app)/qr-codes/loading.tsx, app/(app)/form-builder/loading.tsx, app/(app)/api-manager/loading.tsx, app/(app)/settings/loading.tsx
  Create any missing ones (skeleton layouts matching the actual page structure)

[REQ 13] Add Toaster to app/(app)/layout.tsx and root app/layout.tsx (if not already):
  Import Toaster from shadcn/ui, place at root level
  Verify toast() is called correctly in all action success/error handlers (QR create, delete, export, etc.)

[REQ 14] Review all components for accessibility:
  Every interactive element must have: aria-label if icon-only, keyboard navigation support
  All images must have alt text
  Color is never the ONLY way to convey information (add text labels alongside color indicators)

📊 REQUEST BUDGET: 14/20 used

════ TASK GROUP C: Documentation & Deployment Prep (6 requests) ════

[REQ 15] Create README.md (max 200 lines):
  Sections:
  1. What is QRise
  2. Tech stack overview (with free tier limits table)
  3. Prerequisites (Node 20+, pnpm, Supabase account, Cloudflare account, Upstash account, Resend account)
  4. Local setup step by step:
     - Clone repo
     - pnpm install
     - Copy .env.local.example to .env.local, fill in values
     - Set up Supabase: create project, run migrations (pnpm drizzle-kit push), enable auth providers
     - Set up Cloudflare Worker: wrangler login → kv:namespace create → deploy
     - Set up Upstash: create Redis DB, copy REST URL + token
     - Set up Resend: create account, verify sender domain
     - pnpm dev
  5. Cloudflare Worker deploy steps
  6. Vercel deploy steps (env vars checklist)
  7. First admin setup (how to set is_admin=true for yourself)

[REQ 16] Create DEPLOYMENT.md (max 150 lines):
  Step-by-step production deployment:
  1. GitHub: push to main branch
  2. Vercel: auto-deploys from main
  3. Cloudflare: wrangler deploy (or GitHub Action)
  4. Post-deploy verification checklist:
     - Visit homepage ✓
     - Register an account ✓
     - Create a URL QR ✓
     - Scan the QR → verify redirect works ✓
     - Check analytics recorded the scan ✓
  5. Monitoring: Vercel analytics, Cloudflare Worker analytics (both free)

[REQ 17] Create .github/workflows/deploy.yml (max 80 lines):
  Trigger: push to main
  Jobs:
  - type-check: pnpm tsc --noEmit
  - vercel-deploy: Deploy to Vercel using vercel CLI + VERCEL_TOKEN secret
  - cloudflare-deploy: wrangler deploy using CLOUDFLARE_API_TOKEN secret

[REQ 18] Final verification — scan entire codebase:
  Count lines in each file. Flag any file exceeding 400 lines. List them and split them now.

[REQ 19] Output the MASTER FILE CHECKLIST:
  Every file in the project structure, with actual line count and status: ✅ Created | ⚠️ Needs attention | ❌ Missing

[REQ 20] Output LAUNCH READINESS SUMMARY:
  - Security: list all security measures implemented
  - Free tier limits: what breaks first at scale (with estimated user count)
  - Known limitations to address before launch
  - Recommended first features to add post-launch

📊 REQUEST BUDGET: 20/20 used

✅ AGENT 8 COMPLETE — QRise SaaS build is complete!

═══════════════════════════════════════════
🎉 ALL AGENTS COMPLETE
Total estimated requests: ~250 (across 3 hour windows)
Total files created: ~150+
═══════════════════════════════════════════
Next step: Follow DEPLOYMENT.md for production launch.
```

---

## QUICK REFERENCE — AGENT LAUNCH ORDER

```
Hour 1:   Paste Agent 0 prompt → run → paste Agent 1 → run → paste Agent 2 → run → paste Agent 3 → run
Hour 2:   Paste Agent 4 prompt → run → paste Agent 5 → run → paste Agent 6 → run
Hour 3:   Paste Agent 7 prompt → run → paste Agent 8 → run
Done! Follow DEPLOYMENT.md
```
