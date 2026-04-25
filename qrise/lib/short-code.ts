import crypto from 'crypto';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { qrCodes } from './db/schema';

const MAX_RETRIES = 5;

function generateRandomCode(): string {
  return crypto.randomBytes(6).toString('base64url');
}

export function generateShortCode(): string {
  return generateRandomCode();
}

export function isShortCodeValid(code: string): boolean {
  return /^[A-Za-z0-9_-]{6,10}$/.test(code);
}

export async function generateUniqueShortCode(): Promise<string> {
  let code = generateRandomCode();
  let attempts = 0;
  
  while (attempts < MAX_RETRIES) {
    const existing = await db.query.qrCodes.findFirst({
      where: eq(qrCodes.shortCode, code),
    });
    
    if (!existing) {
      return code;
    }
    
    code = generateRandomCode();
    attempts++;
  }
  
  throw new Error('Failed to generate unique short code after ' + MAX_RETRIES + ' attempts');
}