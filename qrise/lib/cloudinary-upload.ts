export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadFileToCloudinary(
  file: File,
  folder: string,
  _onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set');

  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File must be under 2MB');
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PNG, JPG, SVG, and WebP files are allowed');
  }

  const formData = new FormData();
  formData.append('file', file);
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'qrise_unsigned';
  formData.append('upload_preset', preset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? 'Cloudinary upload failed');
  }

  return response.json();
}