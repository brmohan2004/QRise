export type QRType = 'url' | 'smart_routing' | 'password' | 'multi_action' | 'bulk';

export interface QRDesign {
  dotColor: string;
  bgColor: string;
  eyeColor?: string;
  eyeStyle?: 'square' | 'dot' | 'extra-rounded';
  frameColor?: string;
  logoUrl?: string;
  logoPublicId?: string;
  frameStyle?: 'none' | 'simple' | 'rounded' | 'badge_below' | 'badge_above' | 'bubble';
  dotStyle?: 'square' | 'dots' | 'rounded' | 'extra_rounded';
}

export interface RoutingCondition {
  field: 'device' | 'os' | 'country' | 'language' | 'time_range';
  op: 'eq' | 'in' | 'between';
  value: string | string[];
}

export interface RoutingRule {
  id?: string;
  priority: number;
  conditions: RoutingCondition[];
  targetUrl: string;
  label?: string;
}

export interface QRAction {
  id?: string;
  label: string;
  actionType: 'url' | 'phone' | 'email' | 'map' | 'download' | 'whatsapp';
  actionValue: string;
  icon?: string;
  displayOrder: number;
}

export type QRConfig = 
  | { type: 'url'; targetUrl: string; bulkJobId?: string; rows?: any[] }
  | { type: 'smart_routing'; defaultUrl: string; rules: RoutingRule[]; bulkJobId?: string; rows?: any[] }
  | { type: 'password'; targetUrl: string; password: string; bulkJobId?: string; rows?: any[] }
  | { type: 'multi_action'; actions: QRAction[]; bulkJobId?: string; rows?: any[] }
  | { type: 'bulk'; totalRows: number; rows: any[]; bulkJobId?: string };

export interface WizardState {
  step: 1 | 2 | 3;
  name: string;
  qrType: QRType | null;
  config: Partial<QRConfig>;
  design: Partial<QRDesign>;
  isDynamic: boolean;
  editingQrId: string | null;
}