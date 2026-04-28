import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('Querying users table columns...')
  // We can't easily describe table with supabase client, 
  // but we can try to select one row and see the keys.
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Columns found in users table:', Object.keys(data))
  }
}

check()
