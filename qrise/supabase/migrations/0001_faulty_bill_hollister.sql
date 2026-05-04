ALTER TABLE "plan_rate_limits" ADD COLUMN "max_dynamic_qrs" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_rate_limits" ADD COLUMN "form_builder_limit" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_rate_limits" ADD COLUMN "form_submission_limit" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "custom_type_limit" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "destination_type" varchar(10) DEFAULT 'url';--> statement-breakpoint
ALTER TABLE "routing_rules" ADD COLUMN "destination_type" varchar(10) DEFAULT 'url';--> statement-breakpoint
CREATE INDEX "idx_api_keys_user_id" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_scan_qr_id" ON "scan_events" USING btree ("qr_id");--> statement-breakpoint
CREATE INDEX "idx_scan_scanned_at" ON "scan_events" USING btree ("scanned_at");--> statement-breakpoint
CREATE INDEX "idx_webhook_del_webhook_id" ON "webhook_deliveries" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_del_status" ON "webhook_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_webhook_del_next_retry" ON "webhook_deliveries" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "idx_webhooks_user_id" ON "webhooks" USING btree ("user_id");