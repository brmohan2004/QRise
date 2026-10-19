import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { users, qrCodes, scanEvents, forms } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import Stripe from 'stripe';
import * as jose from 'jose';

const client = postgres(process.env.DATABASE_URL!, { 
  ssl: 'require', 
  prepare: false,
  connect_timeout: 10,
  idle_timeout: 5,
  max: 3,
});
const db = drizzle(client, { schema });

interface TestResult {
  suite: string;
  test: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  details?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void | string>) {
  process.stdout.write(`⏳ [${suite}] ${name}... `);
  const start = Date.now();
  
  // Wrap with 15s timeout
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Test timed out after 15s')), 15000)
  );

  try {
    const details = await Promise.race([fn(), timeoutPromise]);
    const duration = Date.now() - start;
    results.push({
      suite,
      test: name,
      status: 'PASSED',
      details: details || 'OK',
      durationMs: duration,
    });
    console.log(`✅ PASSED (${duration}ms)`);
    if (details) console.log(`   └─ ${details}`);
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({
      suite,
      test: name,
      status: 'FAILED',
      details: err?.message || String(err),
      durationMs: duration,
    });
    console.log(`❌ FAILED (${duration}ms)`);
    console.log(`   └─ Error: ${err?.message || err}`);
  }
}

async function main() {
  console.log('==================================================');
  console.log('   STARTING COMPREHENSIVE END-TO-END AUDIT SUITE   ');
  console.log('==================================================\n');

  // 1. SUPABASE AUTH & CREDENTIALS
  await runTest('1. Authentication', 'Verify User Supabase Credentials', async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'mohanbr2004@gmail.com',
      password: 'M0H@Nbr2004',
    });
    if (error) throw new Error(`Supabase Auth failed: ${error.message}`);
    if (!data.user?.id) throw new Error('No user ID returned from login');
    return `Authenticated as ${data.user.email} (ID: ${data.user.id})`;
  });

  // 2. DATABASE INTEGRITY & SCHEMA
  await runTest('2. Database & Drizzle ORM', 'Connect to PostgreSQL via Drizzle', async () => {
    const userList = await db.select().from(users).limit(5);
    return `Connected! Found ${userList.length} users in DB sample.`;
  });

  await runTest('2. Database & Drizzle ORM', 'Check User is Admin in Database', async () => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, 'mohanbr2004@gmail.com'),
    });
    if (!user) throw new Error('User not found in DB users table');
    if (!user.isAdmin) throw new Error('User is not marked as isAdmin in DB');
    return `User ${user.email} has isAdmin=true in DB`;
  });

  // 3. UPSTASH REDIS
  await runTest('3. Upstash Redis & Caching', 'Ping Upstash Redis Cluster', async () => {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    const pong = await redis.ping();
    if (pong !== 'PONG') throw new Error(`Unexpected Redis response: ${pong}`);
    
    // Test set and get with TTL
    const testKey = 'e2e_test_ping_' + Date.now();
    await redis.set(testKey, 'active', { ex: 60 });
    const val = await redis.get(testKey);
    await redis.del(testKey);
    if (val !== 'active') throw new Error('Redis set/get verification failed');
    return 'Redis pinged & write/read verified successfully';
  });

  // 4. STRIPE PAYMENT GATEWAY CONFIG
  await runTest('4. Stripe Billing', 'Validate Stripe Secret Key', async () => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is missing');
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
    const balance = await stripe.balance.retrieve();
    return `Stripe connection OK. Livemode: ${balance.livemode}`;
  });

  // 5. CLOUDINARY CONFIG
  await runTest('5. Media & Asset Storage', 'Validate Cloudinary Config', async () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !secret) {
      throw new Error('Cloudinary credentials missing in .env');
    }
    return `Configured for cloud: ${cloudName}`;
  });

  // 6. DYNAMIC QR REDIRECTION & SCAN LIFECYCLE
  let testQrId: string | null = null;
  // Use 8-character short code (schema limit is 10 chars)
  const testShortCode = 't_' + Math.random().toString(36).substring(2, 8);
  const targetSiteA = 'https://example.com/target-a';
  const targetSiteB = 'https://example.com/target-b';

  await runTest('6. QR & Redirection', 'Create Dynamic QR Code in Database', async () => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, 'mohanbr2004@gmail.com'),
    });
    if (!user) throw new Error('Cannot create QR without user');

    const [newQr] = await db.insert(qrCodes).values({
      userId: user.id,
      name: 'E2E Test QR Code',
      shortCode: testShortCode,
      targetUrl: targetSiteA,
      destinationType: 'url',
      type: 'url',
      status: 'active',
      isActive: true,
      scanCount: 0,
    }).returning();

    testQrId = newQr.id;
    return `Created test QR with shortCode: ${testShortCode} pointing to ${targetSiteA}`;
  });

  await runTest('6. QR & Redirection', 'Resolve Redirection to Destination A', async () => {
    const res = await fetch(`http://localhost:3000/s/${testShortCode}`, {
      redirect: 'manual',
    });
    
    const location = res.headers.get('location');
    if (res.status !== 307 && res.status !== 308 && res.status !== 302) {
      const text = await res.text();
      if (text.includes(targetSiteA)) {
        return `Redirection resolved via HTML: status ${res.status}`;
      }
      throw new Error(`Expected redirect status (302/307/308), got status ${res.status}. Location: ${location}`);
    }
    if (location !== targetSiteA) {
      throw new Error(`Location header was "${location}", expected "${targetSiteA}"`);
    }
    return `Successfully redirected (HTTP ${res.status}) to ${location}`;
  });

  await runTest('6. QR & Redirection', 'Verify Scan Event Logged in Database', async () => {
    if (!testQrId) throw new Error('No test QR ID');
    const updatedQr = await db.query.qrCodes.findFirst({
      where: eq(qrCodes.id, testQrId),
    });
    if (!updatedQr) throw new Error('QR not found');
    if (updatedQr.scanCount < 1) {
      throw new Error(`Scan count was not incremented! Current count: ${updatedQr.scanCount}`);
    }

    const events = await db.query.scanEvents.findMany({
      where: eq(scanEvents.qrId, testQrId),
    });
    if (events.length === 0) {
      throw new Error('No scanEvents record found in database');
    }
    return `Scan count incremented to ${updatedQr.scanCount}. Scan event logged with deviceType: ${events[0].deviceType}, os: ${events[0].os}, browser: ${events[0].browser}`;
  });

  await runTest('6. QR & Redirection', 'Update Destination to B and Verify Instant Propagation', async () => {
    if (!testQrId) throw new Error('No test QR ID');
    await db.update(qrCodes)
      .set({ targetUrl: targetSiteB })
      .where(eq(qrCodes.id, testQrId));

    const res = await fetch(`http://localhost:3000/s/${testShortCode}`, {
      redirect: 'manual',
    });
    const location = res.headers.get('location');
    if (location !== targetSiteB) {
      throw new Error(`Location was ${location}, expected updated destination: ${targetSiteB}`);
    }
    return `Successfully updated destination! New location is ${location}`;
  });

  // Clean up test QR
  if (testQrId) {
    try {
      await db.delete(scanEvents).where(eq(scanEvents.qrId, testQrId));
      await db.delete(qrCodes).where(eq(qrCodes.id, testQrId));
    } catch {}
  }

  // 7. PUBLIC PAGES & SEO
  const pagesToTest = [
    { path: '/', label: 'Landing Page' },
    { path: '/about', label: 'About Page' },
    { path: '/pricing', label: 'Pricing Page' },
    { path: '/terms', label: 'Terms of Service' },
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/robots.txt', label: 'robots.txt' },
    { path: '/sitemap.xml', label: 'sitemap.xml' },
  ];

  for (const page of pagesToTest) {
    await runTest('7. Public Routes & SEO', `Check HTTP 200 for ${page.label}`, async () => {
      const res = await fetch(`http://localhost:3000${page.path}`);
      if (res.status !== 200) {
        throw new Error(`Received HTTP ${res.status} for ${page.path}`);
      }
      return `HTTP ${res.status} OK`;
    });
  }

  await runTest('7. Public Routes & SEO', 'Check Custom 404 Page on Bad Route', async () => {
    const res = await fetch('http://localhost:3000/non-existent-page-xyz-12345');
    if (res.status !== 404) {
      throw new Error(`Expected 404, received HTTP ${res.status}`);
    }
    return 'HTTP 404 returned correctly';
  });

  // 8. ADMIN PANEL (PORT 3001)
  await runTest('8. QRise Admin Panel', 'Check Admin Server Health (Port 3001)', async () => {
    const res = await fetch('http://localhost:3001/login');
    if (res.status !== 200) throw new Error(`Admin login page returned HTTP ${res.status}`);
    return `Admin server is up! Login page returns HTTP ${res.status}`;
  });

  await runTest('8. QRise Admin Panel', 'Verify Admin JWT Session Generation & Dashboard Access', async () => {
    const adminEnv = dotenv.config({ path: '../qrise-admin/.env' }).parsed || {};
    const jwtSecret = adminEnv.JWT_SECRET || process.env.ADMIN_PANEL_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not found in qrise-admin/.env');

    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new jose.SignJWT({
      id: 'admin_test_session',
      email: 'mohanbr2004@gmail.com',
      is_admin: true,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(secret);

    const res = await fetch('http://localhost:3001/dashboard', {
      headers: {
        Cookie: `admin_session=${token}`,
      },
      redirect: 'manual',
    });

    if (res.status === 307 || res.status === 302) {
      const loc = res.headers.get('location');
      if (loc?.includes('/login')) {
        throw new Error(`Admin session rejected, redirected to ${loc}`);
      }
    }
    return `Admin dashboard accepted valid session! HTTP ${res.status}`;
  });

  let passed = results.filter(r => r.status === 'PASSED').length;
  let failed = results.filter(r => r.status === 'FAILED').length;
  console.log(`\n==================================================`);
  console.log(`COMPLETED: ${results.length} Tests | ${passed} Passed | ${failed} Failed`);
  console.log(`==================================================\n`);

  await client.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error('Fatal error:', e);
  await client.end();
  process.exit(1);
});
