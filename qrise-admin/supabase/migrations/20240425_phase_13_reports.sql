-- Create Bug Reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,                      -- NULL if anonymous
  url VARCHAR(2000),                 -- Page where bug happened
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  severity VARCHAR(20) DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'critical'
  browser_info JSONB,                -- { name, version, os, screen_size }
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewed_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure abuse_reports table exists (if not already)
CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_id UUID,
  reported_by UUID,                      -- NULL if anonymous
  reason VARCHAR(200) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'reviewed' | 'actioned' | 'dismissed'
  reviewed_by UUID,
  action_taken VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);
