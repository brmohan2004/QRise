import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications, userNotifications } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    // Fetch notifications for this user, joining with the notification details
    const result = await db
      .select({
        id: userNotifications.id,
        notificationId: notifications.id,
        title: notifications.subject,
        message: notifications.body,
        type: notifications.category, // 'alert', 'broadcast', etc.
        timestamp: userNotifications.createdAt,
        read: userNotifications.isRead,
      })
      .from(userNotifications)
      .innerJoin(notifications, eq(userNotifications.notificationId, notifications.id))
      .where(eq(userNotifications.userId, user.id))
      .orderBy(desc(userNotifications.createdAt))
      .limit(50);

    return ApiResponse.ok(result);
  } catch (error) {
    console.error("Notifications API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const { id, readAll } = await request.json();

    if (readAll) {
      await db
        .update(userNotifications)
        .set({ isRead: true })
        .where(eq(userNotifications.userId, user.id));
    } else if (id) {
      await db
        .update(userNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(userNotifications.id, id),
            eq(userNotifications.userId, user.id)
          )
        );
    }

    return ApiResponse.ok({ success: true });
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
