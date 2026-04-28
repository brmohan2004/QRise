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

  console.log('Querying platform_feedback...')
  const { data, error, count } = await supabase
    .from('platform_feedback')
    .select('*', { count: 'exact' })

  if (error) {
    console.error('Error platform_feedback:', error)
  } else {
    console.log('Total feedback count:', count)
    console.log('Data:', JSON.stringify(data, null, 2))
    
    if (data && data.length > 0) {
      const userId = data[0].user_id;
      console.log(`Checking user ${userId}...`);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error user:', userError);
      } else {
        console.log('User found:', userData);
      }
    }
  }
}

check()
