# QRise API — Multi-Agent Test & Implementation Prompt
# Version: 1.0 | For Kilo Code (Auto Model)
# Purpose: Test ALL QRise features via a single API key. If a feature is absent, implement it.

---

## WHAT THIS PROMPT DOES

This prompt runs **5 agents** that:
1. Scaffold a unified QRise REST API (Next.js route handlers in main SaaS)
2. Implement every QR feature endpoint under one API key
3. Write a full test suite (curl + TypeScript SDK tests)
4. Implement missing features discovered during testing
5. Generate API reference documentation (OpenAPI 3.1 spec)

The QRise API uses a **single API key per user** that grants access to all features the user's plan allows. Feature access is gated by `lib/plan-validation.ts` — not by separate keys.

---

## GLOBAL RULES

```
RULE 1  Every file: MAX 300–400 lines. Split immediately if approaching 400.
RULE 2  TypeScript strict mode. Zero `any` types.
RULE 3  No secrets hardcoded. All from process.env.
RULE 4  pnpm is the only package manager.
RULE 5  After every file: ✅ {filename} ({line count} lines)
RULE 6  After every 40 requests: 📊 REQUEST BUDGET: {used}/180 used this hour.
RULE 7  Budget hits 160/180 → STOP, output RESUME CHECKPOINT.
RULE 8  Read existing files before creating or modifying anything.
RULE 9  Every API route: validate API key → resolve user → check plan feature access → execute.
RULE 10 Every write operation: validate quota limits before executing.
RULE 11 Rate limit every public API endpoint (Upstash Redis).
RULE 12 Return consistent error envelope: { error: string, code: string, upgradeUrl?: string }
```

---

## API ARCHITECTURE

### Single API Key Flow
```
Request: GET /api/v1/qr-codes
Header:  X-QRise-Key: qr_live_xxxxxxxxxxxx

→ middleware: validateApiKey(key)
   → resolve: userId, planId, plan features & limits
   → check: is feature allowed on this plan?
   → check: has user exceeded quota?
   → execute: handler logic
   → return: JSON response
```

### API Key Format
```
qr_live_{32-char hex}   — production key
qr_test_{32-char hex}   — sandbox/test key (no real data affected)
```

### Unified Feature Access
ONE api key accesses ALL features the plan allows:
- Static QR creation
- Dynamic QR creation
- Smart Routing QR (if plan has smart_routing)
- Design Studio styling (if plan has design_studio)
- Password Protected QR (if plan has password_qr)
- Multi-Action QR (if plan has multi_action_qr)
- Bulk QR generation (if plan has bulk_qr)
- Form Builder (if plan has form_builder)
- Analytics & scan data
- CSV export
- Webhooks

---

## DATABASE SCHEMA (add to Supabase)

```sql
-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(64) NOT NULL UNIQUE,     -- SHA-256 of raw key, never store raw
  key_prefix VARCHAR(16) NOT NULL,          -- first 8 chars for display (qr_live_xxx...)
  name VARCHAR(200) NOT NULL,               -- user-defined label
  is_sandbox BOOL DEFAULT false,            -- true = test mode
  last_used_at TIMESTAMP,
  last_used_ip VARCHAR(45),
  monthly_call_count INT DEFAULT 0,
  total_call_count BIGINT DEFAULT 0,
  is_active BOOL DEFAULT true,
  scopes TEXT[] DEFAULT ARRAY['read','write'],  -- 'read' | 'write' | 'admin'
  allowed_ips TEXT[],                            -- null = all IPs
  webhook_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP                           -- null = never expires
);

-- API call log (for analytics + rate limit recovery)
CREATE TABLE IF NOT EXISTS api_call_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  user_id UUID NOT NULL,
  endpoint VARCHAR(200) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  response_ms INT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  request_body_size INT,
  error_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Webhook deliveries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  user_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,         -- 'qr.scan', 'qr.created', 'form.submitted'
  payload JSONB NOT NULL,
  webhook_url VARCHAR(500) NOT NULL,
  response_status INT,
  response_body TEXT,
  attempt_count INT DEFAULT 1,
  next_retry_at TIMESTAMP,
  delivered_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',     -- 'pending'|'delivered'|'failed'|'retrying'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sandbox QR codes (isolated from production data)
CREATE TABLE IF NOT EXISTS sandbox_qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  api_key_id UUID NOT NULL,
  name VARCHAR(300) NOT NULL,
  qr_type VARCHAR(50) NOT NULL,
  target_url VARCHAR(2000),
  config JSONB,
  scan_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## FILE STRUCTURE (additions to main SaaS)

```
app/
├── api/
│   └── v1/                              ← All public API routes
│       ├── auth/
│       │   └── validate/route.ts        ← Test if key is valid
│       ├── qr-codes/
│       │   ├── route.ts                 ← GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts             ← GET, PATCH, DELETE
│       │       ├── scans/route.ts       ← GET scan history
│       │       └── analytics/route.ts  ← GET analytics
│       ├── design/
│       │   └── route.ts                 ← POST apply design to QR
│       ├── smart-routing/
│       │   ├── route.ts                 ← GET rules, POST rule
│       │   └── [qrId]/route.ts
│       ├── bulk/
│       │   ├── route.ts                 ← POST upload CSV, GET jobs
│       │   └── [jobId]/route.ts        ← GET job status, GET download
│       ├── forms/
│       │   ├── route.ts                 ← GET forms, POST create
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── submissions/route.ts
│       ├── analytics/
│       │   └── route.ts                 ← GET platform analytics
│       ├── webhooks/
│       │   ├── route.ts                 ← GET/POST webhooks
│       │   └── [id]/route.ts
│       └── export/
│           └── route.ts                 ← GET CSV export
lib/
├── api/
│   ├── validate-key.ts                  ← Core key validation + user resolution
│   ├── rate-limit-api.ts               ← Per-key rate limiting (Upstash)
│   ├── api-response.ts                 ← Consistent response helpers
│   └── log-call.ts                     ← Write to api_call_log
tests/
├── api/
│   ├── setup.ts                        ← Create test key, seed test data
│   ├── qr-codes.test.ts
│   ├── design.test.ts
│   ├── smart-routing.test.ts
│   ├── bulk.test.ts
│   ├── forms.test.ts
│   ├── analytics.test.ts
│   ├── webhooks.test.ts
│   └── teardown.ts
docs/
└── openapi.yaml                        ← Full OpenAPI 3.1 spec
```

---

# ════════════════════════════════════════════
# AGENT T0 — API FOUNDATION & KEY VALIDATION
# Budget: 35 requests | Hour 1
# ════════════════════════════════════════════

```
You are Agent T0 — API FOUNDATION agent for QRise.
Budget: 35 requests. Stop at 30, output RESUME CHECKPOINT.

🤖 AGENT T0 — API FOUNDATION — STARTING
📊 REQUEST BUDGET: 0/35 used

════ TASK GROUP A: Core API Middleware (10 requests) ════

[REQ 1] Create lib/api/validate-key.ts (max 180 lines):
  Function: validateApiKey(request: NextRequest): Promise<ApiKeyContext | ApiErrorResponse>

  ApiKeyContext = {
    userId: string
    apiKeyId: string
    plan: Plan               // full plan object with all feature flags & limits
    isSandbox: boolean
    keyPrefix: string
    scopes: string[]
  }

  Steps:
  1. Extract key from header: X-QRise-Key (primary) or Authorization: Bearer (fallback)
  2. Validate format: must start with qr_live_ or qr_test_
  3. Hash the key (SHA-256) → look up in api_keys table (key_hash column)
  4. Check is_active = true, not expired
  5. Check allowed_ips if set: reject if request IP not in list
  6. Resolve user from user_id → fetch plan from plans table
  7. Check user is_suspended = false
  8. Update api_keys SET last_used_at = NOW(), last_used_ip = ip (async, don't await)
  9. Return ApiKeyContext

  Error responses:
  - No key: { error: 'API key required', code: 'MISSING_KEY' } → 401
  - Invalid format: { error: 'Invalid key format', code: 'INVALID_KEY_FORMAT' } → 401
  - Not found: { error: 'API key not found', code: 'KEY_NOT_FOUND' } → 401
  - Expired: { error: 'API key expired', code: 'KEY_EXPIRED' } → 401
  - Suspended: { error: 'Account suspended', code: 'ACCOUNT_SUSPENDED' } → 403
  - IP blocked: { error: 'IP not allowed', code: 'IP_NOT_ALLOWED' } → 403

[REQ 2] Create lib/api/rate-limit-api.ts (max 120 lines):
  Use Upstash Redis + @upstash/ratelimit

  Rate limit tiers (by plan):
  - free: 100 requests/minute, 1,000/day
  - pro: 500 requests/minute, 10,000/day
  - business: 2,000 requests/minute, 100,000/day
  - enterprise: 10,000 requests/minute, unlimited/day

  Function: checkRateLimit(apiKeyId: string, plan: string): Promise<RateLimitResult>
  RateLimitResult = { allowed: boolean, remaining: number, reset: number, limit: number }

  Add headers to response:
  X-RateLimit-Limit: {limit}
  X-RateLimit-Remaining: {remaining}
  X-RateLimit-Reset: {reset timestamp}

  On limit exceeded: return 429 with Retry-After header

[REQ 3] Create lib/api/api-response.ts (max 100 lines):
  Consistent response helpers:

  success<T>(data: T, meta?: PaginationMeta): NextResponse
  created<T>(data: T): NextResponse         → 201
  noContent(): NextResponse                  → 204
  error(code: string, message: string, status: number, upgradeUrl?: string): NextResponse
  paginated<T>(items: T[], total: number, page: number, limit: number): NextResponse

  PaginationMeta = { page, limit, total, totalPages, hasNext, hasPrev }

  Error envelope:
  {
    error: string,
    code: string,           // machine-readable: 'FEATURE_NOT_IN_PLAN', 'QUOTA_EXCEEDED' etc
    upgradeUrl?: string,    // '/pricing' when plan upgrade would fix it
    documentation?: string  // link to relevant API docs section
  }

[REQ 4] Create lib/api/log-call.ts (max 80 lines):
  Async function logApiCall(params: ApiCallLogParams): Promise<void>
  - Insert to api_call_log table
  - Fire-and-forget (don't await in route handlers)
  - Increment api_keys.monthly_call_count and total_call_count

[REQ 5] Create lib/api/check-feature.ts (max 120 lines):
  Function: checkFeatureAccess(ctx: ApiKeyContext, feature: FeatureKey): ApiErrorResponse | null
  - If global feature flag disabled: return { error: 'Feature not available', code: 'FEATURE_DISABLED' }
  - If plan does not include feature: return { error, code: 'FEATURE_NOT_IN_PLAN', upgradeUrl: '/pricing' }
  - null = allowed

  Function: checkQuota(ctx: ApiKeyContext, quotaKey: QuotaKey, currentUsage: number): ApiErrorResponse | null
  - Compare currentUsage against plan limit
  - If over limit: return { error, code: 'QUOTA_EXCEEDED', upgradeUrl: '/pricing' }
  - null = allowed

  QuotaKeys: 'qr_limit' | 'dynamic_qr_limit' | 'bulk_qr_limit' | 'api_call_limit' |
             'password_qr_limit' | 'multi_action_qr_limit' | 'form_builder_limit' | 'webhook_limit'

[REQ 6] Create app/api/v1/auth/validate/route.ts (max 80 lines):
  GET /api/v1/auth/validate
  - Validate API key
  - Return: { valid: true, keyPrefix, plan, isSandbox, scopes, features: string[], limits: Record<QuotaKey, number> }
  - Used by developers to test if their key works and see what features they have

[REQ 7] Create app/api/v1/webhooks/route.ts (max 200 lines):
  GET /api/v1/webhooks — list user's webhook endpoints
  POST /api/v1/webhooks — register a new webhook
    Body: { url, events: string[], secret?: string }
    Events: 'qr.scan' | 'qr.created' | 'qr.updated' | 'form.submitted' | 'bulk.completed'
    Check: plan webhook_limit not exceeded
    Validate: url must be valid HTTPS URL
    Store webhook_url on api_keys record (or separate table if multiple webhooks per key)
    Return: { id, url, events, createdAt }

  DELETE /api/v1/webhooks/[id] — remove webhook

[REQ 8] Create lib/api/deliver-webhook.ts (max 120 lines):
  Function: deliverWebhook(event: WebhookEvent): Promise<void>
  - Find all active api_keys for userId that have webhook_url set and match event type
  - POST event payload to webhook_url with signature: X-QRise-Signature: sha256=HMAC(secret, body)
  - Log to webhook_deliveries table
  - On failure: schedule retry (exponential backoff: 1min, 5min, 30min, 2h, 24h)
  - Mark as 'failed' after 5 attempts

  WebhookEvent = { type: string, userId: string, data: Record<string, unknown>, timestamp: string }

[REQ 9] Create app/api/v1/export/route.ts (max 150 lines):
  GET /api/v1/export?type=qr-codes|scans|forms&format=csv|json&from=ISO&to=ISO
  Check: plan analytics_export + csv_export_limit
  Check: date range within analytics_export_days limit
  For csv: stream CSV response with Content-Disposition header
  For json: return paginated JSON
  Log export to csv_export_usage table (increment monthly count)

[REQ 10] Output T0 Task Group A file checklist with line counts.

📊 REQUEST BUDGET: 10/35 used

════ TASK GROUP B: QR Code API Routes (15 requests) ════

[REQ 11] Create app/api/v1/qr-codes/route.ts (max 280 lines):
  GET /api/v1/qr-codes
    Query: page, limit (max 100), type, isDynamic, search, sort
    Sandbox: if isSandbox → query sandbox_qr_codes table instead
    Return: paginated list of QR codes with scan counts

  POST /api/v1/qr-codes
    Body: {
      name: string,
      type: 'static' | 'dynamic' | 'smart_routing' | 'password' | 'multi_action',
      targetUrl?: string,       -- required for static/dynamic
      password?: string,        -- required if type='password', check password_qr feature
      actions?: QRAction[],     -- required if type='multi_action', check multi_action_qr feature
      design?: DesignConfig,    -- optional, check design_studio feature
      routingRules?: RoutingRule[] -- required if type='smart_routing', check smart_routing feature
    }
    Validate feature access per type
    Check QR quota (qr_limit)
    Check type-specific quotas (password_qr_limit, multi_action_qr_limit)
    If isSandbox: insert to sandbox_qr_codes
    Else: insert to qr_codes
    Fire webhook: 'qr.created'
    Return created QR with shortUrl

[REQ 12] Create app/api/v1/qr-codes/[id]/route.ts (max 200 lines):
  GET /api/v1/qr-codes/{id}
    Verify QR belongs to userId
    Return full QR object: id, name, type, shortCode, shortUrl, targetUrl, design, config, scanCount, createdAt, updatedAt

  PATCH /api/v1/qr-codes/{id}
    Updateable: name, targetUrl (dynamic only — static cannot change URL), design, routingRules, actions, password
    Validate: static QR → reject targetUrl change (return 400 with explanation)
    Fire webhook: 'qr.updated'

  DELETE /api/v1/qr-codes/{id}
    Soft delete: set is_active = false
    Return 204

[REQ 13] Create app/api/v1/qr-codes/[id]/scans/route.ts (max 150 lines):
  GET /api/v1/qr-codes/{id}/scans
    Query: page, limit, from, to, country, device
    Check: plan has analytics
    If analytics_export_days limit: enforce date range cap
    Return: paginated scan events with device, country, city, timestamp

[REQ 14] Create app/api/v1/qr-codes/[id]/analytics/route.ts (max 160 lines):
  GET /api/v1/qr-codes/{id}/analytics?period=7d|30d|90d
    Check: plan has analytics
    Return: {
      totalScans, uniqueScans,
      scansByDay: [{ date, count }],
      byCountry: [{ country, count, percent }],
      byDevice: [{ device, count, percent }],
      byOS: [{ os, count }],
      peakHour: number,
      peakDay: string
    }

[REQ 15] Create app/api/v1/design/route.ts (max 200 lines):
  POST /api/v1/qr-codes/{id}/design (apply design to existing QR)
    Check: plan has design_studio
    Body: {
      style?: {
        dotPattern?: 'square'|'rounded'|'dots'|'classy'|'extra-rounded',
        foregroundColor?: string,   -- hex, check design_studio_color_limit
        backgroundColor?: string
      },
      logo?: {
        url?: string,               -- URL of logo image
        base64?: string,            -- or base64 encoded
        size?: number               -- 0.1–0.4 (as fraction of QR)
      },
      frame?: {
        style?: string,             -- check design_studio_frame_limit
        color?: string,             -- check design_studio_frame_color_limit
        text?: string               -- label text on frame
      },
      eye?: {
        shape?: string,             -- check design_studio_eye_shape_limit
        color?: string              -- check design_studio_eye_color_limit
      }
    }
    Validate each sub-feature against plan limits
    Update qr_codes.design_config
    Return updated design config

[REQ 16] Create app/api/v1/smart-routing/[qrId]/route.ts (max 220 lines):
  GET /api/v1/qr-codes/{id}/routing-rules
    Check: plan has smart_routing
    Return all routing rules for QR

  POST /api/v1/qr-codes/{id}/routing-rules
    Check: plan has smart_routing
    Check: rule count < smart_routing_rule_limit
    Body: {
      type: 'geo'|'device'|'time'|'language',
      condition: { country?: string[], device?: string[], timeRange?: { start, end }, language?: string[] },
      targetUrl: string,
      priority: number
    }
    Validate sub-feature access:
      - type='geo' → check smart_routing_geotargeting
      - type='device' → check smart_routing_devicetargeting
      - type='time' → check smart_routing_timetargeting
    Return created rule

  DELETE /api/v1/qr-codes/{id}/routing-rules/{ruleId}
    Remove rule, reorder priorities

[REQ 17] Create app/api/v1/bulk/route.ts (max 220 lines):
  GET /api/v1/bulk — list bulk jobs for this user/key
    Return: paginated list of bulk_jobs with status + progress

  POST /api/v1/bulk — create bulk job from CSV
    Check: plan has bulk_qr
    Check: bulk job count this month < bulk_qr_limit
    Content-Type: multipart/form-data
    Fields: csv (file), qrType ('static'|'dynamic'), designPreset? (config JSON)
    Validate CSV structure:
      Required columns: name, targetUrl
      Optional: password, description, tags
      Max rows: plan.bulk_qr_row_limit
    Parse CSV → validate all rows before creating job
    Create bulk_job record (status: queued)
    Return: { jobId, totalRows, status: 'queued' }

[REQ 18] Create app/api/v1/bulk/[jobId]/route.ts (max 150 lines):
  GET /api/v1/bulk/{jobId}
    Return: { id, status, totalRows, processedRows, failedRows, createdAt, completedAt, downloadUrl? }

  GET /api/v1/bulk/{jobId}/download
    Status must be 'completed'
    Return ZIP file of generated QR codes (PNG) + result CSV
    Or: return CSV with columns: name, targetUrl, shortUrl, qrImageUrl, status, error?

[REQ 19] Create app/api/v1/forms/route.ts (max 200 lines):
  GET /api/v1/forms — list forms
    Check: plan has form_builder

  POST /api/v1/forms — create form
    Check: plan has form_builder
    Check: form count < form_builder_limit
    Body: {
      name: string,
      fields: FormField[],    -- check field count < form_field_limit
      linkedQrId?: string,    -- attach to a QR code
      settings?: {
        fileUploadEnabled?: boolean,    -- check plan
        maxFileSizeMb?: number,         -- check form_file_upload_limit
        redirectUrl?: string,
        submissionLimit?: number        -- check form_submission_limit
      }
    }
    Return created form with submissionUrl

[REQ 20] Create app/api/v1/forms/[id]/route.ts + submissions/route.ts (max 200 lines):
  GET /api/v1/forms/{id} — form details + submission count
  PATCH /api/v1/forms/{id} — update form fields/settings
  DELETE /api/v1/forms/{id}

  GET /api/v1/forms/{id}/submissions
    Check: plan has form_builder
    Return: paginated submissions with field values, submitted_at, file_urls

[REQ 21] Create app/api/v1/analytics/route.ts (max 180 lines):
  GET /api/v1/analytics?period=7d|30d|90d
    Account-level analytics (across ALL user's QRs)
    Check: plan has analytics
    Return: {
      totalQRCodes, activeQRCodes,
      totalScans, uniqueScans,
      scansByDay: [],
      topQRCodes: [{ id, name, scans }],
      byCountry: [],
      byDevice: []
    }

[REQ 22] Check for missing sandbox implementations:
  For all routes: if isSandbox → use sandbox_qr_codes table
  sandbox_qr_codes has same schema, scans don't affect production data
  Sandbox bulk jobs: parse CSV but don't generate real QRs, return mock data

[REQ 23] Create app/api/v1/qr-codes/[id]/scans/route.ts — verify webhook fires on scan:
  In the Cloudflare Worker (or Next.js redirect handler): after logging a scan, call deliverWebhook
  Add deliverWebhook('qr.scan', userId, { qrId, scanData }) to the scan recording logic

[REQ 24] Verify all routes use validateApiKey + checkRateLimit + logApiCall pattern:
  Every route must follow this exact structure:
  ```typescript
  export async function GET(req: NextRequest, { params }) {
    const ctx = await validateApiKey(req)
    if ('error' in ctx) return error(ctx.code, ctx.error, ctx.status)
    const rl = await checkRateLimit(ctx.apiKeyId, ctx.plan.name)
    if (!rl.allowed) return rateLimitError(rl)
    logApiCall({ ... })   // fire and forget
    // ... handler logic
  }
  ```

[REQ 25] Output T0 Task Group B file checklist.

📊 REQUEST BUDGET: 25/35 used

════ TASK GROUP C: Test Setup (10 requests) ════

[REQ 26] Create tests/api/setup.ts (max 150 lines):
  Before all tests:
  1. Connect to Supabase using SERVICE_ROLE_KEY
  2. Create test user if not exists (email: api-test@qrise.test)
  3. Set test user plan to 'business' (all features enabled)
  4. Generate a test API key (qr_test_ prefix) → store raw key in TEST_API_KEY env
  5. Generate a sandbox test key → store in TEST_SANDBOX_KEY env
  6. Seed: 3 test QR codes, 1 test form, 1 bulk job (queued state)
  7. Export: { apiKey, sandboxKey, testQrId, testFormId, baseUrl }

[REQ 27] Create tests/api/qr-codes.test.ts (max 300 lines):
  Tests using fetch() against process.env.BASE_URL:

  describe('QR Codes API') {
    ✓ GET /api/v1/auth/validate — valid key returns plan info
    ✓ GET /api/v1/qr-codes — returns paginated list
    ✓ POST /api/v1/qr-codes — create static QR (name, targetUrl)
    ✓ POST /api/v1/qr-codes — create dynamic QR (isDynamic: true)
    ✓ POST /api/v1/qr-codes — create password QR (type: 'password', password: 'test123')
    ✓ POST /api/v1/qr-codes — create multi-action QR (type: 'multi_action', actions:[...])
    ✓ PATCH /api/v1/qr-codes/{id} — update targetUrl (dynamic only)
    ✗ PATCH /api/v1/qr-codes/{id} — reject targetUrl change on static QR (expect 400)
    ✓ DELETE /api/v1/qr-codes/{id} — soft delete returns 204
    ✗ GET /api/v1/qr-codes — reject invalid key (expect 401)
    ✗ GET /api/v1/qr-codes — reject expired key (expect 401)
    ✗ POST /api/v1/qr-codes — reject when qr_limit exceeded (expect 429/403)
  }

[REQ 28] Create tests/api/design.test.ts (max 200 lines):
  Tests:
    ✓ POST design — apply dot pattern to QR
    ✓ POST design — apply logo (base64 upload)
    ✓ POST design — apply frame style
    ✓ POST design — apply eye shape + eye color
    ✓ POST design — apply frame color
    ✗ POST design — reject when design_studio not in plan (downgrade to free, expect 403)
    ✓ POST design — multiple design elements in one request
    ✓ GET QR after design — design config reflected in response

[REQ 29] Create tests/api/smart-routing.test.ts (max 200 lines):
  Tests:
    ✓ POST routing rule — geo rule (country: ['IN', 'US'])
    ✓ POST routing rule — device rule (device: ['mobile'])
    ✓ POST routing rule — time rule (timeRange: { start: '09:00', end: '17:00' })
    ✗ POST routing rule — reject geo if smart_routing_geotargeting = false
    ✗ POST routing rule — reject when rule_limit exceeded
    ✓ GET routing rules — list all rules for QR
    ✓ DELETE routing rule — removes rule
    ✓ Priority ordering — rules apply in priority order

[REQ 30] Create tests/api/bulk.test.ts (max 200 lines):
  Tests:
    ✓ POST /bulk — upload valid CSV (5 rows: name, targetUrl)
    ✓ GET /bulk/{jobId} — returns queued status
    ✗ POST /bulk — reject invalid CSV (missing required columns) → 400 with column errors
    ✗ POST /bulk — reject CSV over bulk_qr_row_limit → 400
    ✗ POST /bulk — reject when bulk_qr_limit (monthly jobs) exceeded → 403
    ✓ GET /bulk — list all bulk jobs for user
    ✓ Sandbox bulk — POST with sandbox key → mock result, no real QRs created

[REQ 31] Create tests/api/forms.test.ts (max 200 lines):
  Tests:
    ✓ POST /forms — create form with 3 text fields
    ✓ POST /forms — create form with file upload field (check plan limit)
    ✓ GET /forms/{id}/submissions — returns paginated submissions
    ✗ POST /forms — reject when form_builder_limit exceeded
    ✗ POST /forms — reject fields over form_field_limit
    ✓ PATCH /forms/{id} — update form title + fields
    ✓ DELETE /forms/{id}

[REQ 32] Create tests/api/webhooks.test.ts (max 180 lines):
  Tests:
    ✓ POST /webhooks — register webhook URL for 'qr.scan' event
    ✓ Create QR + simulate scan → verify webhook payload delivered
    ✓ Webhook signature: X-QRise-Signature header is valid HMAC-SHA256
    ✓ GET /webhooks — list registered webhooks
    ✓ DELETE /webhooks/{id} — remove webhook
    ✗ POST /webhooks — reject non-HTTPS URL → 400
    ✗ POST /webhooks — reject when webhook_limit exceeded → 403

[REQ 33] Create tests/api/analytics.test.ts (max 150 lines):
  Tests:
    ✓ GET /analytics?period=7d — returns account analytics
    ✓ GET /qr-codes/{id}/analytics — QR-level analytics
    ✓ GET /qr-codes/{id}/scans — paginated scan history
    ✗ GET /analytics — reject when analytics not in plan (free plan key → 403)
    ✗ GET /qr-codes/{id}/scans?from=2020-01-01 — reject if date exceeds analytics_export_days

[REQ 34] Create tests/api/teardown.ts (max 80 lines):
  After all tests:
  - Delete all test QRs created during tests
  - Delete test form + submissions
  - Delete test API keys
  - Delete sandbox QR codes
  - Leave test user intact (for re-runs)

[REQ 35] Output complete T0 file checklist with line counts.
  Also output: example curl commands for each endpoint (as a quick reference)

📊 REQUEST BUDGET: 35/35 used
✅ AGENT T0 COMPLETE — Handoff to Agent T1.
```

---

# ════════════════════════════════════════════
# AGENT T1 — API KEY MANAGEMENT IN MAIN APP
# Budget: 30 requests | Hour 1 (continued)
# ════════════════════════════════════════════

```
You are Agent T1 — API KEY MANAGEMENT agent for QRise main SaaS UI.
Budget: 30 requests. Stop at 25, output RESUME CHECKPOINT.

🤖 AGENT T1 — API KEY MANAGEMENT UI — STARTING
📊 REQUEST BUDGET: 0/30 used

Prerequisites: Agent T0 complete. Read lib/api/validate-key.ts before starting.

════ TASK GROUP A: API Key Management UI (15 requests) ════

[REQ 1] Create app/(dashboard)/settings/api/page.tsx (max 120 lines):
  API keys management page in main SaaS user settings:
  - Header: "Developer API" + link to docs + plan upgrade CTA (if no api_access)
  - If plan has no api_access: show locked card "Upgrade to Pro to access the API"
  - If plan has api_access: show key list + create button
  - Key list: shows prefix (qr_live_xxxx...), name, last used, created date, scope badges
  - Create key button → modal

[REQ 2] Create components/api/api-keys-list.tsx (max 200 lines):
  TanStack Query: fetch user's API keys from GET /api/user/api-keys
  For each key:
    - Key prefix (monospace): "qr_live_a1b2c3..."
    - Name badge
    - Scope badges: Read, Write
    - Last used: "2 hours ago" or "Never"
    - Created date
    - Actions: Copy prefix (can't copy full key — never shown again), Rename, Revoke
  Empty state: "No API keys yet. Create your first key to start building."
  "Create API key" button → CreateApiKeyModal

[REQ 3] Create components/api/create-api-key-modal.tsx (max 180 lines):
  shadcn Dialog:
  Step 1 — Configure:
    - Name input (required, e.g. "My App Production")
    - Scopes: checkboxes (Read, Write)
    - Key type: Production (qr_live_) or Sandbox (qr_test_)
    - Expiry: Never / 30 days / 90 days / 1 year / Custom date
    - IP allowlist: optional comma-separated list
  Step 2 — Copy key (only shown once):
    - Full key displayed in monospace box with copy button
    - Warning: "This key will never be shown again. Copy it now."
    - Checkbox: "I have copied my key"
    - Confirm button only enabled when checkbox checked
  On submit: POST /api/user/api-keys → display generated key in step 2

[REQ 4] Create app/api/user/api-keys/route.ts (max 200 lines):
  GET: list user's API keys (never return key_hash, only prefix + metadata)
  POST: create new API key
    Validate: plan has api_access
    Validate: key count < plan.api_key_limit
    Generate: raw key = `qr_${isSandbox ? 'test' : 'live'}_${crypto.randomBytes(32).toString('hex')}`
    Store: key_hash = SHA-256(rawKey), key_prefix = rawKey.slice(0, 16)
    Return: { id, rawKey, prefix, name, scopes, createdAt }  ← rawKey ONLY in POST response

[REQ 5] Create app/api/user/api-keys/[id]/route.ts (max 120 lines):
  PATCH: rename key (name only)
  DELETE: revoke key (set is_active = false)
    Confirmation: require body { confirm: true }
    writeAuditLog: action = 'api_key.revoked'

[REQ 6] Create components/api/api-usage-chart.tsx (max 180 lines):
  Shows API usage for current billing period:
  - "X / Y calls used this month" progress bar
  - Calls per day chart (Recharts BarChart, last 30 days)
  - Breakdown by endpoint (pie chart or table)
  - Errors rate line overlay
  Data from: GET /api/user/api-usage

[REQ 7] Create app/api/user/api-usage/route.ts (max 150 lines):
  GET: return usage for current user's API keys
  - Total calls this month (from api_keys.monthly_call_count)
  - Calls by day (from api_call_log GROUP BY DATE)
  - Calls by endpoint (GROUP BY endpoint)
  - Error rate (status_code >= 400 / total)
  - Average response time
  - Cache in Redis: 5 min TTL per userId

[REQ 8] Create components/api/webhook-manager.tsx (max 200 lines):
  Section within API settings page:
  - List registered webhooks (url, events, last delivery status)
  - "Add webhook" button → inline form: URL input + event multi-select
  - Per webhook: Test (sends mock payload), Edit, Delete
  - Delivery log accordion: last 10 deliveries per webhook (status, timestamp, response)
  Data from: GET/POST/DELETE /api/user/webhooks

[REQ 9] Create app/api/user/webhooks/route.ts + [id]/route.ts (max 180 lines):
  GET: list user's webhook endpoints (join with recent webhook_deliveries for status)
  POST: create webhook endpoint
    Validate: HTTPS URL required
    Validate: webhook_limit not exceeded
    Generate: webhook signing secret (32-char hex)
    Return: { id, url, events, secret }  ← secret only in POST response
  PATCH /[id]: update URL or events
  DELETE /[id]: remove webhook

[REQ 10] Create components/api/api-docs-quickstart.tsx (max 150 lines):
  Inline quickstart panel on the API settings page:
  - Language toggle: curl | Node.js | Python | PHP
  - Shows working code snippet for "List your QR codes" in selected language
  - Snippet uses the user's actual key prefix as placeholder
  - "View full docs" button → /docs/api
  Code snippets are static strings per language, key placeholder = 'YOUR_API_KEY'

[REQ 11-15] Finalize: loading states, error boundaries, verify imports, accessibility

📊 REQUEST BUDGET: 15/30 used

════ TASK GROUP B: Sandbox & Testing Tools (10 requests) ════

[REQ 16] Create app/(dashboard)/settings/api/sandbox/page.tsx (max 130 lines):
  Sandbox environment page:
  - Explanation: "Sandbox mode lets you test the API without affecting real data"
  - Sandbox key section (separate from production keys)
  - Sandbox QR codes list (from sandbox_qr_codes table)
  - "Clear sandbox data" button → DELETE /api/user/sandbox/reset
  - Sandbox limits: same as plan but labeled "(sandbox)"

[REQ 17] Create components/api/api-playground.tsx (max 280 lines):
  In-browser API playground (like a mini Postman):
  - Endpoint selector: dropdown of all QRise API endpoints
  - Method badge (GET/POST/PATCH/DELETE)
  - Request body editor (JSON textarea with syntax highlighting via <pre>)
  - Headers section: API key pre-filled from user's sandbox key
  - "Send request" button
  - Response panel: status code badge + JSON response (pretty-printed)
  - "Copy as curl" button
  Uses fetch() to call real /api/v1/* endpoints with sandbox key
  All requests go through sandbox automatically when sandbox key selected

[REQ 18] Create app/api/user/sandbox/reset/route.ts (max 60 lines):
  DELETE: clear all sandbox_qr_codes for this user
  Clear sandbox bulk jobs
  Return 204

[REQ 19] Create app/(dashboard)/settings/api/logs/page.tsx (max 130 lines):
  API call log viewer for the user:
  - Table: timestamp, endpoint, method, status code (color-coded), response time, IP
  - Filter: date range, status, endpoint, key
  - Export as CSV button
  Data from: GET /api/user/api-logs

[REQ 20] Create app/api/user/api-logs/route.ts (max 120 lines):
  GET: paginated API call log for current user
  Query params: page, limit, from, to, status, endpoint, apiKeyId
  Return from api_call_log table filtered by userId

[REQ 21-25] Verify sandbox isolation (sandbox key never touches production tables),
  Add "sandbox" badge to all sandbox key responses in API output,
  Output complete T1 file checklist

📊 REQUEST BUDGET: 25/30 used
[REQ 26-30] Buffer for fixes.

✅ AGENT T1 COMPLETE — Handoff to Agent T2.
```

---

# ════════════════════════════════════════════
# AGENT T2 — MISSING FEATURE IMPLEMENTATION
# Budget: 40 requests | Hour 2
# Purpose: If any feature endpoint is missing or broken, implement it now.
# ════════════════════════════════════════════

```
You are Agent T2 — MISSING FEATURE IMPLEMENTATION agent.
Budget: 40 requests. Stop at 35, output RESUME CHECKPOINT.

🤖 AGENT T2 — MISSING FEATURES — STARTING
📊 REQUEST BUDGET: 0/40 used

Prerequisites: Agents T0 and T1 complete. Run test suite first:
  pnpm vitest run tests/api/
  Collect all failing tests. Implement fixes for each failure.

════ TASK GROUP A: Feature Gap Audit (5 requests) ════

[REQ 1] Run test suite + collect failures:
  pnpm vitest run tests/api/ --reporter=verbose 2>&1 | head -200
  Categorize failures:
  - Missing route (404) → implement route
  - Wrong response schema → fix schema
  - Feature access not checked → add checkFeatureAccess()
  - Quota not enforced → add checkQuota()
  - Webhook not fired → add deliverWebhook()

[REQ 2-5] For each failure category, scan relevant files and plan fix.

════ TASK GROUP B: Implement Missing QR Features (15 requests) ════

[REQ 6] If static QR creation is missing:
  Implement: POST /api/v1/qr-codes with type='static'
  Static QRs: targetUrl is permanent, cannot be changed after creation
  Generate shortCode, set is_dynamic = false

[REQ 7] If dynamic QR with redirect update is missing:
  Implement: PATCH /api/v1/qr-codes/{id} targetUrl update
  Only allowed when qr_codes.is_dynamic = true
  Update redirect target in DB → Cloudflare KV cache invalidated via worker

[REQ 8] If password QR is missing:
  Implement: POST /api/v1/qr-codes with type='password', password field
  Store: bcrypt hash of password in qr_codes.password_hash
  The Cloudflare Worker: on scan → check password_hash → redirect to password gate page
  Password gate page: /scan/{shortCode}/verify → POST password → if correct, redirect

[REQ 9] If multi-action QR is missing:
  Implement: POST /api/v1/qr-codes with type='multi_action', actions array
  Action = { label: string, url: string, icon?: string }
  The Cloudflare Worker: on scan → redirect to /scan/{shortCode}/actions (menu page)
  Actions menu page: /scan/{shortCode}/actions → shows list of links to choose from
  Check: actions.length <= plan.action_limit

[REQ 10] If design studio endpoints are incomplete:
  Implement all sub-features separately:
  - Dot patterns: validate against DOT_PATTERNS constant array
  - Logo upload: validate max size (from plan.design_studio_logo_limit per month)
  - Frame styles: validate against FRAME_STYLES constant
  - Eye shapes: validate against EYE_SHAPES constant
  - Eye color: validate hex format
  - Frame color: validate hex format + check frame_color_limit (how many custom colors used this month)

[REQ 11] If smart routing rule evaluation is missing in Cloudflare Worker:
  The Worker must evaluate rules on every scan:
  1. Fetch routing rules from Supabase (or KV cache)
  2. Sort by priority ascending
  3. For each rule: evaluate condition against request headers (country from CF-IPCountry, device from UA)
  4. First matching rule: redirect to rule.targetUrl
  5. No match: redirect to default targetUrl

[REQ 12] If bulk job processor is missing:
  Implement: app/api/v1/bulk/process/route.ts (max 200 lines)
  Triggered by: Vercel cron or manual trigger
  Process queued bulk_jobs:
    1. Mark job 'processing'
    2. Parse stored CSV rows
    3. For each row: create qr_codes record (same as POST /qr-codes)
    4. Generate QR image (use qrcode npm package)
    5. Upload image to Supabase storage
    6. Update bulk_jobs: processed_rows++, failed_rows++
    7. When complete: create ZIP, upload to storage, set status='completed', downloadUrl
    8. Fire webhook: 'bulk.completed'

[REQ 13] If form submission endpoint is missing (public, no auth):
  Create app/api/forms/[formId]/submit/route.ts (max 150 lines):
  POST: public endpoint (no API key required, but has rate limit by IP)
  Validate: form is active, submission_limit not reached
  Validate: all required fields present
  Handle file uploads: multipart, validate size against form_file_upload_limit
  Store: form_submissions table
  Fire webhook: 'form.submitted' to form owner's webhook
  Return: { success: true, message: form.successMessage }

[REQ 14] If analytics aggregation queries are slow:
  Add database indexes:
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scan_events_qr_date ON scan_events(qr_id, scanned_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scan_events_user ON scan_events(user_id, scanned_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_call_log_key ON api_call_log(api_key_id, created_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_call_log_user ON api_call_log(user_id, created_at DESC);

[REQ 15] Verify webhook HMAC signature implementation:
  Signing: const sig = `sha256=${createHmac('sha256', webhookSecret).update(rawBody).digest('hex')}`
  Set header: X-QRise-Signature: sha256=abc123...
  Verify in test: parse signature, recompute HMAC, compare

════ TASK GROUP C: Re-run Tests + Fix Remaining Failures (20 requests) ════

[REQ 16-25] Re-run test suite after each fix:
  pnpm vitest run tests/api/{file}.test.ts
  Fix each failure. One fix per request.
  After each fix: re-run that test file to verify pass.

[REQ 26-35] Final pass:
  Run full test suite: pnpm vitest run tests/api/
  All tests must pass.
  Output: TEST RESULTS SUMMARY
  ✓ {n} tests passing
  ✗ {n} tests failing (list with error)
  Known limitations: list any tests skipped with reason

[REQ 36-40] Buffer for edge cases.

✅ AGENT T2 COMPLETE — Handoff to Agent T3.
```

---

# ════════════════════════════════════════════
# AGENT T3 — OPENAPI SPEC & CURL REFERENCE
# Budget: 25 requests | Hour 2 (continued)
# ════════════════════════════════════════════

```
You are Agent T3 — OPENAPI SPEC agent for QRise API.
Budget: 25 requests.

🤖 AGENT T3 — API DOCUMENTATION — STARTING
📊 REQUEST BUDGET: 0/25 used

════ TASK GROUP A: OpenAPI 3.1 Spec (15 requests) ════

[REQ 1] Create docs/openapi.yaml — Part 1: Info + Auth + QR codes (max 300 lines):
  openapi: 3.1.0
  info:
    title: QRise API
    version: 1.0.0
    description: |
      Single API key to access all QRise features your plan includes.
      Key format: qr_live_{32hex} (production) or qr_test_{32hex} (sandbox).
      Pass key as: X-QRise-Key: your-key
      Or: Authorization: Bearer your-key
  servers:
    - url: https://your-app.vercel.app/api/v1
      description: Production
    - url: https://your-app.vercel.app/api/v1 (use qr_test_ key)
      description: Sandbox
  security:
    - ApiKeyAuth: []
  components.securitySchemes.ApiKeyAuth:
    type: apiKey, in: header, name: X-QRise-Key
  paths:
    /auth/validate, /qr-codes, /qr-codes/{id}, /qr-codes/{id}/scans, /qr-codes/{id}/analytics

[REQ 2] docs/openapi.yaml — Part 2: Design + Smart Routing + Bulk (max 300 lines):
  paths:
    /qr-codes/{id}/design
    /qr-codes/{id}/routing-rules
    /qr-codes/{id}/routing-rules/{ruleId}
    /bulk
    /bulk/{jobId}
    /bulk/{jobId}/download

[REQ 3] docs/openapi.yaml — Part 3: Forms + Analytics + Webhooks + Export (max 300 lines):
  paths:
    /forms, /forms/{id}, /forms/{id}/submissions
    /analytics
    /webhooks, /webhooks/{id}
    /export

[REQ 4] Create docs/CURL_REFERENCE.md (max 300 lines):
  Complete curl examples for every endpoint:

  ## Authentication
  curl https://your-app.com/api/v1/auth/validate \
    -H "X-QRise-Key: qr_live_YOUR_KEY"

  ## QR Codes
  # List QR codes
  curl https://your-app.com/api/v1/qr-codes \
    -H "X-QRise-Key: qr_live_YOUR_KEY"

  # Create static QR
  curl -X POST https://your-app.com/api/v1/qr-codes \
    -H "X-QRise-Key: qr_live_YOUR_KEY" \
    -H "Content-Type: application/json" \
    -d '{"name":"My QR","type":"static","targetUrl":"https://example.com"}'

  # Create dynamic QR
  # Create password QR
  # Create multi-action QR
  # Create smart routing QR
  # Apply design
  # Add routing rule
  # Upload bulk CSV
  # Create form
  # Register webhook
  ... (full example for every endpoint)

[REQ 5] Create docs/SDK_QUICKSTART.md (max 250 lines):
  TypeScript SDK quickstart (no external SDK — pure fetch wrapper):

  const qrise = createClient('qr_live_YOUR_KEY')
  const qrs = await qrise.qrCodes.list()
  const qr = await qrise.qrCodes.create({ name: 'My QR', type: 'dynamic', targetUrl: 'https://example.com' })
  await qrise.qrCodes.applyDesign(qr.id, { style: { dotPattern: 'rounded', foregroundColor: '#6366f1' } })
  await qrise.qrCodes.addRoutingRule(qr.id, { type: 'geo', condition: { country: ['IN'] }, targetUrl: 'https://india.example.com', priority: 1 })

  Include: Node.js quickstart, Next.js API route example, webhook verification helper

[REQ 6-15] Create individual feature guides (each max 150 lines):
  [REQ 6] docs/guides/static-dynamic-qr.md
  [REQ 7] docs/guides/design-studio.md
  [REQ 8] docs/guides/smart-routing.md
  [REQ 9] docs/guides/password-qr.md
  [REQ 10] docs/guides/multi-action-qr.md
  [REQ 11] docs/guides/bulk-generation.md
  [REQ 12] docs/guides/form-builder.md
  [REQ 13] docs/guides/analytics.md
  [REQ 14] docs/guides/webhooks.md
  [REQ 15] docs/guides/sandbox-mode.md

════ TASK GROUP B: Error Code Reference + Rate Limit Docs (10 requests) ════

[REQ 16] Create docs/ERROR_CODES.md (max 200 lines):
  All error codes with explanation and resolution:

  | Code | Status | Meaning | Resolution |
  |------|--------|---------|------------|
  | MISSING_KEY | 401 | No API key in request | Add X-QRise-Key header |
  | INVALID_KEY_FORMAT | 401 | Key doesn't start with qr_live_ or qr_test_ | Check key format |
  | KEY_NOT_FOUND | 401 | Key not in database | Regenerate key in settings |
  | KEY_EXPIRED | 401 | Key past expiry date | Create new key in settings |
  | ACCOUNT_SUSPENDED | 403 | User account suspended | Contact support |
  | IP_NOT_ALLOWED | 403 | Request IP not in allowlist | Check IP allowlist settings |
  | FEATURE_DISABLED | 403 | Feature globally disabled | Wait for feature launch or contact support |
  | FEATURE_NOT_IN_PLAN | 403 | Plan doesn't include feature | Upgrade plan at /pricing |
  | QUOTA_EXCEEDED | 429 | Monthly quota reached | Wait for reset or upgrade plan |
  | RATE_LIMITED | 429 | Too many requests | Slow down, check Retry-After header |
  | STATIC_URL_IMMUTABLE | 400 | Cannot change URL of static QR | Use dynamic QR for mutable URLs |
  | INVALID_CSV | 400 | CSV structure error | Check required columns: name, targetUrl |
  | BULK_ROWS_EXCEEDED | 400 | CSV has more rows than plan allows | Reduce rows or upgrade plan |
  | WEBHOOK_HTTPS_REQUIRED | 400 | Webhook URL must be HTTPS | Use HTTPS endpoint |
  ... (complete table)

[REQ 17-25] Buffer for docs fixes and additional guides.

✅ AGENT T3 COMPLETE.
```

---

# ════════════════════════════════════════════
# AGENT T4 — API RATE LIMIT & SECURITY HARDENING
# Budget: 20 requests | Hour 2 (final)
# ════════════════════════════════════════════

```
You are Agent T4 — API SECURITY HARDENING agent.
Budget: 20 requests.

🤖 AGENT T4 — SECURITY — STARTING
📊 REQUEST BUDGET: 0/20 used

════ TASK GROUP A: Security (10 requests) ════

[REQ 1] Add CORS headers to all /api/v1/* routes:
  next.config.ts: headers() for /api/v1/* paths
  Allow-Origin: * (public API)
  Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
  Allow-Headers: X-QRise-Key, Authorization, Content-Type
  Options preflight: return 204

[REQ 2] Add request size limits:
  Max request body: 10MB (for bulk CSV + logo uploads)
  next.config.ts: api.bodyParser.sizeLimit = '10mb'
  Per-endpoint override: bulk upload allows 10MB, all others 1MB

[REQ 3] Add API key rotation endpoint:
  POST /api/user/api-keys/{id}/rotate
    Generates new raw key, updates key_hash + key_prefix
    Returns new raw key (shown once)
    Old key immediately invalidated
    writeAuditLog: action='api_key.rotated'

[REQ 4] Add IP allowlist validation in validate-key.ts:
  If api_keys.allowed_ips is not null:
    Parse request IP (handle X-Forwarded-For for proxy)
    If IP not in allowed_ips array: return IP_NOT_ALLOWED error
    Support CIDR ranges: '192.168.1.0/24' (use npm 'ip-range-check')

[REQ 5] Add API key scope enforcement:
  Validate scope per request method:
    GET requests → require 'read' scope
    POST/PATCH/DELETE → require 'write' scope
  If scope missing: return 403 { code: 'INSUFFICIENT_SCOPE' }

[REQ 6] Add monthly call count reset (cron):
  app/api/cron/reset-api-counts/route.ts (max 60 lines):
    Run 1st of every month
    UPDATE api_keys SET monthly_call_count = 0
    Protected by CRON_SECRET header

[REQ 7] Add API abuse detection:
  In checkRateLimit: detect unusual patterns:
    > 1000 errors in 5 minutes from same key → auto-disable key + notify user
    > 10,000 calls in 1 minute from same key → temporary IP block (1 hour)
  Store flags in Redis with TTL

[REQ 8] Verify no sensitive data in API responses:
  Scan all route handlers: no password_hash, no key_hash, no raw keys returned
  Only key_prefix returned in GET /api/user/api-keys

[REQ 9] Add OpenAPI spec serving endpoint:
  GET /api/v1/spec → returns openapi.yaml as JSON (application/json)
  GET /api/v1/spec.yaml → returns raw YAML (text/yaml)
  No auth required (public spec)

[REQ 10] Final security checklist output:
  ✓ All keys hashed before storage
  ✓ Raw key shown exactly once (POST response only)
  ✓ Rate limiting on all endpoints
  ✓ CORS configured
  ✓ IP allowlist enforced
  ✓ Scope enforcement
  ✓ Webhook HMAC signing
  ✓ Sandbox isolation (no production data affected)
  ✓ Session timeout for API (key expiry, not session)
  ✓ Abuse detection

[REQ 11-20] Buffer for final fixes.

✅ AGENT T4 COMPLETE — QRise API build complete!
```

---

## QUICK REFERENCE — AGENT LAUNCH ORDER

```
Hour 1:
  Paste T0 → run (API foundation + all feature routes + tests)
  Paste T1 → run (API key management UI in main SaaS)

Hour 2:
  Paste T2 → run (fix any failing tests, implement missing features)
  Paste T3 → run (OpenAPI spec + curl reference + guides)
  Paste T4 → run (security hardening)

Done! Test with: pnpm vitest run tests/api/
```

---

## RESUME COMMAND FORMAT

```
Resume Agent T2 from: Task Group C, starting at REQ 20 (re-run analytics test)
```
