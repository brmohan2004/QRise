import { useQuery } from '@tanstack/react-query';
import { getScanSummary, getScansByCountry, getScansByDevice, getScansByHour } from '@/lib/db/queries/analytics.queries';

export function useQRAnalytics(qrId: string, dateRange: { from: Date; to: Date }) {
  const summary = useQuery({
    queryKey: ['qr-analytics', qrId, dateRange],
    queryFn: () => getScanSummary(qrId, dateRange),
  });

  const byCountry = useQuery({
    queryKey: ['qr-analytics-country', qrId, dateRange],
    queryFn: () => getScansByCountry(qrId, dateRange),
  });

  const byDevice = useQuery({
    queryKey: ['qr-analytics-device', qrId, dateRange],
    queryFn: () => getScansByDevice(qrId, dateRange),
  });

  const byHour = useQuery({
    queryKey: ['qr-analytics-hour', qrId, dateRange],
    queryFn: () => getScansByHour(qrId, dateRange),
  });

  return { summary, byCountry, byDevice, byHour };
}