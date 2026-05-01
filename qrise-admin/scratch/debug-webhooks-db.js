const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'webhooks' });

  if (error) {
    // If rpc fails, try direct query to information_schema
    const { data: cols, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'webhooks')
      .eq('table_schema', 'public');
      
    if (colError) console.error('Error:', colError);
    else console.log('Columns:', cols);
  } else {
    console.log('Table Info:', data);
  }
}

check();
