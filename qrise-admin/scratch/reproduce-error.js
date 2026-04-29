const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function reproduce() {
  console.log('Attempting to reproduce the error...');
  
  // Try to insert a maintenance window
  const { data, error } = await supabase
    .from('maintenance_windows')
    .insert({
      title: 'Reproduction Test',
      message: 'Testing from script',
      starts_at: new Date().toISOString(),
      created_by: '00000000-0000-0000-0000-000000000000' // Fake UUID
    })
    .select();

  if (error) {
    console.error('Insert failed:', JSON.stringify(error, null, 2));
  } else {
    console.log('Insert successful:', data);
  }
}

reproduce();
