import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  console.log('Testing login for mohanbr2004@gmail.com...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'mohanbr2004@gmail.com',
    password: 'M0H@Nbr2004',
  })

  if (error) {
    console.error('Login failed:', error.message)
    // Check if we can set the password via admin api if needed
  } else {
    console.log('Login successful! User ID:', data.user?.id)
  }
}

main().catch(console.error)
