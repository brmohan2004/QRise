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
  'gptbot',     // ✅ lowercase
  'ccbot',      // ✅ lowercase
  'amazonbot',  // ✅ lowercase
];

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
}

export function isBotUA(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  for (let i = 0; i < BOT_PATTERNS.length; i++) {
    if (ua.includes(BOT_PATTERNS[i])) {
      return true;
    }
  }
  return false;
}

export function parseDevice(ua: string): DeviceInfo {
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
