import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedAdmin() {
  const email = process.argv[2]
  if (!email) {
    console.error('Please provide an email: pnpm tsx scripts/seed-admin.ts user@example.com')
    process.exit(1)
  }

  console.log(`Setting ${email} as administrator...`)

  const { data, error } = await supabase
    .from('users')
    .update({ is_admin: true })
    .eq('email', email)
    .select()

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  if (data.length === 0) {
    console.error(`User with email ${email} not found.`)
    process.exit(1)
  }

  console.log('Success! User is now an admin.')
}

seedAdmin()
