-- Ensure abuse_reports table exists (if not already)
CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if anonymous
  reason VARCHAR(200) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'reviewed' | 'actioned' | 'dismissed'
  reviewed_by UUID,
  action_taken VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);
