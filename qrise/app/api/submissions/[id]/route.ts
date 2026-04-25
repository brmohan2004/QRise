import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formSubmissions, forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    // Verify ownership via the associated form
    const submission = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id)).limit(1);
    if (!submission[0]) return ApiResponse.notFound("Submission not found");

    const form = await db.select().from(forms).where(eq(forms.id, submission[0].formId)).limit(1);
    if (!form[0] || form[0].userId !== user.id) {
      return ApiResponse.unauthorized("You do not have permission to delete this submission");
    }

    await db.delete(formSubmissions).where(eq(formSubmissions.id, id));

    return ApiResponse.ok({ message: "Submission deleted" });
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
