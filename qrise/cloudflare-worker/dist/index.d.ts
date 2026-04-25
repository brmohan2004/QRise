interface Env {
    QR_KV: KVNamespace;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;
    APP_URL: string;
}
declare const _default: {
    fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map