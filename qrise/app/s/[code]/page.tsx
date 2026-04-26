import { db } from '@/lib/db';
import { qrCodes, scanEvents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { PasswordEntryForm } from '@/components/qr/password-entry-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseUA(ua: string | null) {
  if (!ua) return { deviceType: 'unknown', os: 'unknown', browser: 'unknown' };
  
  let deviceType = 'desktop';
  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
  
  let os = 'unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'Mac'; // Changed from macOS to Mac to match frontend config
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  
  let browser = 'unknown';
  if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge|edg/i.test(ua)) browser = 'Edge';
  
  return { deviceType, os, browser };
}

export default async function ShortCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // 1. Fetch QR code
  let qr;
  try {
    qr = await db.query.qrCodes.findFirst({
      where: eq(qrCodes.shortCode, code),
      with: {
        routingRules: true,
      },
    });
  } catch (error) {
    console.error('Database connection error in ShortCodePage:', error);
    // Return a user-friendly error instead of crashing
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900">Service Temporarily Unavailable</h1>
          <p className="text-slate-500 mt-2">
            We're having trouble connecting to our services. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (!qr) {
    notFound();
  }

  if (!qr.isActive || qr.isDeleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">QR Code Inactive</h1>
          <p className="text-slate-500 mt-2">This QR code has been disabled or removed.</p>
          <div className="mt-6">
            <a href={`/report/abuse/${code}`} className="text-sm text-red-600 hover:underline font-medium">
              Report this QR code
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Record scan (analytics)
  const headerList = await headers();
  const ua = headerList.get('user-agent');
  
  const { deviceType, os, browser } = parseUA(ua);
  
  try {
    await db.insert(scanEvents).values({
      qrId: qr.id,
      deviceType,
      os,
      browser,
      scannedAt: new Date(),
    });
  } catch (error) {
    console.error('Error recording scan:', error);
  }

  // 3. Handle Password Protection
  if (qr.passwordHash) {
    return <PasswordEntryForm qrId={qr.id} label={qr.name} />;
  }

  // 4. Evaluate Smart Routing Rules
  let finalTargetUrl = qr.targetUrl;

  if (qr.type === 'smart_routing' && qr.routingRules && qr.routingRules.length > 0) {
    const country = headerList.get('x-vercel-ip-country') || headerList.get('cf-ipcountry') || 'unknown';
    const language = headerList.get('accept-language') || 'unknown';

    const context = {
      device: deviceType,
      os: os,
      country: country,
      language: language,
    };

    // Sort rules by priority
    const sortedRules = [...qr.routingRules].sort((a, b) => (a.priority || 0) - (b.priority || 0));

    for (const rule of sortedRules) {
      if (!rule.conditions || !Array.isArray(rule.conditions)) continue;

      const isMatch = rule.conditions.every((cond: any) => {
        const { field, op, value } = cond;
        if (!field || !op || value === undefined) return false;

        const actualValue = context[field as keyof typeof context] || 'unknown';
        const actStr = String(actualValue).toLowerCase();
        const expStr = String(value).toLowerCase();

        if (op === 'eq') return actStr === expStr;
        if (op === 'in') return expStr.split(',').map(s => s.trim()).includes(actStr);
        return false;
      });

      if (isMatch && rule.targetUrl) {
        finalTargetUrl = rule.targetUrl;
        break; // Match found, stop evaluating
      }
    }
  }

  // 5. Redirect
  if (!finalTargetUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">No Destination</h1>
          <p className="text-slate-500 mt-2">This QR code doesn't have a destination set.</p>
          <div className="mt-6">
            <a href={`/report/abuse/${code}`} className="text-sm text-red-600 hover:underline font-medium">
              Report this QR code
            </a>
          </div>
        </div>
      </div>
    );
  }

  redirect(finalTargetUrl);
}
