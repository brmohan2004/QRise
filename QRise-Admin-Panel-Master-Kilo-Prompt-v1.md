# QRise Admin Panel — Master Agentic Build Prompt for Kilo Code (Auto Model)

> This is a SEPARATE Next.js project from the main QRise SaaS. Deploy independently to a different Vercel project. Access restricted to super-admin users only.
> Paste this entire document into Kilo Code as a single task.

---

## ABSOLUTE RULES

1. **Every file must be MAX 300–400 lines of code.** Split into sub-components if approaching limit.
2. **TypeScript strict mode.** No `any` types.
3. **Admin access only.** Every page and API route verifies `users.is_admin = true` before any operation.
4. **Audit logging.** Every destructive action (delete, ban, plan change) is logged to `admin_audit_log` table.
5. **Read-only first.** Most admin views are read-only. Write operations require confirmation dialogs.
6. **Never show raw passwords, API key hashes, or payment details.**
7. Use `pnpm` as the package manager.

---

## PRODUCT OVERVIEW

QRise Admin Panel is a separate web application for platform administrators. It connects to the same Supabase database as the main QRise SaaS (using the service role key — bypasses RLS) but is deployed to a completely different URL that is never publicly advertised.

**Admin capabilities:**
- Platform metrics overview (revenue, users, QRs, scans)
- User management (view, search, suspend, delete, change plan, impersonate)
- QR code oversight (browse all users' QRs, suspend abusive QRs)
- Analytics (platform-wide scan trends, top QRs, geographic breakdown)
- Plan management (create/edit/delete plans, feature flags per plan)
- Feature flags (global toggles for in-progress features)
- Email broadcasts (send to all users or filtered segments)
- Abuse reports (review flagged QRs, take action)
- Bulk job monitoring (see all bulk jobs, stuck job recovery)
- System health (DB size, error rates, active connections, Worker stats)
- Content moderation (approve/reject "guess the feature" submissions)

---

## FREE INFRASTRUCTURE (NO CARD REQUIRED)

Same Supabase project as the main SaaS. Deploy admin panel as a separate Vercel project.

| Service | Purpose | Notes |
|---|---|---|
| Vercel (2nd project) | Admin panel hosting | Free hobby — separate deployment |
| Supabase (same project) | Same DB, service role access | No extra cost |
| Upstash Redis (same) | Rate limiting admin auth | Same free instance |
| Resend (same) | Admin email broadcasts | Same free account |

**Admin URL:** Keep it obscure. Use a Vercel subdomain like `qrise-admin-[random].vercel.app`. Do NOT publicly link to it anywhere.

---

## TECH STACK

```
Framework:    Next.js 15 (App Router, TypeScript)
Styling:      Tailwind CSS v4 + shadcn/ui
State:        TanStack Query v5 (no Zustand needed for admin)
Database:     Same Supabase instance — service role client (bypasses RLS)
Auth:         Supabase Auth — magic link only (no social providers for admin)
Cache:        Same Upstash Redis instance
Charts:       Recharts
Tables:       TanStack Table v8 (powerful server-side table for user/QR management)
Email:        Resend (broadcast emails)
Icons:        Lucide React
Validation:   Zod
```

---

## FILE STRUCTURE

```
qrise-admin/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx                   # Magic link only
│   ├── (admin)/
│   │   ├── layout.tsx                        # Admin shell with sidebar
│   │   ├── dashboard/page.tsx                # Platform overview
│   │   ├── users/
│   │   │   ├── page.tsx                      # Users table
│   │   │   └── [id]/page.tsx                 # User detail page
│   │   ├── qr-codes/
│   │   │   ├── page.tsx                      # All QR codes table
│   │   │   └── [id]/page.tsx                 # QR detail + actions
│   │   ├── analytics/page.tsx                # Platform analytics
│   │   ├── plans/
│   │   │   ├── page.tsx                      # Plans list
│   │   │   └── [id]/page.tsx                 # Plan editor
│   │   ├── feature-flags/page.tsx
│   │   ├── broadcasts/
│   │   │   ├── page.tsx                      # Broadcast history
│   │   │   └── new/page.tsx                  # Compose broadcast
│   │   ├── reports/page.tsx                  # Abuse reports queue
│   │   ├── bulk-jobs/page.tsx                # All bulk jobs monitor
│   │   ├── features-quiz/page.tsx            # Manage "guess the feature" quiz
│   │   └── system/page.tsx                   # System health
│   ├── api/
│   │   ├── admin/
│   │   │   ├── auth/route.ts                 # Verify admin status
│   │   │   ├── users/
│   │   │   │   ├── route.ts                  # List users
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts              # Get user
│   │   │   │       ├── suspend/route.ts
│   │   │   │       ├── unsuspend/route.ts
│   │   │   │       ├── delete/route.ts
│   │   │   │       ├── plan/route.ts
│   │   │   │       └── impersonate/route.ts
│   │   │   ├── qr-codes/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── suspend/route.ts
│   │   │   │       └── delete/route.ts
│   │   │   ├── analytics/route.ts
│   │   │   ├── plans/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── feature-flags/route.ts
│   │   │   ├── broadcasts/route.ts
│   │   │   ├── reports/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── bulk-jobs/route.ts
│   │   │   └── system/route.ts
│   │   └── auth/callback/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                                   # shadcn/ui
│   ├── admin/
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-header.tsx
│   │   ├── stat-card.tsx
│   │   ├── data-table.tsx                    # Reusable TanStack Table wrapper
│   │   ├── confirm-dialog.tsx                # Confirmation modal for destructive actions
│   │   ├── audit-badge.tsx
│   │   └── search-filter-bar.tsx
│   ├── users/
│   │   ├── users-table.tsx
│   │   ├── user-detail-card.tsx
│   │   ├── user-plan-badge.tsx
│   │   ├── user-actions-menu.tsx
│   │   └── impersonate-banner.tsx
│   ├── qr-codes/
│   │   ├── qr-codes-table.tsx
│   │   ├── qr-detail-panel.tsx
│   │   └── qr-suspend-dialog.tsx
│   ├── analytics/
│   │   ├── platform-trend-chart.tsx
│   │   ├── top-qrs-table.tsx
│   │   ├── geo-breakdown-chart.tsx
│   │   └── device-split-chart.tsx
│   ├── plans/
│   │   ├── plan-card.tsx
│   │   └── plan-editor-form.tsx
│   ├── feature-flags/
│   │   └── flag-toggle-row.tsx
│   ├── broadcasts/
│   │   ├── broadcast-composer.tsx
│   │   ├── segment-selector.tsx
│   │   └── broadcast-preview.tsx
│   └── system/
│       ├── health-card.tsx
│       ├── db-stats.tsx
│       └── job-queue-monitor.tsx
├── lib/
│   ├── supabase/
│   │   ├── admin-client.ts                   # Service role — full DB access
│   │   └── server.ts                         # Auth only (anon key)
│   ├── db/
│   │   ├── schema/                           # Import from shared types or redefine
│   │   │   └── admin.ts                      # Admin-specific tables
│   │   └── admin-queries/
│   │       ├── users.queries.ts
│   │       ├── qr.queries.ts
│   │       ├── analytics.queries.ts
│   │       └── system.queries.ts
│   ├── audit.ts                              # Audit log writer
│   ├── rate-limit.ts                         # Upstash rate limit
│   └── resend.ts                             # Email client
├── middleware.ts                             # Admin-only guard
├── next.config.ts
└── .env.local.example
```

---

## PHASE 1 — Project Setup

### Task 1.1: Initialize Project
```bash
pnpm create next-app@latest qrise-admin --typescript --tailwind --app --src-dir=false --import-alias="@/*"
cd qrise-admin
pnpm add drizzle-orm @supabase/supabase-js @supabase/ssr @upstash/redis @upstash/ratelimit resend @tanstack/react-query @tanstack/react-table recharts lucide-react react-hook-form zod @hookform/resolvers
pnpm add -D drizzle-kit
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label select textarea tabs badge avatar dialog alert-dialog sheet dropdown-menu tooltip skeleton table progress separator
```

### Task 1.2: `.env.local.example`
```env
# Same Supabase project — use SERVICE ROLE key (not anon key)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=                    # Full DB access — NEVER expose client-side
NEXT_PUBLIC_SUPABASE_ANON_KEY=               # Only for auth session management

# Same Upstash instance
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Admin-specific
ADMIN_PANEL_SECRET=                           # Random 64-char string for internal API calls
ADMIN_EMAIL_ALLOWLIST=admin@yourdomain.com    # Comma-separated — only these emails can log in

# Same Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=admin@yourdomain.com

# Main SaaS URL (for impersonation redirects)
MAIN_APP_URL=https://your-qrise-app.vercel.app
```

### Task 1.3: Admin DB Tables
Add to Supabase (run as migration). Create `lib/db/schema/admin.ts` (max 100 lines):

```sql
-- Admin audit log (tracks every admin action)
CREATE TABLE admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,          -- 'user.suspend', 'qr.delete', 'plan.update', etc.
  target_type VARCHAR(50),               -- 'user', 'qr_code', 'plan'
  target_id UUID,
  details JSONB,                         -- Before/after values
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,      -- 'bulk_qr', 'api_access', 'design_studio', etc.
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_enabled BOOL DEFAULT true,
  enabled_for_plans TEXT[],              -- ['pro','business'] or NULL for all
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email broadcasts
CREATE TABLE broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  segment JSONB,                         -- Null = all users, or {plan: 'pro', country: 'IN'}
  recipient_count INT,
  status ENUM('draft','sending','sent','failed') DEFAULT 'draft',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Abuse reports
CREATE TABLE abuse_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_id UUID REFERENCES qr_codes(id),
  reported_by UUID,                      -- NULL if anonymous
  reason VARCHAR(200) NOT NULL,
  details TEXT,
  status ENUM('pending','reviewed','actioned','dismissed') DEFAULT 'pending',
  reviewed_by UUID,
  action_taken VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add is_admin to users table
ALTER TABLE users ADD COLUMN is_admin BOOL DEFAULT false;
ALTER TABLE users ADD COLUMN is_suspended BOOL DEFAULT false;
ALTER TABLE users ADD COLUMN suspended_reason TEXT;
ALTER TABLE users ADD COLUMN suspended_at TIMESTAMP;
```

### Task 1.4: `middleware.ts` (max 100 lines)
- Allow `/login` and `/api/auth/callback` without auth
- All other routes: verify Supabase session exists
- After session check: call `/api/admin/auth` to verify `is_admin = true`
- If not admin: redirect to `/login?error=unauthorized`
- Also check email against `ADMIN_EMAIL_ALLOWLIST` as second factor

---

## PHASE 2 — Auth & Layout

### Task 2.1: `app/(auth)/login/page.tsx` (max 100 lines)
Admin login — magic link ONLY (no password, no social):
- Single email input
- Submit → `supabase.auth.signInWithOtp({ email })` with `shouldCreateUser: false` (must be existing admin)
- Shows confirmation message "Check your email for a magic link"
- Email must be in `ADMIN_EMAIL_ALLOWLIST` (validated server-side)
- No "Register" link anywhere
- Minimal, stark design — this page should feel like a secure entry point, not a product landing page

### Task 2.2: `components/admin/admin-sidebar.tsx` (max 150 lines)
Sidebar navigation with sections:
- **Overview:** Dashboard
- **Users:** Users, Abuse Reports
- **Content:** QR Codes, Bulk Jobs
- **Platform:** Analytics, Feature Flags, Features Quiz
- **Communication:** Broadcasts
- **Config:** Plans, System Health
- Admin badge showing logged-in admin email at bottom
- "Back to app" link to main SaaS URL

### Task 2.3: `app/(admin)/layout.tsx` (max 80 lines)
- Grid: fixed sidebar + scrollable main content
- Wrap with QueryClientProvider
- Audit log context (pass adminUserId to all child components via context)

---

## PHASE 3 — Platform Dashboard

### Task 3.1: `app/(admin)/dashboard/page.tsx` (max 100 lines)
Thin page shell, fetches from `/api/admin/analytics?view=platform_summary`.

### Task 3.2: `components/admin/stat-card.tsx` (max 60 lines)
Same as main app but with admin styling. Props: label, value, delta, trend, icon, isLoading.

### Task 3.3: Platform dashboard layout — split across components:
- `components/analytics/platform-trend-chart.tsx` (max 150 lines): Total scans over 30 days (Recharts AreaChart), toggle: scans / new users / new QRs
- Top stat cards row (max 60 lines in dashboard page): Total Users, Total QR Codes, Total Scans Today, Monthly Revenue (hard-coded 0 until Stripe integrated)
- `components/analytics/geo-breakdown-chart.tsx` (max 120 lines): BarChart of top 10 countries by scans
- `components/analytics/top-qrs-table.tsx` (max 150 lines): Top 10 most scanned QRs globally — shows QR name, owner email, scan count, type

### Task 3.4: `app/api/admin/analytics/route.ts` (max 200 lines)
```
GET /api/admin/analytics?view=platform_summary
  - Verify admin
  - Query: total users count, total QR count, total scans (all time), scans today
  - Query: daily scans last 30 days (grouped by date)
  - Query: top 10 QRs by scan count (join with users for owner email)
  - Query: scan count by country (top 10)
  - Return all in one response object
```

---

## PHASE 4 — User Management

### Task 4.1: `app/(admin)/users/page.tsx` (max 100 lines)
Page shell with search, filter, and the users table. Filter options: plan, status (active/suspended), date range.

### Task 4.2: `components/users/users-table.tsx` (max 300 lines)
TanStack Table v8 with server-side pagination and sorting:
- Columns: Avatar+Name, Email, Plan badge, QR count, Total scans, Joined date, Status (active/suspended), Actions menu
- Actions menu per row: View Details, Change Plan, Suspend, Delete (with confirmation), Impersonate
- Row click → navigate to `/users/{id}`
- Bulk select + bulk suspend/delete (with multi-confirmation)
- Export to CSV button (all users matching current filter)

### Task 4.3: `app/(admin)/users/[id]/page.tsx` (max 150 lines)
Split into:
- `page.tsx` — data fetch, layout
- `components/users/user-detail-card.tsx` — profile info, plan, dates, suspend status, edit plan inline (max 150 lines)
- `components/users/user-qr-list.tsx` — mini table of this user's QR codes with scan counts (max 100 lines)
- `components/users/user-activity-log.tsx` — last 20 scan events across all their QRs (max 100 lines)
- `components/users/user-actions-panel.tsx` — buttons: Suspend, Change Plan, Delete Account, Impersonate (max 100 lines)

### Task 4.4: User action API routes (each max 80 lines)

`app/api/admin/users/[id]/suspend/route.ts`:
- Verify admin
- Set `users.is_suspended = true`, `suspended_reason`, `suspended_at`
- Invalidate all user's active sessions via Supabase Admin API
- Insert to `admin_audit_log`: action='user.suspend', details={reason}
- Send email to user notifying suspension (via Resend)

`app/api/admin/users/[id]/unsuspend/route.ts`:
- Set `is_suspended = false`
- Audit log
- Send unsuspension email

`app/api/admin/users/[id]/plan/route.ts`:
- Update `users.plan` + `plan_expires_at`
- Audit log with before/after plan values

`app/api/admin/users/[id]/delete/route.ts`:
- Double confirmation required (send `confirm: true` in body)
- Delete user's QR codes (set is_active=false)
- Anonymize scan events (set user_id=null on scan_events via qr_id)
- Delete user record
- Audit log: action='user.delete'

`app/api/admin/users/[id]/impersonate/route.ts`:
- Generate a short-lived (15min) impersonation token using Supabase Admin API `createUser` + custom claim
- Return redirect URL: `{MAIN_APP_URL}/auth/impersonate?token={token}`
- Audit log: action='user.impersonate' — this is highly sensitive
- Show `components/users/impersonate-banner.tsx` in main app when impersonating (banner at top: "You are viewing as {email} — Exit impersonation")

---

## PHASE 5 — QR Code Management

### Task 5.1: `app/(admin)/qr-codes/page.tsx` (max 100 lines)
Global QR code browser with filters: user search, QR type, status (active/suspended), date range, dynamic/static.

### Task 5.2: `components/qr-codes/qr-codes-table.tsx` (max 300 lines)
TanStack Table with server-side pagination:
- Columns: QR name, Owner email, Type, Dynamic badge, Scan count, Short code, Status, Created date, Actions
- Actions: View Detail, Suspend QR, Delete QR
- Click row → `/qr-codes/{id}` detail page

### Task 5.3: `app/(admin)/qr-codes/[id]/page.tsx` (max 150 lines)
Split into:
- `page.tsx` — fetch QR + owner + recent scans
- `components/qr-codes/qr-detail-panel.tsx` — shows QR config, target URL, design settings, owner info, short code (max 150 lines)
- Recent scan events table (last 50 scans)
- `components/qr-codes/qr-suspend-dialog.tsx` — reason input + confirm (max 80 lines)

### Task 5.4: QR action API routes (each max 80 lines)

`app/api/admin/qr-codes/[id]/suspend/route.ts`:
- Set `qr_codes.is_active = false`
- Invalidate KV cache entry (call Worker admin endpoint or direct KV API)
- Audit log: action='qr.suspend', details={reason, qr_name, owner_id}

`app/api/admin/qr-codes/[id]/delete/route.ts`:
- Delete QR record
- Anonymize scan events
- Audit log

---

## PHASE 6 — Platform Analytics

### Task 6.1: `app/(admin)/analytics/page.tsx` (max 100 lines)
Platform-wide analytics page with date range picker and 4 tabs: Scans, Users, QR Types, Geography.

### Task 6.2: Split analytics into components (each max 150 lines):

`components/analytics/platform-trend-chart.tsx`:
- Recharts AreaChart: daily scans last 7/30/90 days
- Toggle: Total Scans / Unique Scans / New Users / New QRs
- Download as CSV button

`components/analytics/device-split-chart.tsx`:
- Recharts PieChart: Mobile / Tablet / Desktop split
- Below: BarChart of top 5 OS values

`components/analytics/geo-breakdown-chart.tsx`:
- Bar chart of top 15 countries
- Data table below with scan count + percentage

`components/analytics/top-qrs-table.tsx`:
- Top 50 QRs by scan count (all users)
- Shows: QR name, owner email, type, scans, last scan, link to QR detail

### Task 6.3: `app/api/admin/analytics/route.ts` (max 200 lines)
Handle all analytic views with `?view=` param: scans_trend, device_split, geo_breakdown, top_qrs, user_growth.

---

## PHASE 7 — Plans Management

### Task 7.1: `app/(admin)/plans/page.tsx` (max 100 lines)
List all plans in a card grid. Each card shows: plan name, price (monthly/annual), feature flags, user count on that plan. "+ Create Plan" button.

### Task 7.2: `components/plans/plan-editor-form.tsx` (max 250 lines)
Form for creating/editing a plan. Fields:
- Name, description
- Price monthly, Price annual
- Max QR codes (number or -1 for unlimited)
- Max scans per month (number or -1)
- Max API keys (number)
- Feature toggles: has_analytics, has_api_access, has_bulk_generator, has_design_studio, has_smart_routing, has_password_qr, has_multi_action
- Is publicly visible (hide Enterprise from pricing page)
- Sort order

### Task 7.3: `app/api/admin/plans/route.ts` + `app/api/admin/plans/[id]/route.ts` (max 200 lines)
CRUD for plans. Each plan change: audit log. When plan features change: notify affected users via Resend (e.g., "Your Pro plan now includes Smart Routing QR").

---

## PHASE 8 — Feature Flags

### Task 8.1: `app/(admin)/feature-flags/page.tsx` (max 100 lines)
List all feature flags in a table. Each row: flag key, name, description, current state (on/off), which plans it applies to. Toggle switch per row.

### Task 8.2: `components/feature-flags/flag-toggle-row.tsx` (max 80 lines)
- Shows flag name + description + plan scope
- Toggle switch calls PATCH `/api/admin/feature-flags/{id}` on change
- Audit log on every toggle

### Task 8.3: `app/api/admin/feature-flags/route.ts` (max 150 lines)
```
GET /api/admin/feature-flags — list all flags
POST /api/admin/feature-flags — create new flag
PATCH /api/admin/feature-flags/{id} — update is_enabled or enabled_for_plans
DELETE /api/admin/feature-flags/{id} — delete flag
```

**Feature flags to seed on first setup:**
- `bulk_qr_generator` — enabled for: ['business', 'enterprise']
- `api_access` — enabled for: ['pro', 'business', 'enterprise']
- `design_studio` — enabled for: ['pro', 'business', 'enterprise']
- `smart_routing` — enabled for: ['pro', 'business', 'enterprise']
- `password_qr` — enabled for: ['free', 'pro', 'business', 'enterprise']
- `multi_action_qr` — enabled for: ['pro', 'business', 'enterprise']
- `analytics_export` — enabled for: ['business', 'enterprise']

---

## PHASE 9 — Email Broadcasts

### Task 9.1: `app/(admin)/broadcasts/page.tsx` (max 100 lines)
List of past broadcasts with status (draft/sending/sent/failed), recipient count, sent date. "+ New Broadcast" button.

### Task 9.2: `app/(admin)/broadcasts/new/page.tsx` (max 100 lines)
Page shell wrapping the broadcast composer.

### Task 9.3: `components/broadcasts/broadcast-composer.tsx` (max 300 lines)
Split:
- `broadcast-composer.tsx` — main form: subject, body (rich textarea), segment selector, send/save draft buttons (max 150 lines)
- `components/broadcasts/segment-selector.tsx` — filter audience: All Users, By Plan (multi-select), By Country, By joined date range, Estimate count button (max 100 lines)
- `components/broadcasts/broadcast-preview.tsx` — HTML email preview pane, "Send test to my email" button (max 100 lines)

### Task 9.4: `app/api/admin/broadcasts/route.ts` (max 200 lines)
```
POST /api/admin/broadcasts
  - Verify admin
  - Validate subject + body
  - Resolve segment to list of user emails (query DB with filters)
  - Create broadcast record (status: 'sending')
  - Send emails in batches of 50 via Resend (respect rate limits)
  - Update status to 'sent' when done
  - Audit log: action='broadcast.sent', details={subject, recipient_count}

GET /api/admin/broadcasts
  - Return all broadcasts with status + metrics
```

---

## PHASE 10 — Abuse Reports

### Task 10.1: `app/(admin)/reports/page.tsx` (max 100 lines)
Reports queue with status filter (pending/reviewed/actioned/dismissed). Sort by newest first.

### Task 10.2: Report management split into components:
- `components/qr-codes/qr-suspend-dialog.tsx` — reuse from Phase 5
- Reports table (max 150 lines): columns — QR name, owner, reported reason, reported at, status, reviewer, action taken, actions menu
- Actions per report: View QR, Suspend QR, Dismiss Report, Mark Actioned

### Task 10.3: `app/api/admin/reports/route.ts` + `[id]/route.ts` (max 150 lines)
```
GET /api/admin/reports?status=pending — filtered list
PATCH /api/admin/reports/{id} — update status + action_taken
```

---

## PHASE 11 — Bulk Jobs Monitor

### Task 11.1: `app/(admin)/bulk-jobs/page.tsx` (max 100 lines)
Table of all bulk jobs across all users. Shows: user email, status, total rows, processed rows, progress bar, created at, duration.

### Task 11.2: Stuck job recovery
- Jobs in `processing` status for > 1 hour are highlighted in red
- "Retry" button → PATCH `/api/admin/bulk-jobs/{id}/retry` → resets job to `queued`
- "Cancel" button → sets status to `failed` with error_log entry

---

## PHASE 12 — Features Quiz Management

### Task 12.1: `app/(admin)/features-quiz/page.tsx` (max 100 lines)
Manage the "Guess the upcoming feature" quiz from the public Features page.

Split:
- Table of quiz questions (max 150 lines): feature name, hint text, answer (hidden/shown), correct guesses count, status (active/revealed)
- "Add feature" button → modal with: feature name, hint text, answer (stored as SHA-256 hash — admin sets it in plain text here, it's hashed before storing), blurred preview image upload, gift code
- "Reveal feature" action → marks as active/visible on public site

---

## PHASE 13 — System Health

### Task 13.1: `app/(admin)/system/page.tsx` (max 100 lines)
System health overview page. Auto-refreshes every 30 seconds.

### Task 13.2: Split into health components (each max 100 lines):

`components/system/db-stats.tsx`:
- DB size (MB), table row counts for major tables, active connections count
- Fetch from Supabase `pg_stat` queries via service role

`components/system/health-card.tsx`:
- Per-service health indicator: Supabase DB (ping), Upstash Redis (ping), Resend (last email status), Cloudflare Worker (ping redirect endpoint)
- Green/yellow/red status dots

`components/system/job-queue-monitor.tsx`:
- Count of bulk jobs by status (queued/processing/done/failed)
- Count of webhook deliveries by status
- Count of failed webhook retries
- "Flush stuck jobs" button

### Task 13.3: `app/api/admin/system/route.ts` (max 200 lines)
```
GET /api/admin/system/health
  - Ping Supabase: SELECT 1
  - Ping Upstash: redis.ping()
  - Get DB size: SELECT pg_size_pretty(pg_database_size(current_database()))
  - Get table row counts for: users, qr_codes, scan_events, bulk_jobs, form_submissions
  - Get bulk job counts by status
  - Get webhook delivery counts by status
  - Return structured health report
```

---

## PHASE 14 — Core Utilities & Audit System

### Task 14.1: `lib/audit.ts` (max 80 lines)
```typescript
interface AuditEntry {
  adminUserId: string
  action: string
  targetType?: 'user' | 'qr_code' | 'plan' | 'feature_flag' | 'broadcast'
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

async function writeAuditLog(entry: AuditEntry): Promise<void>
// Insert to admin_audit_log using service role client
// This should be called after EVERY admin write action
```

### Task 14.2: `components/admin/confirm-dialog.tsx` (max 80 lines)
Reusable shadcn AlertDialog for destructive actions:
- Props: `title, description, confirmText, onConfirm, isLoading, variant ('danger'|'warning')`
- Danger variant: red confirm button
- On confirm: calls `onConfirm()` callback

### Task 14.3: `components/admin/data-table.tsx` (max 300 lines)
Reusable TanStack Table v8 wrapper:
- Server-side pagination (controlled)
- Column sort (controlled)
- Row selection with checkbox
- Search input (debounced, controlled)
- Column visibility toggle (dropdown)
- Empty state with icon + message
- Loading skeleton (same column structure)
- Props: `data, columns, pagination, onPaginationChange, sorting, onSortingChange, isLoading, emptyMessage`

---

## FINAL TASKS

### Task F.1: Admin-only middleware verification
Every API route under `/api/admin/*` must start with this guard:
```typescript
async function verifyAdmin(request: NextRequest): Promise<{ adminId: string } | Response> {
  const supabase = createAdminClient()  // Service role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, is_suspended')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) return new Response('Forbidden', { status: 403 })
  if (profile.is_suspended) return new Response('Account suspended', { status: 403 })
  
  const allowlist = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',') ?? []
  if (!allowlist.includes(user.email!)) return new Response('Forbidden', { status: 403 })
  
  return { adminId: user.id }
}
```
Create this as `lib/admin-auth.ts` and import it into every admin API route.

### Task F.2: Seed script
Create `scripts/seed-admin.ts`:
- Accepts email as argument: `pnpm ts-node scripts/seed-admin.ts admin@yourcompany.com`
- Sets `is_admin = true` for that user in DB
- Must already have a Supabase account (no user creation here)

### Task F.3: `README.md`
Document:
- How to set up admin panel (env vars, Supabase service role key)
- How to create first admin user (seed script)
- How to configure ADMIN_EMAIL_ALLOWLIST
- Deployment to Vercel (SEPARATE from main app)
- Security recommendations (restrict IP, use VPN for access)

---

## DEPLOYMENT CHECKLIST

After build:

1. **Supabase:** Run admin table migrations (`admin_audit_log`, `feature_flags`, `broadcasts`, `abuse_reports`, `ALTER TABLE users ADD COLUMN is_admin`)
2. **Seed feature flags:** Run `pnpm ts-node scripts/seed-feature-flags.ts`
3. **Seed admin user:** Run `pnpm ts-node scripts/seed-admin.ts your@email.com`
4. **Vercel:** Create a NEW separate project for admin panel — import GitHub repo → add all env vars → deploy
5. **Security:** In Vercel, set "Password Protection" on the admin deployment (extra layer before even reaching login page)
6. **Test:** Try accessing as non-admin → should get 403. Try accessing as admin → should work.

---

## SECURITY NOTES (MUST READ)

- The admin panel URL should NEVER appear in the main app's code or public documentation
- Use Vercel's built-in "Password Protection" feature (free on hobby) as a first layer before the login page
- The `ADMIN_EMAIL_ALLOWLIST` is a hard whitelist — even if someone creates a user and sets `is_admin=true` in DB, they still can't access unless their email is in the allowlist env variable
- All admin API routes use the Supabase service role key server-side (never exposed to client)
- Every write action writes to `admin_audit_log` — this creates a complete forensic record
- Impersonation is logged at both admin panel level and should optionally notify the impersonated user

---

*End of QRise Admin Panel Master Prompt*
