import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { sendAccountDeletionEmail } from "@/lib/resend";
import { createClient } from "@/lib/supabase/client";

export async function POST() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return ApiResponse.unauthorized();

    // 1. Get user details for email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (!user) return ApiResponse.notFound("User not found");

    // 2. Suspend the account in the database
    await db
      .update(users)
      .set({
        isSuspended: true,
        suspensionReason: "User requested account deletion (Destroy Workspace)",
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // 3. Send notification email
    await sendAccountDeletionEmail(user.email, user.fullName || "User");

    // 4. Note: Permanent deletion logic would be handled by an admin separately.
    
    return ApiResponse.ok({ message: "Workspace destroyed and account scheduled for deletion" });
  } catch (error) {
    console.error("Suspend API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
