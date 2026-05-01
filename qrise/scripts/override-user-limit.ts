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

async function overrideUserLimit() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('❌ Usage: npx tsx scripts/override-user-limit.ts <userId>');
    process.exit(1);
  }

  console.log(`🧪 Overriding limits for user: ${userId}...`);

  // Define the override: set everything to 0 or 1 to trigger "reached limitation"
  const overrideValues = {
    monthlyScanLimit: 0,
    dynamicQrLimit: 0,
    apiCallLimit: 0,
    formBuilderLimit: 0,
    formSubmissionLimit: 0,
    maxWebhooks: 0,
    maxCustomTypes: 0,
    rpm: 1, 
  };

  try {
    // 1. Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    });

    if (!user) {
      console.error(`❌ User with ID ${userId} not found.`);
      process.exit(1);
    }

    // 2. Insert or Update override
    const existingOverride = await db.query.userRateLimitOverrides.findFirst({
      where: eq(schema.userRateLimitOverrides.userId, userId)
    });

    if (existingOverride) {
      console.log('Updating existing override...');
      await db.update(schema.userRateLimitOverrides)
        .set({
          override: overrideValues,
          reason: 'Manual test override for UI limitation check',
          createdAt: new Date(),
        })
        .where(eq(schema.userRateLimitOverrides.id, existingOverride.id));
    } else {
      console.log('Creating new override...');
      await db.insert(schema.userRateLimitOverrides).values({
        userId: userId,
        override: overrideValues,
        reason: 'Manual test override for UI limitation check',
      });
    }

    console.log('\n✅ Override applied! The user will now see "quota finished" for all metrics.');
    console.log('NOTE: Ensure the /api/user/usage route is updated to respect these overrides.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error applying override:', err);
    process.exit(1);
  }
}

overrideUserLimit().catch(console.error);
