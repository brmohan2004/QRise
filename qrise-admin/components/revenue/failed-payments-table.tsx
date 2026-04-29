'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Undo, MessageSquare, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FailedPayment {
  userId: string;
  email: string;
  plan: string;
  amount: number;
  failureReason: string;
  daysPastDue: number;
  retryCount: number;
  stripeInvoiceId: string;
}

interface FailedPaymentsTableProps {
  data: FailedPayment[];
  onRefresh: () => void;
}

export function FailedPaymentsTable({ data, onRefresh }: FailedPaymentsTableProps) {
  const handleRetry = async (userId: string, invoiceId: string) => {
    try {
      const res = await fetch('/api/admin/revenue/failed-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, stripeInvoiceId: invoiceId }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Payment retry triggered. Status: ${result.status}`);
        onRefresh();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to trigger retry');
    }
  };

  const handleRefund = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to issue a refund for ${email}?`)) return;
    
    try {
      // Find the last successful payment for this user to refund
      const logsRes = await fetch(`/api/admin/revenue/logs?userId=${userId}&status=succeeded&limit=1`);
      const logs = await logsRes.json();
      const lastPayment = logs[0];

      if (!lastPayment) {
        toast.error('No successful payment found to refund');
        return;
      }

      const res = await fetch('/api/admin/revenue/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingEventId: lastPayment.id, reason: 'requested_by_customer' }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Refund issued successfully.`);
        onRefresh();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to issue refund');
    }
  };

  const handleDowngrade = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to downgrade ${email} to the Free plan?`)) return;
    
    try {
      const res = await fetch('/api/admin/revenue/trials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert', userId, plan: 'free', reason: 'Non-payment downgrade' }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`${email} downgraded to free plan.`);
        onRefresh();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to downgrade user');
    }
  };

  const handleContact = (email: string) => {
    window.location.href = `mailto:${email}?subject=Important: Issue with your QRise subscription payment`;
  };

  const getStatusBadge = (days: number) => {
    if (days <= 7) return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{days} days</Badge>;
    if (days <= 30) return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">{days} days</Badge>;
    return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">{days} days</Badge>;
  };

  return (
    <div className="rounded-2xl border border-[#222] bg-[#111] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#222] hover:bg-transparent bg-[#161616]">
            <TableHead className="text-gray-400 font-bold py-4">User Email</TableHead>
            <TableHead className="text-gray-400 font-bold">Plan</TableHead>
            <TableHead className="text-gray-400 font-bold">Amount</TableHead>
            <TableHead className="text-gray-400 font-bold">Reason</TableHead>
            <TableHead className="text-gray-400 font-bold">Past Due</TableHead>
            <TableHead className="text-gray-400 font-bold">Retries</TableHead>
            <TableHead className="text-right text-gray-400 font-bold px-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableCell colSpan={7} className="text-center h-32 text-gray-500 italic">
                All accounts are currently in good standing. No failed payments found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.userId} className="border-[#222] hover:bg-[#1a1a1a] transition-colors">
                <TableCell className="font-bold text-white py-4">{row.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize border-[#333] text-gray-400 text-[10px] font-bold tracking-wider">
                    {row.plan}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-white">${row.amount.toFixed(2)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-gray-400 text-xs" title={row.failureReason}>
                  {row.failureReason}
                </TableCell>
                <TableCell>
                  {getStatusBadge(row.daysPastDue)}
                </TableCell>
                <TableCell className="text-gray-400">{row.retryCount}</TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-1.5">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8 rounded-lg border-[#333] bg-[#1a1a1a] hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                      title="Retry Payment"
                      onClick={() => handleRetry(row.userId, row.stripeInvoiceId)}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8 rounded-lg border-[#333] bg-[#1a1a1a] hover:bg-purple-500/20 hover:text-purple-400 transition-all"
                      title="Refund/Issue"
                      onClick={() => handleRefund(row.userId, row.email)}
                    >
                      <Undo className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8 rounded-lg border-[#333] bg-[#1a1a1a] hover:bg-amber-500/20 hover:text-amber-400 transition-all"
                      title="Downgrade"
                      onClick={() => handleDowngrade(row.userId, row.email)}
                    >
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8 rounded-lg border-[#333] bg-[#1a1a1a] hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
                      title="Contact User"
                      onClick={() => handleContact(row.email)}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

  );
}

