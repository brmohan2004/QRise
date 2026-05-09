export type QRType = 'url' | 'smart_routing' | 'password' | 'multi_action' | 'bulk';

export interface QRDesign {
  dotColor: string;
  bgColor: string;
  eyeColor?: string;
  eyeStyle?: 'square' | 'dot' | 'extra-rounded';
  frameColor?: string;
  frameText?: string;
  frameTextColor?: string;
  logoUrl?: string;
  logoPublicId?: string;
  frameStyle?: 'none' | 'simple' | 'rounded' | 'badge_below' | 'badge_above' | 'bubble';
  dotStyle?: 'square' | 'dots' | 'rounded' | 'extra_rounded';
  qrVersion?: number;
  shape?: 'square' | 'micro' | 'rectangular';
  width?: number;
  height?: number;
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
  destinationType?: 'url' | 'text';
  label?: string;
}

export interface QRAction {
  id?: string;
  label: string;
  actionType: 'url' | 'phone' | 'email' | 'map' | 'download' | 'whatsapp' | 'text';
  actionValue: string;
  icon?: string;
  displayOrder: number;
}

export interface BulkRow {
  name: string;
  url?: string;
  type?: string;
  label?: string;
  value?: string;
  routingField?: string;
  routingOp?: string;
  routingValue?: string;
  routingTargetUrl?: string;
  actions?: { type: string; label: string; value: string }[];
  password?: string;
  isDynamic?: boolean;
  status: "valid" | "error" | "duplicate";
  error?: string;
}

export type QRConfig = 
  | { type: 'url'; targetUrl: string; destinationType?: 'url' | 'text'; bulkJobId?: string; rows?: BulkRow[] }
  | { type: 'smart_routing'; defaultUrl: string; defaultDestinationType?: 'url' | 'text'; rules: RoutingRule[]; bulkJobId?: string; rows?: BulkRow[] }
  | { type: 'password'; targetUrl: string; password: string; destinationType?: 'url' | 'text'; bulkJobId?: string; rows?: BulkRow[] }
  | { type: 'multi_action'; actions: QRAction[]; bulkJobId?: string; rows?: BulkRow[] }
  | { type: 'bulk'; totalRows: number; rows: BulkRow[]; bulkJobId?: string; bulkType?: 'url' | 'multi_action' | 'password' | 'smart_routing' };

export interface WizardState {
  step: 1 | 2 | 3;
  name: string;
  qrType: QRType | null;
  config: Partial<QRConfig>;
  design: Partial<QRDesign>;
  isDynamic: boolean;
  editingQrId: string | null;
}