import { ApiResponse } from '@/lib/api-response';
import { db } from '@/lib/db';
import { bulkJobs, qrCodes, type BulkJob, type NewBulkJob } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateShortCode } from '@/lib/short-code';

export async function createBulkJob(
  userId: string,
  totalRows: number
): Promise<BulkJob> {
  const result = await db.insert(bulkJobs).values({
    userId,
    status: 'queued',
    totalRows,
  } as NewBulkJob).returning();
  
  return result[0];
}

export async function getBulkJobStatus(
  jobId: string,
  userId: string
): Promise<BulkJob | undefined> {
  const result = await db
    .select()
    .from(bulkJobs)
    .where(eq(bulkJobs.id, jobId))
    .limit(1);
  
  if (result[0] && result[0].userId === userId) {
    return result[0];
  }
  return undefined;
}

export async function processBulkJob(
  jobId: string,
  rows: { name: string; url: string }[]
): Promise<void> {
  await db
    .update(bulkJobs)
    .set({ status: 'processing', processedRows: 0 })
    .where(eq(bulkJobs.id, jobId));
  
  const processed: number[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const shortCode = await generateUniqueShortCode();
      
      await db.insert(qrCodes).values({
        userId: '',
        name: row.name,
        type: 'url',
        shortCode,
        targetUrl: row.url,
        bulkJobId: jobId,
      });
      
      processed.push(i + 1);
    } catch (error) {
      console.error(`Failed to process row ${i}:`, ApiResponse.getErrorMessage(error));
    }
    
    if ((i + 1) % 50 === 0 || i === rows.length - 1) {
      await db
        .update(bulkJobs)
        .set({ processedRows: i + 1 })
        .where(eq(bulkJobs.id, jobId));
    }
  }
  
  await db
    .update(bulkJobs)
    .set({ status: 'done', processedRows: rows.length })
    .where(eq(bulkJobs.id, jobId));
}

async function generateUniqueShortCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateShortCode();
    const existing = await db.select().from(qrCodes).where(eq(qrCodes.shortCode, code)).limit(1);
    if (existing.length === 0) {
      return code;
    }
  }
  throw new Error('Failed to generate unique short code');
}
