import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function removeAllQRs() {
  console.log('Starting thorough deletion of all QR related data...')

  const tables = [
    'scan_daily_rollups',
    'scan_events',
    'qr_redirect_history',
    'routing_rules',
    'qr_actions',
    'qr_codes'
  ]

  for (const table of tables) {
    console.log(`Deleting all records from ${table}...`)
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // This works for UUIDs. For tables without ID, we might need another way.
    
    if (error) {
      if (error.message.includes('column "id" does not exist')) {
        // Fallback for tables without 'id' column if any
        const { error: error2 } = await supabase
          .from(table)
          .delete()
          .not('qr_id', 'is', null) // Most related tables have qr_id
        
        if (error2) console.error(`Error deleting from ${table}:`, error2.message)
        else console.log(`Successfully deleted all records from ${table}.`)
      } else {
        console.error(`Error deleting from ${table}:`, error.message)
      }
    } else {
      console.log(`Successfully deleted all records from ${table}.`)
    }
  }
}


removeAllQRs()
