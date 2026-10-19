import { db } from '@/lib/db';
import { qrCodes, forms, formSubmissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function sanitizeCSVCell(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Neutralize spreadsheet formula execution triggers: =, +, -, @, tab, newline
  const triggers = ['=', '+', '-', '@', '\t', '\r', '\n'];
  if (triggers.includes(str.charAt(0))) {
    str = `'${str}`;
  }
  // Escape embedded quotes
  return `"${str.replace(/"/g, '""')}"`;
}

export async function exportUserQRs(userId: string): Promise<string> {
  const qrList = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId));
  
  const headers = ['name', 'type', 'short_code', 'target_url', 'is_active', 'created_at'];
  const csv = [
    headers.join(','),
    ...qrList.map(qr => [
      sanitizeCSVCell(qr.name),
      sanitizeCSVCell(qr.type),
      sanitizeCSVCell(qr.shortCode),
      sanitizeCSVCell(qr.targetUrl || ''),
      String(qr.isActive),
      sanitizeCSVCell(qr.createdAt ? new Date(qr.createdAt).toISOString() : '')
    ].join(',')),
  ].join('\n');
  
  return csv;
}

export async function getUserQRCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: qrCodes.id })
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId));
  
  return Number(result[0]?.count) || 0;
}

export async function exportFormSubmissions(
  formId: string,
  userId: string
): Promise<string> {
  const form = await db.select().from(forms).where(eq(forms.id, formId)).limit(1);
  if (!form[0] || form[0].userId !== userId) {
    throw new Error('Form not found');
  }
  
  const submissions = await db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.formId, formId));
  
  const fields = JSON.parse(form[0].fieldsSchema as string) as { id: string; label: string }[];
  const headers = ['submitted_at', ...fields.map(f => sanitizeCSVCell(f.label)), 'ip_hash'];
  
  const csv = [
    headers.join(','),
    ...submissions.map(sub => {
      let data: Record<string, any> = {};
      try {
        data = typeof sub.submissionData === 'string' 
          ? JSON.parse(sub.submissionData) 
          : (sub.submissionData || {});
      } catch {}

      const submittedAt = sub.submittedAt ? sub.submittedAt.toISOString() : 'N/A';
      const row = [sanitizeCSVCell(submittedAt)];
      for (const field of fields) {
        row.push(sanitizeCSVCell(data[field.id] || ''));
      }
      row.push(sanitizeCSVCell(sub.ipHash || ''));
      return row.join(',');
    }),
  ].join('\n');
  
  return csv;
}