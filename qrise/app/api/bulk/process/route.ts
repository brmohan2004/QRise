import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bulkJobs, qrCodes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { zipSync, strToU8 } from "fflate";
import { generateQRBuffer } from "@/lib/qr-generator";
import { createClient } from "@/lib/supabase/server";
import { sendBulkJobReadyEmail } from "@/lib/resend";
import { z } from "zod";
import { rateLimitByIP } from "@/lib/redis";
import { uploadZipToUploadThing } from "@/lib/uploadthing-server";

// Schema for bulk process request body
const BulkProcessSchema = z.object({
  jobId: z.string().uuid(),
  rows: z.array(z.object({
    name: z.string().min(1).max(200),
    url: z.string().url(),
  })).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-internal-secret");
    const expectedSecret = process.env.INTERNAL_SECRET;

    if (!expectedSecret) {
      console.error("[CRITICAL] INTERNAL_SECRET not set");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!authHeader || authHeader !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: prevent abuse even with internal secret
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = await rateLimitByIP(ip, "bulk-process", 10, "1h");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = BulkProcessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { jobId, rows } = parsed.data;

    // 1. Update job status to processing
    await db.update(bulkJobs)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(bulkJobs.id, jobId));

    const zipData: Record<string, Uint8Array> = {};
    let processedCount = 0;
    const batchSize = 10; // Process in small batches to avoid timeout

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (row, index) => {
        try {
          // In a real app we'd create the QR record first
          // For this bulk process, we'll just generate the images
          const buffer = await generateQRBuffer({ data: row.url });
          const filename = `${row.name.replace(/[^a-z0-9]/gi, '_')}_${jobId.slice(0,4)}_${i + index}.png`;
          zipData[filename] = new Uint8Array(buffer);
          processedCount++;
        } catch (err) {
          console.error(`Failed to process row ${i + index}:`, err);
        }
      }));

      // Update progress in DB
      await db.update(bulkJobs)
        .set({ processedRows: processedCount })
        .where(eq(bulkJobs.id, jobId));
    }

    // 2. Generate ZIP
    const zipBuffer = zipSync(zipData);

    // 3. Upload to UploadThing
    const filename = `qrise-bulk-${jobId}-${Date.now()}.zip`;
    const { url, key } = await uploadZipToUploadThing(zipBuffer, filename);

    // 4. Finalize job
    const finalJob = await db.update(bulkJobs)
      .set({
        status: 'done',
        processedRows: processedCount,
        zipUrl: url,
        zipFileKey: key,
        updatedAt: new Date()
      })
      .where(eq(bulkJobs.id, jobId))
      .returning();

    // 5. Notify user
    const job = finalJob[0];
    const user = await db.select().from(users).where(eq(users.id, job.userId)).limit(1);
    if (user[0]) {
      await sendBulkJobReadyEmail(user[0].email, jobId, url);
    }

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("Bulk process error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
