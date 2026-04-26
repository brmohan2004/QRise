import { createAdminClient } from '@/lib/supabase/admin'

export async function getPlatformSummary() {
  const adminClient = createAdminClient()

  const [usersCount, qrCount, scansCount, scansToday, competitionsCount] = await Promise.all([
    adminClient.from('users').select('*', { count: 'exact', head: true }),
    adminClient.from('qr_codes').select('*', { count: 'exact', head: true }),
    adminClient.from('scan_events').select('*', { count: 'exact', head: true }),
    adminClient.from('scan_events').select('*', { count: 'exact', head: true }).gte('scanned_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
    adminClient.from('competitions').select('*', { count: 'exact', head: true }).eq('is_public', true)
  ])

  return {
    totalUsers: usersCount.count || 0,
    totalQRs: qrCount.count || 0,
    totalScans: scansCount.count || 0,
    scansToday: scansToday.count || 0,
    activeCompetitions: competitionsCount.count || 0,
    revenue: 0 // Placeholder
  }
}

export async function getScansTrend(days = 30) {
  const adminClient = createAdminClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await adminClient.rpc('get_scans_trend', { 
    start_date: startDate.toISOString() 
  })
  
  if (error) {
    // Fallback if RPC doesn't exist
    const { data: scans } = await adminClient
      .from('scan_events')
      .select('scanned_at')
      .gte('scanned_at', startDate.toISOString())
    
    const trend = scans?.reduce((acc: Record<string, number>, scan: { scanned_at: string }) => {
      const date = new Date(scan.scanned_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return Object.entries(trend || {}).map(([date, count]) => ({ date, count }))
  }

  return data
}

export async function getGeoBreakdown() {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('scan_events')
    .select('country')
    .not('country', 'is', null)
  
  const counts = data?.reduce((acc: Record<string, number>, item: { country: string }) => {
    acc[item.country] = (acc[item.country] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 10)
}

export async function getDeviceSplit() {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('scan_events')
    .select('device_type')
    .not('device_type', 'is', null)
  
  const counts = data?.reduce((acc: Record<string, number>, item: { device_type: string }) => {
    acc[item.device_type] = (acc[item.device_type] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
}

export async function getUserGrowth(days = 30) {
  const adminClient = createAdminClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data } = await adminClient
    .from('users')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
  
  const trend = data?.reduce((acc: Record<string, number>, user: { created_at: string }) => {
    const date = new Date(user.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return Object.entries(trend || {}).map(([date, count]) => ({ date, count }))
}

export async function getTopQRs() {
  const adminClient = createAdminClient()
  // Join with users for owner email
  const { data } = await adminClient
    .from('qr_codes')
    .select(`
      id,
      name,
      type,
      scan_count,
      user_id,
      users:user_id (email)
    `)
    .order('scan_count', { ascending: false })
    .limit(10)

  return data?.map((qr: { id: string; name: string; type: string; scan_count: number; users: { email: string } | { email: string }[] | null }) => ({
    id: qr.id,
    name: qr.name,
    type: qr.type,
    scans: qr.scan_count,
    owner: Array.isArray(qr.users) ? qr.users[0]?.email : qr.users?.email
  }))
}
