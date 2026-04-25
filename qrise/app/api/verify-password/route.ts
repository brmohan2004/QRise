import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, qrId } = body;

    if (!password || !qrId) {
      return NextResponse.json(
        { error: "Password and QR ID are required" },
        { status: 400 }
      );
    }

    // Fetch QR by ID with password hash
    const qr = await db.select({
      id: qrCodes.id,
      targetUrl: qrCodes.targetUrl,
      passwordHash: qrCodes.passwordHash,
    })
      .from(qrCodes)
      .where(eq(qrCodes.id, qrId))
      .limit(1);

    if (!qr[0] || !qr[0].passwordHash) {
      return NextResponse.json(
        { error: "QR code not found or not password-protected" },
        { status: 404 }
      );
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = await bcrypt.compare(password, qr[0].passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { valid: false },
        { status: 401 }
      );
    }

    // Create a session token (in production, store in Redis with TTL)
    const sessionToken = randomUUID();

    // Optionally: store session token in DB/Redis for later validation
    // For now, return success with redirect URL
    return NextResponse.json({
      valid: true,
      redirectUrl: qr[0].targetUrl,
      sessionToken,
    });
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
