const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUpdate() {
  console.log('Testing platform_config update...');
  const { data, error } = await supabase
    .from('platform_config')
    .update({ 
      value: JSON.stringify(true), 
      updated_at: new Date().toISOString() 
    })
    .eq('key', 'signup_enabled')
    .select();

  if (error) {
    console.error('Update failed:', error.message, error.details, error.hint);
  } else {
    console.log('Update successful:', data);
  }
}

testUpdate();
