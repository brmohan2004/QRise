"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ResolverCall {
  id: string;
  calledAt: Date | string;
  resolverStatus: number | null;
  resolverLatencyMs: number | null;
  responseType: string | null;
  fallbackUsed: boolean;
  scanContext: any;
}

interface ResolverCallsTableProps {
  calls: ResolverCall[];
}

export function ResolverCallsTable({ calls }: ResolverCallsTableProps) {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recent Resolver Calls</h3>
        <Badge variant="outline" className="rounded-full bg-white font-black text-[10px] uppercase">
          Last 50 calls
        </Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-gray-100">
            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-8">Time</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Latency</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Type</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Fallback</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-8">Context</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
                No calls recorded in this period
              </TableCell>
            </TableRow>
          ) : (
            calls.map((call) => (
              <TableRow key={call.id} className="group hover:bg-gray-50/50 border-gray-50 transition-colors">
                <TableCell className="pl-8 py-4">
                  <p className="text-xs font-black text-gray-900">{formatDistanceToNow(new Date(call.calledAt))} ago</p>
                  <p className="text-[10px] font-bold text-gray-400">{new Date(call.calledAt).toLocaleString()}</p>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    className={cn(
                      "rounded-lg font-black text-[10px] uppercase px-3 py-1",
                      call.resolverStatus && call.resolverStatus < 300 
                        ? "bg-green-50 text-green-600 hover:bg-green-100 border-green-100" 
                        : "bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                    )}
                  >
                    {call.resolverStatus || "TIMEOUT"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "text-xs font-black",
                    (call.resolverLatencyMs || 0) > 2000 ? "text-amber-600" : "text-gray-700"
                  )}>
                    {call.resolverLatencyMs}ms
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    {call.responseType || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {call.fallbackUsed ? (
                    <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-full font-black text-[9px] uppercase">Used</Badge>
                  ) : (
                    <span className="text-[10px] font-black text-gray-300">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right pr-8">
                  <span className="text-[10px] font-bold text-gray-400 font-mono">
                    {call.scanContext?.country || "XX"} · {call.scanContext?.device_type || "???"}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
