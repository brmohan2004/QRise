export type AnalyticsRange = '7d' | '30d' | '90d' | 'all';

export interface ScanEvent {
  id: string;
  qrId: string;
  scannedAt: Date;
  country?: string;
  city?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  os?: string;
  browser?: string;
  ipHash?: string;
  isBot: boolean;
  isUnique: boolean;
  matchedRuleId?: string;
}

export interface ScanSummary {
  total: number;
  unique: number;
  bot: number;
}

export interface CountryBreakdown {
  country: string;
  count: number;
}

export interface DeviceBreakdown {
  deviceType: string;
  count: number;
}

export interface HourlyBreakdown {
  hour: number;
  count: number;
}