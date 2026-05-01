import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function setTestLimits() {
  console.log('🧪 Setting extremely low limits for Free plan to test "Quota Finished" UI...');

  const tierName = 'Free';
  
  // 1. Update Features/Limits in 'plans'
  const plan = await db.query.plans.findFirst({
    where: eq(schema.plans.name, tierName)
  });

  if (!plan) {
    console.error('❌ Free plan not found. Please run configure-plans.ts first.');
    process.exit(1);
  }

  console.log('📉 Setting limits to 1 for Free plan...');
  await db.update(schema.plans)
    .set({
      qrLimit: 1,
      dynamicQrLimit: 1,
      monthlyScanLimit: 1,
      apiCallLimit: 1,
      formBuilderLimit: 1,
      formSubmissionLimit: 1,
      customTypeLimit: 1,
      updatedAt: new Date(),
    })
    .where(eq(schema.plans.id, plan.id));

  // 2. Update Rate Limits (API)
  const rateLimit = await db.query.planRateLimits.findFirst({
    where: eq(schema.planRateLimits.plan, tierName.toLowerCase())
  });

  if (rateLimit) {
    await db.update(schema.planRateLimits)
      .set({
        rpm: 1,
        rpd: 5,
        maxBurst: 0,
        apiCallsPerMonth: 1,
        updatedAt: new Date(),
      })
      .where(eq(schema.planRateLimits.id, rateLimit.id));
  }

  console.log('\n✅ Test limits applied! Free users will now see "quota finished" after 1 action.');
  process.exit(0);
}

setTestLimits().catch((err) => {
  console.error('❌ Failed to set test limits:', err);
  process.exit(1);
});
