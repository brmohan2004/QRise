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

async function configurePlans() {
  console.log('🚀 Starting Plan Configuration...');

  const planTiers = [
    {
      name: 'Free',
      description: 'Perfect for hobbyists and individual developers.',
      priceMonthly: '0.00',
      priceAnnual: '0.00',
      isPubliclyVisible: true,
      sortOrder: 0,
      // Features
      hasAnalytics: true,
      hasApiAccess: true,
      hasBulkGenerator: false,
      hasDesignStudio: true,
      hasSmartRouting: false,
      hasPasswordQr: true,
      hasMultiActionQr: false,
      hasFormBuilder: true,
      // Limits
      qrLimit: 10,
      dynamicQrLimit: 5,
      monthlyScanLimit: 100,
      apiCallLimit: 1000,
      formBuilderLimit: 2,
      formSubmissionLimit: 50,
      customTypeLimit: 2,
      // Rate Limits (API)
      rpm: 20,
      rpd: 500,
      maxBurst: 5,
    },
    {
      name: 'Pro',
      description: 'Advanced features for scaling businesses.',
      priceMonthly: '49.00',
      priceAnnual: '490.00',
      isPubliclyVisible: true,
      sortOrder: 1,
      // Features
      hasAnalytics: true,
      hasApiAccess: true,
      hasBulkGenerator: true,
      hasDesignStudio: true,
      hasSmartRouting: true,
      hasPasswordQr: true,
      hasMultiActionQr: true,
      hasFormBuilder: true,
      // Limits
      qrLimit: -1,
      dynamicQrLimit: 100,
      monthlyScanLimit: 10000,
      apiCallLimit: 50000,
      formBuilderLimit: 20,
      formSubmissionLimit: 1000,
      customTypeLimit: 10,
      // Rate Limits (API)
      rpm: 100,
      rpd: 5000,
      maxBurst: 20,
    }
  ];

  for (const tier of planTiers) {
    console.log(`\n📦 Configuring ${tier.name} plan...`);

    // 1. Update/Insert in 'plans' table
    const existingPlan = await db.query.plans.findFirst({
      where: eq(schema.plans.name, tier.name)
    });

    if (existingPlan) {
      console.log(`Updating existing ${tier.name} plan features...`);
      await db.update(schema.plans)
        .set({
          description: tier.description,
          priceMonthly: tier.priceMonthly,
          priceAnnual: tier.priceAnnual,
          isPubliclyVisible: tier.isPubliclyVisible,
          sortOrder: tier.sortOrder,
          hasAnalytics: tier.hasAnalytics,
          hasApiAccess: tier.hasApiAccess,
          hasBulkGenerator: tier.hasBulkGenerator,
          hasDesignStudio: tier.hasDesignStudio,
          hasSmartRouting: tier.hasSmartRouting,
          hasPasswordQr: tier.hasPasswordQr,
          hasMultiActionQr: tier.hasMultiActionQr,
          hasFormBuilder: tier.hasFormBuilder,
          qrLimit: tier.qrLimit,
          dynamicQrLimit: tier.dynamicQrLimit,
          monthlyScanLimit: tier.monthlyScanLimit,
          apiCallLimit: tier.apiCallLimit,
          formBuilderLimit: tier.formBuilderLimit,
          formSubmissionLimit: tier.formSubmissionLimit,
          customTypeLimit: tier.customTypeLimit,
          updatedAt: new Date(),
        })
        .where(eq(schema.plans.id, existingPlan.id));
    } else {
      console.log(`Creating new ${tier.name} plan...`);
      await db.insert(schema.plans).values({
        name: tier.name,
        description: tier.description,
        priceMonthly: tier.priceMonthly,
        priceAnnual: tier.priceAnnual,
        isPubliclyVisible: tier.isPubliclyVisible,
        sortOrder: tier.sortOrder,
        hasAnalytics: tier.hasAnalytics,
        hasApiAccess: tier.hasApiAccess,
        hasBulkGenerator: tier.hasBulkGenerator,
        hasDesignStudio: tier.hasDesignStudio,
        hasSmartRouting: tier.hasSmartRouting,
        hasPasswordQr: tier.hasPasswordQr,
        hasMultiActionQr: tier.hasMultiActionQr,
        hasFormBuilder: tier.hasFormBuilder,
        qrLimit: tier.qrLimit,
        dynamicQrLimit: tier.dynamicQrLimit,
        monthlyScanLimit: tier.monthlyScanLimit,
        apiCallLimit: tier.apiCallLimit,
        formBuilderLimit: tier.formBuilderLimit,
        formSubmissionLimit: tier.formSubmissionLimit,
        customTypeLimit: tier.customTypeLimit,
      });
    }

    // 2. Update/Insert in 'plan_rate_limits' table
    const existingRateLimit = await db.query.planRateLimits.findFirst({
      where: eq(schema.planRateLimits.plan, tier.name.toLowerCase())
    });

    const rlData = {
      plan: tier.name.toLowerCase(),
      rpm: tier.rpm,
      rpd: tier.rpd,
      maxBurst: tier.maxBurst,
      apiCallsPerMonth: tier.apiCallLimit,
      imageRendersPerMonth: tier.monthlyScanLimit, // Assuming scan limit maps to image renders or similar
      maxCustomTypes: tier.name === 'Pro' ? 10 : 2,
      maxWebhooks: tier.name === 'Pro' ? 10 : 2,
      updatedAt: new Date(),
    };

    if (existingRateLimit) {
      console.log(`Updating rate limits for ${tier.name}...`);
      await db.update(schema.planRateLimits)
        .set(rlData)
        .where(eq(schema.planRateLimits.id, existingRateLimit.id));
    } else {
      console.log(`Creating rate limits for ${tier.name}...`);
      await db.insert(schema.planRateLimits).values(rlData);
    }
  }

  console.log('\n✅ Plan configuration complete!');
  process.exit(0);
}

configurePlans().catch((err) => {
  console.error('❌ Configuration failed:', err);
  process.exit(1);
});
