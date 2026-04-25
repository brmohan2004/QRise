export interface WorkerEnv {
    QR_KV: KVNamespace;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;
    APP_URL: string;
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
}
export interface RequestContext {
    device: string;
    os: string;
    country: string;
    language: string;
    hour: number;
}
export declare function getCachedQR(kv: KVNamespace, shortCode: string): Promise<ResolvedQR | null>;
export declare function fetchQRFromDB(shortCode: string, env: WorkerEnv): Promise<ResolvedQR | null>;
export declare function evaluateRoutingRules(rules: RoutingRule[], context: RequestContext): string | null;
export declare function resolveRedirect(shortCode: string, request: Request, env: WorkerEnv): Promise<ResolvedQR | null>;
//# sourceMappingURL=redirect.d.ts.map