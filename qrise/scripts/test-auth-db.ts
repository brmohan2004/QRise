import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('Testing Supabase connection...')
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error listing auth users:', listError)
    return
  }
  
  console.log(`Found ${users.users.length} auth users:`)
  for (const u of users.users) {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Confirmed: ${u.email_confirmed_at ? 'YES' : 'NO'}`)
  }

  // Check DB users table
  const { data: dbUsers, error: dbError } = await supabase.from('users').select('*')
  if (dbError) {
    console.error('Error fetching db users:', dbError)
  } else {
    console.log(`Found ${dbUsers?.length || 0} users in 'users' table:`)
    console.log(JSON.stringify(dbUsers, null, 2))
  }
}

main().catch(console.error)
