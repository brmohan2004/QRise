export declare const BOT_PATTERNS: string[];
export interface DeviceInfo {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
}
export declare function isBotUA(userAgent: string): boolean;
export declare function parseDevice(ua: string): DeviceInfo;
//# sourceMappingURL=bot-filter.d.ts.map