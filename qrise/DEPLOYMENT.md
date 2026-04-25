# Production Deployment Guide

This guide details the process for deploying QRise to production using Vercel (Frontend/API) and Cloudflare (Redirect Engine).

## 1. Supabase Initialization
1. Create a new Supabase project.
2. In the **SQL Editor**, run the contents of `lib/db/schema.sql` (if available) or use Drizzle to push the schema:
   ```bash
   pnpm drizzle-kit push
   ```
3. Enable **Email Auth** in the Authentication settings.
4. Add your production domain to the **URL Configuration** redirect whitelist.

## 2. Cloudflare Worker Deployment
1. Install Wrangler CLI: `npm install -g wrangler`.
2. Login to Cloudflare: `wrangler login`.
3. Create a KV namespace:
   ```bash
   wrangler kv:namespace create QR_KV
   ```
4. Update `wrangler.toml` with the generated `id`.
5. Deploy the worker:
   ```bash
   cd cloudflare-worker && pnpm run deploy
   ```
6. Set production secrets in the Cloudflare Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `APP_URL`

## 3. Vercel Deployment
1. Connect your GitHub repository to Vercel.
2. Configure **Environment Variables** in the Vercel project settings:
   - `DATABASE_URL` (Supabase Transaction Pooler URL)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_REDIRECT_BASE_URL` (Your Worker URL)
   - `INTERNAL_SECRET` (A long random string)
3. Deploy!

## 4. Post-Deployment Checklist
- [ ] Visit the homepage and verify site loads.
- [ ] Register a new test account.
- [ ] Create a "URL" type QR code.
- [ ] Scan the QR code using a mobile device.
- [ ] Verify you are redirected correctly.
- [ ] Check the dashboard to see if the scan was recorded in the analytics charts.
- [ ] Test a password-protected QR code.

## 5. Monitoring
- **Vercel Analytics**: Monitor core web vitals and server failures.
- **Cloudflare Worker Monitor**: Track the CPU time and success rate of redirections.
- **Upstash Dashboard**: Monitor Redis request counts to ensure you're within free tier.
