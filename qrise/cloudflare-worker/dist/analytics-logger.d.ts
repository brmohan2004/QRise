export interface ScanEvent {
    qrId: string;
    country?: string;
    city?: string;
    deviceType?: string;
    os?: string;
    browser?: string;
    ipHash?: string;
    isBot: boolean;
    isUnique: boolean;
    matchedRuleId?: string;
}
export declare function hashIP(ip: string): Promise<string>;
export declare function checkUniqueness(kv: KVNamespace, qrId: string, ipHash: string, uaHash: string): Promise<boolean>;
export declare function logScanEvent(event: ScanEvent, supabaseUrl: string, serviceKey: string): Promise<void>;
//# sourceMappingURL=analytics-logger.d.ts.map