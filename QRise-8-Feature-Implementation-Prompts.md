# QRise — 8 Feature Implementation Prompts
# Each section is a standalone Kilo Code prompt for one feature.
# Paste ONE section at a time. Each is self-contained.

---

# ══════════════════════════════════════════════════════
# FEATURE 1 — INFRA OPS CONTROLS
# Paste this entire section into Kilo Code as one task.
# ══════════════════════════════════════════════════════

## GLOBAL RULES
```
Every file: MAX 300-400 lines. TypeScript strict. pnpm only.
Every admin route: verifyAdmin() first. Destructive actions: ConfirmDialog.
After every file: ✅ {filename} ({lines} lines)
After every 30 requests: 📊 BUDGET: {used}/180
```

## WHAT TO BUILD
Infra ops controls let admins manage the live platform without touching Vercel or Supabase dashboards directly.

## SQL MIGRATIONS
```sql
CREATE TABLE IF NOT EXISTS platform_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,           -- shown to users during maintenance
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP,               -- null = indefinite
  is_active BOOL DEFAULT false,
  allow_read_only BOOL DEFAULT true, -- if true: reads allowed, writes blocked
  affected_features TEXT[],        -- which features are down, null = all
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',  -- 'info' | 'warning' | 'error' | 'success'
  link_text VARCHAR(100),
  link_url VARCHAR(500),
  is_active BOOL DEFAULT true,
  show_to_plans TEXT[],             -- null = all plans
  starts_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO platform_config (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Global maintenance mode switch'),
  ('read_only_mode', 'false', 'Block all write operations'),
  ('signup_enabled', 'true', 'Allow new user registrations'),
  ('max_qr_per_request', '50', 'Max QRs creatable in one API batch'),
  ('cloudflare_cache_ttl', '300', 'KV cache TTL in seconds')
ON CONFLICT (key) DO NOTHING;
```

## FILES TO BUILD

### Agent Infra-1: Core Controls (40 requests)

[REQ 1] Read existing: lib/admin-auth.ts, lib/audit.ts, components/admin/admin-sidebar.tsx

[REQ 2] Create app/api/admin/infra/config/route.ts (max 180 lines):
  GET: return all platform_config rows
  PATCH: update a config value
    Body: { key: string, value: string | boolean | number, reason: string }
    Validate: key must exist in platform_config
    writeAuditLog: action='infra.config_updated', details={key, before, after, reason}
    For maintenance_mode: if enabling → also set Redis key 'platform:maintenance' EX 86400
    For read_only_mode: set Redis key 'platform:read_only'

[REQ 3] Create app/api/admin/infra/maintenance/route.ts (max 200 lines):
  GET: list all maintenance windows, current active window
  POST: create new maintenance window
    Body: { title, message, startsAt, endsAt?, allowReadOnly, affectedFeatures? }
    Validate: startsAt is in the future (or now)
    writeAuditLog: action='infra.maintenance_created'
  PATCH /{id}: update window (extend endsAt, update message)
  DELETE /{id}: cancel maintenance window (set is_active=false)

[REQ 4] Create app/api/admin/infra/maintenance/activate/route.ts (max 80 lines):
  POST: activate a maintenance window NOW (set is_active=true, starts_at=NOW())
    Also: set Redis key 'platform:maintenance:{id}' with the message (for fast lookup)
    writeAuditLog: action='infra.maintenance_activated'

  DELETE /deactivate: end active maintenance window
    Clear Redis key
    writeAuditLog: action='infra.maintenance_deactivated'

[REQ 5] Create app/api/admin/infra/announcements/route.ts (max 180 lines):
  GET: list announcements
  POST: create announcement { message, type, linkText?, linkUrl?, showToPlans?, endsAt? }
  PATCH /{id}: update message, type, is_active
  DELETE /{id}: remove announcement
  writeAuditLog on all writes

[REQ 6] Create app/api/admin/infra/cache/route.ts (max 150 lines):
  POST /flush: flush Cloudflare KV cache
    Options: { target: 'all' | 'user' | 'qr', userId?: string, qrId?: string }
    'all': call Cloudflare KV namespace purge API using CF_KV_NAMESPACE_ID + CF_API_TOKEN
    'qr': delete specific key from KV
    'user': delete all keys matching pattern user:{userId}:*
    writeAuditLog: action='infra.cache_flushed', details={target}

  GET /cache/stats: return Redis + KV cache stats
    Redis: dbsize, used_memory, hit_rate (info command)
    KV: (Cloudflare API) namespace size if available

[REQ 7] Create app/api/admin/infra/cron/route.ts (max 150 lines):
  GET: list all cron jobs with last run time + status
    Jobs: cleanup, reset-api-counts, retry-webhooks, etc.
    Read from: platform_config or a cron_jobs table

  POST /trigger: manually trigger a cron job
    Body: { jobName: string }
    Validate jobName against allowlist
    Call the cron route: fetch(`${ADMIN_URL}/api/cron/${jobName}`, { headers: { Authorization: CRON_SECRET } })
    writeAuditLog: action='infra.cron_triggered', details={jobName}

[REQ 8] Create app/(admin)/infra/page.tsx (max 150 lines):
  Infra ops dashboard with tabs:
  Tab 1 — Config: table of all platform_config keys with inline edit toggles
  Tab 2 — Maintenance: active window (if any) + upcoming windows list + create button
  Tab 3 — Announcements: active announcements list + create button
  Tab 4 — Cache: cache flush controls + Redis stats card
  Tab 5 — Cron Jobs: list of jobs with last run time + manual trigger buttons

[REQ 9] Create components/infra/platform-config-table.tsx (max 200 lines):
  Editable table of platform_config:
  For each key:
  - Key name (monospace)
  - Description
  - Current value (type-aware: boolean = toggle switch, number = input, string = input)
  - Last updated + by whom
  - Save button per row (inline edit)
  Special handling:
  - maintenance_mode: LARGE red toggle with "ENABLE MAINTENANCE MODE" confirmation dialog
  - read_only_mode: large amber toggle
  - signup_enabled: toggleable

[REQ 10] Create components/infra/maintenance-window-form.tsx (max 200 lines):
  Form:
  - Title input
  - User-facing message textarea (what users will see)
  - Start time: "Now" button OR datetime picker
  - End time: "Until manually deactivated" toggle OR datetime picker
  - Allow read-only: toggle (reads work, writes blocked)
  - Affected features: multi-select (all features list)
  Preview: shows what the maintenance banner will look like to users

[REQ 11] Create components/infra/announcement-composer.tsx (max 180 lines):
  Form:
  - Type: select (Info/Warning/Error/Success) → changes color preview
  - Message: textarea (markdown supported, max 200 chars)
  - Link: text + URL inputs (optional)
  - Show to plans: multi-select (free/pro/business/enterprise/all)
  - Starts at: now or scheduled
  - Ends at: never or date picker
  Preview panel: shows how banner looks on main app with selected type

[REQ 12] Create middleware integration for maintenance mode in MAIN SaaS:
  In main app middleware.ts:
  - On every request: check Redis key 'platform:maintenance'
  - If active: redirect to /maintenance page (except /api/health, /maintenance itself)
  - If read_only_mode: allow GET but return 503 on POST/PATCH/DELETE

  Create app/maintenance/page.tsx in main SaaS (max 80 lines):
  - Shows maintenance message from Redis
  - Estimated end time (if set)
  - Status page link
  - "Check status" button (refreshes)

[REQ 13] Create app/(admin)/infra/loading.tsx + all sub-page loading skeletons

[REQ 14] Add "Infra Ops" to admin sidebar under [Config] section

[REQ 15] Output complete Infra feature file checklist.

---

# ══════════════════════════════════════════════════════
# FEATURE 2 — RATE LIMITING (ADVANCED)
# Paste this entire section into Kilo Code as one task.
# ══════════════════════════════════════════════════════

## WHAT TO BUILD
Advanced rate limiting controls: global rules, per-plan tiers, per-user/key overrides,
violation alerting, and IP-level controls.

## SQL MIGRATIONS
```sql
-- Already created in API Management prompt:
-- rate_limit_config table (global per-plan limits)
-- api_keys.admin_call_limit_override column

CREATE TABLE IF NOT EXISTS ip_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  cidr_range VARCHAR(50),          -- optional CIDR block (e.g. 192.168.0.0/24)
  reason TEXT NOT NULL,
  block_type VARCHAR(20) DEFAULT 'temporary',  -- 'temporary' | 'permanent'
  expires_at TIMESTAMP,            -- null = permanent
  blocked_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  unblocked_at TIMESTAMP,
  unblocked_by UUID
);

CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID,
  user_id UUID,
  ip_address VARCHAR(45),
  endpoint VARCHAR(200),
  violations_count INT DEFAULT 1,
  window_start TIMESTAMP NOT NULL,
  window_end TIMESTAMP NOT NULL,
  auto_action_taken VARCHAR(50),   -- 'none' | 'warned' | 'key_disabled' | 'ip_blocked'
  created_at TIMESTAMP DEFAULT NOW()
);
```

## FILES TO BUILD

### Agent RL-1: Rate Limiting (35 requests)

[REQ 1] Read: lib/api/rate-limit-api.ts, lib/admin-auth.ts

[REQ 2] Update lib/api/rate-limit-api.ts to use DB config (max 180 lines):
  Instead of hardcoded limits, fetch from rate_limit_config table
  Cache in Redis: SET rate_limit_config:{plan} {config} EX 300
  On cache miss: fetch from DB + re-cache
  Admin changes to rate_limit_config → also flush Redis cache for that plan

[REQ 3] Create lib/api/rate-limit-middleware.ts (max 200 lines):
  Unified rate limit checker for ALL app routes (not just API):
  checkAppRateLimit(userId: string, endpoint: string): { allowed, remaining, reset }
  Separate limit windows:
  - Per minute: Upstash sliding window
  - Per hour: Upstash fixed window
  - Per day: Upstash fixed window
  Uses plan from users table (cache in Redis per userId, 5min TTL)
  On limit exceeded: log to rate_limit_violations

[REQ 4] Create violation auto-actions in rate-limit-api.ts:
  After logging violation: check pattern:
  - If same key violates > 50 times in 1 hour: disable key + notify user (Resend)
  - If same IP hits rate limit > 1000 times in 1 hour: auto-add to ip_blocks (24h)
  - If same user across multiple keys hits limits: flag in rate_limit_violations

[REQ 5] Create app/api/admin/rate-limits/violations/route.ts (max 180 lines):
  GET: paginated violations log
  Params: userId, apiKeyId, ip, autoAction, from, to
  JOIN with users (email) and api_keys (prefix)
  Return: violations with context + any auto-actions taken

[REQ 6] Create app/api/admin/rate-limits/ip-blocks/route.ts (max 180 lines):
  GET: list all IP blocks (active + expired)
  POST: manually block an IP
    Body: { ip, reason, blockType: 'temporary'|'permanent', expiresAt? }
    Store in ip_blocks table
    Also: set Redis key block:ip:{ip} with reason (EX = expiry seconds or persistent)
    writeAuditLog: action='rate_limit.ip_blocked'

  DELETE /{id}: unblock IP
    Set ip_blocks.unblocked_at = NOW(), unblocked_by = adminId
    Remove Redis key
    writeAuditLog: action='rate_limit.ip_unblocked'

[REQ 7] Create app/(admin)/rate-limits/page.tsx (max 150 lines):
  4 tabs:
  Tab 1 — Plan Limits: RateLimitConfigForm (editable per-plan limits table)
  Tab 2 — Violations: violations log table with filter + export
  Tab 3 — IP Blocks: blocked IPs table with unblock button + add block form
  Tab 4 — Overrides: per-key and per-user override table (link to API Management)

[REQ 8] Create components/rate-limits/violations-table.tsx (max 250 lines):
  Table: timestamp, user, key prefix, IP, endpoint, violations count, window, auto-action badge
  Auto-action badges: None (gray), Warned (amber), Key Disabled (red), IP Blocked (dark red)
  Actions per row: View user, View key, Block IP, Dismiss

[REQ 9] Create components/rate-limits/ip-blocks-table.tsx (max 200 lines):
  Table: IP, CIDR range, reason, type (temp/perm), blocked by (admin email), expires, actions
  Actions: Unblock (ConfirmDialog), Extend expiry (date picker modal)
  Expired blocks shown with strikethrough + gray

[REQ 10] Create rate limit dashboard widgets for main admin dashboard:
  Add to dashboard/page.tsx:
  - "Rate limit hits today" stat card (amber if > 100)
  - "Blocked IPs" stat card (red if > 0)
  Data from /api/admin/rate-limits/overview route (max 80 lines)

[REQ 11-15] Verify all routes, add loading states, test IP block enforcement in middleware.

---

# ══════════════════════════════════════════════════════
# FEATURE 3 — REVENUE & BILLING
# Paste this entire section into Kilo Code as one task.
# ══════════════════════════════════════════════════════

## WHAT TO BUILD
Revenue dashboard, Stripe webhook handling, failed payment recovery,
manual billing controls, refund management.

## SQL MIGRATIONS
```sql
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_event_id VARCHAR(100) UNIQUE,
  event_type VARCHAR(100) NOT NULL,  -- 'payment_succeeded', 'payment_failed', 'subscription_cancelled'
  amount_cents INT,
  currency VARCHAR(10) DEFAULT 'usd',
  plan VARCHAR(50),
  status VARCHAR(30),                -- 'succeeded' | 'failed' | 'refunded'
  stripe_invoice_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_status VARCHAR(30) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_value_cents INT DEFAULT 0;
```

## FILES TO BUILD

### Agent Rev-1: Revenue & Billing (40 requests)

[REQ 1] Create app/api/webhooks/stripe/route.ts in MAIN SaaS (max 250 lines):
  POST: receive Stripe webhook events
  Verify Stripe-Signature header using stripe.webhooks.constructEvent()
  Handle events:
  - checkout.session.completed → update user plan, create billing_events record
  - invoice.payment_succeeded → log, update lifetime_value
  - invoice.payment_failed → log, set billing_status='past_due', send dunning email
  - customer.subscription.deleted → downgrade to free plan, billing_status='cancelled'
  - customer.subscription.updated → sync plan changes
  Return 200 immediately (Stripe requires fast response)

[REQ 2] Create app/api/admin/revenue/overview/route.ts (max 220 lines):
  GET: revenue metrics
  Return:
  {
    mrr: number,                    -- sum of active subscriptions monthly amount
    arr: number,                    -- mrr * 12
    mrrGrowthPercent: number,       -- vs last month
    totalRevenue: number,           -- all time (from billing_events)
    revenueThisMonth: number,
    revenueLastMonth: number,
    revenueByPlan: { plan, mrr, userCount }[],
    revenueByDay: { date, amount }[], -- last 30 days
    churned30d: number,             -- users who cancelled last 30 days
    newSubscriptions30d: number,
    failedPayments: number,         -- currently past_due
    trialUsers: number,             -- trial_ends_at in future
    lifetimeCustomers: number       -- users who ever paid
  }

[REQ 3] Create app/(admin)/revenue/page.tsx (max 150 lines):
  Revenue dashboard:
  Row 1: stat cards — MRR, ARR, Revenue This Month, Failed Payments (red if > 0)
  Row 2: Revenue trend chart (30d) + Plan distribution pie chart
  Row 3: Failed payments table + Trial conversions table

[REQ 4] Create components/revenue/revenue-trend-chart.tsx (max 180 lines):
  Recharts AreaChart: daily revenue last 30/90 days
  Toggle: Total Revenue | New Revenue | Churned Revenue | Net MRR
  Export: download as CSV

[REQ 5] Create app/api/admin/revenue/failed-payments/route.ts (max 180 lines):
  GET: users with billing_status = 'past_due'
  Return: userId, email, plan, last failed amount, failure reason, days_past_due, retry_count

  POST /retry: manually retry a failed payment via Stripe API
    Body: { userId: string }
    Call: stripe.invoices.pay(stripeInvoiceId)
    writeAuditLog: action='revenue.payment_retry_triggered'

[REQ 6] Create app/api/admin/revenue/refunds/route.ts (max 180 lines):
  GET: list all refunds (billing_events where status='refunded')
  POST: issue refund for a payment
    Body: { billingEventId: string, amount?: number, reason: string }
    Call: stripe.refunds.create({ payment_intent: pi_id, amount })
    Update billing_events.status = 'refunded'
    writeAuditLog: action='revenue.refund_issued', details={amount, reason}
    Send email to user confirming refund

[REQ 7] Create app/api/admin/revenue/trials/route.ts (max 150 lines):
  GET: list users in trial
    Return: userId, email, trial_ends_at, days_remaining, has_added_payment_method
  POST /extend: extend trial for a user
    Body: { userId, days: number, reason: string }
    Update users.trial_ends_at += days
    writeAuditLog: action='revenue.trial_extended'
  POST /convert: manually convert trial to paid plan
    Body: { userId, plan: string }
    Update plan, clear trial_ends_at
    writeAuditLog: action='revenue.trial_converted'

[REQ 8] Create components/revenue/failed-payments-table.tsx (max 220 lines):
  Table: user email, plan, amount, failure reason, days past due, retry count, actions
  Actions: Retry payment, Issue refund, Extend trial, Downgrade to free, Contact user (opens broadcast modal)
  Color: days past due — green (0-7), amber (7-30), red (30+)

[REQ 9] Create billing info panel on user detail page:
  Add to components/users/user-detail-card.tsx:
  - Billing status badge: Active/Past Due/Cancelled/Trial
  - Stripe customer ID (external link to Stripe dashboard)
  - Next billing date
  - Lifetime value (formatted as currency)
  - Last payment: amount + date + status

[REQ 10-15] Add revenue to admin dashboard stat cards, implement billing event log viewer, verify Stripe webhook signature validation.

---

# ══════════════════════════════════════════════════════
# FEATURE 4 — SEO & PUBLIC PAGES
# Paste this entire section into Kilo Code as one task.
# ══════════════════════════════════════════════════════

## WHAT TO BUILD
Admin control over all public-facing pages: SEO metadata, OG images,
changelog, redirects, and landing page content blocks.

## SQL MIGRATIONS
```sql
CREATE TABLE IF NOT EXISTS page_seo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path VARCHAR(200) UNIQUE NOT NULL,   -- e.g. '/', '/pricing', '/features'
  title VARCHAR(200),
  description TEXT,
  og_title VARCHAR(200),
  og_description TEXT,
  og_image_url VARCHAR(500),
  canonical_url VARCHAR(500),
  no_index BOOL DEFAULT false,
  no_follow BOOL DEFAULT false,
  structured_data JSONB,                    -- JSON-LD schema
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_path VARCHAR(500) NOT NULL UNIQUE,
  destination_url VARCHAR(500) NOT NULL,
  status_code INT DEFAULT 301,
  is_active BOOL DEFAULT true,
  hit_count INT DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS changelog_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version VARCHAR(50),
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,                       -- markdown
  type VARCHAR(30) DEFAULT 'feature',       -- 'feature'|'improvement'|'fix'|'announcement'
  is_published BOOL DEFAULT false,
  published_at TIMESTAMP,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO page_seo (page_path, title, description) VALUES
  ('/', 'QRise — Smart QR Codes for Everyone', 'Create, track, and manage smart QR codes'),
  ('/pricing', 'QRise Pricing — Simple Plans', 'Choose the right plan for your needs'),
  ('/features', 'QRise Features', 'Everything you need to create professional QR codes')
ON CONFLICT (page_path) DO NOTHING;
```

## FILES TO BUILD

### Agent SEO-1 (35 requests)

[REQ 1] Create app/api/admin/seo/route.ts (max 180 lines):
  GET: list all page_seo records
  POST: create new page SEO entry
  PATCH /{path}: update SEO for a page
    writeAuditLog: action='seo.page_updated', details={path, changes}

[REQ 2] Create app/api/admin/seo/og-image/route.ts (max 120 lines):
  POST: generate/upload OG image for a page
    Accept: multipart (admin uploads image) OR JSON (admin provides URL)
    Upload to Supabase storage: og-images/{pagePath}.jpg
    Update page_seo.og_image_url
    writeAuditLog: action='seo.og_image_updated'

[REQ 3] Create app/api/admin/redirects/route.ts (max 180 lines):
  GET: list all redirects
  POST: create redirect
    Body: { sourcePath, destinationUrl, statusCode: 301|302|307 }
    Validate: sourcePath is unique
    writeAuditLog: action='redirect.created'
  PATCH /{id}: update destination or status code
  DELETE /{id}: remove redirect

[REQ 4] Update next.config.ts in MAIN SaaS:
  async redirects() {
    // Fetch active redirects from DB at build time OR use middleware for dynamic redirects
    // For dynamic: in middleware.ts check Redis cache of redirects, rebuild every 5 min
  }
  For dynamic redirects: cache redirect map in Redis key 'redirects:map' (JSON)
  On admin redirect change: PATCH route also flushes Redis key

[REQ 5] Create app/api/admin/changelog/route.ts (max 180 lines):
  GET: list all changelog entries (paginated, sorted newest first)
  POST: create entry { version, title, body, type }
  PATCH /{id}: update or publish { is_published: true, published_at: NOW() }
  DELETE /{id}: delete (only if not published)

[REQ 6] Create app/(admin)/seo/page.tsx (max 140 lines):
  3 tabs:
  Tab 1 — Page SEO: table of all pages with edit buttons
  Tab 2 — Redirects: redirect rules table + add form
  Tab 3 — Changelog: entries list + editor

[REQ 7] Create components/seo/page-seo-editor.tsx (max 250 lines):
  Form per page:
  - URL path (read-only display)
  - SEO Title input + char counter (recommended < 60 chars)
  - Meta description textarea + char counter (recommended < 160 chars)
  - OG Title input (defaults to SEO title if empty)
  - OG Description textarea
  - OG Image: upload zone + current image preview
  - Canonical URL input
  - No-index + No-follow checkboxes
  - Structured data: JSON editor (basic textarea with JSON validation)
  Preview panel: shows Google search result snippet + social share card preview

[REQ 8] Create components/seo/redirects-table.tsx (max 200 lines):
  Table: source path, destination URL, type (301/302), hits, status, created, actions
  Inline add form: source path input → destination URL input → type select → Save

[REQ 9] Create components/seo/changelog-editor.tsx (max 250 lines):
  Left: form (version, title, type badge selector, markdown body editor with preview toggle)
  Right: preview of rendered changelog entry as it appears on public page
  Publish/Unpublish toggle + publish date display

[REQ 10] Create public changelog page in MAIN SaaS:
  app/changelog/page.tsx (max 100 lines):
  Fetch published changelog_entries ORDER BY published_at DESC
  Render as styled timeline: version badge + date + type badge + title + markdown body

[REQ 11-15] Verify redirect middleware works, test OG image serving, add sitemap endpoint.

---

# ══════════════════════════════════════════════════════
# FEATURE 5 — A/B TESTING & EXPERIMENTS
# Paste this entire section into Kilo Code as one task.
# ══════════════════════════════════════════════════════

## WHAT TO BUILD
Create and manage A/B experiments for pricing page, feature flags, onboarding flows.
Track conversion rates per variant. Declare winners.

## SQL MIGRATIONS
```sql
CREATE TABLE IF NOT EXISTS experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,             -- 'pricing_page'|'feature_flag'|'onboarding'|'custom'
  status VARCHAR(30) DEFAULT 'draft',    -- 'draft'|'running'|'paused'|'completed'
  traffic_split INT DEFAULT 50,          -- % of users in experiment (0-100)
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  winner_variant_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiment_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,            -- 'Control', 'Variant A', 'Variant B'
  description TEXT,
  weight INT DEFAULT 50,                 -- % of experiment traffic → this variant
  config JSONB,                          -- variant-specific config (e.g. different pricing)
  impressions INT DEFAULT 0,
  conversions INT DEFAULT 0,
  is_control BOOL DEFAULT false
);

CREATE TABLE IF NOT EXISTS experiment_assignments (
  user_id UUID NOT NULL,
  experiment_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  converted_at TIMESTAMP,
  PRIMARY KEY (user_id, experiment_id)
);
```

## FILES TO BUILD

### Agent AB-1 (35 requests)

[REQ 1] Create lib/experiments.ts in MAIN SaaS (max 150 lines):
  Function: getExperimentVariant(userId: string, experimentId: string): Promise<ExperimentVariant | null>
  - Check if experiment is 'running'
  - Check if user already assigned: SELECT from experiment_assignments
  - If not: hash(userId + experimentId) → deterministic bucket assignment
  - Check traffic_split: if hash % 100 >= traffic_split → not in experiment (return null)
  - Assign to variant based on variant weights
  - INSERT experiment_assignments
  - Return assigned variant

  Function: recordConversion(userId: string, experimentId: string): Promise<void>
  - UPDATE experiment_assignments SET converted_at = NOW() WHERE user_id AND experiment_id AND converted_at IS NULL
  - INCREMENT experiment_variants.conversions WHERE id = variantId

[REQ 2] Create app/api/admin/experiments/route.ts (max 200 lines):
  GET: list all experiments with variant stats
  POST: create experiment + variants
    Body: { name, description, type, trafficSplit, variants: [{ name, weight, config, isControl }] }
    Validate: variant weights sum to 100
    writeAuditLog: action='experiment.created'

[REQ 3] Create app/api/admin/experiments/[id]/route.ts (max 180 lines):
  GET: full experiment details + per-variant stats
    Compute: impressions, conversions, conversion rate, confidence interval, p-value (basic)
  PATCH: update name, description, status (pause/resume), traffic_split
  POST /start: set status='running', started_at=NOW()
  POST /end: set status='completed', ended_at=NOW()
  POST /declare-winner: set winner_variant_id, rollout winner to 100% traffic

[REQ 4] Create app/(admin)/experiments/page.tsx (max 130 lines):
  Experiments list:
  Table: name, type badge, status badge, variants count, traffic split, conversion rate (winning variant), started date, actions
  Status: Draft (gray), Running (green pulsing), Paused (amber), Completed (blue)
  "+ New Experiment" button

[REQ 5] Create app/(admin)/experiments/[id]/page.tsx (max 150 lines):
  Experiment detail with:
  - Experiment meta: name, type, status, dates, traffic split
  - Variants section: cards per variant
  - Results table: variant name, impressions, conversions, rate, vs control (% lift, p-value)
  - Statistical significance indicator: "Significant at 95% confidence" or "Not yet significant"
  - "Declare winner" button (only when significant result exists)
  - Conversion trend chart over time

[REQ 6] Create components/experiments/experiment-form.tsx (max 250 lines):
  Wizard:
  Step 1: Name, description, type selection
  Step 2: Traffic split slider (0-100%), explanation of what percentage means
  Step 3: Variants builder:
    - Always starts with "Control" variant (is_control=true)
    - "Add variant" button adds Variant A, B, etc.
    - Weight inputs (must sum to 100 — auto-balance when one changes)
    - Config JSON editor per variant (for pricing variants: shows price override fields)
  Step 4: Review + Launch (or save as draft)

[REQ 7] Create components/experiments/variant-stats-card.tsx (max 180 lines):
  Per-variant card showing:
  - Variant name + "Control" badge if applicable
  - Impressions, Conversions, Conversion rate %
  - Lift vs control: green +X% or red -X%
  - Confidence: bar showing 0-100% confidence level
  - "Winner" crown icon if declared winner
  - Config preview (what's different in this variant)

[REQ 8] Integrate pricing page A/B test in MAIN SaaS:
  In app/pricing/page.tsx:
  const variant = await getExperimentVariant(userId, 'pricing-page-test')
  Use variant.config to override default plan prices or layout
  On plan selection: recordConversion(userId, 'pricing-page-test')

[REQ 9-15] Add experiment assignment API for client-side, verify statistical significance calculation, add experiment results to admin dashboard.

---

# ══════════════════════════════════════════════════════
# FEATURE 6 — REFERRAL & AFFILIATE PROGRAM
# Paste this entire section into Kilo Code as one task.
# ══════════════════════════════════════════════════════

## WHAT TO BUILD
User referral program (invite friends, earn rewards) + affiliate program (earn commissions).

## SQL MIGRATIONS
```sql
CREATE TABLE IF NOT EXISTS referral_program_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOL DEFAULT true,
  referrer_reward_type VARCHAR(30) DEFAULT 'credit',   -- 'credit'|'plan_upgrade'|'cash'
  referrer_reward_value DECIMAL(10,2) DEFAULT 10.00,
  referee_reward_type VARCHAR(30) DEFAULT 'discount',  -- 'discount'|'trial_extension'
  referee_reward_value DECIMAL(10,2) DEFAULT 20.00,    -- e.g. 20% off first payment
  referee_reward_duration_days INT DEFAULT 30,
  max_referrals_per_user INT DEFAULT 10,               -- null = unlimited
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  code VARCHAR(30) NOT NULL UNIQUE,
  uses_count INT DEFAULT 0,
  earnings_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  referral_code_id UUID NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',     -- 'pending'|'qualified'|'rewarded'|'cancelled'
  referee_plan_at_conversion VARCHAR(50),
  referrer_reward_issued BOOL DEFAULT false,
  referee_reward_issued BOOL DEFAULT false,
  qualified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  affiliate_code VARCHAR(30) NOT NULL UNIQUE,
  commission_rate DECIMAL(5,2) DEFAULT 20.00,   -- % of payment
  status VARCHAR(30) DEFAULT 'pending',          -- 'pending'|'active'|'suspended'
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_payout DECIMAL(10,2) DEFAULT 0,
  last_payout_at TIMESTAMP,
  payment_info JSONB,                            -- PayPal email, bank details (encrypted)
  created_at TIMESTAMP DEFAULT NOW()
);
```

## FILES TO BUILD

### Agent Ref-1 (35 requests)

[REQ 1] Create app/api/admin/referrals/config/route.ts (max 150 lines):
  GET: current referral program config
  PATCH: update config { isActive, referrerRewardType, referrerRewardValue, ... }
    writeAuditLog: action='referral.config_updated'

[REQ 2] Create app/api/admin/referrals/route.ts (max 200 lines):
  GET: all referrals with stats
    JOIN referrals WITH users (referrer email) WITH users (referee email)
    Filter: status, dateRange, minEarnings
    Stats: totalReferrals, qualifiedReferrals, totalRewardsIssued, conversionRate

[REQ 3] Create app/api/admin/referrals/[id]/route.ts (max 120 lines):
  PATCH: manually qualify a referral, issue reward, cancel referral
    writeAuditLog on every status change

[REQ 4] Create app/api/admin/affiliates/route.ts (max 200 lines):
  GET: list all affiliates with earnings + payout status
  POST: approve affiliate application
    Body: { userId, commissionRate }
    Generate affiliate_code, set status='active'
    writeAuditLog: action='affiliate.approved'

[REQ 5] Create app/api/admin/affiliates/[id]/payout/route.ts (max 120 lines):
  POST: record manual payout
    Body: { amount: number, method: 'paypal'|'bank'|'credit', reference: string }
    Update affiliates: pending_payout -= amount, total_earnings += amount, last_payout_at=NOW()
    writeAuditLog: action='affiliate.payout_recorded', details={amount, method}

[REQ 6] Create app/(admin)/referrals/page.tsx (max 150 lines):
  3 tabs:
  Tab 1 — Referral Program: config editor + stats overview + referrals table
  Tab 2 — Affiliates: affiliates table + pending payouts
  Tab 3 — Leaderboard: top referrers and affiliates (toggle public visibility)

[REQ 7] Create referral system in MAIN SaaS:
  - app/api/referral/track/route.ts: when user visits /?ref=CODE, save cookie + track
  - app/api/referral/complete/route.ts: on signup, link new user to referrer, create referral record
  - Generate referral code for every new user on signup
  - Show referral widget in user dashboard: code, link, earnings, share buttons

[REQ 8] Create affiliate application flow in MAIN SaaS:
  - app/affiliate/page.tsx: public affiliate program page
  - app/api/affiliate/apply/route.ts: submit application → status='pending'
  - Admin reviews and approves in admin panel

[REQ 9-15] Verify referral tracking, add fraud detection (same IP = likely self-referral), add referral leaderboard.

---

# ══════════════════════════════════════════════════════
# FEATURE 7 — USER FEEDBACK SYSTEM
# Paste this entire section into Kilo Code as one task.
# ══════════════════════════════════════════════════════

## WHAT TO BUILD
NPS surveys, in-app feedback inbox, churn surveys, feature request voting,
CSAT scores — all manageable from admin panel.

## SQL MIGRATIONS
```sql
CREATE TABLE IF NOT EXISTS nps_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  plan VARCHAR(50),
  trigger_event VARCHAR(100),      -- 'after_signup'|'after_30_days'|'manual'
  sent_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type VARCHAR(30) NOT NULL,       -- 'bug'|'feature_request'|'general'|'churn_reason'
  subject VARCHAR(300),
  body TEXT NOT NULL,
  rating INT,                      -- 1-5 for CSAT
  status VARCHAR(30) DEFAULT 'open',  -- 'open'|'in_review'|'closed'|'implemented'
  admin_response TEXT,
  plan VARCHAR(50),
  page_context VARCHAR(200),       -- which page user was on
  votes_count INT DEFAULT 0,       -- for feature requests
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_votes (
  user_id UUID NOT NULL,
  feedback_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, feedback_id)
);

CREATE TABLE IF NOT EXISTS churn_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,    -- 'too_expensive'|'missing_feature'|'found_alternative'|'no_longer_needed'|'other'
  detail TEXT,
  plan_at_churn VARCHAR(50),
  months_subscribed INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## FILES TO BUILD

### Agent Feedback-1 (35 requests)

[REQ 1] Create app/api/admin/feedback/overview/route.ts (max 200 lines):
  GET: feedback dashboard metrics
  {
    npsScore: number,              -- average of last 30 days
    npsDistribution: { promoters, passives, detractors },
    npsResponses30d: number,
    openFeedbackCount: number,
    featureRequestsCount: number,
    bugReportsCount: number,
    avgCsatScore: number,
    topChurnReasons: { reason, count, percent }[],
    topFeatureRequests: { subject, votes, status }[]
  }

[REQ 2] Create app/api/admin/feedback/nps/route.ts (max 180 lines):
  GET: paginated NPS responses
    Params: from, to, minScore, maxScore, plan, trigger
    Return: responses + aggregate stats (score, category: promoter/passive/detractor)

  POST /send: trigger NPS survey for user(s)
    Body: { userIds?: string[], segment?: { plan, joinedAfter }, trigger: string }
    Send via Resend: NPS email with 0-10 scale embedded (links back to /survey/nps?token=...)
    writeAuditLog: action='nps.survey_sent'

[REQ 3] Create public NPS survey endpoint in MAIN SaaS:
  app/api/survey/nps/route.ts (max 100 lines):
  POST: { token: string, score: number, comment?: string }
    Validate JWT token (contains userId + surveyId)
    INSERT nps_surveys record
    Return: { message: 'Thank you for your feedback!' }

[REQ 4] Create app/api/admin/feedback/items/route.ts (max 200 lines):
  GET: paginated feedback items
    Filter: type, status, plan, from, to, minVotes
    Sort: newest, most_voted, highest_csat, lowest_csat
  PATCH /{id}: update status, add admin_response
    If status='implemented': notify all voters via Resend
    writeAuditLog: action='feedback.status_updated'

[REQ 5] Create in-app feedback widget in MAIN SaaS:
  components/feedback/feedback-widget.tsx (max 180 lines):
  Floating button (bottom right): "Feedback" icon
  Click → small overlay form:
  - Type selector: Bug Report / Feature Request / General
  - Subject input
  - Message textarea
  - Rating (CSAT): 1-5 stars (optional)
  Submit: POST /api/feedback (no auth required beyond session)
  Captures: current page URL, user plan (if logged in)

[REQ 6] Create churn survey in MAIN SaaS:
  Trigger: when user cancels subscription → redirect to /survey/churn
  app/survey/churn/page.tsx (max 100 lines):
  - Reason selector (radio buttons)
  - Text detail (optional)
  - Submit → POST /api/survey/churn
  - After submit → show "Sorry to see you go" page + reactivation offer

[REQ 7] Create app/(admin)/feedback/page.tsx (max 150 lines):
  5 tabs:
  Tab 1 — Overview: NPS score gauge + CSAT score + open feedback count
  Tab 2 — NPS Responses: table with score distribution bar + individual responses
  Tab 3 — Feedback Inbox: feedback items table with status management
  Tab 4 — Feature Voting: feature requests sorted by votes + mark as implemented
  Tab 5 — Churn Analysis: churn reasons chart + monthly churn trend

[REQ 8] Create components/feedback/nps-gauge.tsx (max 120 lines):
  NPS gauge visualization:
  - Score display: large number (-100 to +100)
  - Stacked bar: Detractors (red) | Passives (gray) | Promoters (green)
  - Trend: vs last month (up/down arrow)

[REQ 9] Create components/feedback/feature-voting-table.tsx (max 200 lines):
  Table: subject, type badge, votes count (with upvote count), plan breakdown, status, actions
  Status badges: Open, In Review, Planned, Implemented
  Actions: "Mark as Planned", "Mark as Implemented" (triggers voter notifications)
  Sort: by votes (most popular first)

[REQ 10-15] Verify NPS token generation, CSAT aggregation, churn survey completion flow.

---

# ══════════════════════════════════════════════════════
# FEATURE 8 — INTEGRATIONS MANAGEMENT
# Paste this entire section into Kilo Code as one task.
# ══════════════════════════════════════════════════════

## WHAT TO BUILD
Admin control over all platform integrations: OAuth apps, Zapier/Make webhooks,
integration health monitoring, API key rotation, sandbox mode.

## SQL MIGRATIONS
```sql
CREATE TABLE IF NOT EXISTS oauth_apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_name VARCHAR(200) NOT NULL,
  provider VARCHAR(50) NOT NULL,         -- 'zapier'|'make'|'slack'|'notion'|'custom'
  client_id VARCHAR(200),
  scope TEXT[],                          -- granted OAuth scopes
  access_token_hash VARCHAR(64),         -- stored hashed
  refresh_token_hash VARCHAR(64),
  token_expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  is_active BOOL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integration_health_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_name VARCHAR(100) NOT NULL, -- 'stripe'|'resend'|'cloudflare'|'upstash'|'supabase'
  status VARCHAR(20) NOT NULL,           -- 'healthy'|'degraded'|'down'
  latency_ms INT,
  error_message TEXT,
  checked_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sandbox_mode_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_global_sandbox BOOL DEFAULT false,  -- when true: ALL API calls use sandbox
  sandbox_for_plans TEXT[],              -- specific plans forced into sandbox
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## FILES TO BUILD

### Agent Int-1 (35 requests)

[REQ 1] Create app/api/admin/integrations/overview/route.ts (max 200 lines):
  GET: integrations health + usage
  {
    platformIntegrations: {
      name: string,
      status: 'healthy'|'degraded'|'down',
      latencyMs: number,
      lastChecked: string,
      config: { configured: boolean, details: string }
    }[],
    oauthApps: {
      provider: string,
      totalConnected: number,
      activeCount: number,
      lastUsed: string
    }[],
    webhookHealth: { success_rate, avg_delivery_ms, failed_24h },
    sandboxMode: { isActive, affectedPlans }
  }

[REQ 2] Create integration health checker (runs on system health page AND integrations page):
  lib/integration-health.ts (max 150 lines):
  checkAllIntegrations(): Promise<IntegrationHealth[]>
  - Stripe: GET https://api.stripe.com/v1/balance → check status + measure latency
  - Resend: GET https://api.resend.com/domains → check status
  - Cloudflare: GET Cloudflare zone analytics API
  - Upstash: redis.ping() + measure latency
  - Supabase: SELECT 1 + measure latency
  Store each result in integration_health_log (upsert by name, keep last 100 per service)

[REQ 3] Create app/api/admin/integrations/oauth-apps/route.ts (max 180 lines):
  GET: list all connected OAuth apps across all users
    JOIN oauth_apps WITH users (email)
    Filter: provider, is_active, userId
    Return: id, provider, app_name, userEmail, scope, last_used, created_at (no tokens)

  PATCH /{id}: revoke OAuth app connection
    Set is_active = false, clear token hashes
    Notify user via email
    writeAuditLog: action='integration.oauth_revoked'

[REQ 4] Create app/api/admin/integrations/rotate-keys/route.ts (max 150 lines):
  POST: rotate platform API keys
    Body: { service: 'resend'|'upstash'|'cloudflare' }
    Admin manually updates the key externally (in Vercel env vars)
    This endpoint: validates the new key (if testable), logs the rotation
    writeAuditLog: action='integration.key_rotation_logged', details={service}
    NOTE: Vercel env vars can't be updated via API — show instructions instead

[REQ 5] Create app/api/admin/integrations/sandbox/route.ts (max 120 lines):
  GET: current sandbox mode config
  PATCH: update sandbox config
    Body: { isGlobalSandbox: boolean, sandboxForPlans?: string[] }
    If isGlobalSandbox: ALL API calls use sandbox_qr_codes table, webhooks go to test endpoint
    writeAuditLog: action='integration.sandbox_mode_updated'

[REQ 6] Create app/(admin)/integrations/page.tsx (max 150 lines):
  3 tabs:
  Tab 1 — Platform Health: cards for each integration (Stripe, Resend, CF, Upstash, Supabase)
    Green/amber/red status + latency + last checked + "Recheck" button
  Tab 2 — Connected Apps: OAuth apps table + revoke controls
  Tab 3 — Sandbox Mode: sandbox config toggle + affected plans selector

[REQ 7] Create components/integrations/integration-health-card.tsx (max 140 lines):
  Per-service card:
  - Service name + logo (icon)
  - Status indicator: large dot (green/amber/red) + text (Healthy/Degraded/Down)
  - Latency: "32ms" (green < 100ms, amber < 500ms, red > 500ms)
  - Last checked: "2 minutes ago"
  - Error message if down
  - "Recheck now" button → calls integration health API
  - "View history" → mini chart of last 24h status

[REQ 8] Create Zapier + Make webhook integration guide:
  In MAIN SaaS: app/integrations/zapier/page.tsx (max 100 lines):
  - Generate a Zapier-compatible webhook URL for the user
  - Step-by-step: "Paste this URL in Zapier → QRise trigger → select events"
  - Supported triggers: QR scan, QR created, Form submitted
  - Test webhook button: sends sample payload to verify

[REQ 9] Add integration status to admin dashboard:
  Integration health indicator in dashboard header or sidebar footer:
  Small colored dot with tooltip: "All integrations healthy" or "1 degraded: Stripe"
  Click → goes to /integrations

[REQ 10-15] Verify OAuth app revocation clears sessions, test sandbox isolation, add integration health to cron monitoring.
```

---

## LAUNCH ORDER FOR ALL 8 FEATURES

```
Week 1 (Foundation):
  Feature 1 — Infra Ops Controls    (needed before anything else goes live)
  Feature 2 — Rate Limiting         (protect the platform)

Week 2 (Revenue):
  Feature 3 — Revenue & Billing     (understand and control money)
  Feature 4 — SEO & Public Pages    (grow organic traffic)

Week 3 (Growth):
  Feature 5 — A/B Testing           (optimize conversion)
  Feature 6 — Referral & Affiliate  (user acquisition)

Week 4 (Retention):
  Feature 7 — User Feedback         (understand why users leave)
  Feature 8 — Integrations          (platform ecosystem)
```
