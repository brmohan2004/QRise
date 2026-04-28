import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AlertOctagon, Mail, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SignOutButton } from '@/components/auth/sign-out-button';

export default async function AbusePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_suspended, suspension_reason')
    .eq('id', user.id)
    .single();

  if (!profile?.is_suspended) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center">
              <AlertOctagon className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Account Suspended
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Your access to QRise has been restricted due to a violation of our terms of service.
            </p>
          </div>

          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-semibold uppercase tracking-wider text-xs">
              <ShieldAlert className="w-4 h-4" />
              Reason for Suspension
            </div>
            <p className="text-white text-lg leading-relaxed">
              {profile.suspension_reason || "Violation of community guidelines or suspicious activity detected on your account."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
            <Link href="mailto:support@qrise.io" className="w-full">
              <Button 
                variant="outline" 
                className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl transition-all duration-300 gap-3"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </Button>
            </Link>
            
            <SignOutButton />
          </div>

          <p className="text-gray-500 text-sm">
            Reference ID: <span className="text-gray-400 font-mono">{user.id.substring(0, 8)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
