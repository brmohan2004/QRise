import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { platformFeedback } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { type, subject, content, email: providedEmail } = body;

    if (!type || !subject || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let result;
    try {
      // Primary attempt: Include userEmail
      result = await db.insert(platformFeedback).values({
        userId: user?.id || null,
        userEmail: providedEmail || user?.email || null,
        type,
        subject,
        content,
        status: 'pending',
      }).returning();
    } catch (dbError: any) {
      console.warn('Feedback insertion failed with userEmail, retrying without it...', dbError.message);
      
      // Fallback attempt: Remove userEmail in case the column hasn't been added to DB yet
      result = await db.insert(platformFeedback).values({
        userId: user?.id || null,
        type,
        subject,
        content,
        status: 'pending',
      }).returning();
    }

    console.log('Feedback inserted in SaaS:', result[0]);
    return NextResponse.json({ success: true, feedback: result[0] });
  } catch (error) {
    console.error('Final feedback submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
