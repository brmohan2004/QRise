import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { Redis } from '@upstash/redis'
import { writeAuditLog } from '@/lib/audit'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const isMaintenance = await redis.get('maintenance_mode')
  return NextResponse.json({ enabled: isMaintenance === 'true' })
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request)
  if ('error' in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const { enabled } = await request.json()
  
  await redis.set('maintenance_mode', enabled ? 'true' : 'false')

  // Audit Log
  await writeAuditLog({
    adminUserId: admin.adminId,
    action: 'system.maintenance_toggle',
    targetType: 'system',
    targetId: 'global',
    details: { enabled },
    ipAddress: admin.ipAddress
  })

  return NextResponse.json({ success: true, enabled })
}
