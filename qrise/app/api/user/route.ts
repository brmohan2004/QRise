import { db } from "@/lib/db";
import { users, plans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { sendWelcomeEmail } from "@/lib/resend";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    // Fetch user with plan details
    const result = await db
      .select({
        user: users,
        plan: plans,
      })
      .from(users)
      .leftJoin(plans, eq(users.plan, plans.name))
      .where(eq(users.id, user.id))
      .limit(1);

    let userData = result[0]?.user;
    let planData = result[0]?.plan;

    if (!userData) {
      // Jit-create user if they exist in Auth but not in DB
      const [newUser] = await db.insert(users).values({
        id: user.id,
        email: user.email,
        fullName: user.email.split('@')[0], // Fallback name
        plan: 'free',
      }).returning();
      userData = newUser;

      // Send welcome email to the new user
      await sendWelcomeEmail(userData.email, userData.fullName || 'User');
      
      // Fetch the free plan details separately if needed, or assume defaults
      const [freePlan] = await db.select().from(plans).where(eq(plans.name, 'free')).limit(1);
      planData = freePlan;
    }

    // Ensure we have some plan object even if not in DB
    const plan = planData || {
      name: userData.plan || 'free',
      hasApiAccess: userData.plan === 'business' || userData.plan === 'enterprise',
      hasBulkGenerator: userData.plan === 'business' || userData.plan === 'enterprise',
      hasSmartRouting: userData.plan !== 'free',
      hasAnalytics: true,
      hasDesignStudio: true,
    };

    return ApiResponse.ok({
      ...userData,
      plan: {
         name: plan.name,
         has_api: 'hasApiAccess' in plan ? plan.hasApiAccess : (plan as any).hasApi,
         has_bulk: 'hasBulkGenerator' in plan ? plan.hasBulkGenerator : (plan as any).hasBulk,
         has_smart_routing: plan.hasSmartRouting,
         has_analytics: plan.hasAnalytics,
         has_design_studio: plan.hasDesignStudio,
      }
    });
  } catch (error) {
    console.error("User API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const body = await request.json();
    const { fullName, avatarUrl, notificationPrefs } = body;

    const result = await db.update(users)
      .set({
        fullName,
        avatarUrl,
        // Assume notificationPrefs is a JSON field in your schema
        // notificationPrefs, 
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return ApiResponse.ok(result[0]);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
