import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/feature-flags";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isEnabled = await isFeatureEnabled("analytics_export_enabled");
    if (!isEnabled) {
      return NextResponse.json({ error: "Feature disabled" }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ownership check here...

    const headers = [
      "Timestamp",
      "Country",
      "Device Type",
      "OS",
      "Browser",
      "Is Unique",
      "Is Bot"
    ].join(",");

    // In a real app, we'd fetch this from the database
    const mockRows = Array.from({ length: 50 }).map((_, i) => [
      new Date(Date.now() - i * 3600000).toISOString(),
      "US",
      "mobile",
      "iOS",
      "Safari",
      "true",
      "false"
    ].join(",")).join("\n");

    const csv = `${headers}\n${mockRows}`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="qr-analytics-${id}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
