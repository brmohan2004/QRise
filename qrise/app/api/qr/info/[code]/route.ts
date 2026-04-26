
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { qrCodes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    const qr = await db.query.qrCodes.findFirst({
      where: eq(qrCodes.shortCode, code),
      columns: {
        id: true,
        name: true,
        shortCode: true
      }
    })

    if (!qr) {
      return NextResponse.json({ error: 'QR Code not found' }, { status: 404 })
    }

    return NextResponse.json(qr)
  } catch (error) {
    console.error('Error fetching QR info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
