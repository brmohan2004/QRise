import { createAdminClient } from '@/lib/supabase/admin'

export async function getPlatformSummary() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.rpc('get_platform_summary')
  
  if (error) {
    console.error('Error fetching platform summary:', error)
    // Fallback to manual counts if RPC fails
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
      revenue: 0
    }
  }

  return data
}

export async function getScansTrend(days = 30) {
  const adminClient = createAdminClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await adminClient.rpc('get_scans_trend', { 
    start_date: startDate.toISOString() 
  })
  
  if (error) {
    console.error('Error fetching scans trend:', error)
    return []
  }

  return data
}

export async function getGeoBreakdown() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.rpc('get_geo_breakdown')
  
  if (error) {
    console.error('Error fetching geo breakdown:', error)
    return []
  }

  return data
}

export async function getDeviceSplit() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.rpc('get_device_split')
  
  if (error) {
    console.error('Error fetching device split:', error)
    return []
  }

  return data
}

export async function getUserGrowth(days = 30) {
  const adminClient = createAdminClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await adminClient.rpc('get_user_growth', {
    start_date: startDate.toISOString()
  })

  if (error) {
    console.error('Error fetching user growth:', error)
    return []
  }

  return data
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
