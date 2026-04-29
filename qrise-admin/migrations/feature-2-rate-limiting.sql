-- Feature 2: Advanced Rate Limiting SQL Migration

-- 1. Table for Global Per-Plan Limits
CREATE TABLE IF NOT EXISTS rate_limit_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name VARCHAR(50) UNIQUE NOT NULL, -- 'free', 'pro', 'business', etc.
  requests_per_minute INT NOT NULL,
  requests_per_hour INT NOT NULL,
  requests_per_day INT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Table for IP Blocks
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

-- 3. Table for Rate Limit Violations
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

-- 4. Initial Config Data
INSERT INTO rate_limit_config (plan_name, requests_per_minute, requests_per_hour, requests_per_day)
VALUES 
  ('free', 60, 1000, 5000),
  ('pro', 300, 10000, 50000),
  ('business', 1000, 50000, 250000),
  ('enterprise', 5000, 250000, 1000000)
ON CONFLICT (plan_name) DO NOTHING;
