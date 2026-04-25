/**
 * Input sanitization utilities for CSV injection prevention,
 * URL validation, and basic XSS mitigation.
 */

const CSV_DANGEROUS_CHARS = ['=', '+', '-', '@', '\t', '\r', '\n'];

/**
 * Sanitize a CSV cell value to prevent formula injection.
 * Prepends a single quote if the cell starts with a dangerous character.
 */
export function sanitizeCSVCell(cell: string): string {
  if (!cell) return '';
  const trimmed = cell.trim();
  if (CSV_DANGEROUS_CHARS.some((c) => trimmed.startsWith(c))) {
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Validate and sanitize a URL. Returns null if invalid.
 * Only allows http:// and https:// protocols.
 */
export function sanitizeURL(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Reject javascript:, data:, vbscript:, etc.
  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Strip HTML tags from a string to prevent basic XSS.
 * This is a simple fallback — use a proper sanitizer (DOMPurify) for rich text.
 */
export function stripHTMLTags(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * Sanitize a batch of CSV rows (used by bulk upload).
 */
export function sanitizeBulkRows(
  rows: { name: string; url: string }[]
): { name: string; url: string; error?: string }[] {
  return rows.map((row) => {
    const name = sanitizeCSVCell(row.name);
    const url = sanitizeURL(row.url);

    if (!url) {
      return { name, url: row.url, error: `Invalid URL: ${row.url}` };
    }

    return { name, url };
  });
}
