-- Add category to distinguish broadcasts from standard alerts
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'alert'; -- 'broadcast' | 'alert' | 'system'

-- Create user_notifications table for in-app tracking
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- Cleanup legacy broadcasts table
DROP TABLE IF EXISTS broadcasts;
