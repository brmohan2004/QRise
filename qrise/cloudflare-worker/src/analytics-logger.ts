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

export async function hashIP(ip: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function checkUniqueness(
  kv: KVNamespace,
  qrId: string,
  ipHash: string,
  userAgent: string
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  // Hash user agent for uniqueness
  const msgBuffer = new TextEncoder().encode(userAgent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const uaHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Format: uniq:{qrId}:{YYYY-MM-DD}:{ipHash16chars}:{uaHash8chars}
  const uniqueKey = `uniq:${qrId}:${today}:${ipHash.substring(0, 16)}:${uaHash.substring(0, 8)}`;
  
  const existing = await kv.get(uniqueKey);
  if (existing) {
    return false;
  }
  
  // TTL: 86400 seconds (24 hours)
  await kv.put(uniqueKey, '1', { expirationTtl: 86400 });
  return true;
}

export async function logScanEvent(
  event: ScanEvent,
  supabaseUrl: string,
  serviceKey: string
): Promise<void> {
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
  } catch (error) {
    console.error('Failed to log scan event:', error);
  }
}