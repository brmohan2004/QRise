# QRise Database Schema

*Generated at: 30/4/2026, 4:56:14 pm*

### `abuse_reports`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `qr_id` | `uuid` | YES | `-` |
| `reported_by` | `uuid` | YES | `-` |
| `reason` | `character varying(200)` | NO | `-` |
| `details` | `text` | YES | `-` |
| `status` | `character varying(20)` | YES | `'pending'::character varying` |
| `reviewed_by` | `uuid` | YES | `-` |
| `action_taken` | `character varying(200)` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `admin_audit_log`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `admin_user_id` | `uuid` | NO | `-` |
| `action` | `character varying(100)` | NO | `-` |
| `target_type` | `character varying(50)` | YES | `-` |
| `target_id` | `uuid` | YES | `-` |
| `details` | `jsonb` | YES | `-` |
| `ip_address` | `character varying(45)` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `announcements`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `message` | `text` | NO | `-` |
| `type` | `character varying(20)` | YES | `'info'::character varying` |
| `link_text` | `character varying(100)` | YES | `-` |
| `link_url` | `character varying(500)` | YES | `-` |
| `is_active` | `boolean` | YES | `true` |
| `show_to_plans` | `ARRAY` | YES | `-` |
| `starts_at` | `timestamp without time zone` | YES | `now()` |
| `ends_at` | `timestamp without time zone` | YES | `-` |
| `created_by` | `uuid` | NO | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `api_keys`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `user_id` | `uuid` | NO | `-` |
| `name` | `character varying(255)` | YES | `-` |
| `key_prefix` | `character varying(50)` | YES | `-` |
| `key_hash` | `character varying(255)` | NO | `-` |
| `scopes` | `ARRAY` | NO | `'{}'::text[]` |
| `is_active` | `boolean` | YES | `true` |
| `admin_call_limit_override` | `jsonb` | YES | `-` |
| `last_used_at` | `timestamp without time zone` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `billing_events`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `user_id` | `uuid` | YES | `-` |
| `stripe_event_id` | `character varying(100)` | YES | `-` |
| `event_type` | `character varying(100)` | NO | `-` |
| `amount_cents` | `integer` | YES | `-` |
| `currency` | `character varying(10)` | YES | `'usd'::character varying` |
| `plan` | `character varying(50)` | YES | `-` |
| `status` | `character varying(30)` | YES | `-` |
| `stripe_invoice_id` | `character varying(100)` | YES | `-` |
| `stripe_customer_id` | `character varying(100)` | YES | `-` |
| `failure_reason` | `text` | YES | `-` |
| `metadata` | `jsonb` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `bulk_jobs`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `user_id` | `uuid` | NO | `-` |
| `status` | `text` | NO | `'queued'::text` |
| `total_rows` | `integer` | NO | `-` |
| `processed_rows` | `integer` | YES | `0` |
| `zip_url` | `text` | YES | `-` |
| `error_log` | `jsonb` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |
| `zip_file_key` | `text` | YES | `-` |

### `competition_registrations`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `competition_id` | `uuid` | YES | `-` |
| `user_id` | `uuid` | YES | `-` |
| `form_data` | `jsonb` | NO | `-` |
| `email` | `character varying(300)` | NO | `-` |
| `status` | `character varying(30)` | YES | `'registered'::character varying` |
| `registered_at` | `timestamp without time zone` | YES | `now()` |

### `competitions`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `title` | `character varying(300)` | NO | `-` |
| `slug` | `character varying(200)` | NO | `-` |
| `description` | `text` | YES | `-` |
| `prize_details` | `text` | YES | `-` |
| `start_date` | `timestamp without time zone` | YES | `-` |
| `end_date` | `timestamp without time zone` | YES | `-` |
| `registration_deadline` | `timestamp without time zone` | YES | `-` |
| `is_public` | `boolean` | YES | `false` |
| `is_registration_open` | `boolean` | YES | `true` |
| `custom_page_html` | `text` | YES | `-` |
| `custom_components_json` | `jsonb` | YES | `-` |
| `registration_form_schema` | `jsonb` | YES | `-` |
| `max_participants` | `integer` | YES | `-` |
| `current_participants` | `integer` | YES | `0` |
| `created_by` | `uuid` | NO | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |

### `coupon_redemptions`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `coupon_id` | `uuid` | YES | `-` |
| `user_id` | `uuid` | NO | `-` |
| `plan` | `character varying(50)` | YES | `-` |
| `discount_applied` | `numeric` | YES | `-` |
| `redeemed_at` | `timestamp without time zone` | YES | `now()` |

### `coupons`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `code` | `character varying(50)` | NO | `-` |
| `description` | `text` | YES | `-` |
| `discount_type` | `character varying(20)` | NO | `-` |
| `discount_value` | `numeric` | NO | `-` |
| `applies_to_plans` | `ARRAY` | YES | `-` |
| `max_uses` | `integer` | YES | `-` |
| `uses_count` | `integer` | YES | `0` |
| `valid_from` | `timestamp without time zone` | YES | `-` |
| `valid_until` | `timestamp without time zone` | YES | `-` |
| `is_active` | `boolean` | YES | `true` |
| `created_by` | `uuid` | NO | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |

### `feature_flags`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `key` | `character varying(100)` | NO | `-` |
| `name` | `character varying(200)` | NO | `-` |
| `description` | `text` | YES | `-` |
| `is_enabled` | `boolean` | YES | `true` |
| `enabled_for_plans` | `ARRAY` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |

### `features_quiz`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `feature_name` | `character varying(200)` | NO | `-` |
| `hint_text` | `text` | NO | `-` |
| `answer_hash` | `character varying(64)` | NO | `-` |
| `image_url` | `character varying(500)` | YES | `-` |
| `gift_code` | `character varying(50)` | YES | `-` |
| `correct_guesses` | `integer` | YES | `0` |
| `is_visible` | `boolean` | YES | `false` |
| `is_revealed` | `boolean` | YES | `false` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `form_submissions`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `form_id` | `uuid` | NO | `-` |
| `submission_data` | `jsonb` | YES | `-` |
| `submitted_at` | `timestamp without time zone` | YES | `now()` |
| `ip_hash` | `text` | YES | `-` |

### `forms`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `user_id` | `uuid` | NO | `-` |
| `qr_id` | `uuid` | YES | `-` |
| `name` | `text` | NO | `-` |
| `slug` | `text` | NO | `-` |
| `fields_schema` | `jsonb` | NO | `-` |
| `success_message` | `text` | YES | `-` |
| `is_active` | `boolean` | YES | `true` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |
| `is_deleted` | `boolean` | YES | `false` |

### `ip_blocks`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `ip_address` | `character varying(45)` | NO | `-` |
| `cidr_range` | `character varying(50)` | YES | `-` |
| `reason` | `text` | NO | `-` |
| `block_type` | `character varying(20)` | YES | `'temporary'::character varying` |
| `expires_at` | `timestamp without time zone` | YES | `-` |
| `blocked_by` | `uuid` | NO | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `unblocked_at` | `timestamp without time zone` | YES | `-` |
| `unblocked_by` | `uuid` | YES | `-` |

### `maintenance_windows`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `title` | `character varying(300)` | NO | `-` |
| `message` | `text` | NO | `-` |
| `starts_at` | `timestamp without time zone` | NO | `-` |
| `ends_at` | `timestamp without time zone` | YES | `-` |
| `is_active` | `boolean` | YES | `false` |
| `allow_read_only` | `boolean` | YES | `true` |
| `affected_features` | `ARRAY` | YES | `-` |
| `created_by` | `uuid` | NO | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `notifications`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `admin_id` | `uuid` | NO | `-` |
| `type` | `character varying(20)` | NO | `'email'::character varying` |
| `subject` | `character varying(500)` | YES | `-` |
| `body` | `text` | NO | `-` |
| `target_type` | `character varying(30)` | YES | `'all'::character varying` |
| `target_id` | `uuid` | YES | `-` |
| `target_plan` | `character varying(50)` | YES | `-` |
| `segment` | `jsonb` | YES | `-` |
| `recipient_count` | `integer` | YES | `-` |
| `status` | `character varying(20)` | YES | `'draft'::character varying` |
| `sent_at` | `timestamp without time zone` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `category` | `character varying(30)` | YES | `'alert'::character varying` |

### `plans`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `name` | `character varying(100)` | NO | `-` |
| `has_analytics` | `boolean` | YES | `false` |
| `has_design_studio` | `boolean` | YES | `false` |
| `has_smart_routing` | `boolean` | YES | `false` |
| `price_monthly` | `numeric` | YES | `-` |
| `price_annual` | `numeric` | YES | `-` |
| `description` | `text` | YES | `-` |
| `is_publicly_visible` | `boolean` | YES | `true` |
| `sort_order` | `integer` | YES | `0` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |
| `has_api_access` | `boolean` | YES | `false` |
| `has_bulk_generator` | `boolean` | YES | `false` |
| `has_password_qr` | `boolean` | YES | `false` |
| `has_multi_action_qr` | `boolean` | YES | `false` |
| `has_analytics_export` | `boolean` | YES | `false` |
| `has_form_builder` | `boolean` | YES | `false` |
| `design_studio_color_limit` | `integer` | YES | `-` |
| `design_studio_dot_pattern_limit` | `integer` | YES | `-` |
| `design_studio_logo_limit` | `integer` | YES | `-` |
| `design_studio_frame_limit` | `integer` | YES | `-` |
| `design_studio_eye_shape_limit` | `integer` | YES | `-` |
| `design_studio_eye_color_limit` | `integer` | YES | `-` |
| `design_studio_frame_color_limit` | `integer` | YES | `-` |
| `design_studio_style_limit` | `integer` | YES | `-` |
| `smart_routing_rule_limit` | `integer` | YES | `-` |
| `smart_routing_geotargeting` | `boolean` | YES | `false` |
| `smart_routing_devicetargeting` | `boolean` | YES | `false` |
| `smart_routing_timetargeting` | `boolean` | YES | `false` |
| `password_qr_limit` | `integer` | YES | `-` |
| `multi_action_qr_limit` | `integer` | YES | `-` |
| `action_limit` | `integer` | YES | `-` |
| `bulk_qr_limit` | `integer` | YES | `-` |
| `bulk_qr_row_limit` | `integer` | YES | `-` |
| `api_key_limit` | `integer` | YES | `0` |
| `api_call_limit` | `integer` | YES | `-` |
| `webhook_limit` | `integer` | YES | `0` |
| `custom_domain_api` | `boolean` | YES | `false` |
| `qr_limit` | `integer` | YES | `'-1'::integer` |
| `dynamic_qr_limit` | `integer` | YES | `-` |
| `static_qr_limit` | `integer` | YES | `-` |
| `smart_qr_limit` | `integer` | YES | `-` |
| `monthly_scan_limit` | `integer` | YES | `'-1'::integer` |
| `smart_qr_scan_limit` | `integer` | YES | `-` |
| `form_builder_limit` | `integer` | YES | `-` |
| `form_field_limit` | `integer` | YES | `-` |
| `form_file_upload_limit` | `integer` | YES | `-` |
| `form_submission_limit` | `integer` | YES | `-` |
| `csv_export_limit` | `integer` | YES | `-` |
| `analytics_export_days` | `integer` | YES | `30` |
| `is_overage_enabled` | `boolean` | YES | `false` |
| `api_unit_price` | `numeric` | YES | `0.001` |

### `platform_config`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `key` | `character varying(100)` | NO | `-` |
| `value` | `jsonb` | NO | `-` |
| `description` | `text` | YES | `-` |
| `updated_by` | `uuid` | YES | `-` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |

### `platform_feedback`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `user_id` | `uuid` | YES | `-` |
| `type` | `character varying(50)` | NO | `-` |
| `subject` | `character varying(255)` | NO | `-` |
| `content` | `text` | NO | `-` |
| `status` | `character varying(20)` | NO | `'pending'::character varying` |
| `created_at` | `timestamp with time zone` | YES | `now()` |
| `updated_at` | `timestamp with time zone` | YES | `now()` |
| `user_email` | `character varying(255)` | YES | `-` |

### `qr_actions`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `qr_id` | `uuid` | NO | `-` |
| `label` | `text` | YES | `-` |
| `action_type` | `text` | NO | `-` |
| `action_value` | `text` | YES | `-` |
| `icon` | `text` | YES | `-` |
| `display_order` | `integer` | YES | `0` |

### `qr_codes`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `user_id` | `uuid` | NO | `-` |
| `name` | `character varying(200)` | NO | `-` |
| `type` | `character varying(20)` | NO | `-` |
| `short_code` | `character varying(10)` | NO | `-` |
| `target_url` | `text` | YES | `-` |
| `is_dynamic` | `boolean` | YES | `true` |
| `is_active` | `boolean` | YES | `true` |
| `password_hash` | `character varying(60)` | YES | `-` |
| `design_config` | `jsonb` | YES | `-` |
| `bulk_job_id` | `uuid` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |
| `is_deleted` | `boolean` | YES | `false` |
| `scan_count` | `integer` | YES | `0` |
| `status` | `character varying(20)` | YES | `'active'::character varying` |
| `deleted_at` | `timestamp without time zone` | YES | `-` |

### `qr_redirect_history`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `qr_id` | `uuid` | NO | `-` |
| `old_url` | `text` | YES | `-` |
| `new_url` | `text` | YES | `-` |
| `changed_by` | `uuid` | YES | `-` |
| `changed_at` | `timestamp without time zone` | YES | `now()` |

### `rate_limit_config`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `plan_name` | `character varying(50)` | NO | `-` |
| `requests_per_minute` | `integer` | NO | `-` |
| `requests_per_hour` | `integer` | NO | `-` |
| `requests_per_day` | `integer` | NO | `-` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |

### `rate_limit_violations`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `api_key_id` | `uuid` | YES | `-` |
| `user_id` | `uuid` | YES | `-` |
| `ip_address` | `character varying(45)` | YES | `-` |
| `endpoint` | `character varying(200)` | YES | `-` |
| `violations_count` | `integer` | YES | `1` |
| `window_start` | `timestamp without time zone` | NO | `-` |
| `window_end` | `timestamp without time zone` | NO | `-` |
| `auto_action_taken` | `character varying(50)` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `routing_rules`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `qr_id` | `uuid` | NO | `-` |
| `priority` | `integer` | YES | `0` |
| `conditions` | `jsonb` | NO | `-` |
| `target_url` | `text` | NO | `-` |
| `label` | `text` | YES | `-` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `scan_daily_rollups`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `qr_id` | `uuid` | NO | `-` |
| `date` | `date` | NO | `-` |
| `total_scans` | `integer` | YES | `0` |
| `unique_scans` | `integer` | YES | `0` |
| `bot_scans` | `integer` | YES | `0` |

### `scan_events`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `qr_id` | `uuid` | NO | `-` |
| `scanned_at` | `timestamp without time zone` | YES | `now()` |
| `country` | `text` | YES | `-` |
| `city` | `text` | YES | `-` |
| `device_type` | `text` | YES | `-` |
| `os` | `text` | YES | `-` |
| `browser` | `text` | YES | `-` |
| `ip_hash` | `text` | YES | `-` |
| `is_bot` | `boolean` | YES | `false` |
| `is_unique` | `boolean` | YES | `true` |
| `matched_rule_id` | `uuid` | YES | `-` |

### `user_notifications`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `user_id` | `uuid` | NO | `-` |
| `notification_id` | `uuid` | NO | `-` |
| `is_read` | `boolean` | YES | `false` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

### `users`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `email` | `character varying(255)` | NO | `-` |
| `full_name` | `character varying(200)` | YES | `-` |
| `avatar_url` | `text` | YES | `-` |
| `plan` | `character varying(20)` | NO | `'free'::character varying` |
| `plan_expires_at` | `timestamp without time zone` | YES | `-` |
| `is_suspended` | `boolean` | YES | `false` |
| `created_at` | `timestamp without time zone` | YES | `now()` |
| `updated_at` | `timestamp without time zone` | YES | `now()` |
| `is_admin` | `boolean` | YES | `false` |
| `suspended_reason` | `text` | YES | `-` |
| `suspended_at` | `timestamp without time zone` | YES | `-` |
| `suspension_reason` | `text` | YES | `-` |
| `stripe_customer_id` | `character varying(100)` | YES | `-` |
| `stripe_subscription_id` | `character varying(100)` | YES | `-` |
| `billing_status` | `character varying(30)` | YES | `'active'::character varying` |
| `trial_ends_at` | `timestamp without time zone` | YES | `-` |
| `next_billing_date` | `timestamp without time zone` | YES | `-` |
| `lifetime_value_cents` | `integer` | YES | `0` |

### `webhook_deliveries`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `webhook_id` | `uuid` | NO | `-` |
| `event_type` | `text` | YES | `-` |
| `payload` | `jsonb` | YES | `-` |
| `response_status` | `text` | YES | `-` |
| `delivered_at` | `timestamp with time zone` | YES | `now()` |
| `attempts` | `text` | YES | `'0'::text` |

### `webhooks`

| Column | Type | Nullable | Default |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` |
| `user_id` | `uuid` | NO | `-` |
| `endpoint_url` | `text` | NO | `-` |
| `events` | `ARRAY` | NO | `-` |
| `secret_hash` | `text` | YES | `-` |
| `is_active` | `boolean` | YES | `true` |
| `created_at` | `timestamp without time zone` | YES | `now()` |

