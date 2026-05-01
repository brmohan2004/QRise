import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, plans, qrCodes, scanEvents, forms, formSubmissions, apiKeys, webhooks, customQrTypes, apiUsageEvents } from "@/lib/db/schema";
import { eq, and, sql, gte, count } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    // 1. Fetch user and plan limits
    const result = await db
      .select({
        user: users,
        plan: plans,
      })
      .from(users)
      .leftJoin(plans, sql`lower(${users.plan}) = lower(${plans.name})`)
      .where(eq(users.id, user.id))
      .limit(1);

    const userData = result[0]?.user;
    const planData = result[0]?.plan;

    if (!userData) return ApiResponse.notFound("User not found");

    // 2. Calculate current usage
    
    // a. Total Scans (Current Month)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const scansResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(scanEvents)
      .innerJoin(qrCodes, eq(scanEvents.qrId, qrCodes.id))
      .where(
        and(
          eq(qrCodes.userId, user.id),
          gte(scanEvents.scannedAt, firstDayOfMonth)
        )
      );
    
    // b. Dynamic QRs
    const qrResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(qrCodes)
      .where(
        and(
          eq(qrCodes.userId, user.id),
          eq(qrCodes.isDynamic, true),
          eq(qrCodes.isDeleted, false)
        )
      );

    // c. API Keys
    const apiKeysResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, user.id));

    // d. Form Submissions
    const submissionsResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(formSubmissions)
      .innerJoin(forms, eq(formSubmissions.formId, forms.id))
      .where(eq(forms.userId, user.id));

    // e. Active Forms
    const activeFormsResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(forms)
      .where(
        and(
          eq(forms.userId, user.id),
          eq(forms.isActive, true),
          eq(forms.isDeleted, false)
        )
      );

    // f. Custom Types
    const customTypesResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(customQrTypes)
      .where(
        and(
          eq(customQrTypes.userId, user.id),
          eq(customQrTypes.isSuspended, false)
        )
      );

    // g. Real API Calls (Current Month)
    const apiCallsResultReal = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(apiUsageEvents)
      .where(
        and(
          eq(apiUsageEvents.userId, user.id),
          gte(apiUsageEvents.calledAt, firstDayOfMonth)
        )
      );

    return ApiResponse.ok({
      plan: {
        name: planData?.name || userData.plan,
        limits: {
          monthlyScans: planData?.monthlyScanLimit ?? 0,
          dynamicQrs: planData?.dynamicQrLimit ?? 0,
          apiCalls: planData?.apiCallLimit ?? 0,
          formSubmissions: planData?.formSubmissionLimit ?? 0,
          forms: planData?.formBuilderLimit ?? 0,
        }
      },
      usage: {
        monthlyScans: Number(scansResult[0]?.count || 0),
        dynamicQrs: Number(qrResult[0]?.count || 0),
        apiCalls: Number(apiCallsResultReal[0]?.count || 0),
        formSubmissions: Number(submissionsResult[0]?.count || 0),
        activeForms: Number(activeFormsResult[0]?.count || 0),
        customTypes: Number(customTypesResult[0]?.count || 0),
      }
    });
  } catch (error) {
    console.error("Usage API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
