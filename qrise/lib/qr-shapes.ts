// Shape definitions and canvas renderers for QRise
// Supports standard QR, Micro QR, Rectangular rMQR, Data Matrix, Cool Data Matrix, Aztec, and Trillcode

import type { QRShapeType } from "@/types/qr.types";

export interface ShapeDefinition {
  id: QRShapeType;
  label: string;
  description: string;
  category: "standard" | "matrix" | "specialty";
  width: number;
  height: number;
  scannabilityNote: string;
}

export const SHAPE_METADATA: Record<QRShapeType, ShapeDefinition> = {
  square: {
    id: "square",
    label: "QR Code",
    description: "Classic ISO standard square QR code",
    category: "standard",
    width: 300,
    height: 300,
    scannabilityNote: "Universal compatibility with all mobile cameras.",
  },
  micro: {
    id: "micro",
    label: "Micro QR",
    description: "Compact single-finder QR code",
    category: "standard",
    width: 200,
    height: 200,
    scannabilityNote: "Optimized for short text/URLs (max 15–21 chars).",
  },
  rectangular: {
    id: "rectangular",
    label: "Rectangular",
    description: "Wide format rMQR ISO standard",
    category: "standard",
    width: 340,
    height: 170,
    scannabilityNote: "Ideal for slender banners, tickets, and wristbands.",
  },
  datamatrix: {
    id: "datamatrix",
    label: "Data Matrix",
    description: "High-density 2D industrial matrix",
    category: "matrix",
    width: 280,
    height: 280,
    scannabilityNote: "Standard ISO/IEC 16022. Read by industrial & mobile scanners.",
  },
  aztec: {
    id: "aztec",
    label: "Aztec Code",
    description: "Central bullseye target 2D code",
    category: "matrix",
    width: 280,
    height: 280,
    scannabilityNote: "Standard ISO/IEC 24778. Used widely in transit and ticketing.",
  },
  trillcode: {
    id: "trillcode",
    label: "Trillcode",
    description: "Lark Computer 3-border matrix tag",
    category: "specialty",
    width: 280,
    height: 280,
    scannabilityNote: "Historic 2D code with globe watermark & dotted bottom.",
  },
};

/** Deterministic pseudo-random bit generator for fallback/proprietary shapes */
export function getDeterministicBits(text: string, count: number): number[] {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const bits: number[] = [];
  let state = hash;
  for (let i = 0; i < count; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    bits.push((state >> 16) & 1);
  }
  return bits;
}

/**
 * Extracts real Data Matrix bits using bwip-js raw, or falls back to deterministic bits.
 */
function getDataMatrixBits(bwip: any, text: string, targetSize = 20): { pixs: number[]; cols: number; rows: number } {
  try {
    if (bwip?.raw) {
      const raw = bwip.raw({ bcid: "datamatrix", text });
      if (raw && raw[0]?.pixs?.length) {
        return {
          pixs: Array.from(raw[0].pixs),
          cols: raw[0].pixx,
          rows: raw[0].pixy,
        };
      }
    }
  } catch {
    // Fallback if bwip raw fails on custom payload
  }
  const bits = getDeterministicBits(text, targetSize * targetSize);
  return { pixs: bits, cols: targetSize, rows: targetSize };
}

/** 1. Data Matrix (Standard BWIP) */
export function renderDataMatrix(
  canvas: HTMLCanvasElement,
  bwip: any,
  text: string,
  dotColor: string,
  bgColor: string,
  width = 280,
  height = 280
) {
  const cleanDot = dotColor.replace("#", "");
  const cleanBg = bgColor.replace("#", "");
  const minDim = Math.min(width, height);
  const scale = Math.max(3, Math.round(minDim / 56));
  bwip.toCanvas(canvas, {
    bcid: "datamatrix",
    text,
    scale,
    barcolor: cleanDot,
    backgroundcolor: cleanBg,
    includetext: false,
    padding: Math.max(6, Math.round(minDim * 0.04)),
  });
}

/** 2. Cool Data Matrix */
export function renderCoolDataMatrix(
  canvas: HTMLCanvasElement,
  bwip: any,
  text: string,
  dotColor: string,
  bgColor: string,
  width = 280,
  height = 280
) {
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(2, 2);

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const pad = Math.max(12, Math.round(Math.min(width, height) * 0.08));
  const w = width - pad * 2;
  const h = height - pad * 2;
  const { pixs, cols, rows } = getDataMatrixBits(bwip, text, 20);
  const cellW = w / cols;
  const cellH = h / rows;

  ctx.fillStyle = dotColor;

  // Solid Top Finder Bar
  ctx.fillRect(pad, pad, w, cellH * 1.15);

  // Solid Left Finder Bar
  ctx.fillRect(pad, pad, cellW * 1.15, h);

  // Right timing track (alternating dots)
  for (let r = 0; r < rows; r++) {
    if (r % 2 === 0) {
      ctx.beginPath();
      ctx.arc(pad + w - cellW / 2, pad + r * cellH + cellH / 2, Math.min(cellW, cellH) * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Bottom timing track (alternating dots)
  for (let c = 0; c < cols; c++) {
    if (c % 2 === 0) {
      ctx.beginPath();
      ctx.arc(pad + c * cellW + cellW / 2, pad + h - cellH / 2, Math.min(cellW, cellH) * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner data modules as smooth circular dots
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const idx = r * cols + c;
      if (pixs[idx] === 1) {
        ctx.beginPath();
        ctx.arc(pad + c * cellW + cellW / 2, pad + r * cellH + cellH / 2, Math.min(cellW, cellH) * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/** 3. Aztec Code (Standard BWIP) */
export function renderAztec(
  canvas: HTMLCanvasElement,
  bwip: any,
  text: string,
  dotColor: string,
  bgColor: string,
  width = 280,
  height = 280
) {
  const cleanDot = dotColor.replace("#", "");
  const cleanBg = bgColor.replace("#", "");
  const minDim = Math.min(width, height);
  const scale = Math.max(3, Math.round(minDim / 70));
  bwip.toCanvas(canvas, {
    bcid: "azteccode",
    text,
    scale,
    barcolor: cleanDot,
    backgroundcolor: cleanBg,
    includetext: false,
    padding: Math.max(6, Math.round(minDim * 0.04)),
  });
}

/** 4. Trillcode */
export function renderTrillcode(
  canvas: HTMLCanvasElement,
  bwip: any,
  text: string,
  dotColor: string,
  bgColor: string,
  width = 280,
  height = 280
) {
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(2, 2);

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const pad = Math.max(12, Math.round(Math.min(width, height) * 0.08));
  const w = width - pad * 2;
  const h = height - pad * 2;
  const borderThick = Math.max(2.5, Math.round(Math.min(width, height) * 0.013));

  ctx.fillStyle = dotColor;
  ctx.fillRect(pad, pad, w, borderThick);
  ctx.fillRect(pad + w - borderThick, pad, borderThick, h);
  const emblemArea = Math.max(22, Math.round(Math.min(width, height) * 0.12));
  ctx.fillRect(pad, pad, borderThick, h - emblemArea);

  // Bottom dashed/timing dots
  const dotCount = 10;
  const dotStep = w / dotCount;
  for (let i = 2; i < dotCount; i++) {
    ctx.fillRect(pad + i * dotStep, pad + h - borderThick, dotStep * 0.45, borderThick);
  }

  // Inside matrix
  const { pixs, cols, rows } = getDataMatrixBits(bwip, text, 22);
  const cellW = (w - borderThick * 4) / cols;
  const cellH = (h - borderThick * 4) / rows;
  const startX = pad + borderThick * 2;
  const startY = pad + borderThick * 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r > rows - 5 && c < 5) continue;
      if (pixs[r * cols + c] === 1) {
        ctx.fillRect(startX + c * cellW, startY + r * cellH, cellW - 0.8, cellH - 0.8);
      }
    }
  }

  // Lark Computer Globe Watermark in lower-left
  const emblemX = pad + emblemArea * 0.5;
  const emblemY = pad + h - emblemArea * 0.5;
  const emblemR = emblemArea * 0.35;

  ctx.strokeStyle = dotColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, emblemR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(emblemX - emblemR, emblemY);
  ctx.lineTo(emblemX + emblemR, emblemY);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(emblemX, emblemY, emblemR * 0.45, emblemR, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Universal shape renderer dispatcher
 */
export function renderTagShape(
  canvas: HTMLCanvasElement,
  shape: QRShapeType,
  text: string,
  bwip: any,
  dotColor = "#000000",
  bgColor = "#ffffff",
  width = 280,
  height = 280
) {
  switch (shape) {
    case "datamatrix":
      renderDataMatrix(canvas, bwip, text, dotColor, bgColor, width, height);
      break;
    case "aztec":
      renderAztec(canvas, bwip, text, dotColor, bgColor, width, height);
      break;
    case "trillcode":
      renderTrillcode(canvas, bwip, text, dotColor, bgColor, width, height);
      break;
    default:
      renderDataMatrix(canvas, bwip, text, dotColor, bgColor, width, height);
      break;
  }
}
