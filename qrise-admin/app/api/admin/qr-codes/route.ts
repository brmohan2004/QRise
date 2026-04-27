import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()
  const { searchParams } = new URL(request.url)
  
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  // 1. Fetch single QRs (not part of a bulk job)
  let singleQuery = adminClient
    .from('qr_codes')
    .select(`
      id,
      name,
      type,
      short_code,
      scan_count,
      is_active,
      status,
      created_at,
      user_id,
      users:user_id (email)
    `)
    .is('bulk_job_id', null)
    .order('created_at', { ascending: false })

  if (type) singleQuery = singleQuery.eq('type', type)
  if (status === 'active') singleQuery = singleQuery.eq('status', 'active')
  if (status === 'suspended') singleQuery = singleQuery.eq('status', 'suspended')
  if (search) singleQuery = singleQuery.ilike('name', `%${search}%`)

  // 2. Fetch bulk jobs (batches)
  let bulkQuery = adminClient
    .from('bulk_jobs')
    .select(`
      id,
      status,
      total_rows,
      processed_rows,
      created_at,
      user_id
    `)
    .order('created_at', { ascending: false })

  // Note: Filtering batches by type/status might be tricky if we want exact matches, 
  // but for now let's just fetch them.
  
  const [singleResult, bulkResult] = await Promise.all([
    singleQuery,
    bulkQuery
  ])

  if (singleResult.error) {
    console.error('Single QR Query Error:', singleResult.error)
    return NextResponse.json({ error: singleResult.error.message }, { status: 500 })
  }

  const bulkData = bulkResult.data || []
  if (bulkResult.error) {
    console.warn('Bulk Job Query Error (falling back to empty list):', bulkResult.error)
  }

  // 3. Combine results
  const combined = [
    ...singleResult.data.map(qr => ({ ...qr, is_batch: false })),
    ...bulkData.map(job => ({
      id: job.id,
      name: `Bulk Batch #${job.id.slice(0, 8)}`,
      type: 'bulk',
      short_code: 'BATCH',
      scan_count: 0, // Could be aggregated later
      is_active: job.status === 'completed',
      status: job.status === 'completed' ? 'active' : 'suspended',
      created_at: job.created_at,
      user_id: job.user_id,
      users: { email: job.user_id?.slice(0, 8) + '...' }, // Fallback since we removed the join
      is_batch: true,
      qr_count: job.total_rows
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json(combined)
}
