const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const tables = ['ip_blocks', 'rate_limit_violations', 'rate_limit_config', 'api_keys'];
  for (const table of tables) {
    console.log(`--- Checking columns for ${table} ---`);
    // Try to select one row and see what keys we get
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error selecting from ${table}:`, error.message);
    } else {
      console.log(`Keys in ${table}:`, data.length > 0 ? Object.keys(data[0]) : 'No data to determine columns');
    }
  }
}

checkColumns();
