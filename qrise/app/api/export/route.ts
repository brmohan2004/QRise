import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !["qr-codes", "form-submissions"].includes(type)) {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    // In a real app, you would enqueue a background job here
    // Example: const job = await enqueueExportJob(user.id, type);
    
    return NextResponse.json({ 
      success: true, 
      jobId: `job_${Math.random().toString(36).substring(7)}`,
      message: "Export job started. You will be notified via email."
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
