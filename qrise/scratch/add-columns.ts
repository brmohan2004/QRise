import 'dotenv/config';
import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

async function run() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    console.log("Adding columns to qr_codes...");
    await sql`ALTER TABLE "qr_codes" ADD COLUMN IF NOT EXISTS "destination_type" varchar(10) DEFAULT 'url'`;
    console.log("Adding columns to routing_rules...");
    await sql`ALTER TABLE "routing_rules" ADD COLUMN IF NOT EXISTS "destination_type" varchar(10) DEFAULT 'url'`;
    console.log("Adding columns to plan_rate_limits...");
    await sql`ALTER TABLE "plan_rate_limits" ADD COLUMN IF NOT EXISTS "max_dynamic_qrs" integer DEFAULT 50`;
    await sql`ALTER TABLE "plan_rate_limits" ADD COLUMN IF NOT EXISTS "form_builder_limit" integer DEFAULT 0`;
    await sql`ALTER TABLE "plan_rate_limits" ADD COLUMN IF NOT EXISTS "form_submission_limit" integer DEFAULT 0`;
    console.log("Adding columns to plans...");
    await sql`ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "custom_type_limit" integer DEFAULT 0`;
    console.log("Success!");
  } catch (e) {
    console.error("Error adding columns:", e);
  } finally {
    await sql.end();
  }
}

run();
