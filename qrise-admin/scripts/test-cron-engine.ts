import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// We simulate calling the admin API which in turn calls the main app
// For this test to work in local environment, we call the admin API route directly 
// or simulate the logic if we don't want to rely on the server running.
// However, since the user wants to test the "triggers", calling the local API is best.

const ADMIN_API_BASE = 'http://localhost:3001/api/admin/infra/cron';
const CRON_JOBS = [
  'cleanup',
  'reset-api-counts',
  'retry-webhooks',
  'sync-stripe',
  'generate-daily-reports',
  'check-system-health',
  'prune-audit-logs',
  'warm-cache',
  'verify-subscriptions',
  'clear-expired-blocks'
];

async function testCronEngine() {
  console.log('🚀 Starting Cron Engine Connectivity Test...\n');
  console.log(`Target Admin API: ${ADMIN_API_BASE}\n`);

  let successCount = 0;

  for (const job of CRON_JOBS) {
    process.stdout.write(`Triggering [${job}]... `);
    
    try {
      // Note: We need a valid session to call the API if it uses verifyAdmin.
      // Since this is a test script, we might need to bypass or provide a token.
      // However, for a simple connectivity test, we can check if the routes are reachable.
      
      // For local testing, we prioritize localhost:3000 to reach the local qrise app
      const mainAppUrl = 'http://localhost:3000';
      const cronSecret = process.env.CRON_SECRET;

      if (!cronSecret) {
        console.log('❌ FAILED (Missing CRON_SECRET in .env)');
        continue;
      }

      const res = await fetch(`${mainAppUrl}/api/cron/${job}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ SUCCESS (${res.status})`);
        console.log(`   Response: ${JSON.stringify(data)}`);
        successCount++;
      } else {
        const text = await res.text();
        console.log(`❌ FAILED (${res.status})`);
        console.log(`   Error: ${text.substring(0, 100)}`);
      }
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }

  console.log(`\n--- Test Summary ---`);
  console.log(`Total Jobs: ${CRON_JOBS.length}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${CRON_JOBS.length - successCount}`);

  if (successCount === CRON_JOBS.length) {
    console.log('\n✨ All Cron Triggers are working correctly!');
  } else {
    console.log('\n⚠️ Some triggers failed. Check your CRON_SECRET and main app status.');
  }
}

testCronEngine().catch(console.error);
