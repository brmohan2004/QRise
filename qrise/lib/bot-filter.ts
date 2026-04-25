export const BOT_PATTERNS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',
  'ia_archiver',
  'wget',
  'curl',
  'python-requests',
  'python-urllib',
  'go-http-client',
  'node-fetch',
  'axios/',
  'libwww-perl',
  'java/',
  'ruby',
  'scrapy',
  'phantomjs',
  'headlesschrome',
  'prerender',
  'uptimerobot',
  'pingdom',
  'datadog',
  'newrelic',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'gptbot',   // lowercase
  'ccbot',    // lowercase
  'amazonbot', // lowercase
];

/**
 * Check if a User-Agent string indicates a bot
 */
export function isBotUA(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
}

/**
 * Parse device info from User-Agent
 */
export function parseDevice(ua: string): {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
} {
  const lowerUA = ua.toLowerCase();
  
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (lowerUA.includes('mobile') || lowerUA.includes('android')) {
    type = 'mobile';
  } else if (lowerUA.includes('tablet') || lowerUA.includes('ipad')) {
    type = 'tablet';
  }
  
  let os = 'Unknown';
  if (lowerUA.includes('windows')) os = 'Windows';
  else if (lowerUA.includes('mac os')) os = 'macOS';
  else if (lowerUA.includes('linux')) os = 'Linux';
  else if (lowerUA.includes('android')) os = 'Android';
  else if (lowerUA.includes('ios') || lowerUA.includes('iphone')) os = 'iOS';
  
  let browser = 'Unknown';
  if (lowerUA.includes('chrome')) browser = 'Chrome';
  else if (lowerUA.includes('safari')) browser = 'Safari';
  else if (lowerUA.includes('firefox')) browser = 'Firefox';
  else if (lowerUA.includes('edge')) browser = 'Edge';
  
  return { type, os, browser };
}

export interface BotRequest {
  ua: string;
  hasJsCookie?: boolean;
}

export function isLikelyBot(req: BotRequest): boolean {
  if (!req.ua) return true;
  
  const ua = req.ua.toLowerCase();
  
  if (isBotUA(req.ua)) return true;
  
  if (req.hasJsCookie === false) {
    const suspiciousPatterns = [
      '^mozilla/5.0$',
      '^mozilla/4.0$',
      '^wget',
      '^curl',
      '^python',
      '^java/',
      '^ruby',
      '^go-http',
    ];
    
    for (const pattern of suspiciousPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(ua)) return true;
    }
  }
  
  return false;
}