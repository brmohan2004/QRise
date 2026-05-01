import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, formSubmissions } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { createForm, bulkDeleteForms } from "@/lib/services/form.service";
import { createQR } from "@/lib/services/qr.service";
import { rateLimitByIP } from "@/lib/redis";
import { getEffectiveLimits } from "@/lib/api/rate-limit-config";
import { users } from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "newest";

    // Fetch forms with submission counts using a subquery or join
    const data = await db
      .select({
        id: forms.id,
        name: forms.name,
        slug: forms.slug,
        isActive: forms.isActive,
        createdAt: forms.createdAt,
        submissionCount: sql<number>`(SELECT count(*) FROM ${formSubmissions} WHERE ${formSubmissions.formId} = ${forms.id})`,
      })
      .from(forms)
      .where(and(
        eq(forms.userId, user.id), 
        eq(forms.isDeleted, false),
        status === "active" ? eq(forms.isActive, true) : status === "paused" ? eq(forms.isActive, false) : undefined
      ))
      .orderBy(sort === "submissions" ? desc(sql`submission_count`) : desc(forms.createdAt));

    return ApiResponse.ok(data);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const body = await request.json();
    const { name, fields, successMessage } = body;

    // 0. Rate Limiting (REQ 3)
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = await rateLimitByIP(ip, "form-create", 10, "1h");
    if (!rl.success) {
      return ApiResponse.error("Form creation limit reached (Max 10/hr).", 429);
    }

    // 1. Quota Check
    const userRec = await db.select({ plan: users.plan }).from(users).where(eq(users.id, user.id)).limit(1);
    const limits = await getEffectiveLimits(user.id, userRec[0]?.plan || 'free');
    
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(forms).where(and(eq(forms.userId, user.id), eq(forms.isDeleted, false)));
    const currentCount = Number(countResult[0]?.count || 0);

    if (limits.formBuilderLimit !== -1 && currentCount >= limits.formBuilderLimit) {
       return ApiResponse.forbidden(`Plan limit reached: You can only have ${limits.formBuilderLimit} active forms.`);
    }

    if (!name || !fields || !Array.isArray(fields)) {
      return ApiResponse.badRequest("Invalid request body. Name and fields array required.");
    }

    // 1. Create the form
    const form = await createForm(user.id, {
      name,
      fieldsSchema: fields,
      successMessage,
    });

    // 2. Create the QR code pointing to this form
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qrise.com";
    const targetUrl = `${appUrl}/f/${form.slug}`;
    
    const qr = await createQR(user.id, {
      name: `Form: ${name}`,
      type: 'url',
      targetUrl,
      isDynamic: true,
    });

    // 3. Link QR ID back to the form
    await db.update(forms)
      .set({ qrId: qr.id })
      .where(eq(forms.id, form.id));

    return ApiResponse.ok({ form, qrCode: qr }, 201);
  } catch (error) {
    console.error("Form creation error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return ApiResponse.error("No IDs provided", 400);
    }

    await bulkDeleteForms(ids, user.id);

    return ApiResponse.noContent();
  } catch (error) {
    console.error("Form Bulk Delete error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
