import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createClient } from '@/lib/supabase/server';

const f = createUploadthing();

const getUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const qriseFileRouter = {
  bulkJobZip: f({ blob: { maxFileSize: '128MB', maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getUser();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        key: file.key,
      };
    }),
} satisfies FileRouter;

export type QRiseFileRouter = typeof qriseFileRouter;