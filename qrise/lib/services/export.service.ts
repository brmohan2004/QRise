import { db } from '@/lib/db';
import { qrCodes, forms, formSubmissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function exportUserQRs(userId: string): Promise<string> {
  const qrList = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId));
  
  const csv = [
    'name,type,short_code,target_url,is_active,created_at',
    ...qrList.map(qr => 
      `"${qr.name}","${qr.type}","${qr.shortCode}","${qr.targetUrl || ''}",${qr.isActive},"${qr.createdAt}"`
    ),
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
  const headers = ['submitted_at', ...fields.map(f => f.label), 'ip_hash'];
  
  const csv = [
    headers.join(','),
    ...submissions.map(sub => {
      const data = JSON.parse(sub.submissionData as string);
      const submittedAt = sub.submittedAt ? sub.submittedAt.toISOString() : 'N/A';
      const row = [submittedAt];
      for (const field of fields) {
        row.push(`"${data[field.id] || ''}"`);
      }
      row.push(sub.ipHash || '');
      return row.join(',');
    }),
  ].join('\n');
  
  return csv;
}