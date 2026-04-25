# QRise Admin Panel — Master Agentic Build Prompt for Kilo Code (Auto Model)
# Version: v2.0 — Extended Edition

> This is a SEPARATE Next.js project from the main QRise SaaS. Deploy independently to a different Vercel project. Access restricted to super-admin users only.
> Paste this entire document into Kilo Code as a single task.

---

## ABSOLUTE RULES

1. **Every file must be MAX 300–400 lines of code.** Split into sub-components if approaching limit.
2. **TypeScript strict mode.** No `any` types.
3. **Admin access only.** Every page and API route verifies `users.is_admin = true` before any operation.
4. **Audit logging.** Every destructive action (delete, ban, plan change, flag toggle) is logged to `admin_audit_log` table.
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
- **Plan management (create/edit/delete plans, feature flags per plan, quota limits per plan)**
- **Feature flags (global toggles for: pricing page, API docs, and each individual product feature)**
- **Feature constraints (granular limits per plan: QR limits, scan limits, API key limits, bulk limits, etc.)**
- Email broadcasts (send to all users or filtered segments)
- **Push notification / support email system (send targeted or broadcast notifications)**
- **Coupon code management (create discount codes for pricing)**
- **Competition / Hackathon management (manage public competition pages, upload custom page files)**
- Abuse reports (review flagged QRs, take action)
- Bulk job monitoring (see all bulk jobs, stuck job recovery)
- System health (DB size, error rates, active connections, Worker stats)
- Content moderation (approve/reject "guess the feature" submissions)

---

## FEATURE FLAGS & PLAN-BASED PRICING SYSTEM

### Global Feature Toggles (Admin-level)
Admin can globally show/hide entire product areas:

| Flag Key | Purpose | Off-State UI |
|---|---|---|
| `pricing_page_enabled` | Show/Hide the entire pricing page on main app | Card: "Pricing will roll out soon 🚀" with email capture |
| `api_docs_enabled` | Show/Hide API documentation page | Card: "We are working on this. API docs will roll out soon 🛠️" |
| `design_studio_enabled` | Enable/disable Design Studio globally | "Coming soon" for all plans |
| `smart_routing_enabled` | Enable/disable Smart Routing QR feature | Hidden globally |
| `password_qr_enabled` | Enable/disable Password Protection feature | Hidden globally |
| `multi_action_qr_enabled` | Enable/disable Multi-Action QR feature | Hidden globally |
| `bulk_qr_enabled` | Enable/disable Bulk Generator feature | Hidden globally |
| `analytics_export_enabled` | Enable/disable CSV export of analytics | Hidden globally |
| `api_access_enabled` | Enable/disable API key generation | "API access requires upgrade" |
| `form_builder_enabled` | Enable/disable Form Builder feature | Hidden globally |

**Behavior when flag is `false`:**
- `pricing_page_enabled = false`: The pricing page (`/pricing`) shows a full-width card with "Pricing will roll out soon" and an email subscribe field instead of plans.
- `api_docs_enabled = false`: The API docs page (`/docs/api`) shows a full-width card with "We are working on this. API documentation will roll out soon."
- All other feature flags `false`: The feature is hidden from the UI entirely for all users. If a user has a direct link, they see a "Feature not available" screen.

### Feature-Level Access Control (Per-Plan Granularity)

**QR Code Limits:**
- `qr_limit` — Maximum QR codes allowed (-1 = unlimited)
- `dynamic_qr_limit` — Separate limit for dynamic/smart QRs (null = same as qr_limit)
- `static_qr_limit` — Separate limit for static QRs (null = included in qr_limit)
- `smart_qr_limit` — Limit for smart routing QRs specifically

**Scan Limits:**
- `monthly_scan_limit` — Scans per month across all QRs (-1 = unlimited)
- `smart_qr_scan_limit` — Scans for smart routing QRs only (null = shared quota)

**Feature-Specific Limits:**
- `password_qr_limit` — Number of password-protected QRs
- `multi_action_qr_limit` — Number of multi-action QRs
- `bulk_qr_limit` — Bulk generator monthly usage (bulk jobs)
- `api_key_limit` — Number of API keys user can create

**Design Studio Constraints (features.tsx flags: Colors, Dot Pattern, Center Logo, Logo Size, Frame Style, Eye Shape, Eye Color, Frame Color):**
- `design_studio_style_limit` — Customizable dot patterns (-1 = all)
- `design_studio_logo_limit` — Custom logo uploads per month (-1 = unlimited)
- `design_studio_frame_limit` — Custom frame styles (-1 = all)
- `design_studio_eye_shape_limit` — Eye pattern choices (-1 = all)
- `design_studio_eye_color_limit` — Custom eye colors (-1 = all)
- `design_studio_frame_color_limit` — Custom frame colors (-1 = all)
- `design_studio_dot_pattern_limit` — Dot pattern options (-1 = all)
- `design_studio_color_limit` — Color palette entries (-1 = all)

**Smart Routing Constraints:**
- `smart_routing_rule_limit` — Maximum routing rules per QR (-1 = unlimited)
- `smart_routing_geotargeting` — Boolean: allow location-based routing
- `smart_routing_devicetargeting` — Boolean: allow device detection routing
- `smart_routing_timetargeting` — Boolean: allow time-based scheduling

**Password QR Constraints:**
- `password_qr_limit` — Max password-protected QRs on this plan

**Multi-Action QR Constraints:**
- `multi_action_qr_limit` — Max multi-action QRs
- `action_limit` — Max actions per multi-action QR

**Bulk QR Constraints:**
- `bulk_qr_limit` — Monthly bulk jobs allowed
- `bulk_qr_row_limit` — Max rows per bulk job CSV

**Form Builder Constraints:**
- `form_builder_limit` — Number of forms per user
- `form_field_limit` — Max fields per form
- `form_file_upload_limit` — MB per file upload
- `form_submission_limit` — Monthly form submissions

**API Access Limits (all QRise features accessible via API when api_access enabled):**
- `api_call_limit` — API calls per month
- `api_key_limit` — Max API keys per user
- `webhook_limit` — Number of webhook endpoints
- `custom_domain_api` — Boolean: allow custom domain for API

**Export Limits:**
- `csv_export_limit` — Number of CSV exports per month
- `analytics_export_days` — Days of historical data accessible (30/90/365)

**CSV File Creation:**
- `csv_template_enabled` — Allow admin to define a CSV template that users download for bulk import
- Admin can upload/define a custom CSV template file per plan

### Upgrade Prompt UI Components (main app)
- `components/feature-upgrade-modal.tsx` — Popup when user tries to access restricted feature:
  - Shows: "Upgrade your plan to access {Feature Name}"
  - Current plan badge + target plan badge
  - Feature list comparison
  - CTA: "View Plans" button → pricing page
- `components/feature-locked-card.tsx` — Shows "Upgrade to unlock" preview card for restricted features on the Features page
- `components/upgrade-banner.tsx` — Top banner: "You've reached your {feature} limit. Upgrade to increase."

---

## FREE INFRASTRUCTURE (NO CARD REQUIRED)

Same Supabase project as the main SaaS. Deploy admin panel as a separate Vercel project.

| Service | Purpose | Notes |
|---|---|---|
| Vercel (2nd project) | Admin panel hosting | Free hobby — separate deployment |
| Supabase (same project) | Same DB, service role access | No extra cost |
| Upstash Redis (same) | Rate limiting admin auth | Same free instance |
| Resend (same) | Admin email broadcasts + notifications | Same free account |

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
Email:        Resend (broadcast emails + push notifications)
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
│   │   ├── feature-flags/page.tsx            # Global feature toggles
│   │   ├── broadcasts/
│   │   │   ├── page.tsx                      # Broadcast history
│   │   │   └── new/page.tsx                  # Compose broadcast
│   │   ├── notifications/
│   │   │   ├── page.tsx                      # Push notification / support email center
│   │   │   └── new/page.tsx                  # Compose notification
│   │   ├── coupons/
│   │   │   ├── page.tsx                      # Coupon code management
│   │   │   └── new/page.tsx                  # Create coupon
│   │   ├── competitions/
│   │   │   ├── page.tsx                      # Competitions / hackathons list
│   │   │   ├── new/page.tsx                  # Create competition
│   │   │   └── [id]/
│   │   │       ├── page.tsx                  # Competition editor
│   │   │       └── upload/page.tsx           # Upload custom page files
│   │   ├── reports/page.tsx                  # Abuse reports queue
│   │   ├── bulk-jobs/page.tsx                # All bulk jobs monitor
│   │   ├── features-quiz/page.tsx            # Manage "guess the feature" quiz
│   │   └── system/page.tsx                   # System health
│   ├── api/
│   │   ├── admin/
│   │   │   ├── auth/route.ts                 # Verify admin status
│   │   │   ├── users/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
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
│   │   │   ├── feature-flags/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── broadcasts/route.ts
│   │   │   ├── notifications/
│   │   │   │   ├── route.ts                  # Push notification / support email API
│   │   │   │   └── [id]/route.ts
│   │   │   ├── coupons/
│   │   │   │   ├── route.ts                  # Coupon CRUD
│   │   │   │   └── [id]/route.ts
│   │   │   ├── competitions/
│   │   │   │   ├── route.ts                  # Competition CRUD
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── [id]/upload/route.ts      # File upload for competition page
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
│   │   ├── data-table.tsx
│   │   ├── confirm-dialog.tsx
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
│   ├── notifications/
│   │   ├── notification-composer.tsx         # Push notification / support email composer
│   │   ├── notification-type-selector.tsx    # Email vs push notification type
│   │   └── notification-history-table.tsx
│   ├── coupons/
│   │   ├── coupon-form.tsx                   # Create/edit coupon
│   │   ├── coupons-table.tsx
│   │   └── coupon-stats-card.tsx             # Usage stats per coupon
│   ├── competitions/
│   │   ├── competition-form.tsx              # Create/edit competition
│   │   ├── competitions-table.tsx
│   │   ├── competition-file-uploader.tsx     # Upload hackathon-page.tsx etc.
│   │   ├── competition-preview.tsx           # Preview rendered competition page
│   │   └── registration-list.tsx            # View registrations
│   └── system/
│       ├── health-card.tsx
│       ├── db-stats.tsx
│       └── job-queue-monitor.tsx
├── lib/
│   ├── supabase/
│   │   ├── admin-client.ts
│   │   └── server.ts
│   ├── db/
│   │   ├── schema/
│   │   │   └── admin.ts
│   │   └── admin-queries/
│   │       ├── users.queries.ts
│   │       ├── qr.queries.ts
│   │       ├── analytics.queries.ts
│   │       └── system.queries.ts
│   ├── admin-auth.ts
│   ├── audit.ts
│   ├── rate-limit.ts
│   └── resend.ts
├── middleware.ts
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
pnpm dlx shadcn@latest add button card input label select textarea tabs badge avatar dialog alert-dialog sheet dropdown-menu tooltip skeleton table progress separator switch
```

### Task 1.2: `.env.local.example`

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ADMIN_PANEL_SECRET=
ADMIN_EMAIL_ALLOWLIST=admin@yourdomain.com
RESEND_API_KEY=
RESEND_FROM_EMAIL=admin@yourdomain.com
MAIN_APP_URL=https://your-qrise-app.vercel.app
JWT_SECRET=
```

### Task 1.3: Admin DB Tables (run in Supabase SQL Editor)

```sql
-- Add admin fields to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_enabled BOOL DEFAULT true,
  enabled_for_plans TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email broadcasts
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  segment JSONB,
  recipient_count INT,
  status VARCHAR(20) DEFAULT 'draft',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Push notifications / support emails
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'email', -- 'email' | 'push'
  subject VARCHAR(500),
  body TEXT NOT NULL,
  target_type VARCHAR(30) DEFAULT 'all',     -- 'all' | 'user' | 'plan' | 'segment'
  target_id UUID,                            -- user id if targeting single user
  target_plan VARCHAR(50),
  segment JSONB,
  recipient_count INT,
  status VARCHAR(20) DEFAULT 'draft',        -- 'draft' | 'sending' | 'sent' | 'failed'
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coupon codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,          -- e.g. LAUNCH50
  description TEXT,
  discount_type VARCHAR(20) NOT NULL,        -- 'percent' | 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,     -- e.g. 50 (%) or 10.00 ($)
  applies_to_plans TEXT[],                   -- null = all plans
  max_uses INT,                              -- null = unlimited
  uses_count INT DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,                     -- null = no expiry
  is_active BOOL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coupon redemptions log
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID NOT NULL,
  plan VARCHAR(50),
  discount_applied DECIMAL(10,2),
  redeemed_at TIMESTAMP DEFAULT NOW()
);

-- Competitions / Hackathons
CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,         -- URL: /competitions/{slug}
  description TEXT,
  prize_details TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  registration_deadline TIMESTAMP,
  is_public BOOL DEFAULT false,              -- false = draft, true = live on public site
  is_registration_open BOOL DEFAULT true,
  custom_page_html TEXT,                     -- Rendered from uploaded hackathon-page.tsx
  custom_components_json JSONB,             -- From hackathon-components.tsx
  registration_form_schema JSONB,           -- From registration-form.tsx
  max_participants INT,
  current_participants INT DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Competition registrations
CREATE TABLE IF NOT EXISTS competition_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  user_id UUID,
  form_data JSONB NOT NULL,                  -- Submitted registration form data
  email VARCHAR(300) NOT NULL,
  status VARCHAR(30) DEFAULT 'registered',   -- 'registered' | 'confirmed' | 'disqualified'
  registered_at TIMESTAMP DEFAULT NOW()
);

-- Abuse reports
CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_id UUID,
  reported_by UUID,
  reason VARCHAR(200) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID,
  action_taken VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plans table (extended with all feature constraints)
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  is_publicly_visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Feature flags (plan-level)
  has_analytics BOOLEAN DEFAULT false,
  has_api_access BOOLEAN DEFAULT false,
  has_bulk_generator BOOLEAN DEFAULT false,
  has_design_studio BOOLEAN DEFAULT false,
  has_smart_routing BOOLEAN DEFAULT false,
  has_password_qr BOOLEAN DEFAULT false,
  has_multi_action_qr BOOLEAN DEFAULT false,
  has_analytics_export BOOLEAN DEFAULT false,
  has_form_builder BOOLEAN DEFAULT false,

  -- Design Studio Sub-Feature Constraints (Colors, Dot Pattern, Logo, Frame, Eye)
  design_studio_color_limit INT DEFAULT NULL,
  design_studio_dot_pattern_limit INT DEFAULT NULL,
  design_studio_logo_limit INT DEFAULT NULL,          -- center logo uploads per month
  design_studio_frame_limit INT DEFAULT NULL,
  design_studio_eye_shape_limit INT DEFAULT NULL,
  design_studio_eye_color_limit INT DEFAULT NULL,
  design_studio_frame_color_limit INT DEFAULT NULL,
  design_studio_style_limit INT DEFAULT NULL,

  -- Smart Routing Constraints
  smart_routing_rule_limit INT DEFAULT NULL,
  smart_routing_geotargeting BOOLEAN DEFAULT false,
  smart_routing_devicetargeting BOOLEAN DEFAULT false,
  smart_routing_timetargeting BOOLEAN DEFAULT false,

  -- Password QR
  password_qr_limit INT DEFAULT NULL,

  -- Multi-Action QR
  multi_action_qr_limit INT DEFAULT NULL,
  action_limit INT DEFAULT NULL,                      -- max actions per multi-action QR

  -- Bulk QR
  bulk_qr_limit INT DEFAULT NULL,
  bulk_qr_row_limit INT DEFAULT NULL,                 -- max rows per CSV

  -- API Access (all features accessible via API)
  api_key_limit INT DEFAULT 0,
  api_call_limit INT DEFAULT NULL,
  webhook_limit INT DEFAULT 0,
  custom_domain_api BOOLEAN DEFAULT false,

  -- General QR & Scan Limits
  qr_limit INT DEFAULT -1,
  dynamic_qr_limit INT DEFAULT NULL,
  static_qr_limit INT DEFAULT NULL,
  smart_qr_limit INT DEFAULT NULL,
  monthly_scan_limit INT DEFAULT -1,
  smart_qr_scan_limit INT DEFAULT NULL,

  -- Form Builder Constraints
  form_builder_limit INT DEFAULT NULL,
  form_field_limit INT DEFAULT NULL,
  form_file_upload_limit INT DEFAULT NULL,
  form_submission_limit INT DEFAULT NULL,

  -- Export
  csv_export_limit INT DEFAULT NULL,
  analytics_export_days INT DEFAULT 30
);

-- Features quiz
CREATE TABLE IF NOT EXISTS features_quiz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name VARCHAR(200) NOT NULL,
  hint_text TEXT NOT NULL,
  answer_hash VARCHAR(64) NOT NULL,
  gift_code VARCHAR(50),
  correct_guesses INT DEFAULT 0,
  is_visible BOOL DEFAULT false,
  is_revealed BOOL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default feature flags
INSERT INTO feature_flags (key, name, description, is_enabled, enabled_for_plans) VALUES
  ('pricing_page_enabled', 'Pricing Page', 'Show pricing page. When off: shows "Pricing will roll out soon" card.', true, NULL),
  ('api_docs_enabled', 'API Documentation', 'Show API docs. When off: shows "We are working on this" card.', true, NULL),
  ('static_qr', 'Static QR Codes', 'Static QR code generation', true, ARRAY['free','pro','business','enterprise']),
  ('dynamic_qr', 'Dynamic QR Codes', 'Dynamic/editable QR codes', true, ARRAY['pro','business','enterprise']),
  ('design_studio_enabled', 'Design Studio', 'Custom QR styling: colors, dots, logo, frame, eye', true, ARRAY['pro','business','enterprise']),
  ('smart_routing_enabled', 'Smart Routing QR', 'Route scans by device/location/time', true, ARRAY['pro','business','enterprise']),
  ('password_qr_enabled', 'Password Protected QR', 'Password-protect QR destinations', true, ARRAY['pro','business','enterprise']),
  ('multi_action_qr_enabled', 'Multi-Action QR', 'Multiple destinations per QR with action menu', true, ARRAY['pro','business','enterprise']),
  ('bulk_qr_enabled', 'Bulk QR Generator', 'Upload CSV to generate QRs in batch', true, ARRAY['business','enterprise']),
  ('analytics_export_enabled', 'Analytics Export', 'Download scan data as CSV', true, ARRAY['business','enterprise']),
  ('api_access_enabled', 'API Access', 'REST API + webhooks (all features accessible via API)', true, ARRAY['pro','business','enterprise']),
  ('form_builder_enabled', 'Form Builder', 'Create forms and collect submissions', true, ARRAY['enterprise'])
ON CONFLICT (key) DO NOTHING;
```

### Task 1.4: `middleware.ts` (max 100 lines)
- Allow `/login` and `/api/auth/callback` without auth
- All other routes: verify Supabase session exists
- After session check: verify `is_admin = true` + email in `ADMIN_EMAIL_ALLOWLIST`
- If not admin: redirect to `/login?error=unauthorized`
- Session timeout: if session > 8 hours old, force re-login

---

## PHASE 2 — Auth & Layout

### Task 2.1: `app/(auth)/login/page.tsx` (max 100 lines)
Admin login — magic link ONLY (no password, no social):
- Single email input with Zod validation
- Submit → `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`
- Shows confirmation message "Check your email for a magic link"
- Email must be in `ADMIN_EMAIL_ALLOWLIST` (server-side)
- Rate limit: 3 magic link requests per email per 15 minutes (Upstash)
- Error if not in allowlist: "Access denied. Contact your system administrator."
- Minimal, stark design (#0a0a0a background) — secure entry point feel

### Task 2.2: `components/admin/admin-sidebar.tsx` (max 200 lines)
Sidebar navigation sections:
- **Overview:** Dashboard
- **Users:** Users, Abuse Reports
- **Content:** QR Codes, Bulk Jobs
- **Platform:** Analytics, Feature Flags, Features Quiz
- **Communication:** Broadcasts, Notifications
- **Commerce:** Coupons
- **Events:** Competitions
- **Config:** Plans, System Health
- Admin badge at bottom with logged-in email + "ADMIN" badge
- "Back to app" link to main SaaS URL
- Sign out button

### Task 2.3: `app/(admin)/layout.tsx` (max 80 lines)
- Grid: fixed sidebar (260px) + scrollable main content
- Wrap with QueryClientProvider + Toaster
- Impersonation banner if impersonating (red top bar)

---

## PHASE 3 — Platform Dashboard

### Task 3.1: `app/(admin)/dashboard/page.tsx` (max 100 lines)
Stat cards: Total Users, Total QRs, Total Scans Today, Active Competitions (new).

### Task 3.2: Dashboard layout split across components:
- `components/analytics/platform-trend-chart.tsx` (max 150 lines)
- `components/analytics/geo-breakdown-chart.tsx` (max 120 lines)
- `components/analytics/top-qrs-table.tsx` (max 150 lines)
- `components/admin/stat-card.tsx` (max 80 lines)

### Task 3.3: `app/api/admin/analytics/route.ts` (max 200 lines)
Handle view params: `platform_summary`, `scans_trend`, `geo`, `devices`, `top_qrs`, `user_growth`.
Cache in Redis 5min TTL per view.

---

## PHASE 4 — User Management (unchanged from v1)

### Task 4.1: `app/(admin)/users/page.tsx` + `components/users/users-table.tsx`
### Task 4.2: `app/(admin)/users/[id]/page.tsx` + user detail components
### Task 4.3: User action API routes (suspend, unsuspend, plan, delete, impersonate)

---

## PHASE 5 — QR Code Management (unchanged from v1)

### Task 5.1–5.4: QR list, detail, suspend, delete pages and API routes

---

## PHASE 6 — Platform Analytics (unchanged from v1)

### Task 6.1–6.3: Analytics page, charts, export API

---

## PHASE 7 — Plans Management (Extended Feature Constraints)

### Task 7.1: `app/(admin)/plans/page.tsx` (max 120 lines)
Grid of plan cards. Each shows:
- Plan name + price (monthly/annual with % savings)
- Pricing page visibility toggle (controls `is_publicly_visible`)
- Feature checklist (Design Studio sub-features: Colors, Dot Pattern, Center Logo, Logo Size, Frame Style, Eye Shape, Eye Color, Frame Color)
- Quota limits summary
- User count on plan
- "Edit" + "Delete" (disabled if plan has users)
- "+ Create Plan" button

### Task 7.2: `components/plans/plan-editor-form.tsx` (max 400 lines — split into sections)
**Section 1 — Basics:** name, description, pricing (monthly/annual), sort order, publicly visible toggle
**Section 2 — Feature Flags (toggle switches with Upgrade badge preview):**
- Static QR, Dynamic QR
- Design Studio (with sub-feature controls when enabled):
  - Colors, Dot Pattern, Center Logo, Logo Size, Frame Style, Eye Shape, Eye Color, Frame Color
- Smart Routing (with sub-feature controls): geotargeting, device targeting, time targeting, rule limit
- Password Protected QR + limit
- Multi-Action QR + limit + action limit per QR
- Bulk QR Generator + bulk job limit + CSV row limit
- Form Builder + form limit + field limit + file upload limit + submission limit
- API Access (grants API access to ALL features) + api_key_limit + api_call_limit + webhook_limit
- Analytics Export + csv_export_limit + analytics_export_days
**Section 3 — General Limits:**
- qr_limit, dynamic_qr_limit, static_qr_limit, smart_qr_limit
- monthly_scan_limit, smart_qr_scan_limit
**Live Preview Panel:** Right-side sticky plan card preview

### Task 7.3: `app/api/admin/plans/route.ts` + `[id]/route.ts`
Full CRUD with audit logging. When plan loses a feature: email affected users.

### Task 7.4: `lib/plan-validation.ts` (max 150 lines) — shared with main app:
```typescript
export function validateFeatureAccess(
  userPlan: Plan,
  feature: FeatureKey,
  usageCount?: number
): { allowed: boolean; reason?: string; upgradeUrl?: string }
```

---

## PHASE 8 — Feature Flags

### Task 8.1: `app/(admin)/feature-flags/page.tsx` (max 130 lines)
Table of all feature flags:
- `pricing_page_enabled`: when toggled off → "Pricing will roll out soon" card shown on main app
- `api_docs_enabled`: when toggled off → "We are working on this. API docs coming soon" card shown
- All other feature flags: each can be individually toggled on/off
- When a feature flag is off: all users see "Feature not available" or upgrade prompt depending on context
- Toggle per row with confirmation dialog (warns which plans/users are affected)
- "+ Add flag" button for custom flags

### Task 8.2: `components/feature-flags/flag-toggle-row.tsx` (max 100 lines)
- Toggle switch with optimistic update + rollback on error
- Confirm dialog before disabling (shows affected plans count)
- For `pricing_page_enabled`: show special warning "Users will see 'Pricing will roll out soon' instead of pricing page"
- For `api_docs_enabled`: show special warning "Users will see 'We are working on this' instead of API docs"
- For per-feature flags: shows "Feature will be hidden for all users regardless of plan"

### Task 8.3: `app/api/admin/feature-flags/route.ts` + `[id]/route.ts`
- GET: list all flags
- POST: create flag
- PATCH: update is_enabled (with audit log recording before+after)
- DELETE: delete flag

---

## PHASE 9 — Email Broadcasts (unchanged from v1)

### Task 9.1–9.4: Broadcast list, composer, segment selector, send API

---

## PHASE 10 — Push Notifications / Support Email System (NEW)

### Task 10.1: `app/(admin)/notifications/page.tsx` (max 120 lines)
Notification center — list of all sent notifications/support emails:
- Table: type badge (Push/Email), subject, target (All / User / Plan), recipient count, status, sent date
- "+ Send Notification" button → `/notifications/new`
- Filter: type, status, date range
- Stats header: Total sent this month, Email open rate (if tracked), Push delivery rate

### Task 10.2: `app/(admin)/notifications/new/page.tsx` (max 80 lines)
Page shell wrapping NotificationComposer.

### Task 10.3: `components/notifications/notification-composer.tsx` (max 260 lines)
Split into sub-components:
- **Type selector:** Toggle between "Email Notification" and "Push Notification"
- **Target selector:**
  - All Users
  - Specific User (search by email/name → user autocomplete)
  - All users on Plan (plan select)
  - Custom segment (plan + country + joined after)
- **Content:**
  - Subject (for email type)
  - Body (textarea with markdown support)
  - For support email: optional attach ticket reference
- **Preview + Send:**
  - "Send test to my email" button
  - Estimated recipient count (debounced API call)
  - "Save Draft" + "Send Now" buttons
  - Confirmation dialog with recipient count before sending

### Task 10.4: `app/api/admin/notifications/route.ts` (max 200 lines)
```
GET /api/admin/notifications — list all notifications (paginated)
POST /api/admin/notifications
  Body: { type, subject?, body, targetType, targetId?, targetPlan?, segment?, sendImmediately }
  - Resolve targets to email list
  - For type='email': send via Resend with support-email template
  - For type='push': send via Resend with push-style template (or integrate web push if available)
  - writeAuditLog: action='notification.sent', details={type, targetType, recipientCount}
```

### Task 10.5: `app/api/admin/notifications/[id]/route.ts` (max 80 lines)
- GET: single notification details + delivery stats
- DELETE: delete draft notification

---

## PHASE 11 — Coupon Code Management (NEW)

### Task 11.1: `app/(admin)/coupons/page.tsx` (max 120 lines)
Coupon management table:
- Columns: Code (monospace, copyable), Description, Discount (e.g. "50% off" or "$10 off"), Applies To Plans, Uses (used/max), Valid Until, Status (active/expired/inactive)
- Bulk actions: Deactivate selected
- "+ Create Coupon" button → `/coupons/new`
- Search by code or description
- Filter: active/expired/inactive, plan scope

### Task 11.2: `app/(admin)/coupons/new/page.tsx` (max 60 lines)
Page shell wrapping CouponForm.

### Task 11.3: `components/coupons/coupon-form.tsx` (max 200 lines)
React Hook Form + Zod:
- **Code:** TEXT input (auto-uppercased, unique validation), or "Generate random code" button
- **Description:** textarea (for internal reference)
- **Discount type:** Radio — "Percentage (%)" | "Fixed amount ($)"
- **Discount value:** Number input (e.g. 50 for 50%, or 10.00 for $10)
- **Applies to plans:** Multi-select (Free, Pro, Business, Enterprise, or "All Plans")
- **Max uses:** Number input or "Unlimited" toggle
- **Valid from:** Date picker (default = now)
- **Valid until:** Date picker or "No expiry" toggle
- **Is active:** Toggle
- Submit: POST/PUT to `/api/admin/coupons`

### Task 11.4: `components/coupons/coupons-table.tsx` (max 200 lines)
TanStack Table with:
- Color-coded status badge: active (green) / expired (red) / inactive (gray) / maxed-out (amber)
- Progress bar for uses (used/max)
- Inline deactivate/activate toggle
- Edit + Delete actions (ConfirmDialog for delete)

### Task 11.5: `components/coupons/coupon-stats-card.tsx` (max 100 lines)
Per-coupon stats card on detail view:
- Total redemptions, Redemptions this month, Total discount value applied, Most recent redemptions table

### Task 11.6: `app/api/admin/coupons/route.ts` + `[id]/route.ts` (max 250 lines)
```
GET /api/admin/coupons — list all coupons with redemption counts
POST /api/admin/coupons — create coupon (validate unique code, discount value, dates)
GET /api/admin/coupons/{id} — single coupon + redemption history
PATCH /api/admin/coupons/{id} — update (is_active, valid_until, max_uses, description)
DELETE /api/admin/coupons/{id} — delete (only if 0 redemptions, otherwise deactivate)
writeAuditLog on all write operations
```

---

## PHASE 12 — Competitions / Hackathons (NEW)

### Task 12.1: `app/(admin)/competitions/page.tsx` (max 120 lines)
Competitions list:
- Table: Title, Slug, Dates (start/end), Registrations, Status (draft/live/ended), Actions
- Status badge: Draft (gray), Live (green), Registration Closed (amber), Ended (gray)
- "+ Create Competition" button
- Toggle "Go Live" switch per row (sets `is_public = true`)

### Task 12.2: `app/(admin)/competitions/new/page.tsx` (max 60 lines)
Page shell wrapping CompetitionForm.

### Task 12.3: `components/competitions/competition-form.tsx` (max 250 lines)
React Hook Form + Zod:
- **Title:** text input
- **Slug:** auto-generated from title, editable (URL-safe, validated unique) → public URL: `/competitions/{slug}`
- **Description:** rich textarea
- **Prize Details:** textarea
- **Dates:** Start date, End date, Registration deadline (date pickers)
- **Max participants:** Number or "Unlimited"
- **Is public:** Toggle (when ON, competition appears at public `/competitions/{slug}`)
- **Registration open:** Toggle
- Submit: POST/PUT

### Task 12.4: `app/(admin)/competitions/[id]/page.tsx` (max 150 lines)
Competition editor with tabs:
- **Details tab:** Edit form (pre-populated CompetitionForm)
- **Registrations tab:** Table of all registrations (email, form data, status, registered_at)
- **Page Files tab:** Upload/manage custom page files (the 3 files that render the public page)
- **Preview tab:** Renders the public competition page in an iframe

### Task 12.5: `app/(admin)/competitions/[id]/upload/page.tsx` (max 100 lines)
Custom Page File Uploader — **this is the key feature that makes the competition page fully customizable:**

The public competition page (`/competitions/{slug}`) is rendered based on 3 uploadable files:
1. **`hackathon-page.tsx`** — Main page layout component
2. **`hackathon-components.tsx`** — Custom UI components used by the page
3. **`registration-form.tsx`** — Registration form definition (fields, validation)

Upload flow:
- 3 separate file upload zones (one per file, `.tsx` extension only)
- Each upload: stores file content in `competitions.custom_page_html` / `competitions.custom_components_json` / `competitions.registration_form_schema`
- "Preview" button: renders the combined page in a sandboxed iframe
- Warning: "Uploaded code will be parsed and rendered safely. Ensure your components follow the QRise component API."
- Upload history: shows last 3 versions per file with restore option

### Task 12.6: `components/competitions/competition-file-uploader.tsx` (max 200 lines)
- Drag-and-drop zone for each of the 3 files
- File validation: `.tsx` extension, max 200KB per file
- Shows file preview (code syntax display)
- Upload progress indicator
- File version history accordion (last 3 uploads with timestamps + restore button)

### Task 12.7: `components/competitions/competition-preview.tsx` (max 100 lines)
- Iframe rendering the public competition page using uploaded files
- Device toggle: desktop / mobile / tablet view
- "Open in new tab" link to live competition URL

### Task 12.8: `components/competitions/registration-list.tsx` (max 180 lines)
- Table of all registrations for a competition
- Columns: Email, Name (from form_data), Registered at, Status (registered/confirmed/disqualified)
- Bulk actions: Confirm selected, Export CSV of all registrations
- Per-row actions: View form data (JSON accordion), Disqualify, Confirm

### Task 12.9: `app/api/admin/competitions/route.ts` + `[id]/route.ts` (max 250 lines)
```
GET /api/admin/competitions — list all competitions with registration count
POST /api/admin/competitions — create (validates unique slug)
GET /api/admin/competitions/{id} — full competition + registration count
PATCH /api/admin/competitions/{id} — update (including is_public toggle)
DELETE /api/admin/competitions/{id} — only if 0 registrations, else deactivate
```

### Task 12.10: `app/api/admin/competitions/[id]/upload/route.ts` (max 120 lines)
```
POST /api/admin/competitions/{id}/upload
  Body: { fileType: 'page' | 'components' | 'form', content: string }
  - Validate file type + content size (max 200KB)
  - Store in competitions table (update appropriate column)
  - Store version snapshot in competition_file_versions table
  - writeAuditLog: action='competition.file_upload', details={fileType, competitionId}
  
GET /api/admin/competitions/{id}/upload?fileType=page
  - Return current file content + last 3 version history
```

### Task 12.11: Public Competition Page (in MAIN SaaS app)
Note for main app team: Create `app/competitions/[slug]/page.tsx` in main SaaS:
- Fetch competition by slug from DB
- If `is_public = false`: show 404 or "Coming soon" page
- Dynamically render the uploaded `hackathon-page.tsx` content
- Registration form uses `registration_form_schema` to render fields
- Form submission: POST to public API `/api/competitions/{slug}/register`

---

---

## PHASE 13 — Abuse Reports

### Task 13.1: `app/(admin)/reports/page.tsx` (max 100 lines)
Reports queue with status filter (pending/reviewed/actioned/dismissed). Sort by newest first.

### Task 13.2: Report management split into components:
- `components/qr-codes/qr-suspend-dialog.tsx` — reuse from Phase 5
- Reports table (max 150 lines): columns — QR name, owner, reported reason, reported at, status, reviewer, action taken, actions menu
- Actions per report: View QR, Suspend QR, Dismiss Report, Mark Actioned

### Task 13.3: `app/api/admin/reports/route.ts` + `[id]/route.ts` (max 150 lines)
```
GET /api/admin/reports?status=pending — filtered list
PATCH /api/admin/reports/{id} — update status + action_taken
```

---
---

## PHASE 14 — Bulk Jobs Monitor

### Task 14.1: `app/(admin)/bulk-jobs/page.tsx` (max 100 lines)
Table of all bulk jobs across all users. Shows: user email, status, total rows, processed rows, progress bar, created at, duration.

### Task 14.2: Stuck job recovery
- Jobs in `processing` status for > 1 hour are highlighted in red
- "Retry" button → PATCH `/api/admin/bulk-jobs/{id}/retry` → resets job to `queued`
- "Cancel" button → sets status to `failed` with error_log entry

---
---

## PHASE 15 — Features Quiz Management

### Task 15.1: `app/(admin)/features-quiz/page.tsx` (max 100 lines)
Manage the "Guess the upcoming feature" quiz from the public Features page.

Split:
- Table of quiz questions (max 150 lines): feature name, hint text, answer (hidden/shown), correct guesses count, status (active/revealed)
- "Add feature" button → modal with: feature name, hint text, answer (stored as SHA-256 hash — admin sets it in plain text here, it's hashed before storing), blurred preview image upload, gift code
- "Reveal feature" action → marks as active/visible on public site

---

---

## PHASE 16 — System Health

### Task 16.1: `app/(admin)/system/page.tsx` (max 100 lines)
System health overview page. Auto-refreshes every 30 seconds.

### Task 16.2: Split into health components (each max 100 lines):

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

### Task 16.3: `app/api/admin/system/route.ts` (max 200 lines)
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

## PHASE 17 — Core Utilities & Auth

### Task 17.1: `lib/admin-auth.ts` (max 100 lines)
```typescript
async function verifyAdmin(request: NextRequest): Promise<{ adminId: string; ipAddress: string } | Response> {
  // 1. Get session via Supabase
  // 2. Check is_admin = true
  // 3. Check is_suspended = false
  // 4. Check email in ADMIN_EMAIL_ALLOWLIST
  // 5. Check session age < 8 hours
  // Returns { adminId, ipAddress } or Response(403)
}
```

### Task 17.2: `lib/audit.ts` (max 80 lines)
```typescript
interface AuditEntry {
  adminUserId: string
  action: string
  targetType?: 'user' | 'qr_code' | 'plan' | 'feature_flag' | 'broadcast' | 'coupon' | 'competition' | 'notification'
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}
async function writeAuditLog(entry: AuditEntry): Promise<void>
```

### Task 17.3: `components/admin/confirm-dialog.tsx` (max 100 lines)
Reusable AlertDialog for destructive actions. Props: title, description, confirmText, onConfirm, isLoading, variant ('danger'|'warning').

### Task 17.4: `components/admin/data-table.tsx` (max 300 lines)
Reusable TanStack Table v8 wrapper with server-side pagination, sorting, row selection, search, empty states.

---

## FINAL TASKS

### Task F.1: Seed scripts
- `scripts/seed-admin.ts` — set user as admin by email
- `scripts/seed-feature-flags.ts` — seed the 12 default feature flags
- `scripts/seed-plans.ts` — seed default Free/Pro/Business/Enterprise plans with feature constraints

### Task F.2: Documentation
- `README.md` — setup, env vars, first admin creation
- `DEPLOYMENT.md` — step-by-step Vercel deploy
- `SECURITY.md` — security model, magic link rationale, audit log, impersonation safety
- `COMPETITION_PAGE_API.md` — documents the component API that uploaded hackathon page files must follow

---

## DEPLOYMENT CHECKLIST

1. **Supabase:** Run all SQL migrations (runed aldready)
2. **Seed:** Run `pnpm tsx scripts/seed-feature-flags.ts`
3. **Seed:** Run `pnpm tsx scripts/seed-plans.ts`
4. **Seed:** Run `pnpm tsx scripts/seed-admin.ts your@email.com`
5. **Vercel:** Create NEW separate project → import repo → add all env vars → deploy
6. **Security:** Enable Vercel Password Protection on admin deployment
7. **Test:** Non-admin gets 403, admin can login and see dashboard

---

## SECURITY NOTES

- Admin panel URL should NEVER appear in main app code or public docs
- Use Vercel "Password Protection" as first layer
- `ADMIN_EMAIL_ALLOWLIST` is hard whitelist — DB flag alone is insufficient
- All admin routes use Supabase service role key server-side only
- Session timeout: 8 hours, then force re-login
- Every write action is logged to `admin_audit_log`
- Impersonation is logged at both admin panel level and optionally notifies user
- Competition file uploads are sandboxed — content stored as text, not executed server-side

---

*End of QRise Admin Panel Master Prompt v2.0*
