-- Add secret column to webhooks table if it's missing
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS secret TEXT;
