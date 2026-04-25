import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return ApiResponse.badRequest("Valid email address required");
    }

    // Log only in development to avoid PII in production logs
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NEWSLETTER] New subscription: ${email}`);
    }

    // Since newsletter table doesn't exist in current schema, 
    // we would connect to Resend Audience or insert into DB in production
    // await resend.contacts.create({ email, audienceId: '...' });

    return ApiResponse.ok({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
