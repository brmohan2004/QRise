# QRise Admin Panel — API Management & Control
# Multi-Agent Prompt for Kilo Code (Auto Model)
# Version: 1.0 | Extends Admin Panel v2.0

---

## PURPOSE

This prompt adds a dedicated **API Management & Control** section to the QRise admin panel.
Admins get full visibility and control over every API key, call, webhook, and rate limit across ALL users.

---

## GLOBAL RULES (same as main admin panel)

```
RULE 1  Every file: MAX 300–400 lines. Split immediately.
RULE 2  TypeScript strict mode. Zero `any` types.
RULE 3  No secrets hardcoded.
RULE 4  pnpm only.
RULE 5  After every file: ✅ {filename} ({line count} lines)
RULE 6  After every 40 requests: 📊 REQUEST BUDGET: {used}/180 used.
RULE 7  Budget hits 160/180 → STOP, output RESUME CHECKPOINT.
RULE 8  Read existing files first.
RULE 9  Every admin API route: verifyAdmin() + writeAuditLog().
RULE 10 Every destructive action: ConfirmDialog before executing.
```

---

## NEW FILE STRUCTURE

```
app/(admin)/
├── api-management/
│   ├── page.tsx                    ← API overview dashboard
│   ├── keys/
│   │   ├── page.tsx               ← All API keys across all users
│   │   └── [id]/page.tsx          ← Single key detail + call log
│   ├── calls/page.tsx             ← Global API call log
│   ├── webhooks/page.tsx          ← All webhook endpoints + delivery log
│   ├── rate-limits/page.tsx       ← Rate limit config + override controls
│   └── abuse/page.tsx             ← API abuse detection + flagged keys

app/api/admin/
├── api-management/
│   ├── overview/route.ts          ← Platform API metrics
│   ├── keys/route.ts              ← List all keys (all users)
│   ├── keys/[id]/route.ts        ← Get/update/revoke single key
│   ├── keys/[id]/impersonate/route.ts ← Test as this key
│   ├── calls/route.ts             ← Global call log (paginated + filtered)
│   ├── webhooks/route.ts          ← All webhook endpoints + deliveries
│   ├── rate-limits/route.ts       ← Global rate limit settings
│   ├── rate-limits/override/route.ts ← Per-user/key overrides
│   └── abuse/route.ts             ← Flagged abuse patterns

components/
├── api-management/
│   ├── api-overview-stats.tsx
│   ├── api-keys-admin-table.tsx
│   ├── api-call-log-table.tsx
│   ├── webhook-deliveries-table.tsx
│   ├── rate-limit-config-form.tsx
│   ├── rate-limit-override-modal.tsx
│   ├── key-detail-panel.tsx
│   └── abuse-flags-table.tsx
```

---

# ════════════════════════════════════════════
# AGENT AM0 — API OVERVIEW DASHBOARD
# Budget: 30 requests | Hour 1
# ════════════════════════════════════════════

```
You are Agent AM0 — API OVERVIEW DASHBOARD agent for QRise Admin Panel.
Budget: 30 requests. Stop at 25, output RESUME CHECKPOINT.

Prerequisites: QRise Admin Panel v2.0 complete. Read lib/admin-auth.ts and lib/audit.ts.

🤖 AGENT AM0 — API OVERVIEW — STARTING
📊 REQUEST BUDGET: 0/30 used

════ TASK GROUP A: Overview Dashboard (10 requests) ════

[REQ 1] Add "API Management" section to components/admin/admin-sidebar.tsx:
  Under [Platform] section, add new group [API]:
    API Overview
    API Keys
    Call Log
    Webhooks
    Rate Limits
    Abuse Detection
  Read existing sidebar file first, add section without breaking existing nav.

[REQ 2] Create app/api/admin/api-management/overview/route.ts (max 220 lines):
  GET /api/admin/api-management/overview
  Verify admin.
  Return:
  {
    // Global metrics (last 30 days)
    totalApiKeys: number,             -- all active api_keys
    totalApiCalls: number,            -- sum of total_call_count
    callsToday: number,               -- api_call_log today
    callsThisMonth: number,           -- api_call_log this month
    errorRatePercent: number,         -- errors (status >= 400) / total
    avgResponseMs: number,

    // Breakdown
    callsByPlan: { plan: string, count: number }[],
    callsByEndpoint: { endpoint: string, count: number, errorCount: number }[],
    callsByDay: { date: string, count: number, errorCount: number }[],

    // Health
    webhooksTotal: number,
    webhookDeliverySuccessRate: number,
    sandboxCallsPercent: number,

    // Top users
    topUsersByApiCalls: { userId: string, email: string, count: number, plan: string }[],

    // Rate limit hits
    rateLimitHitsToday: number,
    rateLimitHitsThisMonth: number,

    // Abuse
    flaggedKeysCount: number,
    autoDisabledKeysCount: number
  }
  Cache: Redis 2-min TTL.

[REQ 3] Create app/(admin)/api-management/page.tsx (max 130 lines):
  Overview page with:
  - 6 stat cards: Total Keys, Calls Today, Calls This Month, Error Rate, Webhook Success Rate, Flagged Keys
  - API calls trend chart (last 30 days, split: successful vs errors)
  - Top 10 endpoints by call volume (table)
  - Top 10 API users (table: email, plan, calls/month)
  - Quick links to sub-pages: View all keys, View call log, Manage rate limits

[REQ 4] Create components/api-management/api-overview-stats.tsx (max 180 lines):
  6 StatCard components using existing components/admin/stat-card.tsx:
  - Total Active Keys (blue, icon: Key)
  - Calls Today (teal, icon: Activity)
  - Calls This Month (purple, icon: BarChart)
  - Error Rate (red if > 5%, amber if 2-5%, green otherwise, icon: AlertCircle)
  - Webhook Success Rate (green/amber/red, icon: Zap)
  - Flagged/Abusive Keys (red if > 0, icon: Shield)
  Loading: skeleton per card

[REQ 5] Create components/api-management/api-calls-trend-chart.tsx (max 180 lines):
  Recharts AreaChart:
  - X-axis: dates (last 30 days)
  - Two series: Successful calls (teal), Failed calls (coral/red)
  - Tooltip: date + success count + error count + error rate %
  - Toggle: show error rate as line overlay
  - Export data button: downloads as CSV

[REQ 6] Create app/(admin)/api-management/loading.tsx (max 50 lines):
  Skeleton layout matching the overview page structure.

[REQ 7] Create components/api-management/top-api-users-table.tsx (max 150 lines):
  Table: rank, user email (link to /users/{id}), plan badge, API calls this month,
  total API calls all time, error rate, last API call, active keys count.
  Click row → view all keys for that user (/api-management/keys?userId={id})

[REQ 8] Create components/api-management/top-endpoints-table.tsx (max 120 lines):
  Table: endpoint, method badge, call count, error count, error rate %, avg response ms.
  Color-code error rate column: green < 1%, amber 1-5%, red > 5%.

[REQ 9-10] Verify overview page renders with all components, fix missing imports.

📊 REQUEST BUDGET: 10/30 used

════ TASK GROUP B: API Keys Admin Table (12 requests) ════

[REQ 11] Create app/api/admin/api-management/keys/route.ts (max 220 lines):
  GET /api/admin/api-management/keys
  Verify admin.
  Query params: page, limit, search (email/prefix), plan, isSandbox, isActive, sort, userId
  JOIN api_keys WITH users for email + plan info
  Return per key: id, key_prefix, name, user email, plan, isSandbox, isActive,
    monthly_call_count, total_call_count, last_used_at, last_used_ip, scopes, expires_at, created_at
  Never return key_hash.

[REQ 12] Create app/(admin)/api-management/keys/page.tsx (max 120 lines):
  Page shell: SearchFilterBar + ApiKeysAdminTable
  Filters: plan, active/revoked/sandbox, date range (created), userId (from URL param)
  Sort: newest, most calls, last used
  Export: CSV of filtered keys (no key_hash)
  Stats bar: X total keys, Y sandbox, Z revoked

[REQ 13] Create components/api-management/api-keys-admin-table.tsx (max 300 lines):
  TanStack Table v8 columns:
  - Prefix (monospace, e.g. qr_live_a1b2...)
  - User (email, link to /users/{id})
  - Plan badge
  - Type: Production (blue) | Sandbox (gray)
  - Calls this month (with plan limit: "1,234 / 10,000")
  - Last used: relative time + IP address (truncated)
  - Status: Active (green) | Revoked (red) | Expired (amber)
  - Scopes: Read, Write badges
  - Created date
  - Actions menu: View details, Revoke, Grant override, Flag as abusive

  Bulk actions: Revoke selected keys (ConfirmDialog required)
  Row click → /api-management/keys/{id}

[REQ 14] Create app/(admin)/api-management/keys/[id]/page.tsx (max 130 lines):
  Single key detail page:
  - Key metadata: prefix, name, owner, plan, type, status, scopes, IPs, created/expires
  - Usage stats: calls today / this month / total, error rate, avg response time
  - Recent call log (last 50 calls, table)
  - Webhook endpoints registered to this key
  - Actions panel: Revoke key, Grant call limit override, Flag as abusive, View user

[REQ 15] Create app/api/admin/api-management/keys/[id]/route.ts (max 180 lines):
  GET /api/admin/api-management/keys/{id}
    Full key detail + usage stats + recent calls
    JOIN: user, plan, webhook_deliveries (last 10), api_call_log (last 50)

  PATCH /api/admin/api-management/keys/{id}
    Admin-only updates:
    - is_active: boolean (revoke/restore)
    - admin_call_limit_override: INT (override plan's api_call_limit for this key)
    - allowed_ips: string[] (admin can set/clear IP restrictions)
    - expires_at: timestamp (extend or shorten expiry)
    writeAuditLog on every change.

  Revoke: PATCH { is_active: false }
    Also: invalidate Redis cache for this key
    Also: fire notification to user (Resend email: "Your API key has been revoked by admin")

[REQ 16] Create components/api-management/key-detail-panel.tsx (max 220 lines):
  Metadata card:
  - Key prefix (monospace, large)
  - Owner info: avatar + email + plan badge + link to user page
  - Status badge: Active / Revoked / Expired
  - Sandbox indicator if applicable
  - Scopes: Read badge, Write badge
  - IP allowlist: list of allowed IPs or "All IPs allowed"
  - Expiry: date or "Never expires"
  - Created: formatted date + "X days ago"

  Usage stats mini-cards (4 in a row):
  - Calls today, Calls this month, Total calls all time, Error rate

  Admin actions panel:
  - "Revoke key" → ConfirmDialog (danger, explains this is irreversible)
  - "Grant call limit override" → modal: enter new monthly call limit
  - "Extend expiry" → date picker modal
  - "Flag as abusive" → modal: enter reason
  - "View user profile" → link to /users/{userId}

[REQ 17] Create app/api/admin/api-management/keys/[id]/impersonate/route.ts (max 80 lines):
  POST /api/admin/api-management/keys/{id}/impersonate
  Verify admin.
  Returns: a temporary test URL the admin can use to make API calls AS this key
  Use case: debugging a user's API key behavior
  Implementation: return { testUrl: 'curl -H "X-QRise-Key: {keyPrefix}..." /api/v1/...' }
  NOTE: does NOT return the actual key hash — only shows how to test via the sandbox environment
  writeAuditLog: action='api_key.admin_tested'

[REQ 18-22] Verify all keys admin routes work, loading states, fix imports.

📊 REQUEST BUDGET: 22/30 used

════ TASK GROUP C: Rate Limit Override Controls (8 requests) ════

[REQ 23] Create app/api/admin/api-management/rate-limits/route.ts (max 180 lines):
  GET /api/admin/api-management/rate-limits
    Return:
    - Global rate limit config per plan (from env or DB config table)
    - Per-key overrides: list of api_keys with admin_call_limit_override set
    - Redis rate limit status: current usage for top 10 highest-usage keys

  POST /api/admin/api-management/rate-limits/override
    Body: { apiKeyId?, userId?, overrideLimit: number, reason: string }
    If apiKeyId: update api_keys.admin_call_limit_override
    If userId: apply to ALL active keys for that user
    writeAuditLog: action='rate_limit.override'

[REQ 24] Create app/(admin)/api-management/rate-limits/page.tsx (max 130 lines):
  Page with 2 sections:
  1. Global limits table: plan name → limit per minute → limit per day → edit controls
  2. Per-key overrides table: key prefix, user email, original plan limit, override value, reason, applied by, applied at, actions (remove override)

[REQ 25] Create components/api-management/rate-limit-config-form.tsx (max 160 lines):
  Form to edit global rate limits per plan:
  - Table with inline edit cells: plan | req/min | req/day | save button per row
  - Changes save to rate_limit_config table (create if not exists)
  - On save: update Redis rate limit config keys + writeAuditLog

[REQ 26] Create components/api-management/rate-limit-override-modal.tsx (max 140 lines):
  Modal to grant a rate limit override:
  - Target: radio (Specific Key | All keys for User)
  - Key selector (autocomplete by prefix) OR User selector (autocomplete by email)
  - New monthly call limit: number input
  - Reason: textarea (required, for audit log)
  - Duration: Permanent | Until date (date picker)
  - Confirm button → POST /api/admin/api-management/rate-limits/override
  Shows: "This will override the plan limit of {planLimit} with {newLimit} calls/month"

[REQ 27-30] Buffer for fixes.

📊 REQUEST BUDGET: 30/30 used
✅ AGENT AM0 COMPLETE — Handoff to Agent AM1.
```

---

# ════════════════════════════════════════════
# AGENT AM1 — API CALL LOG & WEBHOOKS ADMIN
# Budget: 35 requests | Hour 1 (continued)
# ════════════════════════════════════════════

```
You are Agent AM1 — API CALL LOG & WEBHOOKS ADMIN agent.
Budget: 35 requests. Stop at 30, output RESUME CHECKPOINT.

🤖 AGENT AM1 — CALL LOG & WEBHOOKS — STARTING
📊 REQUEST BUDGET: 0/35 used

════ TASK GROUP A: Global Call Log (15 requests) ════

[REQ 1] Create app/api/admin/api-management/calls/route.ts (max 220 lines):
  GET /api/admin/api-management/calls
  Verify admin.
  Params: page, limit (max 200), userId, apiKeyId, endpoint, method, status (success|error|all),
          from, to, minResponseMs, maxResponseMs, search (endpoint search)
  JOIN api_call_log WITH api_keys (prefix) WITH users (email)
  Return paginated: { calls: CallLogEntry[], total, page, totalPages }
  CallLogEntry: { id, timestamp, userEmail, keyPrefix, endpoint, method, statusCode,
                  responseMs, ipAddress, userAgent, errorCode?, isSandbox }

  Export: ?export=csv → stream CSV with Content-Disposition header
  Cache: NO caching (real-time data)

[REQ 2] Create app/(admin)/api-management/calls/page.tsx (max 140 lines):
  Global API call log page:
  - SearchFilterBar: search endpoint, filter by user/status/date/plan/sandbox
  - Summary bar: showing X calls (Y errors, Z% error rate) for current filter
  - ApiCallLogTable component
  - "Export CSV" button (downloads filtered log)

[REQ 3] Create components/api-management/api-call-log-table.tsx (max 300 lines):
  TanStack Table v8 columns:
  - Timestamp (relative + absolute on hover)
  - User (email truncated, link to /users/{id})
  - Key prefix (monospace, link to /keys/{id})
  - Endpoint (method badge + path)
  - Status code (200=green, 4xx=amber, 5xx=red)
  - Response time (ms, color: green < 200ms, amber 200-1000ms, red > 1000ms)
  - IP address
  - Error code (if 4xx/5xx)
  - Sandbox badge (if applicable)

  Row expandable (click to expand): shows full request path, user agent, request size
  Empty state: "No API calls match your filters"
  Pagination: server-side, max 200 rows

[REQ 4] Create components/api-management/call-detail-drawer.tsx (max 180 lines):
  shadcn Sheet (slides in from right) on row click:
  - Timestamp (exact)
  - User: email + plan + link to user profile
  - API Key: prefix + name + link to key detail
  - Endpoint: full path + method
  - Status code + status text
  - Response time in ms
  - IP address + geolocation (country/city via CF headers or ip-api.com)
  - User agent (parsed: browser/OS or "API Client")
  - Error code + error message (if failed)
  - Sandbox: yes/no
  - "View all calls for this key" link
  - "View all calls for this user" link

[REQ 5] Create live call log streaming (optional, best-effort):
  Use: Server-Sent Events (SSE) for real-time call log
  GET /api/admin/api-management/calls/stream (EventSource)
  Every 5 seconds: query last 10 api_call_log entries newer than last seen id
  Push as SSE event: { type: 'new_calls', data: CallLogEntry[] }
  UI: "Live" toggle button → connects SSE, new rows slide in at top of table

[REQ 6-10] Implement call log filtering, export CSV, verify all filters work correctly.

📊 REQUEST BUDGET: 10/35 used

════ TASK GROUP B: Webhook Admin (15 requests) ════

[REQ 11] Create app/api/admin/api-management/webhooks/route.ts (max 220 lines):
  GET /api/admin/api-management/webhooks
  Verify admin.
  Params: page, userId, apiKeyId, status, event, from, to
  JOIN webhook_deliveries WITH api_keys WITH users
  Return: paginated list of webhook deliveries across ALL users
  Also: summary stats { totalDeliveries, successCount, failedCount, retryingCount, avgDeliveryMs }

  Aggregate endpoint count:
  SELECT url, COUNT(*) as deliveries, SUM(CASE WHEN status='delivered' THEN 1 END) as successes
  FROM webhook_deliveries GROUP BY url ORDER BY deliveries DESC LIMIT 50

[REQ 12] Create app/(admin)/api-management/webhooks/page.tsx (max 140 lines):
  Two tabs:
  Tab 1 — Webhook Endpoints: table of all registered webhook URLs across all users
    Columns: URL (truncated), User (email), Event types, Total deliveries, Success rate,
    Last delivery status, Last delivery time
    Actions: View deliveries for this URL, Force retry failed, Deactivate endpoint

  Tab 2 — Delivery Log: paginated table of all webhook delivery attempts
    Filter: status (delivered/failed/retrying/pending), event type, user, date range
    Columns: timestamp, user, URL (truncated), event type, status badge,
    response status, attempt count, delivery time (ms)

[REQ 13] Create components/api-management/webhook-deliveries-table.tsx (max 280 lines):
  TanStack Table with expandable rows:
  Main columns: timestamp, user, event type badge, URL (truncated), status badge, attempts, response ms
  Status badges:
    delivered → green
    failed → red
    retrying → amber (pulsing)
    pending → gray

  Expandable row shows: full URL, full payload JSON (collapsible), response status + body, retry schedule

  Actions per row:
  - "Retry now" → POST /api/admin/api-management/webhooks/{id}/retry
  - "View payload" → modal with formatted JSON
  - "Mark as delivered" → PATCH status (for stuck deliveries)

[REQ 14] Create app/api/admin/api-management/webhooks/[id]/retry/route.ts (max 80 lines):
  POST: verify admin
  Re-queue failed webhook delivery: reset status='pending', attempt_count++ , next_retry_at=NOW()
  Actually call deliverWebhook() immediately
  writeAuditLog: action='webhook.admin_retry'
  Return: { success: true, newStatus: 'delivered'|'failed' }

[REQ 15] Create webhook health monitoring:
  In overview route: add webhook_health object:
  - Delivery success rate (last 24h)
  - Avg delivery time (last 24h)
  - Failed deliveries count (last 24h)
  - Stuck deliveries: WHERE status='retrying' AND next_retry_at < NOW() AND attempt_count >= 5

  Add "Flush stuck webhooks" button on webhooks page:
  POST /api/admin/api-management/webhooks/flush-stuck
    Mark all stuck deliveries (attempt_count >= 5, status != 'failed') as 'failed'
    Notify affected users via Resend

[REQ 16-20] Verify webhook admin routes work, add loading states, fix imports.

📊 REQUEST BUDGET: 20/35 used

════ TASK GROUP C: Abuse Detection (10 requests) ════

[REQ 21] Create app/api/admin/api-management/abuse/route.ts (max 200 lines):
  GET /api/admin/api-management/abuse
  Verify admin.
  Return flagged patterns:
  {
    autoDisabledKeys: ApiKey[],           -- keys auto-disabled by abuse detection
    highErrorRateKeys: {                  -- keys with > 20% error rate this week
      keyPrefix, userId, email, errorRate, callCount
    }[],
    rateLimitHeavyUsers: {                -- users hitting rate limits frequently
      userId, email, plan, rateLimitHitsToday, rateLimitHitsThisMonth
    }[],
    highVolumeIPs: {                      -- IPs making many calls
      ip, callCount, uniqueUsers, country
    }[],
    suspiciousPatterns: {                 -- anomalies
      type: 'bulk_creation'|'rapid_scan'|'credential_stuffing',
      userId, detail, detectedAt
    }[]
  }

[REQ 22] Create app/(admin)/api-management/abuse/page.tsx (max 130 lines):
  Abuse detection dashboard:
  - Alert banner if any auto-disabled keys (count + "Review now" link)
  - 4 tabs: Auto-Disabled, High Error Rate, Rate Limit Abuse, Suspicious IPs
  - Each tab: table of flagged items with actions

[REQ 23] Create components/api-management/abuse-flags-table.tsx (max 220 lines):
  Reusable table for abuse alerts:
  Per row: user email + plan + flagged metric + severity badge (low/medium/high/critical)
  Actions per row:
  - "Revoke all keys for user" → ConfirmDialog → PATCH all user's api_keys set is_active=false
  - "Suspend user account" → links to /users/{id} actions panel
  - "Dismiss flag" → marks pattern as reviewed (ignore for 7 days)
  - "View call log for user" → links to /api-management/calls?userId={id}

[REQ 24] Create global API key block (by IP):
  POST /api/admin/api-management/abuse/block-ip
    Body: { ip: string, reason: string, durationHours: number | null }
    Store in Redis: SET block:ip:{ip} reason EX durationSeconds
    In validateApiKey middleware: check Redis for IP block before processing key
    writeAuditLog: action='api.ip_blocked'

  DELETE /api/admin/api-management/abuse/block-ip?ip={ip}
    Remove Redis key
    writeAuditLog: action='api.ip_unblocked'

[REQ 25-30] Verify abuse routes work, test auto-detection triggers, output complete AM1 file checklist.

📊 REQUEST BUDGET: 30/35 used
[REQ 31-35] Buffer for fixes.

✅ AGENT AM1 COMPLETE.
```

---

## QUICK REFERENCE — AGENT LAUNCH ORDER

```
Hour 1:
  Paste AM0 → run (Overview + Keys admin + Rate limit controls)
  Paste AM1 → run (Call log + Webhooks admin + Abuse detection)

Total requests: ~65
Total new files: ~30
```

---

## SQL MIGRATIONS (run before deploying)

```sql
-- Rate limit config (admin-editable global settings)
CREATE TABLE IF NOT EXISTS rate_limit_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan VARCHAR(50) UNIQUE NOT NULL,
  requests_per_minute INT NOT NULL DEFAULT 100,
  requests_per_day INT NOT NULL DEFAULT 1000,
  burst_multiplier DECIMAL(3,1) DEFAULT 1.5,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO rate_limit_config (plan, requests_per_minute, requests_per_day) VALUES
  ('free', 60, 1000),
  ('pro', 300, 10000),
  ('business', 1000, 100000),
  ('enterprise', 5000, 1000000)
ON CONFLICT (plan) DO NOTHING;

-- Admin override on api_keys
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS admin_call_limit_override INT DEFAULT NULL;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS admin_flag_reason TEXT DEFAULT NULL;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS admin_flagged_at TIMESTAMP DEFAULT NULL;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS admin_flagged_by UUID DEFAULT NULL;

-- Add index for abuse detection queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_call_log_status
  ON api_call_log(api_key_id, status_code, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_call_log_ip
  ON api_call_log(ip_address, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_deliveries_status
  ON webhook_deliveries(status, next_retry_at);
```

---

## ADMIN SIDEBAR ADDITION

Add to `components/admin/admin-sidebar.tsx` under [Platform] group:

```
[API]
  API Overview          → /api-management
  API Keys              → /api-management/keys
  Call Log              → /api-management/calls
  Webhooks              → /api-management/webhooks
  Rate Limits           → /api-management/rate-limits
  Abuse Detection       → /api-management/abuse
```
