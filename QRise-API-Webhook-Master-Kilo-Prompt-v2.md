# QRise API & Webhook Infrastructure v2 — Master Agentic Build Prompt for Kilo Code (Auto Model)

> This prompt rebuilds the QRise API and webhook system from scratch.
> It covers BOTH the main QRise SaaS project AND the QRise Admin Panel.
> Changes to the SaaS project are marked [SAAS]. Changes to the Admin Panel are marked [ADMIN].
> Paste this entire document into Kilo Code as a single task.
> Execute all SaaS phases first, then all Admin phases.

---

## ABSOLUTE RULES

1. **Every file MAX 300–400 lines.** Split into sub-modules before continuing if approaching limit.
2. **TypeScript strict mode everywhere.** No `any` — use `unknown` + narrowing type guards.
3. **All secrets from `process.env`.** Never hardcode keys, secrets, URLs, or numeric limits.
4. **Rate limits are NEVER hardcoded.** They are always read from the `plan_rate_limits` table in DB, cached in Redis for 60 seconds.
5. **API versioning is sacred.** All public routes live under `/api/v1/`. Internal/cron routes stay under `/api/internal/` and `/api/cron/`.
6. **Every v1 API response follows the standard envelope format** defined in Section 1.
7. **Usage is tracked on every authenticated v1 call** — no exceptions, including errors.
8. **Webhooks must be HMAC-SHA256 signed.** Never deliver unsigned payloads.
9. **Custom type resolvers are untrusted.** Always timeout (hard cap 5 000 ms). Never forward raw PII.
10. After each Phase, output a checklist of created/modified files before moving on.
11. Use `pnpm` as the package manager throughout.

---

## SECTION 1 — API DESIGN CONTRACT

### 1.1 Standard Response Envelope

Every v1 API response — success or error — uses this shape:

```typescript
// Success
{
  "ok": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "usage": {
      "calls_this_month": 344,
      "calls_limit": 10000,
      "resets_at": "2026-05-01T00:00:00Z"
    }
  }
}

// Error
{
  "ok": false,
  "error": {
    "code": "QR_NOT_FOUND",
    "message": "QR code not found.",
    "details": {}
  }
}
```

Create `lib/api/response.ts` [SAAS] (max 80 lines):
- `apiSuccess(data, meta?)` → NextResponse with envelope
- `apiError(code, message, status, details?)` → NextResponse with error envelope
- Export all error code constants as typed `ApiErrorCode` object

### 1.2 Authentication

All `/api/v1/*` routes accept ONLY:
- `Authorization: Bearer qr_live_<hex>` — production key, billing applies
- `Authorization: Bearer qr_test_<hex>` — sandbox key, free, data isolated

Session cookies are NOT accepted on v1 routes.

### 1.3 Rate Limits — DB-Driven (NOT hardcoded)

Rate limits are stored in `plan_rate_limits` table (defined in Section 2.3).
Every rate limit check reads from Redis cache first (key: `rl_config:{plan}`, TTL 60 s).
On cache miss → read from DB → write to Redis.
Admin Panel can update any limit → must bust the Redis cache immediately.

Response headers on every v1 call:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 67
X-RateLimit-Reset: 1714000000   (Unix epoch of window reset)
X-RateLimit-Window: 60          (window size in seconds)
X-QRise-Request-Id: req_<uuid>
X-QRise-Plan: pro
```

### 1.4 API Key Prefixes

| Prefix | Environment | Billed | Data Scope |
|--------|-------------|--------|------------|
| `qr_live_` | Production | Yes | Live DB |
| `qr_test_` | Sandbox | No | Isolated sandbox schema |
| `qr_int_` | Internal | No | Full service-role access |

---

## SECTION 2 — DATABASE SCHEMA CHANGES

All schema changes go in `lib/db/schema/api-v1.ts` [SAAS].
Split into multiple files if it exceeds 300 lines.

### 2.1 Extend `api_keys`

```sql
ALTER TABLE api_keys
  ADD COLUMN environment       VARCHAR(10) DEFAULT 'live'
                               CHECK (environment IN ('live','test')),
  ADD COLUMN ip_allowlist      TEXT[],
  ADD COLUMN expires_at        TIMESTAMP,
  ADD COLUMN monthly_call_limit INT,
  ADD COLUMN calls_this_month  INT DEFAULT 0,
  ADD COLUMN calls_reset_at    TIMESTAMP
                               DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
  ADD COLUMN description       TEXT,
  ADD COLUMN last_ip           INET;
```

### 2.2 `api_usage_events`

```sql
CREATE TABLE api_usage_events (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id     UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint       VARCHAR(200) NOT NULL,
  method         VARCHAR(10)  NOT NULL,
  status_code    INT NOT NULL,
  latency_ms     INT,
  billable_unit  VARCHAR(50),
  quantity       INT DEFAULT 1,
  environment    VARCHAR(10) DEFAULT 'live',
  request_id     UUID NOT NULL,
  called_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_key_month  ON api_usage_events (api_key_id, called_at);
CREATE INDEX idx_usage_user_month ON api_usage_events (user_id, called_at);
CREATE INDEX idx_usage_endpoint   ON api_usage_events (endpoint, called_at);
```

### 2.3 `plan_rate_limits` — The DB-Driven Rate Limit Table

```sql
CREATE TABLE plan_rate_limits (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan                    VARCHAR(50) NOT NULL UNIQUE,
  rpm                     INT NOT NULL DEFAULT 20,      -- requests per minute
  rpd                     INT NOT NULL DEFAULT 500,     -- requests per day
  max_burst               INT NOT NULL DEFAULT 5,       -- burst allowance above rpm
  image_renders_per_month INT NOT NULL DEFAULT 100,
  embed_renders_per_month INT NOT NULL DEFAULT 500,
  resolver_calls_per_month INT NOT NULL DEFAULT 0,
  api_calls_per_month     INT NOT NULL DEFAULT 1000,
  max_webhooks            INT NOT NULL DEFAULT 2,
  max_custom_types        INT NOT NULL DEFAULT 0,
  max_resolver_timeout_ms INT NOT NULL DEFAULT 3000,
  updated_at              TIMESTAMP DEFAULT NOW(),
  updated_by_admin_id     UUID
);

-- Seed default rows
INSERT INTO plan_rate_limits (plan, rpm, rpd, max_burst, image_renders_per_month,
  embed_renders_per_month, resolver_calls_per_month, api_calls_per_month,
  max_webhooks, max_custom_types, max_resolver_timeout_ms) VALUES
  ('free',       20,    500,    5,    100,    500,      0,      1000,    2,   0,  3000),
  ('pro',        100,   5000,   20,   1000,   5000,     500,    10000,   10,  5,  5000),
  ('business',   500,   50000,  50,   10000,  50000,    10000,  100000,  50,  20, 5000),
  ('enterprise', 2000,  999999, 200,  999999, 999999,   999999, 999999,  999, 99, 5000);
```

### 2.4 `custom_qr_types`

```sql
CREATE TABLE custom_qr_types (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug          VARCHAR(80) UNIQUE NOT NULL,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  icon_url      TEXT,
  fields_schema JSONB NOT NULL,
  is_public     BOOL DEFAULT false,
  is_verified   BOOL DEFAULT false,
  is_suspended  BOOL DEFAULT false,
  suspend_reason TEXT,
  scan_count    BIGINT DEFAULT 0,
  version       INT DEFAULT 1,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_custom_types_public ON custom_qr_types (is_public, is_verified)
  WHERE is_public = true;
```

### 2.5 `type_resolvers`

```sql
CREATE TABLE type_resolvers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id         UUID NOT NULL REFERENCES custom_qr_types(id) ON DELETE CASCADE,
  resolver_url    TEXT NOT NULL,
  resolver_secret VARCHAR(64) NOT NULL,
  timeout_ms      INT DEFAULT 3000,
  fallback_url    TEXT,
  fallback_html   TEXT,
  retry_on_fail   BOOL DEFAULT true,
  is_active       BOOL DEFAULT true,
  total_calls     BIGINT DEFAULT 0,
  total_errors    BIGINT DEFAULT 0,
  avg_latency_ms  INT DEFAULT 0,
  last_called_at  TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### 2.6 `resolver_calls`

```sql
CREATE TABLE resolver_calls (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resolver_id         UUID NOT NULL REFERENCES type_resolvers(id) ON DELETE CASCADE,
  qr_id               UUID REFERENCES qr_codes(id),
  scan_context        JSONB NOT NULL,
  resolver_status     INT,
  resolver_latency_ms INT,
  response_type       VARCHAR(20),
  fallback_used       BOOL DEFAULT false,
  is_test             BOOL DEFAULT false,
  called_at           TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resolver_calls_resolver ON resolver_calls (resolver_id, called_at);
CREATE INDEX idx_resolver_calls_errors   ON resolver_calls (resolver_id, called_at)
  WHERE resolver_status >= 400 OR resolver_status IS NULL;
```

### 2.7 `type_templates`

```sql
CREATE TABLE type_templates (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id      UUID NOT NULL REFERENCES custom_qr_types(id) ON DELETE CASCADE,
  slug         VARCHAR(80) NOT NULL,
  name         VARCHAR(200) NOT NULL,
  template_html TEXT NOT NULL,
  is_default   BOOL DEFAULT false,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE (type_id, slug)
);
```

### 2.8 Extend `webhook_deliveries`

```sql
ALTER TABLE webhook_deliveries
  ADD COLUMN next_retry_at TIMESTAMP,
  ADD COLUMN signature     VARCHAR(200),
  ADD COLUMN duration_ms   INT,
  ADD COLUMN status        VARCHAR(20) DEFAULT 'pending'
             CHECK (status IN ('pending','delivered','failed','retrying','abandoned')),
  ADD COLUMN filter_config JSONB;   -- For Enhancement 5: per-event filters
```

### 2.9 Extend `webhooks` for Event Filters

```sql
ALTER TABLE webhooks
  ADD COLUMN filter_config JSONB;
-- filter_config shape: { "qr.scanned": { "qr_ids": ["uuid1","uuid2"] } }
-- null = no filter, receive all events of subscribed types
```

### 2.10 `usage_monthly_snapshots`

```sql
CREATE TABLE usage_monthly_snapshots (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id),
  month           DATE NOT NULL,   -- First day of month: 2026-04-01
  api_calls       INT DEFAULT 0,
  image_renders   INT DEFAULT 0,
  embed_renders   INT DEFAULT 0,
  resolver_calls  INT DEFAULT 0,
  overage_calls   INT DEFAULT 0,
  overage_usd     NUMERIC(10,4) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, month)
);
```

### 2.11 Extend `qr_codes` for Custom Types

```sql
ALTER TABLE qr_codes
  ADD COLUMN custom_type_id      UUID REFERENCES custom_qr_types(id),
  ADD COLUMN custom_type_payload JSONB,
  ADD COLUMN tags                TEXT[] DEFAULT '{}';
-- type ENUM: add 'custom' value via Supabase migration
```

### 2.12 `type_marketplace_submissions`

```sql
CREATE TABLE type_marketplace_submissions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id     UUID NOT NULL REFERENCES custom_qr_types(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  status      VARCHAR(20) DEFAULT 'pending'
              CHECK (status IN ('pending','approved','rejected')),
  notes       TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## SECTION 3 — CORE INFRASTRUCTURE [SAAS]

### Phase 1: Shared Utilities

#### Task 1.1: `lib/api/response.ts` (max 80 lines)
- `apiSuccess(data, meta?)` → `NextResponse`
- `apiError(code, message, httpStatus, details?)` → `NextResponse`
- `ApiErrorCode` typed object with every error constant
- `ApiMeta` TypeScript interface

#### Task 1.2: `lib/api/request-id.ts` (max 30 lines)
- `generateRequestId()` → `req_` + `crypto.randomUUID()`
- Injected as `X-QRise-Request-Id` header on every v1 response

#### Task 1.3: `lib/api/scope-registry.ts` (max 100 lines)

Define all scopes and the endpoint→scope map:

```typescript
export const SCOPES = {
  QR_READ:          'qr:read',
  QR_WRITE:         'qr:write',
  ANALYTICS_READ:   'analytics:read',
  FORMS_READ:       'forms:read',
  BULK_WRITE:       'bulk:write',
  TYPES_READ:       'types:read',
  TYPES_WRITE:      'types:write',
  WEBHOOKS_MANAGE:  'webhooks:manage',
  USAGE_READ:       'usage:read',
} as const

export type ApiScope = typeof SCOPES[keyof typeof SCOPES]

// Displayed in UI: human-readable scope descriptions
export const SCOPE_LABELS: Record<ApiScope, string> = {
  'qr:read':        'Read QR codes and analytics',
  'qr:write':       'Create, update, and delete QR codes',
  'analytics:read': 'Read scan analytics',
  'forms:read':     'Read form definitions and submissions',
  'bulk:write':     'Create bulk QR jobs',
  'types:read':     'Read custom QR type definitions',
  'types:write':    'Create and manage custom QR types',
  'webhooks:manage':'Create and manage webhooks',
  'usage:read':     'Read usage and billing data',
}
```

#### Task 1.4: `lib/api/rate-limit-config.ts` (max 100 lines)

DB-driven rate limit loader — the single source of truth:

```typescript
export interface PlanRateLimits {
  plan: string
  rpm: number
  rpd: number
  maxBurst: number
  imageRendersPerMonth: number
  embedRendersPerMonth: number
  resolverCallsPerMonth: number
  apiCallsPerMonth: number
  maxWebhooks: number
  maxCustomTypes: number
  maxResolverTimeoutMs: number
}

// Load from Redis cache (60s TTL). On miss: read from plan_rate_limits table.
export async function getPlanRateLimits(plan: string): Promise<PlanRateLimits>

// Called by Admin Panel after updating a plan's limits — busts the cache.
export async function bustRateLimitCache(plan: string): Promise<void>
// Redis key to bust: rl_config:{plan}
```

**This function is used by BOTH the middleware AND the Admin Panel.**
Never call `plan_rate_limits` directly from route handlers — always go through `getPlanRateLimits()`.

#### Task 1.5: `lib/api/auth-middleware.ts` (max 200 lines)

Single entry point for all v1 route auth. Exports `withApiAuth(handler, requiredScope?)` wrapper.

```typescript
export const GET = withApiAuth(async (req, ctx) => {
  // ctx.apiKey  — full api_keys record
  // ctx.user    — users record
  // ctx.plan    — plan string
  // ctx.limits  — PlanRateLimits from getPlanRateLimits()
  // ctx.environment — 'live' | 'test'
  // ctx.requestId — unique request ID
}, 'qr:read')
```

Steps (in order):
1. Generate `requestId` via `generateRequestId()`.
2. Extract `Authorization: Bearer <token>` — `401 MISSING_API_KEY` if absent.
3. Detect prefix (`qr_live_` / `qr_test_`). Reject unknown prefixes.
4. SHA-256 hash the token → look up `api_keys` by `key_hash`.
5. `401 INVALID_API_KEY` if not found.
6. `401 REVOKED_API_KEY` if `is_active = false`.
7. `401 EXPIRED_API_KEY` if `expires_at` is past.
8. If `ip_allowlist` is non-empty → check client IP → `403 IP_NOT_ALLOWED`.
9. Load user + plan. Cache by `key_hash` in Redis (TTL 60 s).
10. Call `getPlanRateLimits(plan)` → get limits from cache/DB.
11. Check `requiredScope` against key's `scopes` array → `403 INSUFFICIENT_SCOPE`.
12. Run Upstash rate limiter: window = 60 s, limit = `limits.rpm + limits.maxBurst`.
13. `429 RATE_LIMITED` with `Retry-After` header if exceeded.
14. Attach context, set rate limit response headers, call handler.
15. After response: call `trackUsage()` (non-blocking, fire-and-forget).

#### Task 1.6: `lib/api/usage-tracker.ts` (max 120 lines)

```typescript
export async function trackUsage(opts: {
  apiKeyId: string
  userId: string
  endpoint: string
  method: string
  statusCode: number
  latencyMs: number
  requestId: string
  environment: 'live' | 'test'
  billableUnit: 'api_call' | 'image_render' | 'embed_render' | 'resolver_call'
  quantity?: number
}): Promise<void>
```

Logic:
- If `environment === 'test'`: only update a Redis debug counter, skip DB insert.
- Else: INSERT into `api_usage_events` (non-blocking — use `waitUntil` if in edge, else `setTimeout(fn, 0)`).
- Atomic increment: `UPDATE api_keys SET calls_this_month = calls_this_month + 1 WHERE id = ?`
- Check 80% threshold: if `calls_this_month >= apiCallsPerMonth * 0.8` → fire `usage.threshold_reached` webhook (once per month via Redis dedup key).
- Check 100% limit: if exceeded → set Redis flag `quota_exceeded:{userId}` (expires at month end) → future requests get `429 QUOTA_EXCEEDED`.

---

### Phase 2: Webhook Engine

#### Task 2.1: `lib/webhooks/events.ts` (max 60 lines)

```typescript
export const WEBHOOK_EVENTS = [
  'qr.created', 'qr.updated', 'qr.deleted', 'qr.scanned',
  'qr.scan_milestone',         // 100, 1000, 10000 scans
  'type.registered', 'type.updated', 'type.suspended',
  'resolver.failed',           // Resolver timed out or 5xx
  'usage.threshold_reached',   // 80% of monthly limit
  'usage.quota_exceeded',      // 100% — API calls now blocked
  'api_key.created', 'api_key.revoked',
  'bulk.job_completed',
  'form.submission',
  'marketplace.submission_reviewed',  // Type approved/rejected
] as const

export type WebhookEventType = typeof WEBHOOK_EVENTS[number]

// Webhook event payload schemas per type
export type WebhookPayload<T extends WebhookEventType> = {
  id: string           // evt_<uuid>
  type: T
  created_at: string   // ISO 8601
  api_version: string  // '2026-04-01'
  data: WebhookEventData[T]
}
```

#### Task 2.2: `lib/webhooks/signature.ts` (max 80 lines)

```typescript
// Sign outgoing delivery
export async function signPayload(opts: {
  secret: string
  timestamp: number  // Unix epoch ms
  body: string
}): Promise<string>
// Returns: `t=${timestamp},v1=${hmac}`

// Verify incoming delivery (for SDK consumers — exported in docs)
export function verifyWebhookSignature(opts: {
  payload: string    // Raw request body as string
  signature: string  // X-QRise-Signature header value
  secret: string
  tolerance?: number // Max age seconds (default 300)
}): boolean
// Timing-safe comparison using crypto.timingSafeEqual
```

#### Task 2.3: `lib/webhooks/delivery.ts` (max 250 lines)

Split into two files if approaching limit:

**`lib/webhooks/delivery.ts`** — orchestration:
```typescript
// Fire an event to all matching webhook subscriptions for a user
export async function fireWebhookEvent(opts: {
  userId: string
  event: WebhookEventType
  payload: Record<string, unknown>
}): Promise<void>

// Checks webhook's filter_config before creating a delivery record.
// Batch-inserts delivery records — one per matching webhook.
// Does NOT deliver synchronously. Cron picks them up.
```

**`lib/webhooks/executor.ts`** — actual HTTP delivery (max 150 lines):
```typescript
// Deliver a single webhook_deliveries record
export async function executeDelivery(deliveryId: string): Promise<DeliveryResult>

// Retry schedule: [1, 5, 30, 120, 360, 1440] minutes
export const RETRY_SCHEDULE_MINUTES = [1, 5, 30, 120, 360, 1440]

// On success:  status='delivered', duration_ms recorded
// On failure:  attempts++, next attempt from schedule, or 'abandoned' after 6 attempts
// On abandon:  fire resolver.failed event to the user as final notification
```

---

## SECTION 4 — API V1 ROUTES [SAAS]

All routes in `app/api/v1/`. Every handler is wrapped with `withApiAuth`.
Every file under 200 lines — split into a sibling `_handlers.ts` if needed.

### Phase 3: Account & Usage

#### Task 3.1: `app/api/v1/me/route.ts` (max 80 lines)
```
GET /v1/me
  Scope: none (any valid key works)
  Returns: {
    user: { id, email, full_name, plan, plan_expires_at },
    api_key: { name, scopes, environment, created_at, last_used_at },
    limits: PlanRateLimits   ← live values from plan_rate_limits table
  }
```

#### Task 3.2: `app/api/v1/usage/route.ts` (max 120 lines)
```
GET /v1/usage
  Scope: usage:read
  Query: month=YYYY-MM (default: current month)
  Returns: {
    period: { start, end, resets_at },
    limits: PlanRateLimits,
    consumed: {
      api_calls:      { used, limit, remaining, pct },
      image_renders:  { used, limit, remaining, pct },
      embed_renders:  { used, limit, remaining, pct },
      resolver_calls: { used, limit, remaining, pct }
    },
    by_day:    [{ date, api_calls, image_renders }],  // 30-day chart data
    by_endpoint: [{ endpoint, calls, avg_latency_ms, error_rate }],
    overage: { calls: 0, estimated_usd: 0 }
  }

GET /v1/usage/history
  Scope: usage:read
  Returns: last 12 usage_monthly_snapshots

GET /v1/usage/export?month=YYYY-MM
  Scope: usage:read
  Returns: CSV of api_usage_events for the month (stream response)
  Content-Disposition: attachment; filename="qrise-usage-2026-04.csv"
```

### Phase 4: QR Code Routes

#### Task 4.1: `app/api/v1/qr/route.ts` (max 200 lines)

```
GET /v1/qr
  Scope: qr:read
  Query: type, status, tags, search, page, limit (max 100), include=design
  Auto-filters by environment (live key → live QRs, test key → sandbox QRs)

POST /v1/qr
  Scope: qr:write
  Body: {
    name: string
    type: 'url'|'smart_routing'|'password'|'multi_action'|'custom'
    is_dynamic?: boolean         (default true)
    target_url?: string
    password?: string
    routing_rules?: RoutingRule[]
    actions?: QRAction[]
    custom_type_slug?: string    (required when type='custom')
    custom_type_payload?: object (validated against type's fields_schema)
    design?: Partial<QRDesign>
    tags?: string[]
  }
  Validates custom_type_payload against JSON Schema stored on the type.
  Returns: created QR + short_url + embed_snippet
  Fires: qr.created webhook
```

#### Task 4.2: `app/api/v1/qr/[id]/route.ts` (max 200 lines)

```
GET /v1/qr/:id
  Scope: qr:read
  Returns: full QR with design_config, scan_count, short_url, embed_snippet

PATCH /v1/qr/:id
  Scope: qr:write
  Partial update only. On target_url change: insert qr_redirect_history.
  Fires: qr.updated

DELETE /v1/qr/:id
  Scope: qr:write
  Soft delete. Invalidate KV. Fires: qr.deleted. Returns 204.
```

#### Task 4.3: `app/api/v1/qr/[id]/image/route.ts` (max 150 lines)

```
GET /v1/qr/:id/image
  Scope: qr:read
  Query:
    format=png|svg|webp          (default: png)
    size=128|256|512|1024|2048   (default: 512)
    dpi=72|150|300               (default: 72)
    margin=0-10                  (default: 4)
    dark=#hex                    (override dot color)
    light=#hex                   (override background)
    error_correction=L|M|Q|H    (default: M)

  Server-side QR generation via `qrcode` package.
  Apply design_config from DB, overridden by query params.
  Stream binary response. Correct Content-Type header.
  Cache-Control: public, max-age=3600

  Billable unit: image_render
  Hard rate limit: 60 image renders/minute per key (separate Upstash limiter,
  regardless of plan — protects server CPU).
  Returns 429 with Retry-After if image render limit hit.
```

#### Task 4.4: `app/api/v1/qr/[id]/embed/route.ts` (max 120 lines)

```
GET /v1/qr/:id/embed
  Scope: qr:read
  Query:
    style=card|minimal|badge|floating   (default: card)
    theme=light|dark|auto               (default: auto)
    size=sm|md|lg                       (default: md)
    show_scan_count=true|false          (default: false)
    show_name=true|false                (default: true)
  Returns: {
    html: string,       // Self-contained <div> snippet
    iframe_url: string, // Drop-in <iframe> URL (no-JS option)
    css_url: string,    // https://app.qrise.app/embed/embed.css
    react_snippet: string  // <QRiseEmbed id="..." /> JSX for React users
  }
  Billable unit: embed_render
```

#### Task 4.5: `app/api/v1/qr/[id]/analytics/route.ts` (max 150 lines)

```
GET /v1/qr/:id/analytics
  Scope: analytics:read
  Query:
    range=24h|7d|30d|90d|custom
    start=ISO8601, end=ISO8601 (when range=custom)
    tz=IANA timezone (default UTC)
  Returns: { summary, timeline, by_country, by_device, by_os, by_hour_of_day, top_referrers }
```

### Phase 5: Custom QR Type Routes

#### Task 5.1: `app/api/v1/types/route.ts` (max 200 lines)

```
GET /v1/types
  Scope: types:read
  Query: scope=mine|public|marketplace (default: mine)
  scope=mine:         user's own types
  scope=public:       all is_public=true types (includes others' public types)
  scope=marketplace:  is_public=true AND is_verified=true (admin-verified)
  Always includes built-in types: url, smart_routing, password, multi_action, bulk

POST /v1/types
  Scope: types:write
  Plan check: user's plan must have max_custom_types > 0
  (read from plan_rate_limits — NOT hardcoded)
  Body: {
    slug: string        (lowercase, hyphens, max 80 chars)
    name: string
    description?: string
    icon_url?: string
    fields_schema: JSONSchema  (validated: must be valid JSON Schema Draft-07)
    is_public?: boolean
  }
  Validates: slug is globally unique, fields_schema is valid JSON Schema.
  Returns: created type
  Fires: type.registered webhook
```

#### Task 5.2: `app/api/v1/types/[slug]/route.ts` (max 150 lines)

```
GET /v1/types/:slug
  Scope: types:read
  Returns: type definition + resolver info (URL visible, secret masked to prefix only)

PATCH /v1/types/:slug
  Scope: types:write
  Updatable: name, description, fields_schema, is_public
  On fields_schema change: increment version. Existing QRs keep old payload.
  Fires: type.updated

DELETE /v1/types/:slug
  Scope: types:write
  Block with 409 TYPE_IN_USE if active QRs exist.
  Soft delete otherwise.
```

#### Task 5.3: `app/api/v1/types/[slug]/resolver/route.ts` (max 200 lines)

```
GET /v1/types/:slug/resolver
  Scope: types:write
  Returns config — resolver_secret NEVER returned (show prefix only)

PUT /v1/types/:slug/resolver
  Scope: types:write
  Body: {
    resolver_url: string    (must be HTTPS)
    timeout_ms?: number     (100–max_resolver_timeout_ms from plan limits)
    fallback_url?: string
    fallback_html?: string  (max 10 000 chars)
    retry_on_fail?: boolean
  }
  Enforces timeout_ms <= plan's max_resolver_timeout_ms (from plan_rate_limits).
  On first PUT: generates resolver_secret (crypto.randomBytes(32).toString('hex')).
  Returns { ...config, resolver_secret: '<FULL SECRET — shown once>' }
  On subsequent PUT: updates config. Secret NOT shown unless rotated.

DELETE /v1/types/:slug/resolver
  Disables resolver. QRs of this type fall back to fallback_url or show error.

POST /v1/types/:slug/resolver/rotate-secret
  Scope: types:write
  Generates new resolver_secret. Old one immediately invalid.
  Returns: { resolver_secret: '<NEW FULL SECRET>' }

POST /v1/types/:slug/resolver/test
  Scope: types:write
  Body: { scan_context?: object }
  Sends synthetic payload to resolver_url. is_test=true on resolver_calls record.
  Returns: { status, latency_ms, response, fallback_used, signed_correctly }
```

#### Task 5.4: `app/api/v1/types/[slug]/templates/route.ts` (max 150 lines)

```
GET /v1/types/:slug/templates
  Scope: types:read
  Returns: list of Mustache templates registered for this type

POST /v1/types/:slug/templates
  Scope: types:write
  Body: { slug, name, template_html, is_default? }
  template_html is a Mustache template. Variables available: all fields in fields_schema
  plus scan_context.device_type, scan_context.country.
  Max 10 templates per type.

PATCH /v1/types/:slug/templates/:templateSlug
  DELETE /v1/types/:slug/templates/:templateSlug
```

#### Task 5.5: `app/api/v1/types/[slug]/marketplace/route.ts` (max 100 lines)

```
POST /v1/types/:slug/marketplace
  Scope: types:write
  Submits the type for marketplace review (creates type_marketplace_submissions record).
  Type must be is_public=true to submit.
  User can only have 3 pending submissions at once.
  Returns: { submission_id, status: 'pending', estimated_review_days: 3 }
```

### Phase 6: Webhook Routes

#### Task 6.1: `app/api/v1/webhooks/route.ts` (max 150 lines)

```
GET /v1/webhooks
  Scope: webhooks:manage
  Returns: list (secret masked to prefix only)

POST /v1/webhooks
  Scope: webhooks:manage
  Plan check: count existing webhooks < max_webhooks from plan_rate_limits
  Body: {
    endpoint_url: string    (HTTPS required)
    events: WebhookEventType[]
    description?: string
    filter_config?: object  (per-event filters — see Enhancement 5)
  }
  Generates signing secret.
  Returns: { ...webhook, secret: '<FULL SECRET — shown once>' }
```

#### Task 6.2: `app/api/v1/webhooks/[id]/route.ts` (max 200 lines)

```
GET /v1/webhooks/:id        — detail (no secret)
PATCH /v1/webhooks/:id      — update endpoint_url, events, description, filter_config
DELETE /v1/webhooks/:id     — delete + all deliveries

POST /v1/webhooks/:id/test
  Body: { event?: WebhookEventType }  (default: qr.created)
  Sends synthetic event immediately (bypasses queue).
  Returns: { delivered, status_code, latency_ms, response_body, signature_sent }

POST /v1/webhooks/:id/rotate-secret
  Returns: { secret: '<NEW FULL SECRET>' }

GET /v1/webhooks/:id/deliveries
  Query: status, event, page, limit
  Returns: paginated delivery log

POST /v1/webhooks/:id/deliveries/:deliveryId/replay
  Re-sends a past delivery as a new delivery record.
  Original delivery record preserved unchanged.
  Returns: { new_delivery_id, status: 'pending' }
```

---

## SECTION 5 — RESOLVER CALL FLOW [SAAS + CLOUDFLARE]

### Phase 7: Cloudflare Worker — Custom Type Resolver

#### Task 7.1: `cloudflare-worker/src/custom-resolver.ts` (max 250 lines)

Flow when a QR with `type='custom'` is scanned at the edge:

```typescript
// 1. Fetch from KV cache first
//    Key: custom_qr:{short_code}
//    Cached: { type_slug, resolver_url, resolver_secret, timeout_ms,
//              fallback_url, fallback_html, custom_type_payload, qr_id }
// On KV miss: fetch from Supabase, then write to KV (TTL 300s)

// 2. Build scan context — ZERO PII
const scanContext = {
  device_type:   inferDevice(userAgent),   // 'mobile'|'tablet'|'desktop'
  os:            inferOS(userAgent),
  country:       request.cf?.country ?? 'XX',
  language:      request.headers.get('Accept-Language')?.split(',')[0] ?? 'en',
  timestamp:     new Date().toISOString(),
  qr_payload:    customTypePayload         // The hospital's field values
}

// 3. Sign the request (HMAC-SHA256)
const ts = Date.now()
const body = JSON.stringify({ scan_context: scanContext })
const sig = await hmacSHA256(resolverSecret, `${ts}.${body}`)

// 4. Call resolver with AbortSignal timeout
const resolverResponse = await fetch(resolverUrl, {
  method: 'POST',
  headers: {
    'Content-Type':    'application/json',
    'X-QRise-Signature': `t=${ts},v1=${sig}`,
    'X-QRise-Type':    typeSlug,
    'X-QRise-QR-Id':  qrId,
    'User-Agent':      'QRise-Resolver/1.0',
  },
  body,
  signal: AbortSignal.timeout(timeoutMs)   // Hard cap
})

// 5. Parse resolver response
// Resolver MUST return one of:
// { type: 'redirect', url: string }
// { type: 'html', html: string }
// { type: 'json', data: object, template?: string }  → QRise renders via template

// 6. Serve the response
// On any error/timeout: serve fallback_html or 302 to fallback_url

// 7. Log resolver_calls asynchronously via ctx.waitUntil()
// Fire-and-forget POST to /api/internal/resolver-log
```

#### Task 7.2: Resolver Response Contract — `docs/resolver-contract.md`

Document the full protocol:

```typescript
// What the hospital's resolver receives (POST body):
interface ResolverRequest {
  scan_context: {
    device_type: 'mobile' | 'tablet' | 'desktop'
    os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other'
    country: string     // ISO 3166-1 alpha-2, e.g. 'US', 'GB'
    language: string    // BCP 47, e.g. 'en-US'
    timestamp: string   // ISO 8601
    qr_payload: {       // The fields as defined in fields_schema
      patient_id: string
      ward: 'ICU' | 'General' | 'Pediatric' | 'Emergency'
      blood_type: string
    }
  }
}

// What the hospital's resolver returns (one of):
type ResolverResponse =
  | { type: 'redirect'; url: string }
  | { type: 'html'; html: string }
  | { type: 'json'; data: Record<string, unknown>; template?: string }

// Hospital example decision logic:
// if (scan_context.os === 'ios' && isNurseApp(request.headers['User-Agent'])) {
//   return { type: 'redirect', url: `https://hms.hospital.com/patient/${qr_payload.patient_id}` }
// } else {
//   return { type: 'html', html: '<h1>Visiting Hours: 9 AM – 8 PM</h1>' }
// }
```

---

## SECTION 6 — SAAS UI CHANGES [SAAS]

### Phase 8: SaaS App Shell Updates

#### Task 8.1: Sidebar update — `components/app/sidebar-nav.tsx`

Add a new **Developer** section to the sidebar (below Form Builder):
- API Keys
- Custom Types  ← new
- Webhooks
- Usage & Billing  ← new

The existing "API Manager" page is replaced by these four separate pages.

#### Task 8.2: `app/(app)/api-keys/page.tsx` (max 150 lines)

Dedicated API Keys page. Split:

**`components/app/api-keys/keys-list.tsx`** (max 200 lines):
- Table: Name, Environment badge (Live/Sandbox), Scopes (pill tags), Created, Last Used, Calls This Month (progress bar vs limit), Actions
- Progress bar shows `calls_this_month / api_calls_per_month` (from plan_rate_limits — live value)
- Actions: Copy prefix, Revoke (with confirm), Edit description

**`components/app/api-keys/create-key-dialog.tsx`** (max 200 lines):
- Dialog: name, description, environment toggle (Live/Sandbox), scopes checkbox grid
- Show SCOPE_LABELS from `scope-registry.ts` as descriptions on each checkbox
- Submit → POST `/api/v1/webhooks` — on success: show secret-reveal modal
- **Secret Reveal Modal:** One-time display. Shows full key in monospace box. "Copy" button. Warning: "This key will NOT be shown again." Force user to check "I have saved this key" before closing.
- IP Allowlist field: comma-separated IPs/CIDR ranges (optional). Tooltip explains purpose.
- Expiry date picker (optional).

#### Task 8.3: `app/(app)/custom-types/page.tsx` (max 100 lines)

Split:

**`components/app/custom-types/types-grid.tsx`** (max 200 lines):
- Card grid of user's custom types
- Each card: icon, slug badge, name, QR count using it, scan count, Public/Private badge, Verified badge
- Actions: Edit, Configure Resolver, View Analytics, Submit to Marketplace, Delete
- If `max_custom_types = 0` for plan: show locked state with upgrade CTA

**`components/app/custom-types/create-type-dialog.tsx`** (max 250 lines):
- Tabs: Basic Info → Field Schema → Preview
- Basic Info: slug (live slug validation), name, description, icon_url, is_public toggle
- Field Schema: JSON Schema editor with live validation
  - Visual field builder (add field button → type select, label, required toggle, validation options)
  - Toggle between visual builder and raw JSON editor
  - Live validation: show errors inline
- Preview tab: shows how a QR creation form would look using this schema

**`components/app/custom-types/resolver-config-dialog.tsx`** (max 250 lines):
- Resolver URL input with HTTPS enforcement indicator
- Timeout slider: 100 ms to `max_resolver_timeout_ms` (from plan limits — read live)
- Fallback URL / Fallback HTML tabs
- Signing secret section: show prefix + "Rotate Secret" button (with confirm)
- "Send Test Request" button → calls `POST /v1/types/:slug/resolver/test` → shows result panel
- Result panel: status badge, latency, response body preview, signature verification result

#### Task 8.4: `app/(app)/webhooks/page.tsx` (max 100 lines)

Split:

**`components/app/webhooks/webhooks-list.tsx`** (max 200 lines):
- Table: Endpoint URL (truncated), Events (pill tags), Status (Active/Inactive), Deliveries (last 24h: X delivered / Y failed), Actions
- Actions: Edit, Test, View Deliveries, Rotate Secret, Delete

**`components/app/webhooks/create-webhook-dialog.tsx`** (max 200 lines):
- Endpoint URL (HTTPS enforced)
- Events: grouped checkboxes matching `WEBHOOK_EVENTS` categories
- Filter Config (collapsible): per-event additional filters (e.g. `qr.scanned` → only for selected QR IDs)
- On success: show secret once in reveal modal (same pattern as API keys)

**`components/app/webhooks/delivery-log-sheet.tsx`** (max 200 lines):
- Slide-in sheet showing deliveries for a webhook
- Table: event type, status badge, attempts, delivered_at, duration_ms, response status
- Row expand: shows full payload JSON + response body
- "Replay" button per row → POST `.../deliveries/:id/replay`

#### Task 8.5: `app/(app)/usage/page.tsx` (max 100 lines)

Split:

**`components/app/usage/usage-overview-cards.tsx`** (max 150 lines):
- 4 cards: API Calls, Image Renders, Embed Renders, Resolver Calls
- Each: used / limit, progress bar, estimated overage cost
- Alert banner if any metric > 80%

**`components/app/usage/usage-timeline-chart.tsx`** (max 120 lines):
- Recharts AreaChart: last 30 days, multi-series (API calls, image renders)
- Toggle between absolute numbers and percentage of limit

**`components/app/usage/usage-by-endpoint-table.tsx`** (max 150 lines):
- Table: endpoint, calls, avg latency, error rate (%), % of total
- Sortable columns

**`components/app/usage/usage-history-table.tsx`** (max 100 lines):
- Monthly snapshots table: month, API calls, renders, resolver calls, overage USD
- Download CSV button per row

#### Task 8.6: QR Detail page — Embed Preview section

Modify `app/(app)/qr-codes/[id]/analytics/page.tsx`:
Add an **Embed & Export** tab alongside existing analytics tabs.

**`components/qr/embed-preview.tsx`** (max 200 lines):
- Style picker: Card / Minimal / Badge / Floating (visual toggle with preview)
- Theme: Light / Dark / Auto
- Size: SM / MD / LG
- Show Scan Count toggle
- Live preview iframe (renders `/embed/qr/:id` with selected params)
- Code snippets panel with tabs: HTML Snippet, iFrame, React, Vue
- Each tab: syntax-highlighted code + Copy button
- "Download QR Image" button dropdown: PNG 72dpi / PNG 300dpi / SVG / WebP

---

## SECTION 7 — EMBED INFRASTRUCTURE [SAAS]

### Phase 9: Public Embed Pages

#### Task 9.1: `app/embed/qr/[id]/page.tsx` (max 150 lines)

Publicly accessible, no auth. This is the iframe target.

- Accept: `style`, `theme`, `size`, `show_name`, `show_scan_count` query params
- Fetch QR public data server-side: `{ name, scan_count, short_url, design_config }`
- Render a self-contained QR card (inline styles, no app shell)
- Generate QR image URL: `/api/v1/qr/:id/image?format=png&size=256`
- Set `X-Frame-Options: ALLOWALL`, `Content-Security-Policy: frame-ancestors *`
- No JS required for static styles. Add minimal JS only for theme=auto detection.

#### Task 9.2: `public/embed/embed.css`

Standalone CSS for the HTML snippet (no external dependencies):
- `.qrise-embed` base
- Variant classes: `--card`, `--minimal`, `--badge`, `--floating`
- Size classes: `--sm` (120px QR), `--md` (180px), `--lg` (240px)
- Dark mode via `prefers-color-scheme: dark`
- No external font imports (system-ui only)

---

## SECTION 8 — INTERNAL & CRON ROUTES [SAAS]

### Phase 10: Background Jobs

#### Task 10.1: `app/api/cron/usage-reset/route.ts` (max 80 lines)
- Protected: `Authorization: Bearer ${CRON_SECRET}`
- Runs: 00:01 UTC on 1st of each month (add to `vercel.json`)
- Sets `calls_this_month = 0` on all `api_keys`
- Snapshots each user's usage into `usage_monthly_snapshots`
- Clears Redis quota flags: `quota_exceeded:{userId}` pattern
- Fires `usage.threshold_reached` with `{ pct: 0, reset: true }` to clear alert webhooks

#### Task 10.2: `app/api/cron/webhook-processor/route.ts` (max 100 lines)
- Protected: `Authorization: Bearer ${CRON_SECRET}`
- Runs: every minute (add to `vercel.json`)
- Queries pending/retrying deliveries where `next_retry_at <= NOW()`
- Processes max 50 per invocation
- Calls `executeDelivery()` from `lib/webhooks/executor.ts`

#### Task 10.3: `app/api/internal/resolver-log/route.ts` (max 80 lines)
- Protected: `X-Internal-Secret: ${INTERNAL_SECRET}`
- Called fire-and-forget from Cloudflare Worker after every resolver call
- Inserts into `resolver_calls`
- Updates `type_resolvers` aggregate columns: `total_calls++`, `total_errors++` if failed, rolling avg latency

---

## SECTION 9 — RATE LIMIT CONFIG IN ADMIN PANEL [ADMIN]

### Phase 11: Admin Rate Limit Management

#### Task 11.1: `app/(admin)/rate-limits/page.tsx` (max 100 lines)

New admin section: **Rate Limits**. Shows a card per plan.

**`components/rate-limits/rate-limit-card.tsx`** (max 150 lines):
Per-plan card showing all configurable limits in an editable form:
- Fields: RPM, RPD, Max Burst, API Calls/Month, Image Renders/Month,
  Embed Renders/Month, Resolver Calls/Month, Max Webhooks, Max Custom Types,
  Max Resolver Timeout (ms)
- All fields are numeric inputs (inline edit)
- "Save" button → PATCH `/api/admin/rate-limits/:plan`
- Shows "Last updated by [admin email] at [timestamp]" footer
- Highlight if a value is 0 or -1 (disabled/unlimited)

**`components/rate-limits/rate-limit-per-user-override.tsx`** (max 150 lines):
Section below the plan cards:
- Search by user email
- Shows any active per-user overrides (stored in `user_rate_limit_overrides` table — see below)
- "Add Override" button: select user → override specific fields → set expiry
- Override takes precedence over plan limits for that user

#### Task 11.2: New Table `user_rate_limit_overrides`

```sql
CREATE TABLE user_rate_limit_overrides (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  override      JSONB NOT NULL,    -- Partial<PlanRateLimits> — only overridden fields
  reason        TEXT,
  created_by_admin_id UUID,
  expires_at    TIMESTAMP,         -- NULL = permanent
  created_at    TIMESTAMP DEFAULT NOW()
);
```

#### Task 11.3: `app/api/admin/rate-limits/route.ts` (max 150 lines)

```
GET /api/admin/rate-limits
  Verify admin. Returns all rows from plan_rate_limits + user overrides count per plan.

PATCH /api/admin/rate-limits/:plan
  Verify admin.
  Body: Partial<PlanRateLimits>
  Update plan_rate_limits row.
  Set updated_by_admin_id = adminId, updated_at = NOW()
  CRITICAL: Call bustRateLimitCache(plan) from lib/api/rate-limit-config.ts
  Audit log: action='rate_limit.updated', details={ plan, before, after }
  Returns: updated row.

GET /api/admin/rate-limits/overrides
  List all active user_rate_limit_overrides with user email.

POST /api/admin/rate-limits/overrides
  Body: { user_id, override: Partial<PlanRateLimits>, reason, expires_at? }
  Insert override. Also bust Redis cache for this user: rl_config:user:{userId}
  Audit log.

DELETE /api/admin/rate-limits/overrides/:id
  Remove override. Bust user Redis cache.
  Audit log.
```

Update `getPlanRateLimits()` in `lib/api/rate-limit-config.ts` to:
1. Check `rl_config:user:{userId}` first (user override)
2. Fallback to `rl_config:{plan}` (plan default)
3. Merge: override fields win, non-overridden fields come from plan

---

## SECTION 10 — API MONITORING IN ADMIN PANEL [ADMIN]

### Phase 12: Admin API Oversight

#### Task 12.1: `app/(admin)/api-monitor/page.tsx` (max 100 lines)

New admin sidebar section: **API Monitor**. Shows platform-wide API health.

**`components/api-monitor/api-stats-overview.tsx`** (max 150 lines):
- Stat cards: Total API calls today, Total calls this month, Avg latency (ms), Error rate (%), Active API keys, Sandbox keys
- Auto-refreshes every 30 s

**`components/api-monitor/endpoint-breakdown-table.tsx`** (max 150 lines):
- Table: endpoint, calls today, calls this month, avg latency, P95 latency, error rate
- Sortable. Color-code error rate: green <1%, yellow 1–5%, red >5%

**`components/api-monitor/top-api-users-table.tsx`** (max 150 lines):
- Top 20 API users by calls this month
- Columns: user email, plan, keys count, calls this month, usage pct of limit, error rate
- "View Details" → `/admin/api-monitor/users/:userId`

#### Task 12.2: `app/(admin)/api-monitor/users/[userId]/page.tsx` (max 100 lines)

Per-user API breakdown:
- All api_keys for this user: name, environment, scopes, calls_this_month, last_used_at, last_ip
- Usage timeline chart (7 days)
- Actions: Revoke Key, Add Rate Limit Override, Flag for Review

#### Task 12.3: `app/api/admin/api-usage/route.ts` (max 200 lines)

```
GET /api/admin/api-usage
  Verify admin.
  Query: range=24h|7d|30d (default 24h)
  Returns: { summary, by_endpoint, by_plan, top_users, error_breakdown }
  All data from api_usage_events aggregated.

GET /api/admin/api-usage/users/:userId
  Per-user breakdown: keys, usage by day, by endpoint, error events.
```

---

## SECTION 11 — CUSTOM TYPE MODERATION [ADMIN]

### Phase 13: Admin Custom Types Management

#### Task 13.1: `app/(admin)/custom-types/page.tsx` (max 100 lines)

**Tabs:**
1. **All Types** — every registered type across all users
2. **Marketplace Queue** — submissions awaiting review
3. **Verified** — is_verified=true types

**`components/admin/custom-types/types-table.tsx`** (max 250 lines):
- Columns: Slug, Name, Owner email, QR count, Scan count, Public, Verified, Suspended, Created, Actions
- Actions: View Fields Schema, View Resolver Config, Verify, Suspend, Delete
- Suspend dialog: requires reason text → sets is_suspended=true on custom_qr_types + is_active=false on resolver → fires type.suspended webhook
- Verify: sets is_verified=true → fires marketplace.submission_reviewed

**`components/admin/custom-types/marketplace-queue-table.tsx`** (max 200 lines):
- Submissions with status=pending
- Columns: type slug, owner, submitted at, is_public, QR count, description
- Actions: Approve → set is_verified=true + submission status=approved + fire webhook
           Reject → set status=rejected + required rejection notes field + fire webhook

#### Task 13.2: `app/(admin)/custom-types/[id]/page.tsx` (max 150 lines)

Type detail view:
- Full fields_schema rendered as a JSON viewer
- Resolver config (url, timeout, fallback — secret masked)
- Live resolver health: total_calls, total_errors, avg_latency_ms, last_called_at
- Recent resolver_calls table (last 50: status, latency, response_type, fallback_used, timestamp)
- "Send Test Request" button (calls internal API → resolver → shows result)

#### Task 13.3: `app/api/admin/custom-types/route.ts` + sub-routes (max 200 lines)

```
GET /api/admin/custom-types?scope=all|queue|verified
GET /api/admin/custom-types/:id

PATCH /api/admin/custom-types/:id/verify
  Sets is_verified=true. Updates matching marketplace submission to approved.
  Fires marketplace.submission_reviewed webhook to type owner.
  Audit log.

PATCH /api/admin/custom-types/:id/suspend
  Body: { reason: string }
  Sets is_suspended=true, suspend_reason.
  Sets type_resolvers.is_active=false for all resolvers of this type.
  Fires type.suspended webhook to type owner.
  Audit log.

DELETE /api/admin/custom-types/:id
  Hard delete only if no active QRs. Audit log.

GET /api/admin/custom-types/marketplace
  All type_marketplace_submissions with type + user data joined.
```

---

## SECTION 12 — FULL IMPLEMENTATION: ALL 8 ENHANCEMENTS

### Enhancement 1: OpenAPI Spec + SDK Auto-Generation [SAAS]

#### Task E1.1: `public/api/openapi.yaml`

Write a complete OpenAPI 3.1 specification for all v1 endpoints.
Structure:
```yaml
openapi: '3.1.0'
info:
  title: QRise API
  version: '2026-04-01'
  description: |
    The QRise API lets you manage QR codes, custom types, webhooks, and usage programmatically.
servers:
  - url: https://app.qrise.app/api/v1
components:
  securitySchemes:
    ApiKeyAuth:
      type: http
      scheme: bearer
      bearerFormat: qr_live_xxx or qr_test_xxx
  schemas:
    QRCode: { ... }
    CustomType: { ... }
    Webhook: { ... }
    # ... all models
paths:
  /qr:
    get: { ... }
    post: { ... }
  /qr/{id}: { ... }
  /qr/{id}/image: { ... }
  /qr/{id}/embed: { ... }
  /qr/{id}/analytics: { ... }
  /types: { ... }
  /types/{slug}: { ... }
  /types/{slug}/resolver: { ... }
  /types/{slug}/templates: { ... }
  /types/{slug}/marketplace: { ... }
  /webhooks: { ... }
  /webhooks/{id}: { ... }
  /me: { ... }
  /usage: { ... }
```

Every endpoint must have: summary, description, request schema, response schema (200 + errors).

#### Task E1.2: `scripts/generate-sdk.ts`

```bash
pnpm add -D openapi-typescript openapi-fetch
```

Script: reads `public/api/openapi.yaml` → generates TypeScript types to `sdk/types.ts`.
Also produces a typed fetch client at `sdk/client.ts`:

```typescript
// Generated client usage:
import { createClient } from '@qrise/sdk'

const client = createClient({ apiKey: 'qr_live_...' })

const qr = await client.GET('/qr/{id}', { params: { path: { id: 'qr_abc' } } })
const image = await client.GET('/qr/{id}/image', {
  params: { path: { id: 'qr_abc' }, query: { format: 'png', size: 512 } }
})
```

#### Task E1.3: SDK documentation page `app/(public)/docs/sdk/page.tsx` (max 150 lines)

Dedicated SDK docs page with:
- Installation: `npm install @qrise/sdk`
- Quick start with the typed client (TypeScript, Node.js)
- Links to full OpenAPI spec (interactive Swagger UI embedded via iframe or `swagger-ui-react`)
- "Download OpenAPI spec" button → serves `public/api/openapi.yaml`

---

### Enhancement 2: Type Marketplace [SAAS + ADMIN]

#### Task E2.1: `app/(public)/marketplace/page.tsx` (max 150 lines) [SAAS]

Public landing page. No auth required. Shows all `is_public=true AND is_verified=true` custom types.

Split:
**`components/marketplace/type-card.tsx`** (max 100 lines):
- Card: icon, name, slug, creator (username not email), description, scan count, QR count using it, Verified badge
- "Use this type" → if not logged in: /register. If logged in: creates a QR of this type.
- "View schema" → expandable JSON schema preview

**`components/marketplace/marketplace-filters.tsx`** (max 100 lines):
- Search bar, category filter (healthcare, hospitality, retail, events, logistics, other)
- Sort: Most Used, Newest, Most Scans

**`app/api/marketplace/types/route.ts`** (max 80 lines):
```
GET /api/marketplace/types?search&category&sort&page&limit
  No auth required.
  Returns: paginated list of is_public+is_verified custom types.
  Includes: creator username, scan_count, qr_count_using_type.
  Never returns: creator email, resolver_url, resolver_secret.
```

#### Task E2.2: `app/(app)/custom-types/[slug]/submit/page.tsx` (max 100 lines) [SAAS]

Marketplace submission flow:
- Checklist pre-flight: type must be is_public, have description, have icon_url, resolver must be active and tested successfully
- Submission notes textarea (what does this type do, who is it for)
- "Submit for Review" → POST `/v1/types/:slug/marketplace`
- Shows current submission status if already submitted

#### Task E2.3: Admin Marketplace Review — covered in Section 11 Task 13.1 above.

---

### Enhancement 3: Resolver Template System [SAAS + ADMIN]

#### Task E3.1: Template rendering at the Cloudflare edge

Modify `cloudflare-worker/src/custom-resolver.ts`:

When resolver returns `{ type: 'json', data: {...}, template: 'my-template-slug' }`:
1. Fetch template from KV cache (key: `template:{typeId}:{templateSlug}`, TTL 300 s)
2. On KV miss: fetch `template_html` from Supabase `type_templates` table
3. Render Mustache template with `data` + `scan_context` merged as view object
4. Serve the rendered HTML directly — QRise controls rendering (prevents XSS)

Add to KV caching layer:
```typescript
// Cache template alongside resolver config
interface CachedCustomQR {
  // ... existing fields
  templates: Record<string, string>  // { [slug]: template_html }
}
```

#### Task E3.2: Template editor in SaaS UI

Add **Templates** tab to `resolver-config-dialog.tsx`:
- List of templates: name, slug, default badge
- "Add Template" → opens a code editor modal
- Code editor: `<textarea>` with `font-family: monospace` and line numbers (simple implementation — no CodeMirror dependency)
- Variable reference panel: shows all fields from `fields_schema` + scan_context fields as available `{{ variable }}` references
- "Preview" button: sends test resolver call with `template` field → shows rendered output

#### Task E3.3: Template API routes — covered in Task 5.4 above.

---

### Enhancement 4: API Key IP Allowlist UI [SAAS]

#### Task E4.1: IP Allowlist in `create-key-dialog.tsx`

The dialog (Task 8.2) already has an IP Allowlist field. Full implementation:

- Input: comma-separated IPs or CIDR ranges (e.g. `203.0.113.0/24, 198.51.100.5`)
- Client-side validation: each entry must match IP or CIDR regex
- Tooltip: "Requests from unlisted IPs will receive 403 IP_NOT_ALLOWED"
- "Add my current IP" button → detects client IP via `GET /api/detect-ip` and adds it
- On save: stored as `TEXT[]` in `api_keys.ip_allowlist`

#### Task E4.2: `app/api/detect-ip/route.ts` (max 30 lines)

```
GET /api/detect-ip
  No auth required.
  Returns: { ip: string }  (reads from X-Forwarded-For or CF-Connecting-IP headers)
```

#### Task E4.3: IP Allowlist edit flow

**`components/app/api-keys/edit-key-dialog.tsx`** (max 150 lines):
- Edit: description, ip_allowlist, expires_at
- Cannot change scopes after creation (security — must revoke and create new key)
- Shows current last_ip (the IP that last used this key) as a reference

---

### Enhancement 5: Webhook Event Filtering [SAAS]

#### Task E5.1: Filter Config UI in `create-webhook-dialog.tsx`

After selecting events, show a collapsible **Advanced Filters** section:

For `qr.scanned`:
- "Only for specific QR codes" → multi-select QR picker (search by name)
  Stored as: `filter_config.qr.scanned.qr_ids: string[]`

For `qr.updated`:
- "Only when URL changes" → boolean toggle
  Stored as: `filter_config.qr.updated.url_changed_only: true`

For `form.submission`:
- "Only for specific forms" → multi-select form picker
  Stored as: `filter_config.form.submission.form_ids: string[]`

For `usage.threshold_reached`:
- "Notify at percentage" → slider 50–100 (default 80)
  Stored as: `filter_config.usage.threshold_reached.min_pct: 80`

#### Task E5.2: Filter evaluation in `lib/webhooks/delivery.ts`

Modify `fireWebhookEvent()` to evaluate `filter_config` before creating delivery records:

```typescript
function matchesFilter(
  event: WebhookEventType,
  payload: Record<string, unknown>,
  filterConfig: Record<string, unknown> | null
): boolean {
  if (!filterConfig) return true  // No filter = receive all

  const eventFilter = filterConfig[event] as Record<string, unknown> | undefined
  if (!eventFilter) return true

  // qr.scanned → check qr_ids
  if (event === 'qr.scanned' && eventFilter.qr_ids) {
    return (eventFilter.qr_ids as string[]).includes(payload.qr_id as string)
  }

  // qr.updated → check url_changed_only
  if (event === 'qr.updated' && eventFilter.url_changed_only) {
    return payload.url_changed === true
  }

  // ... other filter types

  return true
}
```

---

### Enhancement 6: Resolver Analytics Dashboard [SAAS]

#### Task E6.1: `app/(app)/custom-types/[slug]/analytics/page.tsx` (max 100 lines)

Per-type resolver analytics page.

Split:
**`components/app/custom-types/resolver-health-cards.tsx`** (max 120 lines):
- 4 stat cards: Total Calls (all time), Error Rate (%), Avg Latency (ms), Fallback Rate (%)
- Status indicator: Green (error rate <5%), Yellow (5–20%), Red (>20%)
- Last called: relative time

**`components/app/custom-types/resolver-latency-chart.tsx`** (max 120 lines):
- Recharts LineChart: P50, P95, P99 latency over last 7 days
- Threshold line at `max_resolver_timeout_ms` (from plan limits — shown as dashed red line)

**`components/app/custom-types/resolver-calls-table.tsx`** (max 150 lines):
- Recent resolver calls (last 100, paginated)
- Columns: timestamp, status code, latency (ms), response_type, fallback_used, country, device
- Color-code: green 2xx, red 4xx/5xx/null (timeout)
- Filter: errors only toggle

#### Task E6.2: Resolver analytics API

```
GET /api/v1/types/:slug/analytics
  Scope: types:read
  Query: range=24h|7d|30d (default 7d)
  Returns: {
    summary: { total_calls, error_count, error_rate, avg_latency_ms, fallback_count, fallback_rate },
    latency_percentiles: { p50, p95, p99 },
    by_day: [{ date, calls, errors, avg_latency_ms }],
    by_response_type: [{ response_type, count }],
    by_country: [{ country, calls }],
    recent_errors: [{ called_at, status, latency_ms }]
  }
```

---

### Enhancement 7: Sandbox Environment Isolation [SAAS]

#### Task E7.1: Sandbox Postgres Schema

Run this Supabase migration:

```sql
-- Create sandbox schema that mirrors production schema
CREATE SCHEMA IF NOT EXISTS sandbox;

-- Mirror key tables in sandbox schema
CREATE TABLE sandbox.qr_codes (LIKE public.qr_codes INCLUDING ALL);
CREATE TABLE sandbox.api_usage_events (LIKE public.api_usage_events INCLUDING ALL);
CREATE TABLE sandbox.resolver_calls (LIKE public.resolver_calls INCLUDING ALL);
CREATE TABLE sandbox.scan_events (LIKE public.scan_events INCLUDING ALL);
CREATE TABLE sandbox.webhook_deliveries (LIKE public.webhook_deliveries INCLUDING ALL);

-- Sandbox data never counts toward billing or analytics
-- api_keys.environment='test' keys always read/write to sandbox.* tables
```

#### Task E7.2: `lib/db/sandbox-client.ts` (max 60 lines)

```typescript
// Returns a Drizzle client with schema set to 'sandbox'
export function getSandboxDb() {
  return drizzle(supabaseAdminClient, { schema: sandboxSchema })
}
```

#### Task E7.3: Sandbox routing in API middleware

Modify `withApiAuth()` (Task 1.5):

After environment detection:
- If `environment === 'test'`: attach `ctx.db = getSandboxDb()` instead of the live db
- Route handlers already use `ctx.db` (not a global db import)
- This ensures test-key reads/writes never touch production data

**All v1 route handlers must use `ctx.db` (from middleware context), NOT a direct import of the db instance.**

#### Task E7.4: Sandbox indicator in SaaS UI

**`components/app/sandbox-banner.tsx`** (max 40 lines):
- Displayed in API Manager pages when the user is viewing a sandbox key
- Yellow banner: "You are viewing sandbox data. Sandbox QRs, scans, and webhooks are isolated from your live account."

---

### Enhancement 8: Usage Alerts → Slack & Discord [SAAS]

#### Task E8.1: New table `usage_alert_channels`

```sql
CREATE TABLE usage_alert_channels (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_type VARCHAR(20) NOT NULL CHECK (channel_type IN ('slack','discord','email')),
  webhook_url  TEXT,           -- For Slack/Discord
  email        TEXT,           -- For email channel
  threshold_pct INT DEFAULT 80 -- Alert when usage hits this % (50–100)
    CHECK (threshold_pct BETWEEN 50 AND 100),
  is_active    BOOL DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

#### Task E8.2: Alert channel CRUD routes

**`app/api/v1/usage/alerts/route.ts`** (max 150 lines):
```
GET /v1/usage/alerts          — list configured alert channels
POST /v1/usage/alerts         — create alert channel
DELETE /v1/usage/alerts/:id   — delete alert channel

POST /v1/usage/alerts/:id/test
  Sends a test notification to the configured channel.
  Returns: { delivered, response }
```

#### Task E8.3: Alert channel formatters `lib/billing/alert-formatters.ts` (max 150 lines)

```typescript
// Slack Block Kit message
export function buildSlackAlert(opts: {
  userEmail: string
  pct: number
  consumed: number
  limit: number
  unit: string
  resetAt: string
}): SlackMessage

// Discord Embed
export function buildDiscordAlert(opts: { ... }): DiscordPayload

// Both include:
// - Usage percentage and bar (using block characters ▓░)
// - API calls consumed / limit
// - Reset date
// - "Upgrade plan" link
// - "Manage alerts" link
```

#### Task E8.4: Alert dispatch in `lib/api/usage-tracker.ts`

Modify the 80% threshold check:

```typescript
// When threshold reached:
const channels = await getUsageAlertChannels(userId)
for (const channel of channels) {
  if (pct >= channel.threshold_pct) {
    await dispatchUsageAlert(channel, { pct, consumed, limit, unit, resetAt })
  }
}

// dispatchUsageAlert: routes to Slack/Discord/email based on channel_type
// Dedup with Redis key: alert_sent:{channelId}:{month} (expires next month)
```

#### Task E8.5: Alert channel UI in `app/(app)/usage/page.tsx`

Add **Alert Channels** section to usage page:
**`components/app/usage/alert-channels-section.tsx`** (max 200 lines):
- Card list of configured channels: type icon, masked URL/email, threshold %, test/delete actions
- "Add Alert Channel" button → dialog:
  - Channel type: Slack / Discord / Email
  - Slack/Discord: paste Incoming Webhook URL (validated HTTPS)
  - Email: enter address (defaults to account email)
  - Threshold: slider 50% → 100% (default 80%)
  - "Send Test" button in dialog

---

## SECTION 13 — DOCS PAGE REBUILD [SAAS]

### Phase 14: Full API Docs

#### Task 14.1: `app/(public)/docs/page.tsx` restructure (max 100 lines)

Two-column layout: sticky sidebar + scrollable content. Sidebar sections:

- **Overview** — Introduction, Authentication, Rate Limits, Response Format, Errors, Sandbox
- **QR Codes** — List, Create, Get, Update, Delete, Get Image, Get Embed, Analytics
- **Custom Types** — Concepts, Register, Field Schema, Resolver Protocol, Test Resolver, Templates, Marketplace
- **Webhooks** — Concepts, Events Reference, Create, Test, Replay, Verify Signatures, Event Filters
- **Usage & Billing** — Usage Endpoint, Billing Tiers, Overage, Alerts
- **SDK** — TypeScript SDK, OpenAPI Spec

#### Task 14.2: `components/docs/resolver-flow-diagram.tsx` (max 100 lines)

Animated CSS diagram (no external library) illustrating the resolver flow:

```
[QR Code Scanned]
       ↓
[QRise Edge Worker]          ← Handles all QRs
       ↓  POST (signed)
[Your Resolver Endpoint]     ← You own this
       ↓  { type: 'redirect' | 'html' | 'json' }
[QRise serves result]        ← Nurse sees patient record
                             ← Visitor sees visiting hours
```

Animate with CSS keyframes: each arrow pulses in sequence every 2s.

#### Task 14.3: Code examples for all new endpoints

For each of these, show cURL + TypeScript + Python tabs:
- `GET /v1/qr/:id/image` (save as file)
- `GET /v1/qr/:id/embed` (use html snippet)
- Registering a custom type + resolver (full hospital wristband example)
- Verifying a webhook signature (all 3 languages)
- Verifying a resolver request signature

#### Task 14.4: `components/docs/webhook-verifier-demo.tsx` (max 100 lines)

Interactive demo on the docs page:
- Paste your webhook secret + raw payload + signature header
- Click "Verify" → runs `verifyWebhookSignature()` client-side
- Shows: ✅ Valid / ❌ Invalid + timestamp age analysis
- "Replay Attack Detected" if timestamp is > 5 minutes old

---

## SECTION 14 — NEW ENV VARIABLES

Add all of these to `.env.local.example` in both projects:

```env
# ─── QRise API v1 ───────────────────────────────────────────────────────────
API_KEY_HASH_SALT=            # 32-char random string — concatenated before hashing
INTERNAL_SECRET=              # Secret for /api/internal/* routes
CRON_SECRET=                  # Secret for /api/cron/* routes (Vercel Cron passes this)
WEBHOOK_MAX_PAYLOAD_BYTES=1048576

# ─── Sandbox ────────────────────────────────────────────────────────────────
SANDBOX_DB_SCHEMA=sandbox

# ─── Stripe (usage billing — add when ready) ────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_METER_ID_API_CALLS=
STRIPE_METER_ID_IMAGE_RENDERS=
STRIPE_METER_ID_EMBED_RENDERS=
STRIPE_METER_ID_RESOLVER_CALLS=

# ─── Admin Panel extra ──────────────────────────────────────────────────────
# (in qrise-admin project only)
MAIN_APP_URL=https://your-qrise-app.vercel.app
```

Add to `vercel.json` (main SaaS project):
```json
{
  "crons": [
    { "path": "/api/cron/usage-reset",      "schedule": "1 0 1 * *" },
    { "path": "/api/cron/webhook-processor", "schedule": "* * * * *" }
  ]
}
```
TO PREPARE THE STEP BY STEP TO GET THE NEW CREDENTIALS 


---

## SECTION 15 — COMPLETE FILE CHECKLIST

### [SAAS] New & Modified Files

```
app/
├── api/
│   ├── v1/
│   │   ├── me/route.ts
│   │   ├── usage/
│   │   │   ├── route.ts
│   │   │   ├── history/route.ts
│   │   │   ├── export/route.ts
│   │   │   └── alerts/route.ts              ← E8
│   │   ├── qr/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── image/route.ts
│   │   │       ├── embed/route.ts
│   │   │       └── analytics/route.ts
│   │   ├── types/
│   │   │   ├── route.ts
│   │   │   └── [slug]/
│   │   │       ├── route.ts
│   │   │       ├── resolver/route.ts
│   │   │       ├── templates/route.ts       ← E3
│   │   │       ├── analytics/route.ts       ← E6
│   │   │       └── marketplace/route.ts     ← E2
│   │   └── webhooks/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── cron/
│   │   ├── usage-reset/route.ts
│   │   └── webhook-processor/route.ts
│   ├── internal/
│   │   └── resolver-log/route.ts
│   ├── detect-ip/route.ts                  ← E4
│   └── marketplace/
│       └── types/route.ts                  ← E2
├── embed/
│   └── qr/[id]/page.tsx
├── (public)/
│   ├── docs/
│   │   ├── page.tsx
│   │   └── sdk/page.tsx                    ← E1
│   └── marketplace/page.tsx                ← E2
├── (app)/
│   ├── api-keys/page.tsx
│   ├── custom-types/
│   │   ├── page.tsx
│   │   ├── [slug]/
│   │   │   ├── analytics/page.tsx          ← E6
│   │   │   └── submit/page.tsx             ← E2
│   └── webhooks/page.tsx
│   └── usage/page.tsx
lib/
├── api/
│   ├── response.ts
│   ├── auth-middleware.ts
│   ├── usage-tracker.ts
│   ├── request-id.ts
│   ├── scope-registry.ts
│   └── rate-limit-config.ts
├── billing/
│   ├── usage-meter.ts
│   ├── pricing.ts
│   └── alert-formatters.ts                 ← E8
├── webhooks/
│   ├── events.ts
│   ├── signature.ts
│   ├── delivery.ts
│   └── executor.ts
├── db/
│   ├── schema/api-v1.ts
│   └── sandbox-client.ts                   ← E7
components/
├── app/
│   ├── api-keys/
│   │   ├── keys-list.tsx
│   │   ├── create-key-dialog.tsx
│   │   └── edit-key-dialog.tsx             ← E4
│   ├── custom-types/
│   │   ├── types-grid.tsx
│   │   ├── create-type-dialog.tsx
│   │   ├── resolver-config-dialog.tsx
│   │   └── resolver-health-cards.tsx       ← E6
│   ├── webhooks/
│   │   ├── webhooks-list.tsx
│   │   ├── create-webhook-dialog.tsx
│   │   └── delivery-log-sheet.tsx
│   ├── usage/
│   │   ├── usage-overview-cards.tsx
│   │   ├── usage-timeline-chart.tsx
│   │   ├── usage-by-endpoint-table.tsx
│   │   ├── usage-history-table.tsx
│   │   └── alert-channels-section.tsx      ← E8
│   └── sandbox-banner.tsx                  ← E7
├── marketplace/
│   ├── type-card.tsx                       ← E2
│   └── marketplace-filters.tsx             ← E2
├── docs/
│   ├── resolver-flow-diagram.tsx
│   ├── webhook-verifier-demo.tsx
│   └── code-tabs.tsx (extended)
├── qr/
│   └── embed-preview.tsx
scripts/
└── generate-sdk.ts                         ← E1
public/
├── api/
│   └── openapi.yaml                        ← E1
└── embed/
    └── embed.css
cloudflare-worker/src/
└── custom-resolver.ts
```

### [ADMIN] New & Modified Files

```
app/
├── (admin)/
│   ├── rate-limits/page.tsx
│   ├── api-monitor/
│   │   ├── page.tsx
│   │   └── users/[userId]/page.tsx
│   └── custom-types/
│       ├── page.tsx
│       └── [id]/page.tsx
├── api/
│   └── admin/
│       ├── rate-limits/route.ts
│       ├── api-usage/route.ts
│       └── custom-types/route.ts
components/
├── rate-limits/
│   ├── rate-limit-card.tsx
│   └── rate-limit-per-user-override.tsx
├── api-monitor/
│   ├── api-stats-overview.tsx
│   ├── endpoint-breakdown-table.tsx
│   └── top-api-users-table.tsx
└── admin/custom-types/
    ├── types-table.tsx
    └── marketplace-queue-table.tsx
lib/db/schema/
└── admin-v2.ts    (user_rate_limit_overrides, type_marketplace_submissions)
```

---

## SECTION 16 — ADMIN SIDEBAR ADDITIONS [ADMIN]

Add these sections to `components/admin/admin-sidebar.tsx`:

**Platform section** (add after existing items):
- 📊 Rate Limits  ← new
- 🔌 API Monitor  ← new
- 🧩 Custom Types  ← new (replaces nothing — new section)

Rate Limits page should show a warning badge if any plan's limits were changed in the last 24h (Redis key: `rl_changed_recently`).

---

## SECTION 17 — DEPLOYMENT ADDITIONS

Append to the main QRise deployment checklist:

1. **Run DB migrations** — Apply `supabase/migrations/20260430000000_api_v2_infrastructure.sql` to your Supabase instance. This script handles:
   - Extending existing tables (`api_keys`, `qr_codes`, `webhooks`, `webhook_deliveries`).
   - Creating all new v2 infrastructure tables.
   - Handling data type migrations (e.g., `webhook_deliveries.attempts`).
   - Seeding the `plan_rate_limits` table with default tiers.
   - Creating and mirroring the `sandbox` Postgres schema.
4. **Add Vercel Cron** entries from Section 14 to `vercel.json`
5. **Set env vars** — all from Section 14
6. **Deploy Cloudflare Worker** — with updated `custom-resolver.ts`
7. **Verify cache busting** — update a rate limit from Admin → check Redis key is gone → make an API call → confirm new limit is reflected in headers
8. **Sandbox smoke test** — create `qr_test_` key → create QR → confirm it appears in sandbox schema, NOT in public.qr_codes

---

*End of QRise API & Webhook Master Prompt v2*
