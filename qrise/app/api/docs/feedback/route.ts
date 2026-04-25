import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { page, helpful } = await req.json();
    
    // Only log in development to avoid PII
    if (process.env.NODE_ENV === 'development') {
      console.log(`Docs feedback: ${page} - ${helpful ? 'helpful' : 'not helpful'}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}