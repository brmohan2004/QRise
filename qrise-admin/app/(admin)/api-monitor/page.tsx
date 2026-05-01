import { ApiStatsOverview } from '@/components/api-monitor/api-stats-overview';
import { EndpointBreakdownTable } from '@/components/api-monitor/endpoint-breakdown-table';
import { TopApiUsersTable } from '@/components/api-monitor/top-api-users-table';

export default function ApiMonitorPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">API Monitor</h2>
      <ApiStatsOverview />
      <div className="grid gap-4 md:grid-cols-2">
        <EndpointBreakdownTable />
        <TopApiUsersTable />
      </div>
    </div>
  );
}
