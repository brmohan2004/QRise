export async function getCachedQR(kv, shortCode) {
    const data = await kv.get(`qr:${shortCode}`);
    if (!data)
        return null;
    return JSON.parse(data);
}
export async function fetchQRFromDB(shortCode, env) {
    try {
        const response = await fetch(`${env.SUPABASE_URL}/rest/v1/qr_codes?short_code=eq.${shortCode}&select=*`, {
            headers: {
                'apikey': env.SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            },
        });
        if (!response.ok)
            return null;
        const rows = await response.json();
        if (!rows || rows.length === 0)
            return null;
        const qr = rows[0];
        const resolved = {
            qrId: qr.id,
            type: qr.type,
            targetUrl: qr.target_url,
            isActive: qr.is_active,
            passwordHash: qr.password_hash,
        };
        // Cache in KV
        await env.QR_KV.put(`qr:${shortCode}`, JSON.stringify(resolved), { expirationTtl: 60 });
        return resolved;
    }
    catch (error) {
        console.error('Failed to fetch QR from DB:', error);
        return null;
    }
}
export function evaluateRoutingRules(rules, context) {
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    for (const rule of sorted) {
        let allMatch = true;
        for (const condition of rule.conditions) {
            if (!evaluateCondition(condition, context)) {
                allMatch = false;
                break;
            }
        }
        if (allMatch) {
            return rule.targetUrl;
        }
    }
    return null;
}
function evaluateCondition(condition, context) {
    const value = context[condition.field];
    if (condition.op === 'eq') {
        return value === condition.value;
    }
    if (condition.op === 'in') {
        const values = condition.value;
        return values.includes(value);
    }
    return false;
}
export async function resolveRedirect(shortCode, request, env) {
    // Check KV cache first
    const cached = await getCachedQR(env.QR_KV, shortCode);
    if (cached)
        return cached;
    // Fetch from DB
    return fetchQRFromDB(shortCode, env);
}
//# sourceMappingURL=redirect.js.map