import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { getAdminUser } from '@/lib/auth-utils'

export async function GET() {
  const user = await getAdminUser()

  if (!user) {
    console.log('[API] Status: Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const changedRecently = await redis.get('rl_changed_recently')

  return NextResponse.json({
    changedRecently: changedRecently === 'true'
  })
}
