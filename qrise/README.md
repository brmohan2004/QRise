# QRise - Dynamic QR Codes & Analytics

QRise is a premium, full-stack SaaS platform for creating, managing, and tracking dynamic QR codes. Built with Next.js 15, Supabase, and Cloudflare Workers, it provides context-aware redirection, real-time analytics, and lead-gen form integration.

## 🚀 Key Features
- **Dynamic Redirections**: Edit the destination URL anytime without reprinting.
- **Smart Routing**: Redirect based on Device type, Country, OS, or Language.
- **Lead Gen Forms**: Integrated form builder to collect lead data before redirection.
- **Advanced Analytics**: Track scans, uniques, and bot traffic in real-time.
- **Developer Hub**: Full API access and Webhook delivery (HMAC signed).
- **Security First**: CSP headers, Bcrypt hashing, and rate-limiting on all sensitive routes.

## 🛠️ Tech Stack
| Service | Provider | Free Tier Limit |
| :--- | :--- | :--- |
| **Frontend/API** | Next.js (Vercel) | 1,000 requests/mo (v0) |
| **Database/Auth** | Supabase | 500MB storage, 50k users |
| **Cache/Rate Limit** | Upstash Redis | 10k requests/day |
| **Redirect Engine** | Cloudflare Workers | 100k requests/day |
| **Email** | Resend | 100 emails/day |

## 📋 Prerequisites
- Node.js 20+ & pnpm
- Supabase Account (New project)
- Cloudflare Account (Workers + KV)
- Upstash Account (Redis REST)
- Resend Account (API Key)

## 💻 Local Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/qrise.git
   cd qrise
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Configure Environment**:
   Copy `.env.local.example` to `.env.local` and fill in the values from your dashboards.
4. **Database Migration**:
   ```bash
   pnpm drizzle-kit push
   ```
5. **Start Development**:
   ```bash
   pnpm dev
   ```

## 🏗️ Production Deployment
Follow the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide for step-by-step instructions on Vercel and Cloudflare setup.

## 🛡️ Admin Setup
To access the Admin Panel, navigate to your Supabase SQL Editor and run:
```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

---
© 2026 QRise Inc. Built for performance and reliability.
