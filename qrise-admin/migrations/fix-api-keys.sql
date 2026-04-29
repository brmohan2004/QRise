-- Fix for missing api_keys table and other related tables
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  key_prefix VARCHAR(50),
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  admin_call_limit_override JSONB, -- { "minute": 100, "hour": 1000, "day": 10000 }
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure the foreign key exists in rate_limit_violations if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'rate_limit_violations_api_key_id_fkey'
    ) THEN
        ALTER TABLE rate_limit_violations 
        ADD CONSTRAINT rate_limit_violations_api_key_id_fkey 
        FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL;
    END IF;
END $$;
