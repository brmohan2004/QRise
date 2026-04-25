import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ApiResponse } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return ApiResponse.unauthorized();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return ApiResponse.badRequest("No file uploaded");

    // Validate type
    if (!file.type.startsWith("image/")) {
      return ApiResponse.badRequest("Only images are allowed");
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return ApiResponse.badRequest("File too large (max 2MB)");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize image using sharp
    const resizedBuffer = await sharp(buffer)
      .resize(256, 256, { fit: 'cover' })
      .toFormat('webp')
      .toBuffer();

    const supabase = await createClient();
    const fileName = `${user.id}/avatar_${Date.now()}.webp`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, resizedBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return ApiResponse.ok({ url: publicUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return ApiResponse.error(ApiResponse.getErrorMessage(error));
  }
}
