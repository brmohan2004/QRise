import { db } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface EmbedPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmbedPage({ params, searchParams }: EmbedPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const style = (resolvedSearchParams.style as string) || 'card';
  const theme = (resolvedSearchParams.theme as string) || 'auto';
  const size = (resolvedSearchParams.size as string) || 'md';
  const showScanCount = resolvedSearchParams.show_scan_count !== 'false';
  const showName = resolvedSearchParams.show_name !== 'false';

  const data = await db
    .select({ 
      name: qrCodes.name, 
      scanCount: qrCodes.scanCount,
      shortCode: qrCodes.shortCode,
      designConfig: qrCodes.designConfig
    })
    .from(qrCodes)
    .where(eq(qrCodes.id, id))
    .limit(1);

  if (!data || data.length === 0) {
    notFound();
  }

  const qr = data[0];
  const qrImageUrl = `/api/v1/qr/${id}/image?format=png&size=256`;
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/s/${qr.shortCode}`;

  return (
    <div className={`qrise-embed-wrapper ${theme}`}>
      <link rel="stylesheet" href="/embed/embed.css" />
      <div className={`qrise-embed --${style} --${size}`}>
        {showName && <div className="qr-name">{qr.name}</div>}
        <div className="qr-image-container">
          <img src={qrImageUrl} alt="QR Code" className="qr-image" />
        </div>
        {showScanCount && (
          <div className="qr-scans">
            <span className="scan-number">{Number(qr.scanCount).toLocaleString()}</span> scans
          </div>
        )}
        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="qr-short-link">
          {shortUrl.replace(/^https?:\/\//, '')}
        </a>
      </div>
    </div>
  );
}

// Security headers are typically handled in middleware or next.config.js for all /embed/* routes.
// However, we can also set them in a dedicated route handler if this were an API.
// For a Page, we'll assume the middleware handles frame-ancestors.
