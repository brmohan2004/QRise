-- QRise API & Webhook Infrastructure v2 Migration
-- Generated at: 2026-04-30

-- 1. EXTENDING EXISTING TABLES
-- api_keys extension
ALTER TABLE api_keys
  ADD COLUMN IF NOT EXISTS environment       VARCHAR(10) DEFAULT 'live' CHECK (environment IN ('live','test')),
  ADD COLUMN IF NOT EXISTS ip_allowlist      TEXT[],
  ADD COLUMN IF NOT EXISTS expires_at        TIMESTAMP,
  ADD COLUMN IF NOT EXISTS monthly_call_limit INT,
  ADD COLUMN IF NOT EXISTS calls_this_month  INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS calls_reset_at    TIMESTAMP DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  ADD COLUMN IF NOT EXISTS description       TEXT,
  ADD COLUMN IF NOT EXISTS last_ip           INET;

-- qr_codes extension
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS custom_type_id      UUID,
  ADD COLUMN IF NOT EXISTS custom_type_payload JSONB,
  ADD COLUMN IF NOT EXISTS tags                TEXT[] DEFAULT '{}';

-- webhooks extension
ALTER TABLE webhooks
  ADD COLUMN IF NOT EXISTS filter_config JSONB;

-- webhook_deliveries extension
-- Handle attempts column type transition from text to integer
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'webhook_deliveries' 
        AND column_name = 'attempts' 
        AND data_type = 'text'
    ) THEN
        -- 1. Drop the existing text default
        ALTER TABLE webhook_deliveries ALTER COLUMN attempts DROP DEFAULT;
        -- 2. Change the type with a cast
        ALTER TABLE webhook_deliveries ALTER COLUMN attempts TYPE INTEGER USING attempts::integer;
        -- 3. Set the new integer default
        ALTER TABLE webhook_deliveries ALTER COLUMN attempts SET DEFAULT 0;
    END IF;
END $$;

ALTER TABLE webhook_deliveries
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS signature     VARCHAR(200),
  ADD COLUMN IF NOT EXISTS duration_ms   INT,
  ADD COLUMN IF NOT EXISTS status        VARCHAR(20) DEFAULT 'pending'
             CHECK (status IN ('pending','delivered','failed','retrying','abandoned')),
  ADD COLUMN IF NOT EXISTS filter_config JSONB;

-- 2. CREATING NEW TABLES
-- plan_rate_limits
CREATE TABLE IF NOT EXISTS plan_rate_limits (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan                    VARCHAR(50) NOT NULL UNIQUE,
  rpm                     INT NOT NULL DEFAULT 20,
  rpd                     INT NOT NULL DEFAULT 500,
  max_burst               INT NOT NULL DEFAULT 5,
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

-- api_usage_events
CREATE TABLE IF NOT EXISTS api_usage_events (
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

CREATE INDEX IF NOT EXISTS idx_usage_key_month  ON api_usage_events (api_key_id, called_at);
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON api_usage_events (user_id, called_at);
CREATE INDEX IF NOT EXISTS idx_usage_endpoint   ON api_usage_events (endpoint, called_at);

-- custom_qr_types
CREATE TABLE IF NOT EXISTS custom_qr_types (
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

CREATE INDEX IF NOT EXISTS idx_custom_types_public ON custom_qr_types (is_public, is_verified)
  WHERE is_public = true;

-- type_resolvers
CREATE TABLE IF NOT EXISTS type_resolvers (
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

-- resolver_calls
CREATE TABLE IF NOT EXISTS resolver_calls (
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

CREATE INDEX IF NOT EXISTS idx_resolver_calls_resolver ON resolver_calls (resolver_id, called_at);
CREATE INDEX IF NOT EXISTS idx_resolver_calls_errors   ON resolver_calls (resolver_id, called_at)
  WHERE resolver_status >= 400 OR resolver_status IS NULL;

-- type_templates
CREATE TABLE IF NOT EXISTS type_templates (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id      UUID NOT NULL REFERENCES custom_qr_types(id) ON DELETE CASCADE,
  slug         VARCHAR(80) NOT NULL,
  name         VARCHAR(200) NOT NULL,
  template_html TEXT NOT NULL,
  is_default   BOOL DEFAULT false,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE (type_id, slug)
);

-- usage_monthly_snapshots
CREATE TABLE IF NOT EXISTS usage_monthly_snapshots (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id),
  month           DATE NOT NULL,
  api_calls       INT DEFAULT 0,
  image_renders   INT DEFAULT 0,
  embed_renders   INT DEFAULT 0,
  resolver_calls  INT DEFAULT 0,
  overage_calls   INT DEFAULT 0,
  overage_usd     NUMERIC(10,4) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, month)
);

-- type_marketplace_submissions
CREATE TABLE IF NOT EXISTS type_marketplace_submissions (
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

-- user_rate_limit_overrides
CREATE TABLE IF NOT EXISTS user_rate_limit_overrides (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  override      JSONB NOT NULL,
  reason        TEXT,
  created_by_admin_id UUID,
  expires_at    TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- usage_alert_channels
CREATE TABLE IF NOT EXISTS usage_alert_channels (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_type VARCHAR(20) NOT NULL CHECK (channel_type IN ('slack','discord','email')),
  webhook_url  TEXT,
  email        TEXT,
  threshold_pct INT DEFAULT 80 CHECK (threshold_pct BETWEEN 50 AND 100),
  is_active    BOOL DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- 3. HANDLING DUPLICATION
-- Drop the old rate_limit_config table
DROP TABLE IF EXISTS rate_limit_config CASCADE;

-- 4. SEEDING DEFAULT DATA
INSERT INTO plan_rate_limits (plan, rpm, rpd, max_burst, image_renders_per_month,
  embed_renders_per_month, resolver_calls_per_month, api_calls_per_month,
  max_webhooks, max_custom_types, max_resolver_timeout_ms) 
VALUES
  ('free',       20,    500,    5,    100,    500,      0,      1000,    2,   0,  3000),
  ('pro',        100,   5000,   20,   1000,   5000,     500,    10000,   10,  5,  5000),
  ('business',   500,   50000,  50,   10000,  50000,    10000,  100000,  50,  20, 5000),
  ('enterprise', 2000,  999999, 200,  999999, 999999,   999999, 999999,  999, 99, 5000)
ON CONFLICT (plan) DO NOTHING;

-- 5. SANDBOX SCHEMA SETUP
CREATE SCHEMA IF NOT EXISTS sandbox;

-- Mirror key tables in sandbox schema (this is a simplified version, ideally would be identical)
CREATE TABLE IF NOT EXISTS sandbox.qr_codes (LIKE public.qr_codes INCLUDING ALL);
CREATE TABLE IF NOT EXISTS sandbox.api_usage_events (LIKE public.api_usage_events INCLUDING ALL);
CREATE TABLE IF NOT EXISTS sandbox.resolver_calls (LIKE public.resolver_calls INCLUDING ALL);
CREATE TABLE IF NOT EXISTS sandbox.scan_events (LIKE public.scan_events INCLUDING ALL);
CREATE TABLE IF NOT EXISTS sandbox.webhook_deliveries (LIKE public.webhook_deliveries INCLUDING ALL);
