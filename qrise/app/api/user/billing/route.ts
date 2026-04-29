import { db } from "@/lib/db";
import { users, plans } from "@/lib/db/schema";
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

    // 2. Prepare billing data
    // In a real app, these would come from Stripe or a dedicated table
    const billingData = {
      plan: {
        name: planData?.name || userData.plan || 'Free',
        price: planData?.priceMonthly || "0.00",
        interval: 'month',
        status: userData.planExpiresAt && userData.planExpiresAt > new Date() ? 'active' : 'free',
        expiresAt: userData.planExpiresAt,
      },
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expMonth: 9,
        expYear: 2027,
      },
      invoices: [
        {
          id: 'inv_123',
          amount: planData?.priceMonthly || "0.00",
          date: new Date().toISOString(),
          status: 'settled',
          description: `${planData?.name || 'Free'} Plan — Current Month`,
        }
      ]
    };

    return ApiResponse.ok(billingData);
  } catch (error) {
    console.error("Billing API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
