-- Add allow_overages column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_overages BOOLEAN DEFAULT false;
