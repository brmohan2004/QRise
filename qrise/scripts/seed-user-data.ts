import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seedUserData() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('❌ Usage: npx tsx scripts/seed-user-data.ts <userId>');
    process.exit(1);
  }

  console.log(`🌱 Seeding data for user: ${userId}...`);

  try {
    // 1. Create some QR Codes
    console.log('Creating QR codes...');
    const qr1 = await db.insert(schema.qrCodes).values({
      userId,
      name: 'Test QR 1',
      type: 'url',
      shortCode: Math.random().toString(36).substring(7),
      targetUrl: 'https://google.com',
      isDynamic: true,
    }).returning();

    const qr2 = await db.insert(schema.qrCodes).values({
      userId,
      name: 'Test QR 2',
      type: 'url',
      shortCode: Math.random().toString(36).substring(7),
      targetUrl: 'https://github.com',
      isDynamic: true,
    }).returning();

    // 2. Create some Scan Events
    console.log('Creating scan events...');
    await db.insert(schema.scanEvents).values([
      { qrId: qr1[0].id, ipHash: 'dummy_hash_1', browser: 'Mozilla', scannedAt: new Date() },
      { qrId: qr1[0].id, ipHash: 'dummy_hash_2', browser: 'Chrome', scannedAt: new Date() },
      { qrId: qr2[0].id, ipHash: 'dummy_hash_3', browser: 'Safari', scannedAt: new Date() },
    ]);

    // 2.5 Create an API Key
    console.log('Creating API key...');
    const apiKey = await db.insert(schema.apiKeys).values({
      userId,
      name: 'Test Key ' + Math.random().toString(36).substring(7),
      keyPrefix: 'qr_',
      keyHash: uuidv4(),
      scopes: ['all'],
    }).returning();

    // 3. Create API Usage Events
    console.log('Creating API usage events...');
    await db.insert(schema.apiUsageEvents).values([
      { userId, apiKeyId: apiKey[0].id, endpoint: '/api/v1/qr', method: 'GET', statusCode: 200, requestId: uuidv4(), calledAt: new Date() },
      { userId, apiKeyId: apiKey[0].id, endpoint: '/api/v1/qr', method: 'POST', statusCode: 201, requestId: uuidv4(), calledAt: new Date() },
    ]);

    // 4. Create a Form and Submissions
    console.log('Creating form and submissions...');
    const form = await db.insert(schema.forms).values({
      userId,
      qrId: qr1[0].id,
      name: 'Feedback Form ' + Math.random().toString(36).substring(7),
      slug: 'feedback-' + Math.random().toString(36).substring(7),
      fieldsSchema: [{ label: 'Name', type: 'text', required: true }],
    }).returning();

    await db.insert(schema.formSubmissions).values([
      { formId: form[0].id, submissionData: { Name: 'Alice' } },
      { formId: form[0].id, submissionData: { Name: 'Bob' } },
    ]);

    console.log('\n✅ Seeding complete! The user now has real usage data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedUserData().catch(console.error);
