CREATE TABLE "abuse_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_id" uuid,
	"reported_by" uuid,
	"reason" varchar(200) NOT NULL,
	"details" text,
	"status" varchar(20) DEFAULT 'pending',
	"reviewed_by" uuid,
	"action_taken" varchar(200),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50),
	"target_id" uuid,
	"details" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"type" varchar(20) DEFAULT 'info',
	"link_text" varchar(100),
	"link_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"show_to_plans" text[],
	"starts_at" timestamp DEFAULT now(),
	"ends_at" timestamp,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text,
	"description" text,
	"key_prefix" text,
	"key_hash" text NOT NULL,
	"scopes" text[] NOT NULL,
	"environment" text DEFAULT 'live',
	"ip_allowlist" text[],
	"expires_at" timestamp,
	"monthly_call_limit" integer,
	"calls_this_month" integer DEFAULT 0,
	"calls_reset_at" timestamp DEFAULT date_trunc('month', NOW()) + INTERVAL '1 month',
	"last_ip" "inet",
	"created_at" timestamp DEFAULT now(),
	"last_used_at" timestamp,
	"is_active" boolean DEFAULT true,
	"admin_call_limit_override" jsonb,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "api_usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" varchar(200) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer NOT NULL,
	"latency_ms" integer,
	"billable_unit" varchar(50),
	"quantity" integer DEFAULT 1,
	"environment" varchar(10) DEFAULT 'live',
	"request_id" uuid NOT NULL,
	"called_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"stripe_event_id" varchar(100),
	"event_type" varchar(100) NOT NULL,
	"amount_cents" integer,
	"currency" varchar(10) DEFAULT 'usd',
	"plan" varchar(50),
	"status" varchar(30),
	"stripe_invoice_id" varchar(100),
	"stripe_customer_id" varchar(100),
	"failure_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "billing_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "bulk_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"total_rows" integer NOT NULL,
	"processed_rows" integer DEFAULT 0,
	"zip_url" text,
	"zip_file_key" text,
	"error_log" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competition_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid,
	"user_id" uuid,
	"form_data" jsonb NOT NULL,
	"email" varchar(300) NOT NULL,
	"status" varchar(30) DEFAULT 'registered',
	"registered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(300) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"prize_details" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"registration_deadline" timestamp,
	"is_public" boolean DEFAULT false,
	"is_registration_open" boolean DEFAULT true,
	"custom_page_html" text,
	"custom_components_json" jsonb,
	"registration_form_schema" jsonb,
	"max_participants" integer,
	"current_participants" integer DEFAULT 0,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "competitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid,
	"user_id" uuid NOT NULL,
	"plan" varchar(50),
	"discount_applied" numeric(10, 2),
	"redeemed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"applies_to_plans" text[],
	"max_uses" integer,
	"uses_count" integer DEFAULT 0,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "custom_qr_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"icon_url" text,
	"fields_schema" jsonb NOT NULL,
	"is_public" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"is_suspended" boolean DEFAULT false,
	"suspend_reason" text,
	"scan_count" bigint DEFAULT 0,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "custom_qr_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT true,
	"enabled_for_plans" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "features_quiz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_name" varchar(200) NOT NULL,
	"hint_text" text NOT NULL,
	"answer_hash" varchar(64) NOT NULL,
	"image_url" varchar(500),
	"gift_code" varchar(50),
	"correct_guesses" integer DEFAULT 0,
	"is_visible" boolean DEFAULT false,
	"is_revealed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"submission_data" jsonb,
	"submitted_at" timestamp DEFAULT now(),
	"ip_hash" text
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"qr_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"fields_schema" jsonb NOT NULL,
	"success_message" text,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ip_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"reason" text,
	"blocked_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_permanent" boolean DEFAULT false,
	"metadata" jsonb,
	CONSTRAINT "ip_blocks_ip_address_unique" UNIQUE("ip_address")
);
--> statement-breakpoint
CREATE TABLE "maintenance_windows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(300) NOT NULL,
	"message" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"is_active" boolean DEFAULT false,
	"allow_read_only" boolean DEFAULT true,
	"affected_features" text[],
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"type" varchar(20) DEFAULT 'email' NOT NULL,
	"category" varchar(30) DEFAULT 'alert',
	"subject" varchar(500),
	"body" text NOT NULL,
	"target_type" varchar(30) DEFAULT 'all',
	"target_id" uuid,
	"target_plan" varchar(50),
	"segment" jsonb,
	"recipient_count" integer,
	"status" varchar(20) DEFAULT 'draft',
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan" varchar(50) NOT NULL,
	"rpm" integer DEFAULT 20 NOT NULL,
	"rpd" integer DEFAULT 500 NOT NULL,
	"max_burst" integer DEFAULT 5 NOT NULL,
	"image_renders_per_month" integer DEFAULT 100 NOT NULL,
	"embed_renders_per_month" integer DEFAULT 500 NOT NULL,
	"resolver_calls_per_month" integer DEFAULT 0 NOT NULL,
	"api_calls_per_month" integer DEFAULT 1000 NOT NULL,
	"max_webhooks" integer DEFAULT 2 NOT NULL,
	"max_custom_types" integer DEFAULT 0 NOT NULL,
	"max_resolver_timeout_ms" integer DEFAULT 3000 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"updated_by_admin_id" uuid,
	CONSTRAINT "plan_rate_limits_plan_unique" UNIQUE("plan")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price_monthly" numeric(10, 2),
	"price_annual" numeric(10, 2),
	"is_publicly_visible" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"has_analytics" boolean DEFAULT false,
	"has_api_access" boolean DEFAULT false,
	"has_bulk_generator" boolean DEFAULT false,
	"has_design_studio" boolean DEFAULT false,
	"has_smart_routing" boolean DEFAULT false,
	"has_password_qr" boolean DEFAULT false,
	"has_multi_action_qr" boolean DEFAULT false,
	"has_analytics_export" boolean DEFAULT false,
	"has_form_builder" boolean DEFAULT false,
	"design_studio_color_limit" integer,
	"design_studio_dot_pattern_limit" integer,
	"design_studio_logo_limit" integer,
	"design_studio_frame_limit" integer,
	"design_studio_eye_shape_limit" integer,
	"design_studio_eye_color_limit" integer,
	"design_studio_frame_color_limit" integer,
	"design_studio_style_limit" integer,
	"smart_routing_rule_limit" integer,
	"smart_routing_geotargeting" boolean DEFAULT false,
	"smart_routing_devicetargeting" boolean DEFAULT false,
	"smart_routing_timetargeting" boolean DEFAULT false,
	"password_qr_limit" integer,
	"multi_action_qr_limit" integer,
	"action_limit" integer,
	"bulk_qr_limit" integer,
	"bulk_qr_row_limit" integer,
	"api_key_limit" integer DEFAULT 0,
	"api_call_limit" integer,
	"webhook_limit" integer DEFAULT 0,
	"custom_domain_api" boolean DEFAULT false,
	"qr_limit" integer DEFAULT -1,
	"dynamic_qr_limit" integer,
	"static_qr_limit" integer,
	"smart_qr_limit" integer,
	"monthly_scan_limit" integer DEFAULT -1,
	"smart_qr_scan_limit" integer,
	"form_builder_limit" integer,
	"form_field_limit" integer,
	"form_file_upload_limit" integer,
	"form_submission_limit" integer,
	"csv_export_limit" integer,
	"analytics_export_days" integer DEFAULT 30,
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "platform_config" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"user_email" varchar(255),
	"type" varchar(50) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qr_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_id" uuid NOT NULL,
	"label" text,
	"action_type" text NOT NULL,
	"action_value" text,
	"icon" text,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" varchar(20) NOT NULL,
	"short_code" varchar(10) NOT NULL,
	"target_url" text,
	"is_dynamic" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'active',
	"deleted_at" timestamp,
	"password_hash" varchar(60),
	"design_config" jsonb,
	"bulk_job_id" uuid,
	"scan_count" integer DEFAULT 0,
	"custom_type_id" uuid,
	"custom_type_payload" jsonb,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "qr_codes_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "qr_redirect_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_id" uuid NOT NULL,
	"old_url" text,
	"new_url" text,
	"changed_by" uuid,
	"changed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rate_limit_violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"user_id" uuid,
	"endpoint" text,
	"violation_type" varchar(50),
	"violation_details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resolver_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resolver_id" uuid NOT NULL,
	"qr_id" uuid,
	"scan_context" jsonb NOT NULL,
	"resolver_status" integer,
	"resolver_latency_ms" integer,
	"response_type" varchar(20),
	"fallback_used" boolean DEFAULT false,
	"is_test" boolean DEFAULT false,
	"called_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_id" uuid NOT NULL,
	"priority" integer DEFAULT 0,
	"conditions" jsonb NOT NULL,
	"target_url" text NOT NULL,
	"label" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scan_daily_rollups" (
	"qr_id" uuid NOT NULL,
	"date" date NOT NULL,
	"total_scans" integer DEFAULT 0,
	"unique_scans" integer DEFAULT 0,
	"bot_scans" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "scan_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_id" uuid NOT NULL,
	"scanned_at" timestamp DEFAULT now(),
	"country" text,
	"city" text,
	"device_type" text,
	"os" text,
	"browser" text,
	"ip_hash" text,
	"is_bot" boolean DEFAULT false,
	"is_unique" boolean DEFAULT true,
	"matched_rule_id" uuid
);
--> statement-breakpoint
CREATE TABLE "type_marketplace_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending',
	"notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "type_resolvers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" uuid NOT NULL,
	"resolver_url" text NOT NULL,
	"resolver_secret" text NOT NULL,
	"timeout_ms" integer DEFAULT 3000,
	"fallback_url" text,
	"fallback_html" text,
	"retry_on_fail" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"total_calls" bigint DEFAULT 0,
	"total_errors" bigint DEFAULT 0,
	"avg_latency_ms" integer DEFAULT 0,
	"last_called_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "type_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" uuid NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(200) NOT NULL,
	"template_html" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_alert_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"channel_type" varchar(20) NOT NULL,
	"webhook_url" text,
	"email" text,
	"threshold_pct" integer DEFAULT 80,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_monthly_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month" date NOT NULL,
	"api_calls" integer DEFAULT 0,
	"image_renders" integer DEFAULT 0,
	"embed_renders" integer DEFAULT 0,
	"resolver_calls" integer DEFAULT 0,
	"overage_calls" integer DEFAULT 0,
	"overage_usd" numeric(10, 4) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_id" uuid NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_rate_limit_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"override" jsonb NOT NULL,
	"reason" text,
	"created_by_admin_id" uuid,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(200),
	"avatar_url" text,
	"plan" varchar(20) DEFAULT 'free' NOT NULL,
	"plan_expires_at" timestamp,
	"is_suspended" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"suspension_reason" text,
	"stripe_customer_id" varchar(100),
	"stripe_subscription_id" varchar(100),
	"billing_status" varchar(30) DEFAULT 'active',
	"trial_ends_at" timestamp,
	"next_billing_date" timestamp,
	"lifetime_value_cents" integer DEFAULT 0,
	"allow_overages" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"event_type" text,
	"payload" jsonb,
	"signature" text,
	"response_status" text,
	"delivered_at" timestamp,
	"attempts" integer DEFAULT 0,
	"next_retry_at" timestamp,
	"duration_ms" integer,
	"status" text DEFAULT 'pending',
	"filter_config" jsonb
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint_url" text NOT NULL,
	"events" text[] NOT NULL,
	"secret" text,
	"filter_config" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "api_usage_events" ADD CONSTRAINT "api_usage_events_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage_events" ADD CONSTRAINT "api_usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_registrations" ADD CONSTRAINT "competition_registrations_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_qr_types" ADD CONSTRAINT "custom_qr_types_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_feedback" ADD CONSTRAINT "platform_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_custom_type_id_custom_qr_types_id_fk" FOREIGN KEY ("custom_type_id") REFERENCES "public"."custom_qr_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_redirect_history" ADD CONSTRAINT "qr_redirect_history_qr_id_qr_codes_id_fk" FOREIGN KEY ("qr_id") REFERENCES "public"."qr_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resolver_calls" ADD CONSTRAINT "resolver_calls_resolver_id_type_resolvers_id_fk" FOREIGN KEY ("resolver_id") REFERENCES "public"."type_resolvers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resolver_calls" ADD CONSTRAINT "resolver_calls_qr_id_qr_codes_id_fk" FOREIGN KEY ("qr_id") REFERENCES "public"."qr_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_marketplace_submissions" ADD CONSTRAINT "type_marketplace_submissions_type_id_custom_qr_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."custom_qr_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_marketplace_submissions" ADD CONSTRAINT "type_marketplace_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_resolvers" ADD CONSTRAINT "type_resolvers_type_id_custom_qr_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."custom_qr_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "type_templates" ADD CONSTRAINT "type_templates_type_id_custom_qr_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."custom_qr_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_alert_channels" ADD CONSTRAINT "usage_alert_channels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_monthly_snapshots" ADD CONSTRAINT "usage_monthly_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rate_limit_overrides" ADD CONSTRAINT "user_rate_limit_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_usage_key_month" ON "api_usage_events" USING btree ("api_key_id","called_at");--> statement-breakpoint
CREATE INDEX "idx_usage_user_month" ON "api_usage_events" USING btree ("user_id","called_at");--> statement-breakpoint
CREATE INDEX "idx_usage_endpoint" ON "api_usage_events" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "idx_custom_types_public" ON "custom_qr_types" USING btree ("is_public","is_verified") WHERE "custom_qr_types"."is_public" = $1;--> statement-breakpoint
CREATE INDEX "idx_resolver_calls_resolver" ON "resolver_calls" USING btree ("resolver_id","called_at");--> statement-breakpoint
CREATE INDEX "idx_resolver_calls_errors" ON "resolver_calls" USING btree ("resolver_id","called_at") WHERE resolver_status >= 400 OR resolver_status IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_type_templates_type_slug" ON "type_templates" USING btree ("type_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_usage_snapshots_user_month" ON "usage_monthly_snapshots" USING btree ("user_id","month");