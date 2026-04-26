
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { qr_id, reason, details } = body

    if (!qr_id || !reason) {
      return NextResponse.json({ error: 'QR ID and reason are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('abuse_reports')
      .insert({
        reported_by: user?.id || null,
        qr_id,
        reason,
        details,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Abuse report error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Abuse report submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
