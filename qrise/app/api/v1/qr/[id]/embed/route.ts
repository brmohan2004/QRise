import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withApiAuth } from '@/lib/api/auth-middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { SCOPES } from '@/lib/api/scope-registry';

const EMBED_CSS_URL = `${process.env.NEXT_PUBLIC_APP_URL}/embed/embed.css`;

export const GET = withApiAuth(async (req, ctx) => {
  const { params } = req;
  const id = params?.id;
  if (!id) return apiError('VALIDATION_ERROR', 'QR ID required.', 400);

  const { searchParams } = new URL(req.url);
  const style = (searchParams.get('style') || 'card') as 'card' | 'minimal' | 'badge' | 'floating';
  const theme = (searchParams.get('theme') || 'auto') as 'light' | 'dark' | 'auto';
  const size = (searchParams.get('size') || 'md') as 'sm' | 'md' | 'lg';
  const showScanCount = searchParams.get('show_scan_count') !== 'false';
  const showName = searchParams.get('show_name') !== 'false';

   const qr = await db
     .select({
       name: qrCodes.name,
       shortCode: qrCodes.shortCode,
       scanCount: qrCodes.scanCount,
     })
     .from(qrCodes)
     .where(eq(qrCodes.id, id))
     .limit(1);

  if (!qr[0]) {
    return apiError('QR_NOT_FOUND', 'QR code not found.', 404);
  }

  const q = qr[0];
  const qrImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/qr/${id}/image?format=png&size=256`;

  const html = generateEmbedHtml({
    id,
    name: q.name,
    shortCode: q.shortCode,
    scanCount: Number(q.scanCount),
    style,
    theme,
    size,
    showScanCount,
    showName,
    qrImageUrl,
    cssUrl: EMBED_CSS_URL,
  });

  const iframeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/embed/qr/${q.shortCode}?style=${style}&theme=${theme}&size=${size}&show_scan_count=${showScanCount}&show_name=${showName}`;

  const reactSnippet = `<QRiseEmbed id="${id}" style="${style}" theme="${theme}" size="${size}" showScanCount={${showScanCount}} showName={${showName}} />`;

  return apiSuccess({
    html,
    iframe_url: iframeUrl,
    css_url: EMBED_CSS_URL,
    react_snippet: reactSnippet,
  });
}, { scope: SCOPES.QR_READ, billableUnit: 'embed_render' });

function generateEmbedHtml(opts: {
  id: string;
  name: string;
  shortCode: string;
  scanCount: number;
  style: string;
  theme: string;
  size: string;
  showScanCount: boolean;
  showName: boolean;
  qrImageUrl: string;
  cssUrl: string;
}): string {
  const classes = [`qrise-embed`, `--${opts.style}`, `--${opts.size}`, opts.theme === 'dark' ? '--dark' : ''].filter(Boolean).join(' ');
  return `
<link rel="stylesheet" href="${opts.cssUrl}">
<div class="${classes}" data-qr-id="${opts.id}">
  ${opts.showName ? `<div class="qr-name">${escapeHtml(opts.name)}</div>` : ''}
  <img src="${opts.qrImageUrl}" alt="QR Code" class="qr-image" />
  ${opts.showScanCount ? `<div class="qr-scans">${opts.scanCount.toLocaleString()} scans</div>` : ''}
</div>
`.trim();
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!));
}
