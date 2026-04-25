export interface RequestContext {
  device: 'mobile' | 'tablet' | 'desktop' | string;
  os: string;
  browser: string;
  country: string;
  hour: number;
}

export interface QRAction {
  id: string;
  label: string;
  actionType: string;
  actionValue: string;
  icon?: string;
  displayOrder: number;
}

export interface ResolvedQR {
  qrId: string;
  type: string;
  targetUrl: string;
  routingRules?: RoutingRule[];
  actions?: QRAction[];
  isActive: boolean;
  passwordHash?: string;
  label?: string;
}

export interface RoutingRule {
  id?: string;
  priority: number;
  conditions: RoutingCondition[];
  targetUrl: string;
}

export interface RoutingCondition {
  field: 'device' | 'os' | 'country' | 'language' | 'time_range';
  op: 'eq' | 'in' | 'between';
  value: string | string[];
}

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

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
}

export interface ActionMenuItem {
  id: string;
  label: string;
  actionType: string;
  actionValue: string;
  icon: string;
  displayOrder: number;
  color?: string;
}

export interface PasswordPageOptions {
  qrId: string;
  shortCode: string;
  label?: string;
  appUrl: string;
}

export interface ActionMenuOptions {
  qrId: string;
  actions: ActionMenuItem[];
  title?: string;
  appUrl: string;
}

export interface NotFoundOptions {
  shortCode?: string;
  appUrl: string;
}

export interface ErrorPageOptions {
  statusCode?: number;
  message: string;
  shortCode?: string;
  appUrl: string;
}

export interface WorkerEnv {
  QR_KV: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  APP_URL: string;
}
