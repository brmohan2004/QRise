import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qrCodes, users } from "@/lib/db/schema";
import { generateShortCode } from "@/lib/short-code";
import { desc, eq, and, like, or, sql } from "drizzle-orm";
import { getAuthenticatedUser, requirePlanFeature } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { createQR, createBulkQR, bulkDeleteQR } from "@/lib/services/qr.service";
import { rateLimitByIP } from "@/lib/redis";
import { getEffectiveLimits } from "@/lib/api/rate-limit-config";
import { qrCodes as qrSchema } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const cursor = searchParams.get("cursor");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "newest";

    const query = db.select().from(qrCodes).where(eq(qrCodes.userId, user.id));

    // Filters
    const conditions = [eq(qrCodes.userId, user.id), eq(qrCodes.isDeleted, false)];
    if (search) {
      conditions.push(like(qrCodes.name, `%${search}%`));
    }
    if (type) {
      conditions.push(eq(qrCodes.type, type as any));
    }
    if (status === "active") {
      conditions.push(eq(qrCodes.isActive, true));
    } else if (status === "paused") {
      conditions.push(eq(qrCodes.isActive, false));
    }
    
    const bulkJobId = searchParams.get("bulkJobId");
    if (bulkJobId) {
      conditions.push(eq(qrCodes.bulkJobId, bulkJobId));
    }
    
    // Pagination (cursor based)
    if (cursor) {
      conditions.push(sql`${qrCodes.createdAt} < ${cursor}`);
    }

    const items = await db
      .select()
      .from(qrCodes)
      .where(and(...conditions))
      .orderBy(sort === "scans" ? desc(qrCodes.scanCount) : desc(qrCodes.createdAt))
      .limit(limit);

    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(qrCodes)
      .where(and(...conditions));
    
    const nextCursor = items.length === limit ? items[items.length - 1].createdAt?.toISOString() || null : null;

    return ApiResponse.paginated(items, nextCursor, Number(totalRes[0].count));
  } catch (error) {
    console.error("QR GET error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const body = await request.json();
    const { name, type, targetUrl, isDynamic, design, config } = body;

    // 0. Rate Limiting (REQ 3)
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = await rateLimitByIP(ip, "qr-create", 20, "1h");
    if (!rl.success) {
      return ApiResponse.error("QR creation limit reached (Max 20/hr).", 429);
    }

    // 1. Plan limit check (Numeric & Features)
    const userRec = await db.select({ plan: users.plan }).from(users).where(eq(users.id, user.id)).limit(1);
    const limits = await getEffectiveLimits(user.id, userRec[0]?.plan || 'free');

    // a. Check dynamic QR limit
    if (isDynamic ?? true) {
      const qrCountResult = await db
        .select({ count: count() })
        .from(qrSchema)
        .where(and(eq(qrSchema.userId, user.id), eq(qrSchema.isDynamic, true), eq(qrSchema.isDeleted, false)));
      
      const currentCount = Number(qrCountResult[0]?.count || 0);
      if (limits.maxDynamicQrs !== -1 && currentCount >= limits.maxDynamicQrs) {
        return ApiResponse.forbidden(`Plan limit reached: You can only have ${limits.maxDynamicQrs} dynamic QR codes.`);
      }
    }

    const isBulk = type === "bulk" || config?.type === "bulk";

    // 2. Business logic (via service)
    let result: any;
    if (isBulk && config?.rows) {
      result = await createBulkQR(user.id, {
        name: name || "Bulk Upload",
        rows: config.rows,
        isDynamic: isDynamic ?? true,
        designConfig: design || {},
        bulkType: config.bulkType || "url",
      });
    } else {
      result = await createQR(user.id, {
        name: name || config?.name || "Untitled QR",
        type: type || config?.type || "url",
        targetUrl: targetUrl || config?.targetUrl || config?.defaultUrl || "",
        isDynamic: isDynamic ?? true,
        rules: config?.rules,
        actions: config?.actions,
        password: config?.password,
      });

      // 3. Update design if provided (for single QRs, createBulkQR handles this internally)
      if (design) {
        const designToStore = {
          ...design,
          logoPublicId: design.logoPublicId ?? null,
        };
        await db.update(qrCodes).set({ designConfig: designToStore }).where(eq(qrCodes.id, result.id));
      }
    }

    return ApiResponse.ok(result, 201);
  } catch (error) {
    console.error("QR POST error:", error);
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

    await bulkDeleteQR(ids, user.id);

    return ApiResponse.noContent();
  } catch (error) {
    console.error("QR Bulk Delete error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
