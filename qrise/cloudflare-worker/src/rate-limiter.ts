export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const windowSlot = Math.floor(Date.now() / (windowSec * 1000));
  const rateKey = `rl:${windowSlot}:${key}`;
  
  const current = await kv.get(rateKey);
  const count = current ? parseInt(current as string, 10) : 0;
  
  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  await kv.put(rateKey, String(count + 1), { expirationTtl: windowSec });
  
  return { allowed: true, remaining: limit - count - 1 };
}
