export async function checkRateLimit(kv, key, limit, windowSec) {
    const windowSlot = Math.floor(Date.now() / (windowSec * 1000));
    const rateKey = `rl:${windowSlot}:${key}`;
    const current = await kv.get(rateKey);
    const count = current ? parseInt(current, 10) : 0;
    if (count >= limit) {
        return { allowed: false, remaining: 0 };
    }
    await kv.put(rateKey, String(count + 1), { expirationTtl: windowSec });
    return { allowed: true, remaining: limit - count - 1 };
}
//# sourceMappingURL=rate-limiter.js.map