import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { url, description, steps_to_reproduce, severity, browser_info } = body

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('bug_reports')
      .insert({
        user_id: user?.id || null,
        url,
        description,
        steps_to_reproduce,
        severity,
        browser_info,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Bug report database error:', error)
      return NextResponse.json({ 
        error: error.message, 
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Bug report submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
