import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const supabase = await createClient();
    
    // Check if the exported file exists in storage
    // We assume exports are stored in /bulk-exports/[jobId]/qrs.zip
    const filePath = `bulk-exports/${jobId}/qrs.zip`;
    
    const { data: fileExists, error } = await supabase.storage
      .from('exports')
      .list(`bulk-exports/${jobId}`, {
        limit: 1,
        search: 'qrs.zip'
      });

    if (error || !fileExists || fileExists.length === 0) {
      return ApiResponse.ok({ status: 'pending' });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('exports')
      .getPublicUrl(filePath);

    return ApiResponse.ok({ 
      status: 'ready', 
      downloadUrl: publicUrl 
    });
  } catch (error) {
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
