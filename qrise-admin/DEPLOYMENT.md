# Deployment Guide: QRise Admin Panel

Follow these steps to deploy a secure, production-ready instance of the Admin Panel on Vercel.

## 1. Supabase Preparation
Ensure all migrations in the `supabase/migrations` folder have been executed in your Supabase SQL Editor. 

## 2. Vercel Project Setup
1. Create a **New Project** in Vercel.
2. Import the `qrise-admin` subdirectory (or the full repo and set the Root Directory).
3. **CRITICAL:** Enable **Vercel Password Protection** (Deployment Protection) in the Vercel project settings. This acts as the first layer of defense.

## 3. Environment Variables
Add all variables from your `.env.local` to Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL_ALLOWLIST` (Comma-separated)
- `NEXT_PUBLIC_MAIN_APP_URL` (URL of the main SaaS app)

## 4. First Admin Creation
Once deployed, run the seed script locally pointing to your production database (or use a GitHub Action) to elevate your account:
```bash
pnpm tsx scripts/seed-admin.ts your@email.com
```

## 5. Security Checklist
- [ ] Vercel Password Protection is ON.
- [ ] `ADMIN_EMAIL_ALLOWLIST` contains ONLY trusted developers.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not exposed in any client-side code.
- [ ] Magic link authentication is working on the production domain.
