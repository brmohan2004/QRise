const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const status = { dashboard: true };
  const userId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID

  const { data, error } = await supabase
    .from('platform_config')
    .upsert({
      key: 'admin_module_status',
      value: status,
      updated_by: '00000000-0000-0000-0000-000000000000', 
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Upsert Error:', error);
  } else {
    console.log('Upsert Success:', data);
  }
}

check();
