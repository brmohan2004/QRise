export function calculateScannabilityScore(dotColor: string, bgColor: string, logoCoverage: number): number {
  // Simple contrast heuristic
  const luminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const dotLum = luminance(dotColor);
  const bgLum = luminance(bgColor);
  const contrast = Math.abs(dotLum - bgLum) / 255; // 0-1

  let score = Math.round(contrast * 100);
  // Penalty for large logo coverage
  if (logoCoverage > 30) score -= 20;
  if (logoCoverage > 20) score -= 10;
  // Ensure within 0-100
  score = Math.max(0, Math.min(100, score));
  return score;
}
