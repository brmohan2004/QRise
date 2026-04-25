import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBulkJob } from "@/lib/services/bulk.service";
import { rateLimitByIP } from "@/lib/redis";
import { sanitizeBulkRows } from "@/lib/sanitize";
import { ApiResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { bulkJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return ApiResponse.unauthorized();

    // 1. Rate Limiting (Sensitive Route)
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = await rateLimitByIP(ip, "bulk-create", 5, "1h");
    if (!rl.success) {
      return ApiResponse.error("Bulk creation limit reached. Please try again in an hour.", 429);
    }

    const { rows } = await request.json();

    if (!rows || !Array.isArray(rows)) {
      return ApiResponse.badRequest("Invalid request body: rows array required");
    }

    const maxRows = 1000;
    if (rows.length > maxRows) {
      return ApiResponse.badRequest(`Limit exceeded. Max ${maxRows} rows per job.`);
    }

    // 2. Sanitization (REQ 8)
    const sanitizedRows = sanitizeBulkRows(rows);
    const errors = sanitizedRows.filter(r => r.error);
    if (errors.length > 0) {
      return ApiResponse.badRequest(`Validation failed for ${errors.length} rows. Example: ${errors[0].error}`);
    }

    const job = await createBulkJob(user.id, sanitizedRows.length);

    // 3. Trigger processing with internal secret
    const internalSecret = process.env.INTERNAL_SECRET;
    
    if (!internalSecret) {
      console.error("[CRITICAL] INTERNAL_SECRET not configured");
      return ApiResponse.error("Server configuration error", 500);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bulk/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": internalSecret,
        },
        body: JSON.stringify({ jobId: job.id, rows: sanitizedRows }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Bulk process trigger failed:", res.status, errorText);
        // Mark job as failed
        await db.update(bulkJobs)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(bulkJobs.id, job.id));
        return ApiResponse.error("Failed to start bulk processing. Please try again later.", 500);
      }
    } catch (err) {
      console.error("Bulk trigger network error:", err);
      // Mark job as failed
      await db.update(bulkJobs)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(bulkJobs.id, job.id));
      return ApiResponse.error("Network error starting bulk job", 500);
    }

    return ApiResponse.ok({ jobId: job.id });
  } catch (error) {
    console.error("Bulk API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
