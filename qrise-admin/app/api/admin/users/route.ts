import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const adminClient = createAdminClient()

  // Query users with QR count and Scan count (requires complex query or multiple lookups)
  // For simplicity in this step, we'll fetch basic user data.
  // In a real app, this would be a single view or a more complex RPC.
  
  const { searchParams } = new URL(request.url);
  const emailFilter = searchParams.get('email');

  let query = adminClient
    .from('users')
    .select(`
      id,
      full_name,
      email,
      plan,
      is_suspended,
      avatar_url,
      created_at
    `);

  if (emailFilter) {
    query = query.eq('email', emailFilter);
  }

  const { data: users, error } = await query.order('created_at', { ascending: false });


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch counts separately or assume they are in the user record if joined
  // For this implementation, we'll mock the counts if not present in the base table
  const usersWithCounts = await Promise.all(users.map(async (user) => {
    const [qrCount, scanCount] = await Promise.all([
      adminClient.from('qr_codes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      adminClient.from('scan_events').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ])

    return {
      ...user,
      qr_count: qrCount.count || 0,
      scan_count: scanCount.count || 0
    }
  }))

  return NextResponse.json(usersWithCounts)
}
