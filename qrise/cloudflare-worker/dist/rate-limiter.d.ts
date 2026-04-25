export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
}
export declare function checkRateLimit(kv: KVNamespace, key: string, limit: number, windowSec: number): Promise<RateLimitResult>;
//# sourceMappingURL=rate-limiter.d.ts.map