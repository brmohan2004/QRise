"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  LogOut, 
  Code2, 
  Key, 
  ChevronRight, 
  Activity, 
  QrCode, 
  FileText, 
  Sparkles,
  ArrowUpRight,
  Database
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SignOutDialog } from "@/components/app/sign-out-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { data: usage, isLoading: isUsageLoading } = useUsageStats();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      const json = await res.json();
      return json.data;
    }
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const user = {
    name: userData?.fullName || "User",
    email: userData?.email || "",
    avatar_url: userData?.avatarUrl,
    plan: userData?.plan?.name || "Free",
  };

  const scansPct = usage?.metrics?.scans?.pct || 0;
  const isPro = user.plan.toLowerCase() !== "free";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

      {/* Profile Header Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Subtle decorative background gradient */}
        <div className="h-28 sm:h-36 w-full bg-gradient-to-r from-primary/15 via-indigo-500/10 to-emerald-500/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)]" />
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar */}
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl border-4 border-white dark:border-slate-900 shadow-xl bg-white shrink-0">
                <AvatarImage src={user.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl sm:text-3xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 mb-1">
                {isUserLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {user.name}
                      </h1>
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border",
                        isPro 
                          ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      )}>
                        {user.plan} Plan
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {!isPro && (
                <Button 
                  asChild
                  size="sm"
                  className="rounded-xl font-black text-xs uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-md gap-1.5"
                >
                  <Link href="/pricing">
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl font-bold text-xs border-slate-200 dark:border-slate-800"
              >
                <Link href="?general=true">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Overview Section (matches popup card from user screenshot) */}
      <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Usage Overview
            </h2>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              Monthly Plan Limits & Quota
            </p>
          </div>
          <span className={cn(
            "text-xs font-black px-2.5 py-1 rounded-full border",
            scansPct > 80 
              ? "bg-amber-50 text-amber-700 border-amber-200" 
              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
          )}>
            {scansPct}% Scans Used
          </span>
        </div>

        {/* Scans Progress Bar */}
        <div className="space-y-2">
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${scansPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full transition-all duration-500",
                scansPct > 80 
                  ? "bg-gradient-to-r from-amber-500 to-rose-500" 
                  : "bg-gradient-to-r from-emerald-500 to-teal-500"
              )} 
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
            <span>{usage?.metrics?.scans?.current || 0} scans recorded this billing cycle</span>
            <span>Limit: {usage?.metrics?.scans?.limit === -1 ? "Unlimited" : (usage?.metrics?.scans?.limit || 500)}</span>
          </div>
        </div>

        {/* Resource Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <QrCode className="w-3.5 h-3.5 text-primary" />
              <span>Dynamic QRs</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {usage?.metrics?.dynamicQrs?.current || 0}
              <span className="text-xs text-muted-foreground font-medium ml-1">
                / {usage?.metrics?.dynamicQrs?.limit === -1 ? "∞" : (usage?.metrics?.dynamicQrs?.limit ?? "—")}
              </span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>Forms</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {usage?.metrics?.forms?.current || 0}
              <span className="text-xs text-muted-foreground font-medium ml-1">
                / {usage?.metrics?.forms?.limit === -1 ? "∞" : (usage?.metrics?.forms?.limit ?? "—")}
              </span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <span>Submissions</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {usage?.metrics?.submissions?.current || 0}
              <span className="text-xs text-muted-foreground font-medium ml-1">
                / {usage?.metrics?.submissions?.limit === -1 ? "∞" : (usage?.metrics?.submissions?.limit ?? "—")}
              </span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>API Calls</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {usage?.metrics?.apiCalls?.current || 0}
              <span className="text-xs text-muted-foreground font-medium ml-1">
                / {usage?.metrics?.apiCalls?.limit === -1 ? "∞" : (usage?.metrics?.apiCalls?.limit ?? "—")}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-muted-foreground font-medium">
            Resets in {usage?.plan?.daysToReset ?? 30} days
          </span>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs font-bold text-primary hover:text-primary/90 h-8 px-2"
          >
            <Link href="?usage=true">
              Full Usage Details
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* DEVELOPER HUB BUTTON */}
      <Link
        href="?settings=true"
        className="group relative overflow-hidden flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all"
      >
        <div className="relative flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-slate-200/70 dark:group-hover:bg-slate-700/70 transition-all shrink-0">
            <Code2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Developer Hub
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-slate-700 shrink-0">
                API
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate sm:whitespace-normal">
              Build workflows with QRise REST API and Webhooks
            </p>
          </div>
        </div>

        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-all shrink-0 ml-3">
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </Link>

      {/* BACKUP OPTION BUTTON */}
      <Link
        href="?backup=true"
        className="group relative overflow-hidden flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all"
      >
        <div className="relative flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-slate-200/70 dark:group-hover:bg-slate-700/70 transition-all shrink-0">
            <Database className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
              Backup & Data Export
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate sm:whitespace-normal">
              Download backups of your QR codes and form data
            </p>
          </div>
        </div>

        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-all shrink-0 ml-3">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* Danger Zone / Sign Out */}
      <div className="p-6 rounded-3xl border border-red-100 dark:border-red-950/40 bg-red-50/30 dark:bg-red-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-red-600 dark:text-red-400">Account Session</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sign out of your active session on this device.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsSignOutOpen(true)}
          className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold text-xs gap-2 shrink-0 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>

      {/* Sign Out Confirmation Modal */}
      <SignOutDialog 
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
}
