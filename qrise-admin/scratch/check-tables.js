const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  const tables = ['platform_config', 'maintenance_windows', 'announcements', 'ip_blocks', 'rate_limit_violations', 'rate_limit_config', 'non_existent_table_xyz'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`Error checking table ${table}:`, error);
    } else {
      console.log(`Table ${table} exists. Row count: ${count}`);
    }
  }
}

checkTables();
