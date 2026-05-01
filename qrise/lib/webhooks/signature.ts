import { createHmac, timingSafeEqual } from 'node:crypto';

export async function signPayload(opts: {
  secret: string;
  timestamp: number;
  body: string;
}): Promise<string> {
  const { secret, timestamp, body } = opts;
  const hmac = createHmac('sha256', secret);
  hmac.update(`${timestamp}.${body}`);
  const signature = hmac.digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

export function verifyWebhookSignature(opts: {
  payload: string;
  signature: string;
  secret: string;
  tolerance?: number;
}): boolean {
  const { payload, signature, secret, tolerance = 300 } = opts;

  const parts = signature.split(',');
  const timestampPart = parts.find(p => p.startsWith('t='));
  const v1Part = parts.find(p => p.startsWith('v1='));

  if (!timestampPart || !v1Part) return false;

  const timestamp = parseInt(timestampPart.slice(2), 10);
  const now = Math.floor(Date.now() / 1000);

  if (Math.abs(now - timestamp) > tolerance) {
    return false;
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  const providedSignature = v1Part.slice(3);
  return timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  );
}
