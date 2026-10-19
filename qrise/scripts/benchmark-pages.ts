import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

interface PageBenchmark {
  name: string;
  url: string;
  authRequired: boolean;
  samples: number[];
  ttfbSamples: number[];
  avgTotalMs: number;
  avgTtfbMs: number;
  status: number;
  sizeKb: number;
  grade: 'EXCELLENT' | 'GOOD' | 'NEEDS_OPTIMIZATION' | 'SLOW';
}

const PUBLIC_PAGES = [
  { name: 'Landing Page', path: '/' },
  { name: 'About Page', path: '/about' },
  { name: 'Pricing Page', path: '/pricing' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Login Page', path: '/login' },
  { name: 'Register Page', path: '/register' },
  { name: 'Forgot Password', path: '/forgot-password' },
  { name: 'robots.txt', path: '/robots.txt' },
  { name: 'sitemap.xml', path: '/sitemap.xml' },
];

const AUTH_PAGES = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'QR Code Builder (/create)', path: '/create' },
  { name: 'My QR Codes (/qr-codes)', path: '/qr-codes' },
  { name: 'Analytics Dashboard (/analytics)', path: '/analytics' },
  { name: 'Form Builder (/forms)', path: '/forms' },
  { name: 'Profile & Usage (/profile)', path: '/profile' },
  { name: 'Billing Settings (/settings/billing)', path: '/settings/billing' },
];

async function measureRequest(url: string, cookieHeader?: string) {
  const start = performance.now();
  let ttfb = 0;
  
  const headers: Record<string, string> = {
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': 'QRise-Perf-Tester/1.0',
  };
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  const res = await fetch(url, { headers, redirect: 'manual' });
  ttfb = performance.now() - start;

  const body = await res.arrayBuffer();
  const total = performance.now() - start;

  return {
    status: res.status,
    ttfbMs: Math.round(ttfb),
    totalMs: Math.round(total),
    sizeBytes: body.byteLength,
  };
}

async function main() {
  console.log('====================================================');
  console.log('    QRISE FULL APPLICATION PERFORMANCE BENCHMARK    ');
  console.log('====================================================\n');

  // 1. Authenticate user to obtain real session cookie
  console.log('Authenticating test session for: mohanbr2004@gmail.com...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mohanbr2004@gmail.com',
    password: 'M0H@Nbr2004',
  });

  if (authError || !authData.session) {
    throw new Error(`Auth failed: ${authError?.message}`);
  }

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieHeader = `${cookieName}=${encodeURIComponent(JSON.stringify(authData.session))}`;
  console.log(`Authenticated! Session established.\n`);

  const results: PageBenchmark[] = [];

  // Helper to test a page 3 times
  async function testPage(name: string, path: string, authRequired: boolean) {
    process.stdout.write(`Benchmarking [${name}] (${path})... `);
    const url = `http://localhost:3000${path}`;
    const cookie = authRequired ? cookieHeader : undefined;

    // Warm-up hits (ensures Next.js on-demand route compilation is complete)
    await measureRequest(url, cookie);
    await measureRequest(url, cookie);

    const totals: number[] = [];
    const ttfbs: number[] = [];
    let lastStatus = 200;
    let lastSize = 0;

    for (let i = 0; i < 3; i++) {
      const m = await measureRequest(url, cookie);
      totals.push(m.totalMs);
      ttfbs.push(m.ttfbMs);
      lastStatus = m.status;
      lastSize = m.sizeBytes;
    }

    const avgTotal = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const avgTtfb = Math.round(ttfbs.reduce((a, b) => a + b, 0) / ttfbs.length);

    let grade: PageBenchmark['grade'] = 'EXCELLENT';
    if (avgTtfb > 1000) grade = 'SLOW';
    else if (avgTtfb > 500) grade = 'NEEDS_OPTIMIZATION';
    else if (avgTtfb > 250) grade = 'GOOD';

    results.push({
      name,
      url: path,
      authRequired,
      samples: totals,
      ttfbSamples: ttfbs,
      avgTotalMs: avgTotal,
      avgTtfbMs: avgTtfb,
      status: lastStatus,
      sizeKb: Math.round((lastSize / 1024) * 10) / 10,
      grade,
    });

    const gradeIcon = grade === 'EXCELLENT' ? '⚡' : grade === 'GOOD' ? '✅' : grade === 'NEEDS_OPTIMIZATION' ? '⚠️' : '🚨';
    console.log(`${gradeIcon} TTFB: ${avgTtfb}ms | Total: ${avgTotal}ms | Size: ${Math.round(lastSize / 1024)}KB [${grade}]`);
  }

  // 2. Test Public Pages
  console.log('--- PUBLIC ROUTES ---');
  for (const p of PUBLIC_PAGES) {
    await testPage(p.name, p.path, false);
  }

  // 3. Test Authenticated Pages
  console.log('\n--- AUTHENTICATED ROUTES ---');
  // Warm up the authenticated session
  await measureRequest('http://localhost:3000/dashboard', cookieHeader);
  for (const p of AUTH_PAGES) {
    await testPage(p.name, p.path, true);
  }

  console.log('\n====================================================');
  console.log('                BENCHMARK SUMMARY                   ');
  console.log('====================================================');
  console.table(
    results.map(r => ({
      Page: r.name,
      Route: r.url,
      Status: r.status,
      'Avg TTFB (ms)': r.avgTtfbMs,
      'Avg Total (ms)': r.avgTotalMs,
      'Size (KB)': r.sizeKb,
      Grade: r.grade,
    }))
  );
}

main().catch(console.error);
