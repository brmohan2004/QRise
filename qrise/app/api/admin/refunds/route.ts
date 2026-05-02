import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { billingEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    // In a real app, you'd check if user is admin here
    if (!user) {
      return ApiResponse.unauthorized();
    }

    const { paymentIntentId, reason, eventId } = await request.json();

    if (!paymentIntentId) {
      return ApiResponse.badRequest("Payment Intent ID is required");
    }

    // Process refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    });

    if (eventId) {
      // Update our database to reflect the refund
      await db.update(billingEvents)
        .set({ status: 'refunded', metadata: { refundId: refund.id, reason } })
        .where(eq(billingEvents.id, eventId));
    }

    return ApiResponse.ok({ refundId: refund.id, status: refund.status });
  } catch (error: any) {
    console.error("Refund error:", error);
    return ApiResponse.error(error.message || "Failed to process refund", 500);
  }
}
