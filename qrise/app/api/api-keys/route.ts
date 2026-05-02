import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

import { generateApiKey } from "@/lib/api-key";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { rateLimitByIP } from "@/lib/redis";
import { ApiResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const keys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      isActive: apiKeys.isActive,
      monthlyCallLimit: apiKeys.monthlyCallLimit,
      callsThisMonth: apiKeys.callsThisMonth,
      callsResetAt: apiKeys.callsResetAt,
      environment: apiKeys.environment,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, user.id), eq(apiKeys.isActive, true)))
    .orderBy(desc(apiKeys.createdAt));

    const maskedKeys = keys.map(k => ({
      ...k,
      keyPrefix: k.keyPrefix ? k.keyPrefix.substring(0, 8) + '***' : '***', // Mask S4
    }));

    return ApiResponse.ok(maskedKeys);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    // 1. Rate Limiting (REQ 3)
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rl = await rateLimitByIP(ip, "api-key-create", 10, "1h");
    if (!rl.success) {
      return ApiResponse.error("API key creation limit reached (Max 10/hr).", 429);
    }

    const { name, scopes } = await request.json();

    if (!name || !scopes || !Array.isArray(scopes)) {
      return ApiResponse.badRequest("Invalid request body. Name and scopes array required.");
    }

    const { raw, prefix, hash } = generateApiKey();

    const result = await db.insert(apiKeys).values({
      userId: user.id,
      name,
      keyPrefix: prefix,
      keyHash: hash,
      scopes,
    }).returning();

    // ⚠️  SECURITY: Return raw key ONLY once. Client must store it immediately.
    // Never log it. Never return it in subsequent GET requests.
    return ApiResponse.ok({
      ...result[0],
      // rawKey is intentionally included ONLY in the creation response
      // After this, the key cannot be retrieved again
      rawKey: raw,
    }, 201);
  } catch (error) {
    console.error("API Key creation error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
