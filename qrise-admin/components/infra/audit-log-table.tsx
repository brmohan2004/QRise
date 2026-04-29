'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export function AuditLogTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/infra/audit-logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.target_type?.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-white/90">Audit Trail</CardTitle>
          <CardDescription className="text-white/40 text-xs">Immutable record of all administrative actions.</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
            <Input 
              placeholder="Search logs..." 
              className="pl-9 h-9 bg-white/[0.03] border-white/10 text-xs text-white/70"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchLogs} 
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 text-white/50 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/[0.01]">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Timestamp</TableHead>
                <TableHead className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Action</TableHead>
                <TableHead className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Target</TableHead>
                <TableHead className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Details</TableHead>
                <TableHead className="text-right text-white/50 font-bold uppercase tracking-wider text-[10px]">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-white/10" />
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-white/20 text-xs">
                    No logs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="text-[10px] font-mono text-white/40">
                      {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter bg-white/[0.03] border-white/10 text-white/60">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold text-white/60 capitalize">
                      {log.target_type || '-'}
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <div className="text-[10px] text-white/30 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                        {JSON.stringify(log.details)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-[10px] font-mono text-white/20">
                      {log.ip_address || '---'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
