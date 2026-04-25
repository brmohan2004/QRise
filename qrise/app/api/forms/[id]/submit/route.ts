import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, formSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ApiResponse } from "@/lib/api-response";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { submitForm } from "@/lib/services/form.service";

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1h"),
  analytics: true,
  prefix: "ratelimit:form-submit",
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(`${id}:${ip}`);
    
    if (!success) {
      return ApiResponse.error("Too many submissions. Please try again later.", 429);
    }

    const body = await request.json();
    const { data } = body;

    if (!data) return ApiResponse.badRequest("Submission data required");

    // Fetch form to validate against schema
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, id)
    });

    if (!form || !form.isActive) {
      return ApiResponse.notFound("Form not found or inactive");
    }

    const fields = typeof form.fieldsSchema === 'string' 
      ? JSON.parse(form.fieldsSchema) 
      : form.fieldsSchema;

    // Basic validation
    for (const field of fields) {
      if (field.required && !data[field.id]) {
        return ApiResponse.badRequest(`${field.label} is required`);
      }
      
      if (field.type === 'email' && data[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data[field.id])) {
          return ApiResponse.badRequest(`Invalid email format for ${field.label}`);
        }
      }
    }

    // Submit via service
    const submission = await submitForm(id, data, ip);

    return ApiResponse.ok({
      success: true,
      message: form.successMessage || "Thank you for your submission!",
      submissionId: submission.id
    }, 201);
  } catch (error) {
    console.error("Form submit error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}