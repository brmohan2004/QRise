import { db } from '@/lib/db';
import { qrCodes, scanEvents, customQrTypes, typeResolvers } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { PasswordEntryForm } from '@/components/qr/password-entry-form';
import { Globe, Phone, Mail, MapPin, Download, MessageCircle, AlertTriangle } from 'lucide-react';
import { fireWebhookEvent } from '@/lib/webhooks/delivery';
import { executeResolver } from '@/lib/resolvers/executor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseUA(ua: string | null) {
  if (!ua) return { deviceType: 'unknown', os: 'unknown', browser: 'unknown' };
  
  let deviceType = 'desktop';
  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
  
  let os = 'unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'Mac';
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
        qrActions: true,
      },
    });
  } catch (error) {
    console.error('Database connection error in ShortCodePage:', error);
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

  if (!qr.isActive || qr.isDeleted || qr.status !== 'active') {
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
    const scanEventPromise = db.insert(scanEvents).values({
      qrId: qr.id,
      deviceType,
      os,
      browser,
      scannedAt: new Date(),
    });

    const updateCountPromise = db.update(qrCodes)
      .set({ scanCount: sql`${qrCodes.scanCount} + 1` })
      .where(eq(qrCodes.id, qr.id));

    const webhookPromise = fireWebhookEvent({
      userId: qr.userId,
      event: 'qr.scanned',
      payload: {
        qr_id: qr.id,
        scan_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ip: headerList.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
        country: headerList.get('x-vercel-ip-country') || 'unknown',
        user_agent: ua || 'unknown',
      }
    });

    await Promise.all([scanEventPromise, updateCountPromise, webhookPromise]);
  } catch (error) {
    console.error('Error recording scan or updating count/webhooks:', error);
  }

  // 3. Handle Password Protection
  if (qr.passwordHash) {
    return <PasswordEntryForm qrId={qr.id} label={qr.name} />;
  }

  // 4. Handle Multi Action QRs
  if (qr.type === 'multi_action' && qr.qrActions && qr.qrActions.length > 0) {
    const sortedActions = [...qr.qrActions].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 text-center bg-[#0F6E56] text-white">
            <h1 className="text-2xl font-bold">{qr.name}</h1>
            <p className="mt-2 text-emerald-100">Choose an action below</p>
          </div>
          <div className="p-6 space-y-4">
            {sortedActions.map((action) => {
              let href = action.actionValue || '#';
              let Icon = Globe;
              if (action.actionType === 'phone') { href = `tel:${action.actionValue}`; Icon = Phone; }
              else if (action.actionType === 'email') { href = `mailto:${action.actionValue}`; Icon = Mail; }
              else if (action.actionType === 'whatsapp') { 
                const cleanPhone = action.actionValue?.replace(/\D/g, '') || '';
                href = `https://wa.me/${cleanPhone}`; Icon = MessageCircle; 
              }
              else if (action.actionType === 'map') { href = `https://maps.google.com/?q=${encodeURIComponent(action.actionValue || '')}`; Icon = MapPin; }
              else if (action.actionType === 'download') { Icon = Download; }

              return (
                <a key={action.id} href={href} className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-[#0F6E56] hover:bg-emerald-50 transition-colors group">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 text-[#0F6E56] rounded-full flex items-center justify-center group-hover:bg-[#0F6E56] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4 flex-1 overflow-hidden">
                    <p className="text-lg font-semibold text-gray-900 group-hover:text-[#0F6E56] transition-colors truncate">{action.label}</p>
                    <p className="text-sm text-gray-500 truncate">{action.actionValue}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 5. Evaluate Smart Routing Rules
  let finalTargetUrl = qr.targetUrl;
  if (qr.type === 'smart_routing' && qr.routingRules && qr.routingRules.length > 0) {
    const country = headerList.get('x-vercel-ip-country') || 'unknown';
    const language = headerList.get('accept-language')?.split(',')[0] || 'unknown';
    const context = { device: deviceType, os, country, language };
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
        break;
      }
    }
  }

  // 6. Handle Custom QR Types (Resolvers)
  const builtInTypes = ['url', 'smart_routing', 'multi_action', 'password', 'bulk'];
  if (!builtInTypes.includes(qr.type)) {
    try {
      const typeRecord = await db.query.customQrTypes.findFirst({
        where: eq(customQrTypes.slug, qr.type),
      });

      if (typeRecord) {
        const resolver = await db.query.typeResolvers.findFirst({
          where: eq(typeResolvers.typeId, typeRecord.id),
        });

        if (resolver && resolver.isActive) {
          const result = await executeResolver(
            resolver.resolverUrl,
            resolver.resolverSecret,
            resolver.timeoutMs || 3000,
            {
              device_type: deviceType,
              os,
              country: headerList.get('x-vercel-ip-country') || 'unknown',
              language: headerList.get('accept-language')?.split(',')[0] || 'unknown',
              timestamp: new Date().toISOString(),
              qr_payload: (qr as any).dynamicData || {},
            }
          );

          if (result.redirect_url) {
            redirect(result.redirect_url);
          }

          if (result.rendered_html) {
            return (
              <div className="fixed inset-0 w-screen h-screen bg-white">
                <iframe 
                  srcDoc={result.rendered_html} 
                  title={qr.name}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                />
              </div>
            );
          }

          if (result.error) {
            console.error(`Resolver error for ${qr.type}:`, result.error);
            if (resolver.fallbackUrl) redirect(resolver.fallbackUrl);
            if (resolver.fallbackHtml) {
              return (
                <div className="fixed inset-0 w-screen h-screen bg-white">
                  <iframe 
                    srcDoc={resolver.fallbackHtml} 
                    title={qr.name}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                  />
                </div>
              );
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in custom type resolution:', err);
    }
  }

  // 7. Final Redirect
  if (!finalTargetUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">No Destination</h1>
          <p className="text-slate-500 mt-2">This QR code doesn't have a destination set.</p>
          <div className="mt-6">
            <a href={`/report/abuse/${code}`} className="text-sm text-red-600 hover:underline font-medium">Report this QR code</a>
          </div>
        </div>
      </div>
    );
  }

  redirect(finalTargetUrl);
}
