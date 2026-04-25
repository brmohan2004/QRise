import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formSubmissions, forms } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    // Verify ownership
    const form = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
    if (!form[0] || form[0].userId !== user.id) {
      return ApiResponse.notFound("Form not found");
    }

    const data = await db
      .select()
      .from(formSubmissions)
      .where(eq(formSubmissions.formId, id))
      .orderBy(desc(formSubmissions.submittedAt));

    return ApiResponse.ok(data);
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
