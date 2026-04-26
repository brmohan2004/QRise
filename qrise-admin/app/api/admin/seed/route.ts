import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const plans = [
  { name: 'Free', max_qr_codes: 5, max_scans_per_month: 100 },
  { name: 'Pro', max_qr_codes: 50, max_scans_per_month: 5000 },
  { name: 'Business', max_qr_codes: 500, max_scans_per_month: 50000 }
]

export async function GET() {
  const supabase = createAdminClient()
  
  console.log('Seeding plans via API...')
  
  const results = []
  for (const plan of plans) {
    const { data, error } = await supabase
      .from('plans')
      .upsert(plan, { onConflict: 'name' })
      .select()
    
    results.push({ name: plan.name, success: !error, error: error?.message })
  }
  
  return NextResponse.json({ seeded: true, results })
}
