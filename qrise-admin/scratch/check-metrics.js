const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: size, error: sizeErr } = await supabase.rpc('get_db_size');
  const { data: conns, error: connErr } = await supabase.rpc('get_active_connections');

  console.log('DB Size:', size, sizeErr || '');
  console.log('Active Connections:', conns, connErr || '');
}

check();
