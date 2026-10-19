import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  const { data, error } = await supabase
    .from('users')
    .update({ is_admin: true })
    .eq('email', 'mohanbr2004@gmail.com')
    .select()

  if (error) {
    console.error('Error updating user is_admin:', error)
  } else {
    console.log('Successfully updated mohanbr2004@gmail.com to is_admin=true:', data)
  }
}

main().catch(console.error)
