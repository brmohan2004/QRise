import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { Redis } from '@upstash/redis'
import * as queries from '@/lib/db/admin-queries/analytics.queries'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'platform_summary'
  const cacheKey = `admin_analytics:${view}`

  // Try cache
  const cachedData = await redis.get(cacheKey)
  if (cachedData) {
    return NextResponse.json(cachedData)
  }

  let data
  try {
    switch (view) {
      case 'platform_summary':
        data = await queries.getPlatformSummary()
        break
      case 'scans_trend':
        data = await queries.getScansTrend()
        break
      case 'geo':
        data = await queries.getGeoBreakdown()
        break
      case 'top_qrs':
        data = await queries.getTopQRs()
        break
      case 'devices':
        data = await queries.getDeviceSplit()
        break
      case 'user_growth':
        data = await queries.getUserGrowth()
        break
      default:
        return NextResponse.json({ error: 'Invalid view' }, { status: 400 })
    }

    // Cache for 5 minutes
    await redis.set(cacheKey, data, { ex: 300 })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
