import { createClient } from '@supabase/supabase-js';
import { type SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | undefined;

export function createAdminClient(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  return adminClient;
}