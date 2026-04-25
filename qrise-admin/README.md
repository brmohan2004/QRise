# QRise Admin Panel

The mission control center for the QRise platform. Built with Next.js 15, Tailwind CSS v4, and Supabase.

## 🚀 Quick Start

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and fill in the following:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # CRITICAL: Server-side only
ADMIN_EMAIL_ALLOWLIST=admin@example.com,dev@example.com
NEXT_PUBLIC_MAIN_APP_URL=https://qrise.app
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Run Seeding Scripts
Initialize your database with essential platform data:
```bash
# Seed Feature Flags
pnpm tsx scripts/seed-feature-flags.ts

# Seed Platform Plans
pnpm tsx scripts/seed-plans.ts

# Create Your First Admin
pnpm tsx scripts/seed-admin.ts your@email.com
```

### 4. Start Development
```bash
npm run dev
```

## 🛡️ Security Model
- **Multi-Factor Guard:** Access requires an active Supabase session, a DB `is_admin` flag, and presence in the `ADMIN_EMAIL_ALLOWLIST`.
- **Audit Logging:** Every administrative action is logged to the `admin_audit_log` table.
- **Session Timeout:** Forced re-login every 8 hours.
- **Service Role:** Database operations use the service role key to bypass RLS, restricted to secure API routes.

## 📦 Features
- **Analytics:** Real-time platform pulse and scan distributions.
- **User Management:** Impersonation, suspension, and plan overrides.
- **Plan Engine:** Granular control over platform constraints and pricing.
- **Competitions:** Sandbox for hackathon pages and custom component uploads.
- **Bulk Monitor:** Oversight for system-wide QR generation jobs.
