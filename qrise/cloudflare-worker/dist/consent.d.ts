export interface ConsentPreferences {
    analytics: boolean;
    functional: boolean;
    marketing: boolean;
}
export interface ConsentState {
    hasConsent: boolean;
    preferences: ConsentPreferences;
    timestamp: number;
}
export declare const STORAGE_KEY = "qrise_consent";
export declare const DEFAULT_PREFERENCES: ConsentPreferences;
export declare function getConsentFromCookie(cookieHeader: string | null): ConsentState | null;
export declare function setConsentCookie(preferences: ConsentPreferences): string;
export declare function buildConsentBanner(appUrl: string): string;
export declare function getConsentHtml(appUrl: string): string;
//# sourceMappingURL=consent.d.ts.map