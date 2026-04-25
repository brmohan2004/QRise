export async function hashIP(ip) {
    const msgBuffer = new TextEncoder().encode(ip);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function checkUniqueness(kv, qrId, ipHash, uaHash) {
    const today = new Date().toISOString().split('T')[0];
    const uniqueKey = `uniq:${qrId}:${today}:${ipHash}:${uaHash}`;
    const existing = await kv.get(uniqueKey);
    if (existing) {
        return false;
    }
    await kv.put(uniqueKey, '1', { expirationTtl: 86400 });
    return true;
}
export async function logScanEvent(event, supabaseUrl, serviceKey) {
    try {
        await fetch(`${supabaseUrl}/rest/v1/scan_events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
                qr_id: event.qrId,
                scanned_at: new Date().toISOString(),
                country: event.country,
                city: event.city,
                device_type: event.deviceType,
                os: event.os,
                browser: event.browser,
                ip_hash: event.ipHash,
                is_bot: event.isBot,
                is_unique: event.isUnique,
                matched_rule_id: event.matchedRuleId,
            }),
        });
    }
    catch (error) {
        console.error('Failed to log scan event:', error);
    }
}
//# sourceMappingURL=analytics-logger.js.map