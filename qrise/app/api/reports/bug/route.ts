import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { url, description, steps_to_reproduce, severity, browser_info } = body

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const { data, error } = await supabase
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
      console.error('Bug report error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Bug report submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
