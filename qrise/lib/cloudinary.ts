import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadQRLogo(
  input: Buffer | string,
  userId: string
): Promise<UploadResult> {
  const data = Buffer.isBuffer(input)
    ? `data:image/png;base64,${input.toString('base64')}`
    : input;

  const result = await cloudinary.uploader.upload(data, {
    folder: `qrise/logos/${userId}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'limit' },
      { fetch_format: 'auto', quality: 'auto' },
    ],
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function uploadQRExport(
  buffer: Buffer,
  qrId: string,
  format: 'png' | 'svg',
  userId: string
): Promise<UploadResult> {
  const mimeType = format === 'svg' ? 'image/svg+xml' : 'image/png';
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `qrise/exports/${userId}`,
    public_id: `${qrId}-${format}`,
    overwrite: true,
    resource_type: 'image',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteCloudinaryFile(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[Cloudinary] Failed to delete:', publicId, err);
  }
}

export function getDownloadUrl(publicId: string, _filename: string): string {
  return cloudinary.url(publicId, {
    flags: 'attachment',
    type: 'upload',
    sign_url: false,
  });
}

export default cloudinary;