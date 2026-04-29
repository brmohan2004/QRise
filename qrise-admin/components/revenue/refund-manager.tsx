'use client';

import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  RotateCcw, 
  User, 
  CreditCard, 
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface RefundManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundManager({ open, onOpenChange }: RefundManagerProps) {
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [userPayments, setUserPayments] = useState<any[] | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);

  const searchUser = async () => {
    if (!email) return;
    setSearching(true);
    try {
      const userRes = await fetch(`/api/admin/users?email=${email}`);
      const userData = await userRes.json();
      
      const user = Array.isArray(userData) ? userData[0] : null;
      if (!user) {
        toast.error('User not found');
        setUserPayments(null);
        return;
      }

      const res = await fetch(`/api/admin/revenue/logs?userId=${user.id}&status=succeeded`);
      const data = await res.json();
      setUserPayments(data);
    } catch (err) {
      toast.error('Failed to search for user');
    } finally {
      setSearching(false);
    }
  };

  const initializeRefund = async (paymentId: string, amount: number) => {
    if (!confirm(`Are you sure you want to refund $${(amount / 100).toFixed(2)}?`)) return;
    
    setRefunding(paymentId);
    try {
      const res = await fetch('/api/admin/revenue/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          billingEventId: paymentId, 
          reason: 'requested_by_customer',
          amount: amount / 100
        }),
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success('Refund initialized successfully');
        searchUser();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to initialize refund');
    } finally {
      setRefunding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111] border-[#222] text-white max-w-2xl">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="text-xl font-bold">Refund Initialization</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Search for a customer to manage their refunds.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Customer Email Address..." 
                className="pl-10 bg-[#1a1a1a] border-[#333] text-white rounded-xl h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUser()}
              />
            </div>
            <Button 
              onClick={searchUser} 
              disabled={searching}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-6 h-11"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Lookup
            </Button>
          </div>

          {userPayments !== null && (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Eligible Payments</h3>
              {userPayments.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-amber-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  No refundable payments found for this user.
                </div>
              ) : (
                <div className="grid gap-3">
                  {userPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#333] rounded-2xl group hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            ${(payment.amount_cents / 100).toFixed(2)}
                            <Badge variant="outline" className="text-[10px] h-4 bg-emerald-500/5 text-emerald-500 border-emerald-500/10">Paid</Badge>
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(payment.created_at), 'PPP')}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => initializeRefund(payment.id, payment.amount_cents)}
                        disabled={refunding === payment.id}
                        className="border-[#333] bg-[#222] text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 rounded-xl h-9 text-xs"
                      >
                        {refunding === payment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-2" />}
                        Refund
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
