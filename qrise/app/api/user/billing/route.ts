import { db } from "@/lib/db";
import { users, plans, billingEvents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    // 1. Fetch user and plan
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

    // 2. Fetch real billing events (invoices)
    const events = await db
      .select()
      .from(billingEvents)
      .where(eq(billingEvents.userId, user.id))
      .orderBy(sql`${billingEvents.createdAt} DESC`)
      .limit(10);

    const billingData = {
      plan: {
        name: planData?.name || (userData.plan ? userData.plan : 'No Plan'),
        price: planData?.priceMonthly || "0.00",
        interval: 'month',
        status: userData.planExpiresAt && userData.planExpiresAt > new Date() ? 'active' : 'free',
        expiresAt: userData.planExpiresAt,
        features: planData ? [
          planData.hasAnalytics && "Advanced Analytics",
          planData.hasApiAccess && "API Access",
          planData.hasBulkGenerator && "Bulk Generator",
          planData.hasDesignStudio && "Design Studio",
          planData.hasSmartRouting && "Smart Routing",
          planData.hasFormBuilder && "Form Builder",
          planData.monthlyScanLimit !== null && planData.monthlyScanLimit !== -1 ? `${planData.monthlyScanLimit.toLocaleString()} Monthly Scans` : (planData.monthlyScanLimit === -1 ? "Unlimited Scans" : null),
          planData.dynamicQrLimit !== null && planData.dynamicQrLimit !== -1 ? `${planData.dynamicQrLimit.toLocaleString()} Dynamic QRs` : (planData.dynamicQrLimit === -1 ? "Unlimited Dynamic QRs" : null),
        ].filter(Boolean) : [],
      },
      paymentMethod: userData.stripeCustomerId ? {
        brand: 'Visa', // These would ideally come from Stripe API using stripeCustomerId
        last4: '4242',
        expMonth: 12,
        expYear: 2028,
      } : null,
      invoices: events.map(event => ({
        id: event.id,
        amount: (Number(event.amountCents || 0) / 100).toFixed(2),
        date: event.createdAt,
        status: event.status === 'succeeded' ? 'settled' : 'failed',
        description: `${event.plan || 'Pro'} Plan — ${event.eventType.replace('_', ' ')}`,
      }))
    };

    return ApiResponse.ok(billingData);
  } catch (error) {
    console.error("Billing API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
