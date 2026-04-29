import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qrCodes, formSubmissions, forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { zipSync, strToU8 } from "fflate";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.email) return ApiResponse.unauthorized();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !["qr-codes", "form-submissions"].includes(type)) {
      return ApiResponse.badRequest("Invalid export type");
    }

    // Perform export logic
    let zipBuffer: Uint8Array;

    if (type === "qr-codes") {
      const codes = await db.select().from(qrCodes).where(eq(qrCodes.userId, user.id));
      
      // Create CSV
      const headers = "ID,Name,Type,Target URL,Created At\n";
      const rows = codes.map(c => 
        `"${c.id}","${c.name}","${c.isDynamic ? 'Dynamic' : 'Static'}","${c.targetUrl}","${c.createdAt?.toISOString()}"`
      ).join("\n");
      
      const csvContent = headers + rows;
      
      // Create ZIP with metadata
      const zipData = {
        "metadata.csv": strToU8(csvContent),
        "README.txt": strToU8("Your QRise Export Archive\n\nThis archive contains your QR code metadata."),
      };
      
      zipBuffer = zipSync(zipData);

    } else {
      const submissions = await db
        .select({
          id: formSubmissions.id,
          formName: forms.name,
          data: formSubmissions.submissionData,
          submittedAt: formSubmissions.submittedAt,
        })
        .from(formSubmissions)
        .innerJoin(forms, eq(formSubmissions.formId, forms.id))
        .where(eq(forms.userId, user.id));

      // Create CSV
      const headers = "ID,Form,Submission Data,Submitted At\n";
      const rows = submissions.map(s => 
        `"${s.id}","${s.formName}","${JSON.stringify(s.data).replace(/"/g, '""')}","${s.submittedAt?.toISOString()}"`
      ).join("\n");
      
      const csvContent = headers + rows;
      zipBuffer = zipSync({ "submissions.csv": strToU8(csvContent) });
    }

    // Prepare response for direct download
    const filename = type === "qr-codes" ? "qrise-qr-export.zip" : "qrise-forms-export.zip";
    
    return new NextResponse(Buffer.from(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Export API Error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
