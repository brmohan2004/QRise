import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debug() {
  const type = 'bug'
  const status = 'pending'
  const searchQuery = ''
  const page = 1
  const limit = 20
  const offset = (page - 1) * limit

  console.log('--- Simulating API Query ---')
  let query = supabase
    .from('bug_reports')
    .select('*, users!bug_reports_user_id_fkey(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (searchQuery) {
    query = query.ilike('description', `%${searchQuery}%`)
  }

  const { data, count, error } = await query
  
  if (error) {
    console.error('API Query Error:', error)
  } else {
    console.log(`API Query returned ${data.length} rows (Total count: ${count})`)
    console.log('Data:', JSON.stringify(data, null, 2))
  }
}

debug()
