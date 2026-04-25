import { createRouteHandler } from 'uploadthing/next';
import { qriseFileRouter } from '@/lib/uploadthing';

export const { GET, POST } = createRouteHandler({
  router: qriseFileRouter,
});