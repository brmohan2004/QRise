import qrcode from 'qrcode';
import sharp from 'sharp';
import { Readable } from 'stream';

export interface GetQrImageStreamOptions {
  content: string;
  format: 'png' | 'svg' | 'webp';
  size: number;
  margin: number;
  dark?: string;
  light?: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  designConfig?: Record<string, unknown>; // reserved for future design customization
}

export async function getQrImageStream(opts: GetQrImageStreamOptions): Promise<Readable> {
  const { content, format, size, margin, dark, light, errorCorrection } = opts;

  if (format === 'svg') {
    const svg = await qrcode.toString(content, {
      type: 'svg',
      width: size,
      margin,
      color: dark ? { dark, light: light || '#FFFFFF' } : undefined,
      errorCorrectionLevel: errorCorrection,
    });
    return Readable.from(Buffer.from(svg));
  }

  // PNG (or convert to WebP later)
  const buffer = await qrcode.toBuffer(content, {
    width: size,
    margin,
    color: dark ? { dark, light: light || '#FFFFFF' } : undefined,
    errorCorrectionLevel: errorCorrection,
  });

  if (format === 'webp') {
    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    return Readable.from(webpBuffer);
  }

  // PNG
  return Readable.from(buffer);
}

export async function generateQRBuffer(options: {
  content: string;
  size?: number;
  margin?: number;
  dark?: string;
  light?: string;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
}): Promise<Buffer> {
  const size = options.size ?? 512;
  const margin = options.margin ?? 4;
  const errorCorrection = options.errorCorrection ?? 'M';
  return qrcode.toBuffer(options.content, {
    width: size,
    margin,
    color: options.dark ? { dark: options.dark, light: options.light || '#FFFFFF' } : undefined,
    errorCorrectionLevel: errorCorrection,
  });
}

export async function generateQRSVG(options: {
  content: string;
  size?: number;
  margin?: number;
  dark?: string;
  light?: string;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
}): Promise<string> {
  const size = options.size ?? 512;
  const margin = options.margin ?? 4;
  const errorCorrection = options.errorCorrection ?? 'M';
  return qrcode.toString(options.content, {
    type: 'svg',
    width: size,
    margin,
    color: options.dark ? { dark: options.dark, light: options.light || '#FFFFFF' } : undefined,
    errorCorrectionLevel: errorCorrection,
  });
}

export function calculateScannabilityScore(_design: Record<string, unknown>): number {
  // Simplified: always return 100 for now
  return 100;
}

export interface ScannabilityResult {
  score: number;
  warnings: string[];
}

