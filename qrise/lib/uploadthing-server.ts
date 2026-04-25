import { UTApi } from 'uploadthing/server';

export const utapi = new UTApi({
  token: process.env.UPLOADTHING_SECRET!,
});

export async function uploadZipToUploadThing(
  zipBuffer: Uint8Array,
  filename: string
): Promise<{ url: string; key: string }> {
  const blob = new Blob([zipBuffer as any], { type: 'application/zip' });
  const file = new File([blob], filename, { type: 'application/zip' });

  const response = await utapi.uploadFiles(file);

  if (response.error) {
    throw new Error(`UploadThing upload failed: ${response.error.message}`);
  }

  return {
    url: response.data.url,
    key: response.data.key,
  };
}

export async function deleteZipFromUploadThing(key: string): Promise<void> {
  try {
    await utapi.deleteFiles(key);
  } catch (err) {
    console.error('[UploadThing] Failed to delete:', key, err);
  }
}