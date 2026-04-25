import { NextResponse } from "next/server";
import { getFormBySlug } from "@/lib/services/form.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const form = await getFormBySlug(slug);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Fetch form error:", error);
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
  }
}
