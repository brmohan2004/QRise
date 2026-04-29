'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueTrendChart } from '@/components/revenue/revenue-trend-chart';
import { FailedPaymentsTable } from '@/components/revenue/failed-payments-table';
import { StatCard } from '@/components/admin/stat-card';
import { 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CreditCard,
  Target,
  Users,
  RotateCcw
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { RefundManager } from '@/components/revenue/refund-manager';

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [failedPayments, setFailedPayments] = useState([]);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [mRes, fRes] = await Promise.all([
        fetch('/api/admin/revenue/overview'),
        fetch('/api/admin/revenue/failed-payments')
      ]);
      setMetrics(await mRes.json());
      setFailedPayments(await fRes.json());
    } catch (err) {
      console.error('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-64 bg-[#111]" />
          <Skeleton className="h-4 w-96 bg-[#111] mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full bg-[#111]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
           <Skeleton className="lg:col-span-4 h-[450px] bg-[#111]" />
           <Skeleton className="lg:col-span-2 h-[450px] bg-[#111]" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Failed to load revenue data</h2>
        <p className="text-gray-400">Please check your server logs and Stripe configuration.</p>
        <Button onClick={fetchData} variant="outline" className="border-[#333] text-white">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Revenue & Billing</h1>
          <p className="text-gray-400 mt-1">Real-time financial performance and subscription management.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tools & Scale</span>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Badge variant="outline" className="px-3 py-1 bg-blue-500/5 text-blue-400 border-blue-500/10 rounded-lg">
                  {metrics.lifetimeCustomers} Customers
                </Badge>
                <Badge variant="outline" className="px-3 py-1 bg-emerald-500/5 text-emerald-400 border-emerald-500/10 rounded-lg">
                  {metrics.trialUsers} Trials
                </Badge>
              </div>
              <div className="flex gap-2 border-l border-[#222] pl-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-[#333] bg-[#1a1a1a] text-purple-400 hover:bg-purple-500/10 rounded-xl h-9"
                  onClick={() => setRefundModalOpen(true)}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Refund Management
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-[#333] bg-[#1a1a1a] text-gray-300 hover:bg-[#222] rounded-xl h-9"
                  onClick={() => window.location.href = '/revenue/logs'}
                >
                  All Logs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="MRR" 
          value={`$${(metrics.mrr || 0).toLocaleString()}`} 
          delta={`${metrics.mrrGrowthPercent || 0}%`}
          trend="up"
          icon={TrendingUp}
        />
        <StatCard 
          label="ARR" 
          value={`$${(metrics.arr || 0).toLocaleString()}`} 
          delta={`${metrics.mrrGrowthPercent || 0}%`}
          trend={metrics.mrrGrowthPercent >= 0 ? "up" : "down"}
          icon={Target}
        />
        <StatCard 
          label="Monthly Revenue" 
          value={`$${(metrics.revenueThisMonth || 0).toLocaleString()}`} 
          delta={`${metrics.mrrGrowthPercent || 0}%`}
          trend={metrics.mrrGrowthPercent >= 0 ? "up" : "down"}
          icon={CreditCard}
        />
        <StatCard 
          label="Failed Payments" 
          value={metrics.failedPayments || 0} 
          delta={(metrics.failedPayments || 0) > 0 ? "Needs action" : "Clean"}
          trend={(metrics.failedPayments || 0) > 0 ? "down" : "neutral"}
          icon={AlertCircle}
          className={(metrics.failedPayments || 0) > 0 ? "border-red-900/20" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div className="lg:col-span-4">
          <RevenueTrendChart data={metrics.revenueByDay} />
        </div>
        <Card className="lg:col-span-2 bg-[#111] border-[#222] text-white">
          <CardHeader className="flex flex-row items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <CardTitle className="text-lg font-bold">Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {metrics.revenueByPlan.map((plan: any) => (
              <div key={plan.plan} className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="capitalize font-bold text-gray-200">{plan.plan}</span>
                    <span className="text-[10px] text-gray-500">{plan.userCount} active users</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">${plan.mrr.toLocaleString()}</span>
                    <span className="block text-[10px] text-gray-500">/ mo</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" 
                    style={{ width: `${(plan.mrr / metrics.mrr) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-[#222]">
              <div className="flex justify-between items-center px-2 py-3 bg-[#1a1a1a] rounded-xl border border-[#333]">
                <span className="text-xs text-gray-400">Churn Rate</span>
                <span className="text-sm font-bold text-red-400">{metrics.churnRate || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RefundManager open={refundModalOpen} onOpenChange={setRefundModalOpen} />

      <div className="space-y-4 pt-4">

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Critical Billing Issues</h2>
        </div>
        <FailedPaymentsTable data={failedPayments} onRefresh={fetchData} />
      </div>
    </div>
  );
}

