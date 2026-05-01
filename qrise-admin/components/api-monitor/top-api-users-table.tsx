'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function TopApiUsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/api-usage?range=24h')
      .then(r => r.json())
      .then(d => { setUsers(d.top_users || []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>API Keys</TableHead>
            <TableHead>Calls (Month)</TableHead>
            <TableHead>Usage %</TableHead>
            <TableHead>Error Rate</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u, i) => (
            <TableRow key={i}>
              <TableCell>{u.email}</TableCell>
              <TableCell className="capitalize">{u.plan}</TableCell>
              <TableCell>{u.keys_count}</TableCell>
              <TableCell>{u.calls.toLocaleString()}</TableCell>
              <TableCell>{Math.round(u.calls / 1000)}%</TableCell>
              <TableCell className={u.error_rate > 5 ? 'text-red-500' : 'text-green-500'}>{u.error_rate.toFixed(2)}%</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/api-monitor/users/${u.user_id}`}>View Details</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
