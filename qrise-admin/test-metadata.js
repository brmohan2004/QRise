import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function testMetadata() {
  const email = 'mohanbr2004@gmail.com'
  const { data, error } = await adminClient.auth.admin.listUsers()
  const user = data.users.find(u => u.email === email)
  
  console.log('User app_metadata:', user?.app_metadata)
  console.log('User user_metadata:', user?.user_metadata)
}

testMetadata()
