import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin-auth'
import { writeAuditLog } from '@/lib/audit'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ip_blocks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json()
  const { ip, reason, blockType, expiresAt } = body

  if (!ip || !reason) {
    return NextResponse.json({ error: 'IP and reason are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ip_blocks')
    .insert({
      ip_address: ip,
      reason,
      block_type: blockType || 'temporary',
      expires_at: expiresAt || null,
      blocked_by: auth.adminId
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also set Redis key for fast lookup in main SaaS middleware
  const cacheKey = `block:ip:${ip}`
  if (blockType === 'permanent' || !expiresAt) {
    await redis.set(cacheKey, { blocked: true, reason })
  } else {
    const ttl = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    if (ttl > 0) {
      await redis.set(cacheKey, { blocked: true, reason }, { ex: ttl })
    }
  }

  await writeAuditLog({
    adminUserId: auth.adminId,
    action: 'rate_limit.ip_blocked',
    targetType: 'system',
    targetId: ip,
    details: { reason, blockType, expiresAt },
    ipAddress: auth.ipAddress
  })

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  // Unblock IP
  // Expected URL: /api/admin/rate-limits/ip-blocks?id={id}&ip={ip}
  const auth = await verifyAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const ip = searchParams.get('ip')

  if (!id || !ip) {
    return NextResponse.json({ error: 'ID and IP are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('ip_blocks')
    .update({ 
      unblocked_at: new Date().toISOString(),
      unblocked_by: auth.adminId
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Remove Redis key
  await redis.del(`block:ip:${ip}`)

  await writeAuditLog({
    adminUserId: auth.adminId,
    action: 'rate_limit.ip_unblocked',
    targetType: 'system',
    targetId: ip,
    ipAddress: auth.ipAddress
  })

  return NextResponse.json({ success: true })
}
