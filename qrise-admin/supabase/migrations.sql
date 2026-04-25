-- Add admin fields to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_enabled BOOL DEFAULT true,
  enabled_for_plans TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email broadcasts
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  segment JSONB,
  recipient_count INT,
  status VARCHAR(20) DEFAULT 'draft',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Push notifications / support emails
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'email', -- 'email' | 'push'
  subject VARCHAR(500),
  body TEXT NOT NULL,
  target_type VARCHAR(30) DEFAULT 'all',     -- 'all' | 'user' | 'plan' | 'segment'
  target_id UUID,                            -- user id if targeting single user
  target_plan VARCHAR(50),
  segment JSONB,
  recipient_count INT,
  status VARCHAR(20) DEFAULT 'draft',        -- 'draft' | 'sending' | 'sent' | 'failed'
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coupon codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,          -- e.g. LAUNCH50
  description TEXT,
  discount_type VARCHAR(20) NOT NULL,        -- 'percent' | 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,     -- e.g. 50 (%) or 10.00 ($)
  applies_to_plans TEXT[],                   -- null = all plans
  max_uses INT,                              -- null = unlimited
  uses_count INT DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,                     -- null = no expiry
  is_active BOOL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coupon redemptions log
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id),
  user_id UUID NOT NULL,
  plan VARCHAR(50),
  discount_applied DECIMAL(10,2),
  redeemed_at TIMESTAMP DEFAULT NOW()
);

-- Competitions / Hackathons
CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,         -- URL: /competitions/{slug}
  description TEXT,
  prize_details TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  registration_deadline TIMESTAMP,
  is_public BOOL DEFAULT false,              -- false = draft, true = live on public site
  is_registration_open BOOL DEFAULT true,
  custom_page_html TEXT,                     -- Rendered from uploaded hackathon-page.tsx
  custom_components_json JSONB,             -- From hackathon-components.tsx
  registration_form_schema JSONB,           -- From registration-form.tsx
  max_participants INT,
  current_participants INT DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Competition registrations
CREATE TABLE IF NOT EXISTS competition_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  user_id UUID,
  form_data JSONB NOT NULL,                  -- Submitted registration form data
  email VARCHAR(300) NOT NULL,
  status VARCHAR(30) DEFAULT 'registered',   -- 'registered' | 'confirmed' | 'disqualified'
  registered_at TIMESTAMP DEFAULT NOW()
);

-- Abuse reports
CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_id UUID,
  reported_by UUID,
  reason VARCHAR(200) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID,
  action_taken VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plans table (extended with all feature constraints)
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  is_publicly_visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Feature flags (plan-level)
  has_analytics BOOLEAN DEFAULT false,
  has_api_access BOOLEAN DEFAULT false,
  has_bulk_generator BOOLEAN DEFAULT false,
  has_design_studio BOOLEAN DEFAULT false,
  has_smart_routing BOOLEAN DEFAULT false,
  has_password_qr BOOLEAN DEFAULT false,
  has_multi_action_qr BOOLEAN DEFAULT false,
  has_analytics_export BOOLEAN DEFAULT false,
  has_form_builder BOOLEAN DEFAULT false,

  -- Design Studio Sub-Feature Constraints (Colors, Dot Pattern, Logo, Frame, Eye)
  design_studio_color_limit INT DEFAULT NULL,
  design_studio_dot_pattern_limit INT DEFAULT NULL,
  design_studio_logo_limit INT DEFAULT NULL,          -- center logo uploads per month
  design_studio_frame_limit INT DEFAULT NULL,
  design_studio_eye_shape_limit INT DEFAULT NULL,
  design_studio_eye_color_limit INT DEFAULT NULL,
  design_studio_frame_color_limit INT DEFAULT NULL,
  design_studio_style_limit INT DEFAULT NULL,

  -- Smart Routing Constraints
  smart_routing_rule_limit INT DEFAULT NULL,
  smart_routing_geotargeting BOOLEAN DEFAULT false,
  smart_routing_devicetargeting BOOLEAN DEFAULT false,
  smart_routing_timetargeting BOOLEAN DEFAULT false,

  -- Password QR
  password_qr_limit INT DEFAULT NULL,

  -- Multi-Action QR
  multi_action_qr_limit INT DEFAULT NULL,
  action_limit INT DEFAULT NULL,                      -- max actions per multi-action QR

  -- Bulk QR
  bulk_qr_limit INT DEFAULT NULL,
  bulk_qr_row_limit INT DEFAULT NULL,                 -- max rows per CSV

  -- API Access (all features accessible via API)
  api_key_limit INT DEFAULT 0,
  api_call_limit INT DEFAULT NULL,
  webhook_limit INT DEFAULT 0,
  custom_domain_api BOOLEAN DEFAULT false,

  -- General QR & Scan Limits
  qr_limit INT DEFAULT -1,
  dynamic_qr_limit INT DEFAULT NULL,
  static_qr_limit INT DEFAULT NULL,
  smart_qr_limit INT DEFAULT NULL,
  monthly_scan_limit INT DEFAULT -1,
  smart_qr_scan_limit INT DEFAULT NULL,

  -- Form Builder Constraints
  form_builder_limit INT DEFAULT NULL,
  form_field_limit INT DEFAULT NULL,
  form_file_upload_limit INT DEFAULT NULL,
  form_submission_limit INT DEFAULT NULL,

  -- Export
  csv_export_limit INT DEFAULT NULL,
  analytics_export_days INT DEFAULT 30
);

-- Features quiz
CREATE TABLE IF NOT EXISTS features_quiz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name VARCHAR(200) NOT NULL,
  hint_text TEXT NOT NULL,
  answer_hash VARCHAR(64) NOT NULL,
  gift_code VARCHAR(50),
  correct_guesses INT DEFAULT 0,
  is_visible BOOL DEFAULT false,
  is_revealed BOOL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default feature flags
INSERT INTO feature_flags (key, name, description, is_enabled, enabled_for_plans) VALUES
  ('pricing_page_enabled', 'Pricing Page', 'Show pricing page. When off: shows "Pricing will roll out soon" card.', true, NULL),
  ('api_docs_enabled', 'API Documentation', 'Show API docs. When off: shows "We are working on this" card.', true, NULL),
  ('static_qr', 'Static QR Codes', 'Static QR code generation', true, ARRAY['free','pro','business','enterprise']),
  ('dynamic_qr', 'Dynamic QR Codes', 'Dynamic/editable QR codes', true, ARRAY['pro','business','enterprise']),
  ('design_studio_enabled', 'Design Studio', 'Custom QR styling: colors, dots, logo, frame, eye', true, ARRAY['pro','business','enterprise']),
  ('smart_routing_enabled', 'Smart Routing QR', 'Route scans by device/location/time', true, ARRAY['pro','business','enterprise']),
  ('password_qr_enabled', 'Password Protected QR', 'Password-protect QR destinations', true, ARRAY['pro','business','enterprise']),
  ('multi_action_qr_enabled', 'Multi-Action QR', 'Multiple destinations per QR with action menu', true, ARRAY['pro','business','enterprise']),
  ('bulk_qr_enabled', 'Bulk QR Generator', 'Upload CSV to generate QRs in batch', true, ARRAY['business','enterprise']),
  ('analytics_export_enabled', 'Analytics Export', 'Download scan data as CSV', true, ARRAY['business','enterprise']),
  ('api_access_enabled', 'API Access', 'REST API + webhooks (all features accessible via API)', true, ARRAY['pro','business','enterprise']),
  ('form_builder_enabled', 'Form Builder', 'Create forms and collect submissions', true, ARRAY['enterprise'])
ON CONFLICT (key) DO NOTHING;
