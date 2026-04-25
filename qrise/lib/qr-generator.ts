import QRCode from 'qrcode';

export interface QROptions {
  data: string;
  dotColor?: string;
  bgColor?: string;
  logoUrl?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  size?: number;
}

/**
 * Generate QR code as PNG buffer
 */
export async function generateQRBuffer(options: QROptions): Promise<Buffer> {
  return QRCode.toBuffer(options.data, {
    color: {
      dark: options.dotColor || '#000000',
      light: options.bgColor || '#ffffff',
    },
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    width: options.size || 300,
    margin: 1,
  });
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRSVG(options: QROptions): Promise<string> {
  return QRCode.toString(options.data, {
    type: 'svg',
    color: {
      dark: options.dotColor || '#000000',
      light: options.bgColor || '#ffffff',
    },
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    width: options.size || 300,
    margin: 1,
  });
}

/**
 * Calculate scannability score (0-100)
 */
export function calculateScannabilityScore(
  dotColor: string,
  bgColor: string,
  logoCoverage: number
): number {
  let score = 0;
  
  // Contrast check (50 points max)
  const contrast = getContrastRatio(dotColor, bgColor);
  if (contrast >= 7) score += 50;
  else if (contrast >= 5) score += 35;
  else if (contrast >= 3) score += 20;
  else score += 5;
  
  // Logo coverage (50 points max)
  if (logoCoverage <= 10) score += 50;
  else if (logoCoverage <= 20) score += 35;
  else if (logoCoverage <= 30) score += 20;
  else score += 5;
  
  return Math.min(100, score);
}

function getContrastRatio(fg: string, bg: string): number {
  const fgL = getLuminance(fg);
  const bgL = getLuminance(bg);
  const lighter = Math.max(fgL, bgL);
  const darker = Math.min(fgL, bgL);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}
