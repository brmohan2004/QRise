import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req)

  if ('error' in admin) {
    console.log('[API] Status: Unauthorized access attempt')
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const changedRecently = await redis.get('rl_changed_recently')

  return NextResponse.json({
    changedRecently: changedRecently === 'true'
  })
}
