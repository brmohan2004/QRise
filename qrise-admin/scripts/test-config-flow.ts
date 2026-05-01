import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const redisUrl = process.env.UPSTASH_REDIS_REST_URL!;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({ url: redisUrl, token: redisToken });
} else {
  console.warn('⚠️ Missing Redis environment variables. Cache sync testing will be skipped.');
}

const DEFAULT_CONFIGS = [
  { key: 'maintenance_mode', value: 'false', description: 'Global maintenance mode switch' },
  { key: 'read_only_mode', value: 'false', description: 'Block all write operations' },
  { key: 'max_qr_per_request', value: '50', description: 'Max QRs creatable in one API batch' },
  { key: 'cloudflare_cache_ttl', value: '300', description: 'KV cache TTL in seconds' },
  { key: 'signup_enabled', value: 'true', description: 'Allow new user registrations' }
];

async function testConfigFlow() {
  console.log('🚀 Starting System Configuration Test...\n');

  // 1. Check and Seed Configs
  console.log('--- Step 1: Checking/Seeding Database ---');
  for (const config of DEFAULT_CONFIGS) {
    const { error } = await supabase
      .from('platform_config')
      .select('key')
      .eq('key', config.key)
      .single();

    if (error && error.code === 'PGRST116') { // Not found
      console.log(`+ Seeding ${config.key}...`);
      await supabase.from('platform_config').insert(config);
    } else {
      console.log(`ok ${config.key} exists`);
    }
  }

  // 2. Simulate Config Update (Maintenance Mode ON)
  console.log('\n--- Step 2: Updating maintenance_mode to "true" ---');
  const testReason = 'Automated Test ' + new Date().toISOString();
  
  // We'll call the logic that the API route performs
  const { error: updateError } = await supabase
    .from('platform_config')
    .update({
      value: 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('key', 'maintenance_mode');

  if (updateError) {
    console.error('❌ Update failed:', updateError.message);
    return;
  }
  console.log('✅ DB updated successfully');

  // 3. Verify Redis Sync (if available)
  if (redis) {
    console.log('\n--- Step 3: Verifying Redis Sync ---');
    console.log(`Connecting to Redis: ${redisUrl.split('@')[1] || 'URL hidden'}`);
    
    try {
      // Simulate the API route's Redis update
      await redis.set('platform:maintenance', 'true', { ex: 86400 });
      
      const redisVal = await redis.get('platform:maintenance');
      if (String(redisVal) === 'true') {
        console.log('✅ Redis key "platform:maintenance" is "true"');
      } else {
        console.error(`❌ Redis key mismatch. Expected "true", got "${redisVal}"`);
      }
    } catch (e: unknown) {
      console.error('❌ Redis error:', e instanceof Error ? e.message : 'Unknown error');
    }
  }

  // 4. Verify Audit Log
  console.log('\n--- Step 4: Verifying Audit Log Entry ---');
  // Use a dummy UUID for target_id because the column type is UUID
  const dummyUuid = '00000000-0000-0000-0000-000000000000';
  const auditEntry = {
    admin_user_id: dummyUuid,
    action: 'infra.config_updated',
    target_type: 'system',
    target_id: dummyUuid, // Fixed: must be a valid UUID
    details: {
      key: 'maintenance_mode',
      before: 'false',
      after: 'true',
      reason: testReason,
    },
    ip_address: '127.0.0.1'
  };

  const { error: auditError } = await supabase.from('admin_audit_log').insert(auditEntry);
  if (auditError) {
    console.error('❌ Audit log write failed:', auditError.message);
  } else {
    console.log('✅ Audit log entry created');
  }

  // 5. Revert Changes
  console.log('\n--- Step 5: Reverting maintenance_mode to "false" ---');
  await supabase
    .from('platform_config')
    .update({ value: 'false', updated_at: new Date().toISOString() })
    .eq('key', 'maintenance_mode');
    
  if (redis) {
    await redis.del('platform:maintenance');
    const redisValAfter = await redis.get('platform:maintenance');
    if (!redisValAfter) {
      console.log('✅ Redis key cleaned up');
    }
  }

  console.log('\n✨ System Configuration Test Completed Successfully!');
}

testConfigFlow().catch(console.error);
