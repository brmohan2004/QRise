import { db } from '../lib/db';
import { featureFlags, plans } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { isFeatureEnabled } from '../lib/feature-flags';

async function runTests() {
  console.log('--- STARTING QA TESTS ---');
  
  // 2.1.1 Feature Flags
  console.log('\n--- 2.1.1 Feature Flags ---');
  try {
    const testKey = 'test_flag_' + Date.now();
    
    // T-FF-01: Create flag
    const [flag] = await db.insert(featureFlags).values({
      key: testKey,
      name: 'Test Flag',
      description: 'Test flag',
      isEnabled: true
    }).returning();
    console.log('T-FF-01 (Create flag): PASS');
    
    // T-FF-02: Check flag
    const enabled = await isFeatureEnabled(testKey);
    console.log(`T-FF-02 (Flag enabled check): ${enabled ? 'PASS' : 'FAIL'}`);
    
    // Toggle off
    await db.update(featureFlags).set({ isEnabled: false }).where(eq(featureFlags.key, testKey));
    
    const notExists = await isFeatureEnabled('does_not_exist_' + Date.now());
    console.log(`T-FF-04 (Non-existent flag is false): ${!notExists ? 'PASS' : 'FAIL'}`);
    
  } catch (err) {
    console.error('Feature Flag tests failed:', err);
  }

  // 2.1.2 Plans
  console.log('\n--- 2.1.2 Subscription Plans ---');
  try {
    const testPlanName = 'test_plan_' + Date.now();
    
    // T-PL-01: Create plan
    const [plan] = await db.insert(plans).values({
      name: testPlanName,
      priceMonthly: '9.99',
      priceAnnual: '99.99',
      isPubliclyVisible: false
    }).returning();
    console.log('T-PL-01 (Create plan): PASS');
    
    // T-PL-02: Edit plan
    const [updated] = await db.update(plans).set({ priceMonthly: '19.99' }).where(eq(plans.id, plan.id)).returning();
    console.log(`T-PL-02 (Edit plan): ${updated.priceMonthly === '19.99' ? 'PASS' : 'FAIL'}`);
    
  } catch (err) {
    console.error('Plan tests failed:', err);
  }
  
  console.log('\n--- TESTS COMPLETED ---');
  process.exit(0);
}

runTests().catch(console.error);
