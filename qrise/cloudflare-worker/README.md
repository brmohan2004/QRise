# QRise Cloudflare Worker

Smart QR code redirect worker built for Cloudflare Workers with dynamic routing, A/B testing, password protection, and interactive action menus.

## Features

- **Dynamic Routing**: Route users based on device type, OS, country, language, or time
- **Password Protection**: Secure QR codes with password gates
- **Action Menu**: Show interactive action cards (call, email, SMS, copy, open URL)
- **Analytics**: Track scans with country, city, device, OS, browser, and bot detection
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **KV Caching**: Fast lookups with Cloudflare KV
- **Bot Filtering**: Automatic bot/ crawler detection

## Project Structure

```
cloudflare-worker/
├── src/
│   ├── pages/
│   │   ├── password-page.ts    # Password gate UI
│   │   ├── action-menu.ts      # Interactive action menu
│   │   ├── not-found.ts        # 404 page
│   │   └── error-page.ts       # Error page
│   ├── index.ts               # Main worker entry point
│   ├── redirect.ts            # QR resolution & routing logic
│   ├── types.ts               # Shared TypeScript types
│   ├── consent.ts             # Cookie consent handling
│   ├── analytics-logger.ts    # Analytics logging
│   ├── rate-limiter.ts        # Rate limiting
│   └── bot-filter.ts          # Bot & device detection
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `wrangler.toml`:
   ```toml
   [vars]
   SUPABASE_URL = "https://your-project.supabase.co"
   SUPABASE_SERVICE_KEY = "your-service-role-key"
   APP_URL = "https://yourdomain.com"
   ```

3. Add KV namespace binding:
   ```bash
   wrangler kv:namespace create QR_KV
   ```
   Then update `wrangler.toml` with the KV namespace ID.

4. Run locally:
   ```bash
   npm run dev
   ```

5. Deploy:
   ```bash
   npm run deploy
   ```

## Database Schema

The worker expects the following tables in Supabase:

### `qr_codes`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| short_code | varchar | Unique short code |
| type | varchar | QR type |
| target_url | varchar | Default redirect URL |
| is_active | boolean | Active flag |
| password_hash | varchar | Optional password hash |
| label | varchar | Optional label |
| routing_rules | jsonb | Routing rules array |
| actions | jsonb | Action items array |

### `scan_events`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| qr_id | uuid | References qr_codes |
| scanned_at | timestamp | Scan timestamp |
| country | varchar | Country code |
| city | varchar | City name |
| device_type | varchar | Device type |
| os | varchar | Operating system |
| browser | varchar | Browser |
| ip_hash | varchar | Hashed IP |
| is_bot | boolean | Bot flag |
| is_unique | boolean | Unique scan flag |
| matched_rule_id | varchar | Matched routing rule |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/:shortcode` | GET | Redirect logic |
| `/api/verify-password` | POST | Verify password |
| `/api/track-action` | POST | Track action tap |
| `/api/consent` | POST | Save consent preferences |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `APP_URL` | Yes | Base URL of the app |

## Notes

- Password hashing: SHA-256 of the plaintext password
- Rate limits: Default 100 req/min per shortcode (configurable)
- Consent banner: Styled UI for GDPR compliance

## License

Private - All rights reserved
