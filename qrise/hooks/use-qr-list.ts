import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserQRCodes, type QRFilters } from '@/lib/db/queries/qr.queries';

export function useQRList(userId: string, filters?: QRFilters) {
  return useInfiniteQuery({
    queryKey: ['qr-list', userId, filters],
    queryFn: ({ pageParam = 0 }) => getUserQRCodes(userId, filters, 20, pageParam * 20),
    getNextPageParam: (lastPage, allPages) => 
      lastPage.length === 20 ? allPages.length : undefined,
    initialPageParam: 0,
  });
}