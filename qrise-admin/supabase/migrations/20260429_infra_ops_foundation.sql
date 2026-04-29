-- Infra Ops Controls Foundation
-- Created on 2026-04-29

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

-- Seed initial platform configuration
INSERT INTO platform_config (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Global maintenance mode switch'),
  ('read_only_mode', 'false', 'Block all write operations'),
  ('signup_enabled', 'true', 'Allow new user registrations'),
  ('max_qr_per_request', '50', 'Max QRs creatable in one API batch'),
  ('cloudflare_cache_ttl', '300', 'KV cache TTL in seconds')
ON CONFLICT (key) DO NOTHING;
